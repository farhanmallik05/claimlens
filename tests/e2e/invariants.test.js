/**
 * Property Invariant Test Suite
 * Conservation Law (FR-7: 100 random runs)
 * Room Rate Monotonicity (FR-8: 100 random runs)
 * Clause Completeness Guard (FR-12)
 * Zero Float Currency Audit
 * Run with: node --test tests/e2e/invariants.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  forecast,
  ClauseCompletenessError
} = require('./engine.js');

const fixturesDir = path.resolve(__dirname, '../../fixtures');
const basePolicy = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));

// Deterministic pseudo-random generator with seed for reproducible property runs
function createPRNG(seed = 123456789) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const prng = createPRNG(42);

function getRandomInt(min, max) {
  return Math.floor(prng() * (max - min + 1)) + min;
}

function generateRandomPolicy() {
  const sumInsured = getRandomInt(50000, 2000000);
  const copayPct = prng() < 0.5 ? 0 : getRandomInt(5, 30);
  const copayOrder = prng() < 0.5 ? 'afterCap' : 'beforeCap';
  const roomMode = prng() < 0.33 ? 'pctSI' : (prng() < 0.66 ? 'fixedPerDay' : 'none');

  return {
    ...basePolicy,
    sumInsured,
    priorClaimsPaid: getRandomInt(0, Math.floor(sumInsured * 0.4)),
    roomRent: {
      mode: roomMode,
      value: roomMode === 'pctSI' ? getRandomInt(1, 2) : (roomMode === 'fixedPerDay' ? getRandomInt(2000, 8000) : 0),
      clauseId: 'SP-3.1'
    },
    proportionate: {
      enabled: prng() > 0.2,
      appliesTo: prng() > 0.5 ? ['professional'] : ['professional', 'diagnostics'],
      clauseId: 'SP-3.2'
    },
    copay: {
      pct: copayPct,
      order: copayOrder,
      clauseId: 'SP-5.1'
    }
  };
}

function generateRandomBill() {
  const lineCount = getRandomInt(2, 10);
  const categories = ['room', 'professional', 'pharmacy', 'diagnostics', 'other'];
  const lines = [];

  for (let i = 0; i < lineCount; i++) {
    const category = categories[getRandomInt(0, categories.length - 1)];
    const rate = getRandomInt(1000, 25000);
    const qty = category === 'room' ? getRandomInt(1, 10) : getRandomInt(1, 3);
    const amount = rate * qty;
    const hasNonPayable = prng() < 0.3;
    const nonPayable = hasNonPayable
      ? { amount: getRandomInt(500, Math.min(amount, 5000)), reason: 'Consumables' }
      : undefined;

    lines.push({
      id: `line-${i + 1}`,
      category,
      label: `Service ${i + 1}`,
      qty,
      rate,
      amount,
      nonPayable
    });
  }

  return { id: `bill-rand-${Date.now()}`, lines };
}

describe('Property Invariants & Zero Float Audit', () => {
  // -------------------------------------------------------------
  // Invariant 1: Conservation Law FR-7 (100 Iterations)
  // -------------------------------------------------------------
  test('[Invariant FR-7] Conservation Law across 100 randomized runs', () => {
    let runsCompleted = 0;
    for (let i = 0; i < 100; i++) {
      const policy = generateRandomPolicy();
      const bill = generateRandomBill();
      const res = forecast(policy, bill);

      // Invariant: billed === insurerPays + youPay
      assert.equal(
        res.insurerPays + res.youPay,
        res.billed,
        `Conservation failure on run ${i}: insurerPays (${res.insurerPays}) + youPay (${res.youPay}) !== billed (${res.billed})`
      );

      // Invariant: billed - insurerPays === sum(deductions.amount)
      const sumDeductions = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(
        res.billed - res.insurerPays,
        sumDeductions,
        `Deduction sum failure on run ${i}: billed - insurerPays !== sumDeductions`
      );

      // Line level conservation
      for (const line of res.lines) {
        const lineDeductions = res.deductions.filter(d => d.lineId === line.id);
        const lineSum = lineDeductions.reduce((s, d) => s + d.amount, 0);
        assert.equal(
          line.billed - line.payable,
          lineSum,
          `Line-level conservation failure on line ${line.id}`
        );
      }
      runsCompleted++;
    }
    assert.equal(runsCompleted, 100);
  });

  // -------------------------------------------------------------
  // Invariant 2: Room Rate Monotonicity FR-8 (100 Iterations)
  // -------------------------------------------------------------
  test('[Invariant FR-8] Room Rate Monotonicity across 100 randomized runs', () => {
    let runsCompleted = 0;
    for (let i = 0; i < 100; i++) {
      const policy = generateRandomPolicy();
      const baseBill = generateRandomBill();

      // Pick two room rates r1 <= r2
      const r1 = getRandomInt(1000, 10000);
      const r2 = r1 + getRandomInt(0, 8000);

      const bill1 = {
        ...baseBill,
        lines: baseBill.lines.map(l => (l.category === 'room' ? { ...l, rate: r1, amount: r1 * (l.qty || 1) } : l))
      };
      const bill2 = {
        ...baseBill,
        lines: baseBill.lines.map(l => (l.category === 'room' ? { ...l, rate: r2, amount: r2 * (l.qty || 1) } : l))
      };

      const res1 = forecast(policy, bill1);
      const res2 = forecast(policy, bill2);

      assert.ok(
        res2.youPay >= res1.youPay,
        `Monotonicity violation on run ${i}: youPay at rate ${r2} (${res2.youPay}) < youPay at rate ${r1} (${res1.youPay})`
      );
      runsCompleted++;
    }
    assert.equal(runsCompleted, 100);
  });

  // -------------------------------------------------------------
  // Invariant 3: Clause Completeness Guard FR-12
  // -------------------------------------------------------------
  test('[Invariant FR-12] Clause Completeness Guard on all emitted deductions', () => {
    for (let i = 0; i < 20; i++) {
      const policy = generateRandomPolicy();
      const bill = generateRandomBill();
      const res = forecast(policy, bill);

      for (const d of res.deductions) {
        assert.ok(
          policy.clauses[d.clauseId],
          `Emitted deduction ${d.ruleId} has unmapped clauseId "${d.clauseId}"`
        );
        assert.ok(d.formula, `Deduction ${d.ruleId} missing structured formula`);
        assert.equal(d.formula.result, d.amount, `Formula result mismatch on ${d.ruleId}`);
      }
    }
  });

  test('[Invariant FR-12] Fatal rejection when deduction references missing clauseId', () => {
    const brokenPolicy = {
      ...basePolicy,
      roomRent: { mode: 'fixedPerDay', value: 3000, clauseId: 'NON_EXISTENT_CLAUSE' }
    };
    const bill = {
      lines: [{ id: 'l1', category: 'room', qty: 1, rate: 8000, amount: 8000 }]
    };
    assert.throws(() => {
      forecast(brokenPolicy, bill);
    }, ClauseCompletenessError);
  });

  // -------------------------------------------------------------
  // Invariant 4: Zero Float Leakage Audit
  // -------------------------------------------------------------
  test('[Audit] Zero floating-point numbers across all currency calculations', () => {
    for (let i = 0; i < 50; i++) {
      const policy = generateRandomPolicy();
      const bill = generateRandomBill();
      const res = forecast(policy, bill);

      assert.ok(Number.isInteger(res.billed), 'res.billed must be integer');
      assert.ok(Number.isInteger(res.insurerPays), 'res.insurerPays must be integer');
      assert.ok(Number.isInteger(res.youPay), 'res.youPay must be integer');

      for (const d of res.deductions) {
        assert.ok(Number.isInteger(d.amount), `Deduction ${d.ruleId} amount must be integer`);
      }

      for (const line of res.lines) {
        assert.ok(Number.isInteger(line.billed), `Line ${line.id} billed must be integer`);
        assert.ok(Number.isInteger(line.payable), `Line ${line.id} payable must be integer`);
        assert.ok(Number.isInteger(line.deducted), `Line ${line.id} deducted must be integer`);
      }
    }
  });
});
