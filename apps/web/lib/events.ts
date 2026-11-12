/**
 * ClaimLens SSE Event Pipeline & Replay Circuit Breaker Client
 * Provides resilient streaming client for 5-agent LangGraph execution
 * with automatic 6-second fallback circuit breaker to offline recorded traces.
 * Conforms to plan/trd.md §6.6, §6.8, and PROJECT.md § Interface Contracts.
 */

import rajuTraceJson from '../../../fixtures/raju_trace.json';

export type AgentName =
  | 'policy_parser'
  | 'bill_reader'
  | 'rules_engine'
  | 'explainer'
  | 'appeal_drafter';

export type AgentEventType =
  | 'node_start'
  | 'node_end'
  | 'forecast_ready'
  | 'appeal_ready'
  | 'status'
  | 'error'
  | 'handshake'
  | 'agent'
  | 'result';

export interface AgentEvent {
  step?: number;
  event: AgentEventType;
  agent?: AgentName;
  timestamp?: string | number;
  message?: string;
  data?: Record<string, unknown>;
  type?: 'agent' | 'result' | 'handshake';
  status?: 'start' | 'progress' | 'done' | 'error' | 'completed';
  payload?: Record<string, unknown>;
  forecast?: Record<string, unknown>;
  extraction?: Record<string, unknown>;
  verifiedAgainst?: string;
  matched?: string;
  label?: string;
  isReplay?: boolean;
}

export interface AgentEventSource {
  connect(sampleId?: string): AsyncIterable<AgentEvent>;
  readonly label: 'Live' | 'Replayed from recorded run';
  readonly isReplay: boolean;
}

export interface AgentSourceOptions {
  apiUrl?: string;
  timeoutMs?: number;
  stepDelayMs?: number;
  forceReplay?: boolean;
}

export const DEFAULT_TIMEOUT_MS = 6000;
export const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Offline Replay Event Source
 * Reads authoritative recorded traces and emits sequential events with simulated pacing.
 */
export class ReplaySource implements AgentEventSource {
  public readonly label = 'Replayed from recorded run' as const;
  public readonly isReplay = true as const;
  private readonly stepDelayMs: number;

  constructor(options?: { stepDelayMs?: number }) {
    this.stepDelayMs = options?.stepDelayMs ?? 120;
  }

  public async *connect(sampleId: string = 'raju'): AsyncIterable<AgentEvent> {
    let traceData: typeof rajuTraceJson = rajuTraceJson;

    // In browser environment, optionally attempt to fetch public/replay asset if different sample
    if (typeof window !== 'undefined' && sampleId !== 'raju') {
      try {
        const res = await fetch(`/replay/${sampleId}_trace.json`);
        if (res.ok) {
          traceData = await res.json();
        }
      } catch {
        // Fall back to embedded rajuTraceJson
      }
    }

    const events = (traceData.events || []) as AgentEvent[];

    for (const evt of events) {
      if (this.stepDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, this.stepDelayMs));
      }
      yield {
        ...evt,
        label: this.label,
        isReplay: true,
      };
    }
  }
}

/**
 * Live SSE Event Source
 * Connects to ClaimLens FastAPI gateway via POST /v1/runs and GET /v1/runs/{id}/events.
 */
export class LiveSource implements AgentEventSource {
  public readonly label = 'Live' as const;
  public readonly isReplay = false as const;
  private readonly apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || DEFAULT_API_URL;
  }

  public async *connect(sampleId: string = 'raju'): AsyncIterable<AgentEvent> {
    // 1. Initialize run
    const createRes = await fetch(`${this.apiUrl}/v1/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sampleId }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create run: HTTP ${createRes.status}`);
    }

    const runData = (await createRes.json()) as { runId: string };
    const runId = runData.runId;

    // 2. Stream SSE events
    const eventsRes = await fetch(`${this.apiUrl}/v1/runs/${runId}/events`, {
      headers: {
        Accept: 'text/event-stream',
      },
    });

    if (!eventsRes.ok || !eventsRes.body) {
      throw new Error(`SSE stream failed: HTTP ${eventsRes.status}`);
    }

    const reader = eventsRes.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr) as AgentEvent;
              yield {
                ...parsed,
                label: this.label,
                isReplay: false,
              };
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    }
  }
}

/**
 * Resilient Agent Event Source with 6-Second Circuit Breaker
 * Attempts LiveSource first. If connection fails or does not respond within
 * timeoutThreshold (6000ms SLA), immediately trips circuit breaker and falls back
 * transparently to ReplaySource with honest label update.
 */
export class ResilientAgentEventSource implements AgentEventSource {
  private _label: 'Live' | 'Replayed from recorded run' = 'Live';
  private _isReplay: boolean = false;
  private readonly timeoutMs: number;
  private readonly apiUrl: string;
  private readonly stepDelayMs: number;
  private readonly forceReplay: boolean;

  constructor(options?: AgentSourceOptions) {
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.apiUrl = options?.apiUrl ?? DEFAULT_API_URL;
    this.stepDelayMs = options?.stepDelayMs ?? 100;
    this.forceReplay = options?.forceReplay ?? false;
  }

  public get label(): 'Live' | 'Replayed from recorded run' {
    return this._label;
  }

  public get isReplay(): boolean {
    return this._isReplay;
  }

  public async *connect(sampleId: string = 'raju'): AsyncIterable<AgentEvent> {
    if (this.forceReplay) {
      this._label = 'Replayed from recorded run';
      this._isReplay = true;
      const replay = new ReplaySource({ stepDelayMs: this.stepDelayMs });
      yield* replay.connect(sampleId);
      return;
    }

    const live = new LiveSource(this.apiUrl);
    const replay = new ReplaySource({ stepDelayMs: this.stepDelayMs });

    // Setup 6-second timeout circuit breaker
    let circuitTripped = false;
    let liveIterator: AsyncIterator<AgentEvent> | null = null;

    try {
      const liveIterable = live.connect(sampleId);
      liveIterator = liveIterable[Symbol.asyncIterator]();

      // Race the initial connection & first event against timeoutMs
      const timeoutPromise = new Promise<{ timeout: true }>(resolve => {
        setTimeout(() => resolve({ timeout: true }), this.timeoutMs);
      });

      const firstEventPromise = liveIterator.next().then(result => ({
        timeout: false as const,
        result,
      }));

      const firstOutcome = await Promise.race([firstEventPromise, timeoutPromise]);

      if (firstOutcome.timeout || !firstOutcome.result || firstOutcome.result.done) {
        circuitTripped = true;
      } else {
        this._label = 'Live';
        this._isReplay = false;
        yield firstOutcome.result.value;

        // Stream remaining live events
        while (true) {
          const next = await liveIterator.next();
          if (next.done) break;
          yield next.value;
        }
        return;
      }
    } catch {
      circuitTripped = true;
    }

    if (circuitTripped) {
      this._label = 'Replayed from recorded run';
      this._isReplay = true;
      yield* replay.connect(sampleId);
    }
  }
}

/**
 * Factory helper creating a resilient AgentEventSource instance.
 */
export function createAgentEventSource(options?: AgentSourceOptions): AgentEventSource {
  return new ResilientAgentEventSource(options);
}
