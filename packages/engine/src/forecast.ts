/**
 * ClaimLens Deterministic Rules Engine — Core Adjudication Pipeline
 * Pure TypeScript, exact integer rupees, downward integer floor truncation.
 * Enforces Conservation of Money (FR-7) and Clause Completeness Guard (FR-12).
 */

import {
  Bill,
  BillLine,
  ClauseCompletenessError,
  Deduction,
  Forecast,
  LineResult,
  Policy,
  ValidationError,
} from './types';
import { isIcuLine, resolveRoomBilling } from './multiroom';

/**
 * Resolves daily room rent cap from policy parameters.
 * Mode pctSI: floor(sumInsured * value / 100)
 * Mode fixedPerDay / fixed: floor(value)
 * Mode none / unconfigured: Infinity
 */
export function resolveCap(policy: Policy): number {
  if (!policy) return Infinity;
  const roomRent = policy.roomRent;
  if (!roomRent) return Infinity;

  if (roomRent.mode === 'pctSI') {
    const pct = roomRent.value || 0;
    return Math.floor(((policy.sumInsured || 0) * pct) / 100);
  }

  if (roomRent.mode === 'fixedPerDay' || (roomRent.mode as string) === 'fixed') {
    return Math.floor(roomRent.value || 0);
  }

  if (roomRent.mode === 'none') {
    return Infinity;
  }

  return Infinity;
}

/**
 * Evaluates insurance policy rules against an itemized hospital bill.
 * Executes the canonical 6-stage deterministic pipeline in exact integer rupees.
 */
