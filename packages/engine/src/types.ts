/**
 * ClaimLens Deterministic Rules Engine — Authoritative Types & Contracts
 * Pure TypeScript, exact integer rupees, zero external runtime dependencies.
 * Conforms to plan/trd.md §6.3, COUNTER_PLAN.md §3.3, and fixtures/*.json.
 */

export const ENGINE_VERSION = '0.1.0';

/**
 * Standard hospital bill line item classification categories.
 * Accommodates IRDAI standardized tariff heads, clinical charges, and general heads.
 */
export type CategoryId =
  | 'room'
  | 'icu'
  | 'nursing'
  | 'surgeon'
  | 'anaesthesia'
  | 'ot'
  | 'professional'
  | 'medicines'
  | 'pharmacy'
  | 'consumables'
  | 'investigation'
  | 'diagnostic'
  | 'diagnostics'
  | 'misc'
  | 'ambulance'
  | 'other';

/**
 * Authoritative Deduction Rule Identifiers.
 * Strictly adheres to plan/trd.md §6.3, COUNTER_PLAN §3.3, and scenario fixtures.
 */
export type RuleId =
  | 'ROOM_CAP'
  | 'PROPORTIONATE'
  | 'NON_PAYABLE'
  | 'COPAY'
  | 'SI_CLAMP';

/**
 * Policy clause reference text and pagination from the policy wording contract.
 */
export interface PolicyClause {
  page: number;
  heading: string;
  text: string;
}

/**
 * Health insurance policy contract representation.
 */
export interface Policy {
  id: string;
  insurer: string;
  planName: string;
  sumInsured: number;                     // Integer ₹
  sumInsuredClauseId?: string;            // e.g. "SP-2.1"
  roomRent?: {
    mode: 'pctSI' | 'fixedPerDay' | 'none' | 'fixed';
    value?: number;                       // Percentage (e.g. 1) or daily ₹ (e.g. 5000)
    clauseId?: string;                    // e.g. "SP-3.1"
  };
  proportionate?: {
    enabled: boolean;
    appliesTo: CategoryId[];              // e.g. ["professional"]
    clauseId?: string;                    // e.g. "SP-3.2"
  };
  nonPayable?: {
    clauseId?: string;                    // e.g. "SP-4.1"
  };
  copay?: {
    pct: number;                          // Integer 0-100
    order: 'beforeCap' | 'afterCap';
    clauseId?: string;                    // e.g. "SP-5.1"
  };
  priorClaimsPaid?: number;              // Integer ₹ (defaults to 0)
  clauses: Record<string, PolicyClause>;  // Keyed by clauseId
}

/**
 * Itemized hospital bill line item.
 */
export interface BillLine {
  id: string;
  category: CategoryId;
  label: string;
  qty: number;
  rate: number;
  amount: number;                         // Integer ₹; qty * rate
  nonPayable?: {
    amount: number;
    reason: string;
  };
  isIcu?: boolean;                        // Flag for statutory ICU room cap exemption
}

/**
 * Inpatient hospitalization bill container.
 */
export interface Bill {
  id: string;
  patientAlias: string;
  hospital: string;
  days: number;
  lines: BillLine[];
}

/**
 * Mathematical deduction formula representation for auditability.
 */
export interface DeductionFormula {
  template: string;                       // e.g. "floor(eligible × cap ÷ rate)"
  vars: Record<string, number>;
  result: number;
}

/**
 * Specific financial deduction applied to a bill line item.
 */
export interface Deduction {
  lineId: string;
  ruleId: RuleId;
  clauseId: string;                       // Must exist in policy.clauses (FR-12)
  amount: number;                         // Integer ₹ deducted
  formula: DeductionFormula;
  label?: string;
  description?: string;
  notes?: string;
}

/**
 * Adjudication result for a single bill line item.
 */
export interface LineResult {
  id: string;                             // Line identifier (e.g. "line-surgeon")
  lineId?: string;                        // Alias for interoperability
  category?: CategoryId;
  label?: string;
  billed: number;                         // Original billed amount in integer ₹
  payable: number;                        // Final insurer payable amount in integer ₹
  allowed?: number;                       // Alias to payable for backward compatibility
  deducted: number;                       // Total deductions on this line (billed - payable)
  disallowed?: number;                    // Alias to deducted for backward compatibility
  deductions?: Deduction[];               // Line-attributed deductions
  reason?: string;
  appliedRules?: RuleId[];
  clauseId?: string;
}

/**
 * Complete claim forecast and shortfall assessment.
 */
export interface Forecast {
  billed: number;                         // Total bill amount in integer ₹
  insurerPays: number;                    // Total insurer liability in integer ₹
  youPay: number;                         // Total patient out-of-pocket shortfall (billed - insurerPays)
  deductions: Deduction[];                // Flat list of all deductions
  lines: LineResult[];                    // Line-by-line itemized results
  lineResults?: LineResult[];             // Alias for backward compatibility
}

/**
 * Pre-admission room selection recommendation and advice.
 */
export interface RoomAdvice {
  maxEligiblePerDay: number;              // Room cap amount
  currentRoomRentPerDay: number;          // Actual room rate (or weighted average)
  isOverCap: boolean;
  proportionateApplies: boolean;
  avoidableShortfall: number;             // Out-of-pocket savings if in-cap room selected
  recommendation: string;
}

/**
 * Insurer settlement breakdown line item.
 */
export interface SettlementLine {
  lineId: string;
  billed: number;
  paid: number;
  deducted: number;
  adjudicationReason?: string;
}

/**
 * Insurer settlement letter / adjudication statement.
 */
export interface Settlement {
  claimRef: string;
  patientAlias?: string;
  totalBilled: number;
  insurerPaid: number;
  settlementLines: SettlementLine[];
}

/**
 * Discrepancy discovered during settlement audit.
 */
export interface SettlementDiscrepancy {
  lineId: string;
  insurerDeducted: number;
  policyAllows: number;
  difference: number;
  clauseId: string;
  clauseQuote: string;
}

/**
 * Settlement audit report summarizing unauthorized over-deductions.
 */
export interface SettlementAudit {
  discrepancies: SettlementDiscrepancy[];
  totalDiscrepancyAmount: number;
  statutoryGround: string;
}

/**
 * Formal legal appeal / grievance letter.
 */
export interface GrievanceAppeal {
  claimRef: string;
  subject: string;
  body: string;
  totalDisputedAmount: number;
  discrepancies: SettlementDiscrepancy[];
  statutoryCitations: string[];
}

/**
 * Custom error thrown when a deduction cites a clauseId not found in policy.clauses (FR-12).
 */
export class ClauseCompletenessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClauseCompletenessError';
  }
}

/**
 * Custom error thrown when bill or policy contains invalid, negative, or malformed inputs.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
