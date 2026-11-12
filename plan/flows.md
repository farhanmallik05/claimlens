# ClaimLens — User Flows

---

## 4.1 Judge flow (primary path)

```mermaid
flowchart TD
    A[Open link] --> B[Wow 1: bill audits itself]
    B --> C[Scroll: Scene 2 — stats + Raju]
    C --> D[Wow 2: Ripple, slider auto-drags once]
    D --> E{Judge acts}
    E -->|Drags slider| F[Lines recompute, caption updates]
    E -->|Types own cap| F
    E -->|Ignores| G[Continue scrolling]
    F --> H[Wow 3: tap a deduction]
    G --> H
    H --> I[Clause drawer: clause text + arithmetic + clause ID]
    I --> J[Scenes 5–7: tech, why us, impact]
    J --> K[Scene 8: Run live read / appeal / links]
    A -.->|Presses J or pill| T[90-second tour]
    T -.-> B
    T -.-> D
    T -.-> H
```

---

## 4.2 Product flow (the deck's 4-step promise)

```mermaid
flowchart LR
    A["1. Add policy<br/>(PDF or phone photo)"] --> B["2. Add bill<br/>(estimate or final)"]
    B --> C["3. See forecast<br/>(payable vs deducted + clauses)"]
    C --> D["4. Take action<br/>(checklist + cited appeal)"]
```

---

## 4.3 Live read flow — Finisher A

```mermaid
sequenceDiagram
    participant U as Judge
    participant W as Web (Next.js)
    participant A as API (FastAPI)
    participant L as LLM (LiteLLM)

    U->>W: Click "Read the sample bill"
    W->>A: POST /v1/runs {sampleId}
    A-->>W: {runId}
    W->>A: GET /v1/runs/{id}/events (SSE)

    A->>A: Redact PII (black bars burned in)
    A-->>W: agent policy_parser → start

    A->>L: Vision call (policy image)
    L-->>A: Policy JSON
    A-->>W: policy_parser → done + payload

    A->>L: Vision call (bill image)
    L-->>A: Bill JSON
    A-->>W: bill_reader → done + payload

    A->>A: rules_engine (Python port — no LLM)
    A-->>W: rules_engine → done

    A->>L: Explainer call
    L-->>A: Explanations JSON
    A-->>W: explainer → done

    W->>W: Verify vs ground truth → render forecast UI
    W-->>U: "Verified against ground truth: N/N lines matched" + Live label

    Note over W,A: Any error / timeout / budget hit → replay JSON, labelled "Replayed from a recorded run"
```

---

## 4.4 Error and edge paths

| Situation | Behaviour |
| :--- | :--- |
| API cold start / timeout >6 s | Switch to **Replayed from a recorded run** automatically; label shown prominently |
| LLM returns invalid JSON | One retry with repair prompt; if still invalid → replay |
| Extraction ≠ ground truth on sample | Show diff honestly (`"12/14 lines matched"`) and still render the forecast |
| Rate limit hit | Replay + message `"Live budget reached"` |
| JS disabled | `<noscript>` static receipt showing the ₹41,500 result |
| `prefers-reduced-motion` | Static scenes; slider still interactive |
| API unavailable entirely | Page works fully from replay; engine runs in-browser |