export function forecast(policy: Policy, bill: Bill): Forecast {
  if (!policy) throw new ValidationError('Policy must be provided');
  if (!bill) throw new ValidationError('Bill must be provided');

  const lines = bill.lines || [];

  // Input Boundary Validations
  for (const l of lines) {
    if (typeof l.amount === 'number' && l.amount < 0) {
      throw new ValidationError(`Line amount must be non-negative: ${l.id || 'unknown'}`);
    }
    if (typeof l.qty === 'number' && l.qty < 0) {
      throw new ValidationError(`Line qty must be positive integer: ${l.id || 'unknown'}`);
    }
  }

  // 1. Resolve Daily Room Cap
  const cap = resolveCap(policy);

  // 2. Identify Room Rate & Over-Cap Status via Multi-Room Aggregator
  const roomBilling = resolveRoomBilling(lines);
  const rate = roomBilling.rate;
  const isOverCap = cap !== Infinity && rate > cap;

  const deductions: Deduction[] = [];
  const lineResults: LineResult[] = [];

  // 3. Process Each Bill Line
  for (const l of lines) {
    const lineAmount = Math.max(0, Math.floor(l.amount || 0));
    let eligible = lineAmount;

    // Step 3a: Non-Payables Elimination (SP-4.1)
    if (l.nonPayable && typeof l.nonPayable.amount === 'number' && l.nonPayable.amount > 0) {
      const nonPayableAmt = Math.min(eligible, Math.max(0, Math.floor(l.nonPayable.amount)));
      if (nonPayableAmt > 0) {
        eligible -= nonPayableAmt;
        const clauseId = (policy.nonPayable && policy.nonPayable.clauseId) || 'SP-4.1';
        deductions.push({
          lineId: l.id,
          ruleId: 'NON_PAYABLE',
          clauseId,
          amount: nonPayableAmt,
          formula: {
            template: 'amount - nonPayable',
            vars: { amount: lineAmount, nonPayable: nonPayableAmt },
            result: nonPayableAmt,
          },
        });
      }
    }

    // Step 3b: Co-pay before cap (if configured)
    if (policy.copay && policy.copay.order === 'beforeCap' && policy.copay.pct > 0) {
      const copayPct = Math.min(100, Math.max(0, policy.copay.pct));
      const copayAmt = Math.floor((eligible * copayPct) / 100);
      if (copayAmt > 0) {
        eligible -= copayAmt;
        const clauseId = policy.copay.clauseId || 'SP-5.1';
        deductions.push({
          lineId: l.id,
          ruleId: 'COPAY',
          clauseId,
          amount: copayAmt,
          formula: {
            template: 'eligible × copayPct ÷ 100',
            vars: { eligible: eligible + copayAmt, copayPct },
            result: copayAmt,
          },
        });
      }
    }

    // Step 3c: Room Cap or Proportionate Deduction
    let payable = eligible;
    if (isOverCap) {
      if (l.category === 'room') {
        if (isIcuLine(l)) {
          // ICU stay is exempt from room rent cap per IRDAI Master Circular 2020 §5 Cl. 19
          payable = eligible;
        } else {
          const qty = Math.max(1, l.qty || 1);
          const allowedRoom = qty * cap;
          payable = Math.min(eligible, allowedRoom);
          const roomCut = eligible - payable;
          if (roomCut > 0) {
            const clauseId = (policy.roomRent && policy.roomRent.clauseId) || 'SP-3.1';
            deductions.push({
              lineId: l.id,
              ruleId: 'ROOM_CAP',
              clauseId,
              amount: roomCut,
              formula: {
                template: 'eligible - (qty × cap)',
                vars: { eligible, qty, cap },
                result: roomCut,
              },
            });
          }
        }
      } else if (
        policy.proportionate &&
        policy.proportionate.enabled &&
        Array.isArray(policy.proportionate.appliesTo) &&
        policy.proportionate.appliesTo.includes(l.category)
      ) {
        // Proportionate cut applies to configured categories (e.g. professional)
        payable = Math.floor((eligible * cap) / rate);
        const profCut = eligible - payable;
        if (profCut > 0) {
          const clauseId = policy.proportionate.clauseId || 'SP-3.2';
          deductions.push({
            lineId: l.id,
            ruleId: 'PROPORTIONATE',
            clauseId,
            amount: profCut,
            formula: {
              template: 'floor(eligible × cap ÷ rate)',
              vars: { eligible, cap, rate },
              result: profCut,
            },
          });
        }
      } else {
        // Exempt categories (pharmacy, diagnostics, consumables, etc.)
        payable = eligible;
      }
    } else {
      payable = eligible;
    }

    // Step 3d: Co-pay after cap (default Indian policy order)
    if (policy.copay && policy.copay.order === 'afterCap' && policy.copay.pct > 0) {
      const copayPct = Math.min(100, Math.max(0, policy.copay.pct));
      const copayAmt = Math.floor((payable * copayPct) / 100);
      if (copayAmt > 0) {
        payable -= copayAmt;
        const clauseId = policy.copay.clauseId || 'SP-5.1';
        deductions.push({
          lineId: l.id,
          ruleId: 'COPAY',
          clauseId,
          amount: copayAmt,
          formula: {
            template: 'payable × copayPct ÷ 100',
            vars: { payable: payable + copayAmt, copayPct },
            result: copayAmt,
          },
        });
      }
    }

    const deducted = lineAmount - payable;
    lineResults.push({
      id: l.id,
      lineId: l.id,
      category: l.category,
      label: l.label,
      billed: lineAmount,
      payable,
      allowed: payable,
      deducted,
      disallowed: deducted,
    });
  }

  // 4. Sum Insured Clamping via Hare-Niemeyer Largest-Remainder Method
  const availableSI = Math.max(0, (policy.sumInsured || 0) - (policy.priorClaimsPaid || 0));
  const currentTotalPayable = lineResults.reduce((sum, lr) => sum + lr.payable, 0);

  if (currentTotalPayable > availableSI) {
    const excess = currentTotalPayable - availableSI;
    if (currentTotalPayable > 0) {
      const reductions = new Array(lineResults.length).fill(0);
      const remainders: { index: number; remainder: number; linePayable: number }[] = [];
      let totalFloorCut = 0;

      for (let i = 0; i < lineResults.length; i++) {
        const linePayable = lineResults[i].payable;
        if (linePayable > 0) {
          const quota = (excess * linePayable) / currentTotalPayable;
          const floorCut = Math.floor(quota);
          reductions[i] = floorCut;
          totalFloorCut += floorCut;
          remainders.push({ index: i, remainder: quota - floorCut, linePayable });
        }
      }

      const deficit = excess - totalFloorCut;
      remainders.sort((a, b) => {
        if (b.remainder !== a.remainder) return b.remainder - a.remainder;
        return b.linePayable - a.linePayable;
      });

      for (let j = 0; j < deficit && j < remainders.length; j++) {
        reductions[remainders[j].index] += 1;
      }

      const siClauseId = policy.sumInsuredClauseId || 'SP-2.1';
      for (let i = 0; i < lineResults.length; i++) {
        const cut = reductions[i];
        if (cut > 0) {
          const prevPayable = lineResults[i].payable;
          lineResults[i].payable -= cut;
          lineResults[i].allowed = lineResults[i].payable;
          lineResults[i].deducted += cut;
          lineResults[i].disallowed = lineResults[i].deducted;

          deductions.push({
            lineId: lineResults[i].id,
            ruleId: 'SI_CLAMP',
            clauseId: siClauseId,
            amount: cut,
            formula: {
              template: 'hareNiemeyer(excess, payable, totalPayable)',
              vars: { excess, linePayable: prevPayable, totalPayable: currentTotalPayable },
              result: cut,
            },
          });
        }
      }
    }
  }

  // 5. Calculate Final Totals & Verify Invariants
  const insurerPays = lineResults.reduce((sum, lr) => sum + lr.payable, 0);
  const totalBilled = lines.reduce((sum, l) => sum + Math.max(0, Math.floor(l.amount || 0)), 0);
  const youPay = totalBilled - insurerPays;

  // 6. Clause Completeness Guard (FR-12)
  if (deductions.length > 0 && (!policy.clauses || typeof policy.clauses !== 'object')) {
    throw new ClauseCompletenessError('Policy clauses object is missing');
  }

  for (const d of deductions) {
    if (!policy.clauses || !policy.clauses[d.clauseId]) {
      throw new ClauseCompletenessError(
        `ClauseCompletenessError: Deduction clauseId "${d.clauseId}" not found in policy.clauses`
      );
    }
  }

  return {
    billed: totalBilled,
    insurerPays,
    youPay,
    deductions,
    lines: lineResults,
    lineResults,
  };
}

/**
 * Public alias for canonical calculation entry point.
 */
export const calculateForecast = forecast;
