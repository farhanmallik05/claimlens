/**
 * Pre-Admission Room Advice, Avoidable Shortfall & Settlement Audit Engine
 * Evaluates in-cap options and drafts formal grievance appeals with statutory citations.
 */

import {
  Bill,
  Forecast,
  GrievanceAppeal,
  Policy,
  RoomAdvice,
  Settlement,
  SettlementAudit,
  SettlementDiscrepancy,
} from './types';
import { forecast, resolveCap } from './forecast';
import { resolveRoomBilling } from './multiroom';

/**
 * Sanitizes interactive room cap input from sliders and textboxes.
 * Cleans strings, handles NaN, and clamps values into integer range [0, maxSI].
 */
export function sanitizeRoomCapInput(input: unknown, maxSI: number = Infinity): number {
  let val: number;
  if (typeof input === 'string') {
    const cleaned = input.replace(/[^0-9.-]/g, '');
    val = parseFloat(cleaned);
  } else if (typeof input === 'number') {
    val = input;
  } else {
    return 0;
  }

  if (isNaN(val) || !isFinite(val)) {
    return 0;
  }

  const clamped = Math.max(0, Math.min(val, maxSI));
  return Math.floor(clamped);
}

/**
 * Calculates the maximum daily room rent rate that completely avoids any room cut
 * or proportionate deduction haircut.
 */
export function maxRoomRateWithoutCut(policy: Policy): number {
  return resolveCap(policy);
}

/**
 * Calculates patient out-of-pocket savings if an in-cap room had been selected.
 * Simulates the bill with room rate adjusted down to cap and evaluates the difference in youPay.
 */
export function avoidableShortfall(policy: Policy, bill: Bill): number {
  const cap = resolveCap(policy);
  if (!isFinite(cap)) return 0;

  const current = forecast(policy, bill);

  const inCapBill: Bill = {
    ...bill,
    lines: (bill.lines || []).map(l => {
      if (l.category === 'room') {
        const qty = Math.max(1, l.qty || 1);
        const rate = l.rate || (l.amount ? Math.floor(l.amount / qty) : 0);
        const cappedRate = Math.min(rate, cap);
        return {
          ...l,
          rate: cappedRate,
          amount: Math.min(l.amount || 0, qty * cappedRate),
        };
      }
      return l;
    }),
  };

  const inCapForecast = forecast(policy, inCapBill);
  return Math.max(0, current.youPay - inCapForecast.youPay);
}

/**
 * Compiles pre-admission room rent advice and shortfall forecasts.
 */
export function getRoomAdvice(policy: Policy, bill?: Bill): RoomAdvice {
  const maxEligiblePerDay = resolveCap(policy);
  const roomBilling = bill ? resolveRoomBilling(bill.lines) : { rate: 0 };
  const currentRoomRentPerDay = roomBilling.rate;
  const isOverCap = isFinite(maxEligiblePerDay) && currentRoomRentPerDay > maxEligiblePerDay;
  const proportionateApplies = isOverCap && Boolean(policy.proportionate && policy.proportionate.enabled);
  const avoidable = bill ? avoidableShortfall(policy, bill) : 0;

  let recommendation = 'Your room rate is within your policy eligibility limit. No proportionate deductions apply.';
  if (isOverCap) {
    recommendation = `Selecting a room at or below ₹${maxEligiblePerDay.toLocaleString('en-IN')}/day avoids both room deductions and proportionate haircuts, saving approximately ₹${avoidable.toLocaleString('en-IN')} out-of-pocket.`;
  }

  return {
    maxEligiblePerDay,
    currentRoomRentPerDay,
    isOverCap,
    proportionateApplies,
    avoidableShortfall: avoidable,
    recommendation,
  };
}

/**
 * Compares an engine forecast against an insurer's settlement statement to identify
 * unauthorized over-deductions (e.g. illegal proportionate cuts on medicines).
 */
