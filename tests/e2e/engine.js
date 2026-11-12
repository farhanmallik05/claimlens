/**
 * Deterministic Financial Rules Engine for ClaimLens
 * Pure, zero-dependency, integer rupee arithmetic with downward integer floor truncation.
 * Preserves Conservation Law (FR-7), Monotonicity (FR-8), and Clause Completeness (FR-12).
 */

class ClauseCompletenessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClauseCompletenessError';
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Aggregates room lines to compute total stay days, total charges, and weighted daily rate.
 * Handles single-room, multi-room, and ICU stays.
 */
function resolveRoomBilling(lines = []) {
  const roomLines = (lines || []).filter(l => l && l.category === 'room');
  if (roomLines.length === 0) {
    return { totalDays: 0, totalRoomCharge: 0, rate: 0 };
  }
  const totalDays = roomLines.reduce((sum, l) => sum + Math.max(0, l.qty || 0), 0);
  const totalRoomCharge = roomLines.reduce((sum, l) => sum + Math.max(0, l.amount || 0), 0);
  const rate = totalDays > 0 ? Math.floor(totalRoomCharge / totalDays) : 0;
  return { totalDays, totalRoomCharge, rate };
}

/**
 * Sanitizes room cap user input.
 * Handles non-numeric strings, negative numbers, and bounds input within [0, maxSI].
 */
function sanitizeRoomCapInput(input, maxSI = Infinity) {
  if (typeof input === 'string') {
    const parsed = parseFloat(input.replace(/[^0-9.-]/g, ''));
    if (isNaN(parsed) || !isFinite(parsed)) return 0;
    input = parsed;
  }
  if (typeof input !== 'number' || isNaN(input) || !isFinite(input)) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(input, maxSI));
  return Math.floor(clamped);
}

/**
 * Evaluates policy rules against an itemized hospital bill.
 * Returns deterministic forecast with integer rupee guarantees.
 */
function forecast(policy, bill) {
  if (!policy) throw new ValidationError('Policy must be provided');
  if (!bill) throw new ValidationError('Bill must be provided');

  const lines = bill.lines || [];

  // Input validation
  for (const l of lines) {
    if (typeof l.amount === 'number' && l.amount < 0) {
      throw new ValidationError(`Line amount must be non-negative: ${l.id || 'unknown'}`);
    }
    if (typeof l.qty === 'number' && l.qty < 0) {
      throw new ValidationError(`Line qty must be positive integer: ${l.id || 'unknown'}`);
    }
  }

  // 1. Resolve Daily Room Cap
  let cap = Infinity;
  const roomRentConfig = policy.roomRent || {};
  if (roomRentConfig.mode === 'pctSI') {
    const pct = roomRentConfig.value || 0;
    cap = Math.floor(((policy.sumInsured || 0) * pct) / 100);
  } else if (roomRentConfig.mode === 'fixedPerDay') {
    cap = Math.floor(roomRentConfig.value || 0);
  } else if (roomRentConfig.mode === 'none') {
    cap = Infinity;
  } else {
    cap = Infinity;
  }

  // 2. Identify Room Rate & Over-Cap Status
  const roomBilling = resolveRoomBilling(lines);
  const rate = roomBilling.rate;
  const isOverCap = cap !== Infinity && rate > cap;

  const deductions = [];
  const lineResults = [];

  // 3. Process Each Bill Line
  for (const l of lines) {
    const lineAmount = Math.max(0, Math.floor(l.amount || 0));
    let eligible = lineAmount;

    // Step 3a: Non-Payables Elimination
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
            result: nonPayableAmt
          }
        });
      }
    }

    // Step 3b: Co-pay before cap
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
            result: copayAmt
          }
        });
      }
    }

    // Step 3c: Room Cap or Proportionate Deduction
    let payable = eligible;
    if (isOverCap) {
      if (l.category === 'room') {
        const isIcu = (l.id && l.id.toLowerCase().includes('icu')) ||
                      (l.label && l.label.toLowerCase().includes('icu'));
        if (isIcu) {
          // ICU stay is exempt from room rent cap per statutory guidelines
          payable = eligible;
        } else {
          const qty = Math.max(1, l.qty || 1);
          const allowedRoom = qty * cap;
          payable = Math.min(eligible, allowedRoom);
          const roomCut = eligible - payable;
          if (roomCut > 0) {
            const clauseId = policy.roomRent.clauseId || 'SP-3.1';
            deductions.push({
              lineId: l.id,
              ruleId: 'ROOM_CAP',
              clauseId,
              amount: roomCut,
              formula: {
                template: 'eligible - (qty × cap)',
                vars: { eligible, qty, cap },
                result: roomCut
              }
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
              result: profCut
            }
          });
        }
      } else {
        // Category exempt from proportionate cut (pharmacy, diagnostics, etc.)
        payable = eligible;
      }
    } else {
      payable = eligible;
    }

    // Step 3d: Co-pay after cap
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
            result: copayAmt
          }
        });
      }
    }

    lineResults.push({
      id: l.id,
      category: l.category,
      label: l.label,
      billed: lineAmount,
      payable,
      deducted: lineAmount - payable
    });
  }

  // 4. Sum Insured Clamping via Hare-Niemeyer Remainder Method
  const availableSI = Math.max(0, (policy.sumInsured || 0) - (policy.priorClaimsPaid || 0));
  const currentTotalPayable = lineResults.reduce((sum, lr) => sum + lr.payable, 0);

  if (currentTotalPayable > availableSI) {
    const excess = currentTotalPayable - availableSI;
    if (currentTotalPayable > 0) {
      const reductions = new Array(lineResults.length).fill(0);
      const remainders = [];
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

      let deficit = excess - totalFloorCut;
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
          lineResults[i].deducted += cut;
          deductions.push({
            lineId: lineResults[i].id,
            ruleId: 'SI_CLAMP',
            clauseId: siClauseId,
            amount: cut,
            formula: {
              template: 'hareNiemeyer(excess, payable, totalPayable)',
              vars: { excess, linePayable: prevPayable, totalPayable: currentTotalPayable },
              result: cut
            }
          });
        }
      }
    }
  }

  // 5. Calculate Final Totals
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
    lines: lineResults
  };
}

