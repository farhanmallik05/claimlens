/**
 * Tier 3: Cross-Feature Combinations (Orthogonal Pairwise Matrix)
 * 18 Orthogonal Pairwise Test Runs covering all 2-way interactions of 5 factors:
 * Factor A (Room Cap) × Factor B (Proportionate) × Factor C (Co-pay) × Factor D (Non-Payables) × Factor E (SI Clamp)
 * Run with: node --test tests/e2e/tier3-pairwise.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { forecast } = require('./engine.js');

const fixturesDir = path.resolve(__dirname, '../../fixtures');
const basePolicy = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));
const baseBill = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'bill.raju.json'), 'utf8'));

// 5 Factor Definitions
const factors = {
  A: {
    under_cap: { rate: 3500 },
    at_cap: { rate: 5000 },
    over_cap: { rate: 8000 }
  },
  B: {
    disabled: { enabled: false, appliesTo: ['professional'] },
    prof_only: { enabled: true, appliesTo: ['professional'] },
    prof_and_diag: { enabled: true, appliesTo: ['professional', 'diagnostics'] }
  },
  C: {
    zero: { pct: 0, order: 'afterCap' },
    copay_10_after: { pct: 10, order: 'afterCap' },
    copay_20_before: { pct: 20, order: 'beforeCap' }
  },
  D: {
    none: (lines) => lines.map(l => ({ ...l, nonPayable: undefined })),
    partial_pharmacy: (lines) => lines.map(l => (l.id === 'line-consumables' ? { ...l, nonPayable: { amount: 4000 } } : { ...l, nonPayable: undefined })),
    multiline: (lines) => lines.map(l => {
      if (l.id === 'line-consumables') return { ...l, nonPayable: { amount: 4000 } };
      if (l.id === 'line-imaging') return { ...l, nonPayable: { amount: 2000 } };
      return { ...l, nonPayable: undefined };
    })
  },
  E: {
    unclamped: { sumInsured: 1000000, priorClaimsPaid: 0 },
    near_cap: { sumInsured: 110000, priorClaimsPaid: 0 },
    clamped: { sumInsured: 50000, priorClaimsPaid: 0 }
  }
};

// 18 Concrete Pairwise Runs (Standard Taguchi L18(2^1 x 3^7) Orthogonal Array)
const pairwiseRuns = [
  { id: 'TC-T3-01', A: 'under_cap', B: 'disabled',      C: 'zero',            D: 'none',             E: 'unclamped', desc: 'Under cap, disabled prof, 0% copay, no non-pay, unclamped' },
  { id: 'TC-T3-02', A: 'under_cap', B: 'prof_only',     C: 'copay_10_after',  D: 'partial_pharmacy', E: 'near_cap',  desc: 'Under cap, prof only, 10% copay after, partial non-pay, near cap' },
  { id: 'TC-T3-03', A: 'under_cap', B: 'prof_and_diag', C: 'copay_20_before', D: 'multiline',        E: 'clamped',   desc: 'Under cap, prof+diag, 20% copay before, multi non-pay, clamped' },
  { id: 'TC-T3-04', A: 'at_cap',    B: 'disabled',      C: 'copay_10_after',  D: 'multiline',        E: 'unclamped', desc: 'At cap, disabled prof, 10% copay after, multi non-pay, unclamped' },
  { id: 'TC-T3-05', A: 'at_cap',    B: 'prof_only',     C: 'copay_20_before', D: 'none',             E: 'near_cap',  desc: 'At cap, prof only, 20% copay before, no non-pay, near cap' },
  { id: 'TC-T3-06', A: 'at_cap',    B: 'prof_and_diag', C: 'zero',            D: 'partial_pharmacy', E: 'clamped',   desc: 'At cap, prof+diag, 0% copay, partial non-pay, clamped' },
  { id: 'TC-T3-07', A: 'over_cap',  B: 'disabled',      C: 'copay_20_before', D: 'partial_pharmacy', E: 'clamped',   desc: 'Over cap, disabled prof, 20% copay before, partial non-pay, clamped' },
  { id: 'TC-T3-08', A: 'over_cap',  B: 'prof_only',     C: 'zero',            D: 'multiline',        E: 'unclamped', desc: 'Over cap, prof only, 0% copay, multi non-pay, unclamped' },
  { id: 'TC-T3-09', A: 'over_cap',  B: 'prof_and_diag', C: 'copay_10_after',  D: 'none',             E: 'near_cap',  desc: 'Over cap, prof+diag, 10% copay after, no non-pay, near cap' },
  { id: 'TC-T3-10', A: 'under_cap', B: 'disabled',      C: 'copay_20_before', D: 'multiline',        E: 'near_cap',  desc: 'Under cap, disabled prof, 20% copay before, multi non-pay, near cap' },
  { id: 'TC-T3-11', A: 'under_cap', B: 'prof_only',     C: 'zero',            D: 'none',             E: 'clamped',   desc: 'Under cap, prof only, 0% copay, no non-pay, clamped' },
  { id: 'TC-T3-12', A: 'under_cap', B: 'prof_and_diag', C: 'copay_10_after',  D: 'partial_pharmacy', E: 'unclamped', desc: 'Under cap, prof+diag, 10% copay after, partial non-pay, unclamped' },
  { id: 'TC-T3-13', A: 'at_cap',    B: 'disabled',      C: 'zero',            D: 'partial_pharmacy', E: 'near_cap',  desc: 'At cap, disabled prof, 0% copay, partial non-pay, near cap' },
  { id: 'TC-T3-14', A: 'at_cap',    B: 'prof_only',     C: 'copay_10_after',  D: 'multiline',        E: 'clamped',   desc: 'At cap, prof only, 10% copay after, multi non-pay, clamped' },
  { id: 'TC-T3-15', A: 'at_cap',    B: 'prof_and_diag', C: 'copay_20_before', D: 'none',             E: 'unclamped', desc: 'At cap, prof+diag, 20% copay before, no non-pay, unclamped' },
  { id: 'TC-T3-16', A: 'over_cap',  B: 'disabled',      C: 'copay_10_after',  D: 'none',             E: 'clamped',   desc: 'Over cap, disabled prof, 10% copay after, no non-pay, clamped' },
  { id: 'TC-T3-17', A: 'over_cap',  B: 'prof_only',     C: 'copay_20_before', D: 'partial_pharmacy', E: 'unclamped', desc: 'Over cap, prof only, 20% copay before, partial non-pay, unclamped' },
  { id: 'TC-T3-18', A: 'over_cap',  B: 'prof_and_diag', C: 'zero',            D: 'multiline',        E: 'near_cap',  desc: 'Over cap, prof+diag, 0% copay, multi non-pay, near cap' }
];

function buildTestCase(run) {
  const roomConfig = factors.A[run.A];
  const propConfig = factors.B[run.B];
  const copayConfig = factors.C[run.C];
  const nonPayTransform = factors.D[run.D];
  const siConfig = factors.E[run.E];

  const policy = {
    ...basePolicy,
    sumInsured: siConfig.sumInsured,
    priorClaimsPaid: siConfig.priorClaimsPaid,
    // Fixed 5,000 cap across different SI levels for consistent factor testing:
    roomRent: { mode: 'fixedPerDay', value: 5000, clauseId: 'SP-3.1' },
    proportionate: {
      enabled: propConfig.enabled,
      appliesTo: propConfig.appliesTo,
      clauseId: 'SP-3.2'
    },
    copay: {
      pct: copayConfig.pct,
      order: copayConfig.order,
      clauseId: 'SP-5.1'
    }
  };

  const modifiedLines = nonPayTransform(
    baseBill.lines.map(l => {
      if (l.category === 'room') {
        return { ...l, rate: roomConfig.rate, amount: roomConfig.rate * (l.qty || 5) };
      }
      return { ...l };
    })
  );

  const bill = {
    ...baseBill,
    lines: modifiedLines
  };

  return { policy, bill };
}

describe('Tier 3: Orthogonal Pairwise Matrix (18 Runs)', () => {
  for (const run of pairwiseRuns) {
    test(`[Pairwise] ${run.id}: ${run.desc}`, () => {
      const { policy, bill } = buildTestCase(run);
      const res = forecast(policy, bill);

      // Invariant 1: Integer Rupees Only
      assert.ok(Number.isInteger(res.billed), 'res.billed must be integer');
      assert.ok(Number.isInteger(res.insurerPays), 'res.insurerPays must be integer');
      assert.ok(Number.isInteger(res.youPay), 'res.youPay must be integer');
      for (const d of res.deductions) {
        assert.ok(Number.isInteger(d.amount), `Deduction ${d.ruleId} amount must be integer`);
      }
      for (const lr of res.lines) {
        assert.ok(Number.isInteger(lr.payable), `Line ${lr.id} payable must be integer`);
        assert.ok(Number.isInteger(lr.deducted), `Line ${lr.id} deducted must be integer`);
      }

      // Invariant 2: Conservation Law FR-7
      const sumDeductions = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(
        res.billed - res.insurerPays,
        sumDeductions,
        `Conservation failed on ${run.id}: billed (${res.billed}) - insurerPays (${res.insurerPays}) !== sumDeductions (${sumDeductions})`
      );
      assert.equal(
        res.insurerPays + res.youPay,
        res.billed,
        `Total balance failed on ${run.id}: insurerPays + youPay !== billed`
      );

      // Invariant 3: Clause Completeness Guard FR-12
      for (const d of res.deductions) {
        assert.ok(policy.clauses[d.clauseId], `Clause ${d.clauseId} missing from policy.clauses`);
        assert.ok(d.formula, `Formula missing for deduction ${d.ruleId}`);
        assert.equal(d.formula.result, d.amount, `Formula result mismatch on ${d.ruleId}`);
      }

      // Factor-Specific Assertions
      if (run.A === 'under_cap' || run.A === 'at_cap') {
        assert.equal(
          res.deductions.filter(d => d.ruleId === 'ROOM_CAP').length,
          0,
          `Under/at cap must have 0 ROOM_CAP deductions`
        );
        assert.equal(
          res.deductions.filter(d => d.ruleId === 'PROPORTIONATE').length,
          0,
          `Under/at cap must have 0 PROPORTIONATE deductions`
        );
      }

      if (run.A === 'over_cap') {
        assert.ok(res.deductions.some(d => d.ruleId === 'ROOM_CAP'), 'Must have ROOM_CAP deduction');
        if (run.B !== 'disabled') {
          assert.ok(res.deductions.some(d => d.ruleId === 'PROPORTIONATE'), 'Must have PROPORTIONATE deduction');
        }
      }

      if (run.C !== 'zero') {
        assert.ok(res.deductions.some(d => d.ruleId === 'COPAY'), 'Must have COPAY deduction');
      }

      if (run.D !== 'none') {
        assert.ok(res.deductions.some(d => d.ruleId === 'NON_PAYABLE'), 'Must have NON_PAYABLE deduction');
      }

      if (run.E === 'clamped') {
        assert.ok(
          res.insurerPays <= policy.sumInsured,
          `Insurer payout (${res.insurerPays}) must not exceed SI (${policy.sumInsured})`
        );
        assert.ok(
          res.deductions.some(d => d.ruleId === 'SI_CLAMP'),
          'Must have SI_CLAMP deduction'
        );
      }
    });
  }
});

module.exports = {
  factors,
  pairwiseRuns,
  buildTestCase
};