export function auditSettlement(forecastResult: Forecast, settlement: Settlement): SettlementAudit {
  const discrepancies: SettlementDiscrepancy[] = [];
  let totalDiscrepancyAmount = 0;

  const forecastMap = new Map<string, number>();
  for (const lr of forecastResult.lines) {
    forecastMap.set(lr.id, lr.deducted);
    if (lr.lineId) forecastMap.set(lr.lineId, lr.deducted);
  }

  for (const sl of settlement.settlementLines || []) {
    const expectedDeducted = forecastMap.get(sl.lineId);
    if (expectedDeducted === undefined) continue;

    // Discrepancy: insurer deducted more than policy rules permit
    if (sl.deducted > expectedDeducted) {
      const diff = sl.deducted - expectedDeducted;
      discrepancies.push({
        lineId: sl.lineId,
        insurerDeducted: sl.deducted,
        policyAllows: expectedDeducted,
        difference: diff,
        clauseId: 'SP-3.3',
        clauseQuote: 'Clause 3.2 does not apply to pharmacy, medicines and diagnostic investigations.',
      });
      totalDiscrepancyAmount += diff;
    }
  }

  return {
    discrepancies,
    totalDiscrepancyAmount,
    statutoryGround: 'IRDAI Master Circular 2020 (Ref: IRDAI/HLT/CIR/GDL/61/04/2020 Section 5, Clause 19)',
  };
}

/**
 * Drafts a formal legal grievance letter citing IRDAI regulations and Ombudsman rules.
 */
export function generateAppeal(
  settlement: Settlement,
  discrepancies: SettlementAudit,
  _regulatoryRefs?: unknown
): GrievanceAppeal {
  const amount = discrepancies.totalDiscrepancyAmount || 0;
  const claimRef = settlement.claimRef || 'CLM-DEMO-001';
  const patient = settlement.patientAlias || 'Insured Patient';

  const subject = `Formal Grievance: Illegal Over-Deduction of ₹${amount.toLocaleString('en-IN')} on Claim Ref ${claimRef}`;
  const body = `To: Grievance Redressal Officer, Demo Assure
Subject: ${subject}

Dear Sir / Madam,

Re: Insurance Claim Adjudication Dispute for ${patient} (Claim Ref: ${claimRef})

I am writing to formally dispute an unauthorized deduction of ₹${amount.toLocaleString('en-IN')} applied against the settlement of the hospital bill for ${patient}.

1. Disputed Deductions:
${discrepancies.discrepancies
  .map(
    d =>
      `- Line item "${d.lineId}": Insurer deducted ₹${d.insurerDeducted}, whereas policy permits ₹${d.policyAllows} (Over-deduction: ₹${d.difference}).`
  )
  .join('\n')}

2. Policy & Statutory Ground:
Under Policy Clause SP-3.3 ("Exempt Expenses"), proportionate room rent deductions expressly do not apply to pharmacy, medicines, and diagnostic investigations.
Furthermore, Section 5, Clause 19 of IRDAI Master Circular (IRDAI/HLT/CIR/GDL/61/04/2020) strictly prohibits insurers from applying proportionate room-rent cuts to medicines and diagnostics.

3. Escalation Notice:
If this over-deducted amount of ₹${amount.toLocaleString('en-IN')} is not restored within 30 days pursuant to Regulation 12 of IRDAI Regulations 2016, this dispute will be escalated directly to the Insurance Ombudsman under Rule 13 of the Insurance Ombudsman Rules, 2017.

Sincerely,
${patient} (Policyholder)`;

  return {
    claimRef,
    subject,
    body,
    totalDisputedAmount: amount,
    discrepancies: discrepancies.discrepancies,
    statutoryCitations: [
      'IRDAI Master Circular 2020 §5 Cl. 19',
      'Policy Clause SP-3.3',
      'Insurance Ombudsman Rules 2017 Rule 13',
    ],
  };
}
