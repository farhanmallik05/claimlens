/**
 * ClaimLens Deterministic Rules Engine
 * Pure TypeScript, exact integer rupees, zero external runtime dependencies.
 */

export const ENGINE_VERSION = '0.1.0';

export type CategoryId =
  | 'room'
  | 'icu'
  | 'nursing'
  | 'professional'
  | 'investigation'
  | 'diagnostics'
  | 'pharmacy'
  | 'consumables'
  | 'ambulance'
  | 'other';

export type RuleId =
  | 'ROOM_RENT_CAPPED'
  | 'PROPORTIONATE_DEDUCTION'
  | 'NON_PAYABLE_ITEM'
  | 'COPAY_APPLIED'
  | 'SUM_INSURED_EXCEEDED'
  | 'UNSPECIFIED_DEDUCTION';

export interface BillLine {
  id: string;
  category: CategoryId;
  label: string;
  qty: number;
  rate: number;
  amount: number;
  nonPayable?: {
    amount: number;
    reason: string;
  };
}

export interface Bill {
  id: string;
  patientAlias: string;
  hospital: string;
  days: number;
  lines: BillLine[];
}

export interface PolicyClause {
  page: number;
  heading: string;
  text: string;
}

export interface Policy {
  id: string;
  insurer: string;
  planName: string;
  sumInsured: number;
  sumInsuredClauseId?: string;
  roomRent?: {
    mode: 'pctSI' | 'fixed';
    value: number;
    clauseId: string;
  };
  proportionate?: {
    enabled: boolean;
    appliesTo: CategoryId[];
    clauseId: string;
  };
  nonPayable?: {
    clauseId: string;
  };
  copay?: {
    pct: number;
    order: 'beforeCap' | 'afterCap';
    clauseId: string;
  };
  priorClaimsPaid: number;
  clauses: Record<string, PolicyClause>;
}

export interface LineResult {
  lineId: string;
  billed: number;
  allowed: number;
  disallowed: number;
  reason?: string;
  appliedRules: RuleId[];
  clauseId?: string;
}

export interface Deduction {
  ruleId: RuleId;
  clauseId: string;
  label: string;
  amount: number;
  notes?: string;
}

export interface Forecast {
  billed: number;
  insurerPays: number;
  youPay: number;
  deductions: Deduction[];
  lineResults: LineResult[];
}

export interface RoomAdvice {
  maxEligiblePerDay: number;
  currentRoomRentPerDay: number;
  isOverCap: boolean;
  proportionateApplies: boolean;
  recommendation: string;
}

/**
 * Baseline engine health check helper
 */
export function getEngineHealth(): { status: string; version: string } {
  return {
    status: 'ok',
    version: ENGINE_VERSION,
  };
}