/**
 * Calculates out-of-pocket savings if an in-cap room had been chosen.
 */
function avoidableShortfall(policy, bill) {
  const current = forecast(policy, bill);
  let cap = Infinity;
  const roomRent = policy.roomRent || {};
  if (roomRent.mode === 'pctSI') {
    cap = Math.floor(((policy.sumInsured || 0) * (roomRent.value || 0)) / 100);
  } else if (roomRent.mode === 'fixedPerDay') {
    cap = roomRent.value || 0;
  }

  if (cap === Infinity) return 0;

  // Simulate bill with room rate adjusted to cap
  const inCapBill = {
    ...bill,
    lines: (bill.lines || []).map(l => {
      if (l.category === 'room') {
        const qty = l.qty || 1;
        return {
          ...l,
          rate: Math.min(l.rate || 0, cap),
          amount: Math.min(l.amount || 0, qty * cap)
        };
      }
      return l;
    })
  };

  const inCapForecast = forecast(policy, inCapBill);
  return Math.max(0, current.youPay - inCapForecast.youPay);
}

/**
 * Compares engine forecast against insurer settlement statement.
 * Detects illegal deductions on exempt items.
 */
function auditSettlement(forecastResult, settlement) {
  const discrepancies = [];
  let totalDiscrepancyAmount = 0;

  const forecastMap = new Map();
  for (const lr of forecastResult.lines) {
    forecastMap.set(lr.id, lr);
  }

  for (const sl of settlement.settlementLines || []) {
    const expected = forecastMap.get(sl.lineId);
    if (!expected) continue;

    // If insurer deducted more than policy allows
    if (sl.deducted > expected.deducted) {
      const diff = sl.deducted - expected.deducted;
      discrepancies.push({
        lineId: sl.lineId,
        insurerDeducted: sl.deducted,
        policyAllows: expected.deducted,
        difference: diff,
        clauseId: 'SP-3.3',
        clauseQuote: 'Clause 3.2 does not apply to pharmacy, medicines and diagnostic investigations.'
      });
      totalDiscrepancyAmount += diff;
    }
  }

  return {
    discrepancies,
    totalDiscrepancyAmount,
    statutoryGround: 'IRDAI Master Circular 2020 (Ref: IRDAI/HLT/CIR/GDL/61/04/2020 Section 5, Clause 19)'
  };
}

/**
 * Drafts formal legal grievance letter citing IRDAI regulations and Ombudsman rules.
 */
function generateAppeal(settlement, discrepancies, regulatoryRefs) {
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
      'Insurance Ombudsman Rules 2017 Rule 13'
    ]
  };
}

module.exports = {
  forecast,
  resolveRoomBilling,
  sanitizeRoomCapInput,
  avoidableShortfall,
  auditSettlement,
  generateAppeal,
  ClauseCompletenessError,
  ValidationError
};
