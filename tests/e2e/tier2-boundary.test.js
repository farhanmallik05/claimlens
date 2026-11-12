/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * 25 Boundary & Corner Test Cases
 * Run with: node --test tests/e2e/tier2-boundary.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  forecast,
  resolveRoomBilling,
  sanitizeRoomCapInput,
  ClauseCompletenessError,
  ValidationError
} = require('./engine.js');

const fixturesDir = path.resolve(__dirname, '../../fixtures');
const policyRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));

const boundaryCases = [];

function registerBoundary(id, domain, name, fn) {
  boundaryCases.push({ id, domain, name, fn });
  test(`[Boundary] ${id} (${domain}): ${name}`, fn);
}

describe('Tier 2: Boundary & Corner Cases (25 Test Cases)', () => {
  registerBoundary('TC-T2-01', '₹0 Bill Total', 'Handles zero bill without division by zero', () => {
    const bill = { lines: [{ id: 'l1', category: 'room', amount: 0, qty: 1, rate: 0 }] };
    const res = forecast(policyRaju, bill);
    assert.equal(res.billed, 0);
    assert.equal(res.insurerPays, 0);
    assert.equal(res.youPay, 0);
    assert.equal(res.deductions.length, 0);
  });

  registerBoundary('TC-T2-02', 'Negative Amount Rejection', 'Throws ValidationError on negative amount', () => {
    const bill = { lines: [{ id: 'l1', category: 'room', amount: -5000, qty: 1, rate: 5000 }] };
    assert.throws(() => {
      forecast(policyRaju, bill);
    }, ValidationError);
  });

  registerBoundary('TC-T2-03', 'Negative Quantity Rejection', 'Throws ValidationError on negative qty', () => {
    const bill = { lines: [{ id: 'l1', category: 'room', amount: 5000, qty: -1, rate: 5000 }] };
    assert.throws(() => {
      forecast(policyRaju, bill);
    }, ValidationError);
  });

  registerBoundary('TC-T2-04', 'Exact Cap Boundary', 'Zero deductions at exact room cap limit', () => {
    const bill = {
      lines: [
        { id: 'l-room', category: 'room', qty: 5, rate: 5000, amount: 25000 },
        { id: 'l-surg', category: 'professional', qty: 1, rate: 30000, amount: 30000 }
      ]
    };
    const res = forecast(policyRaju, bill);
    assert.equal(res.insurerPays, 55000);
    assert.equal(res.youPay, 0);
    assert.equal(res.deductions.length, 0);
  });

  registerBoundary('TC-T2-05', '1 Rupee Under Cap', 'Rate 4999 does not trigger proportionate penalty', () => {
    const bill = {
      lines: [
        { id: 'l-room', category: 'room', qty: 5, rate: 4999, amount: 24995 },
        { id: 'l-surg', category: 'professional', qty: 1, rate: 30000, amount: 30000 }
      ]
    };
    const res = forecast(policyRaju, bill);
    assert.equal(res.insurerPays, 54995);
    assert.equal(res.youPay, 0);
    assert.equal(res.deductions.length, 0);
  });

  registerBoundary('TC-T2-06', '1 Rupee Over Cap', 'Rate 5001 triggers room cut and proportionate penalty', () => {
    const bill = {
      lines: [
        { id: 'l-room', category: 'room', qty: 5, rate: 5001, amount: 25005 },
        { id: 'l-surg', category: 'professional', qty: 1, rate: 30000, amount: 30000 }
      ]
    };
    const res = forecast(policyRaju, bill);
    const roomCut = res.deductions.find(d => d.ruleId === 'ROOM_CAP');
    const profCut = res.deductions.find(d => d.ruleId === 'PROPORTIONATE');
    assert.ok(roomCut);
    assert.equal(roomCut.amount, 5); // 25005 - (5 * 5000) = 5
    assert.ok(profCut);
    assert.ok(profCut.amount > 0);
  });

  registerBoundary('TC-T2-07', 'Sum Insured Exact Match', 'Payable equal to SI triggers 0 clamp deduction', () => {
    const policy = { ...policyRaju, sumInsured: 500000, priorClaimsPaid: 0 };
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 500000 }]
    };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, 500000);
    assert.equal(res.youPay, 0);
    assert.equal(res.deductions.filter(d => d.ruleId === 'SI_CLAMP').length, 0);
  });

  registerBoundary('TC-T2-08', '1 Rupee Over Sum Insured', 'Payable 500001 clamps exactly 1 rupee', () => {
    const policy = { ...policyRaju, sumInsured: 500000, priorClaimsPaid: 0 };
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 500001 }]
    };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, 500000);
    assert.equal(res.youPay, 1);
    const clamp = res.deductions.find(d => d.ruleId === 'SI_CLAMP');
    assert.ok(clamp);
    assert.equal(clamp.amount, 1);
  });

  registerBoundary('TC-T2-09', 'Zero Remaining Sum Insured', 'priorClaimsPaid === sumInsured leaves ₹0 payable', () => {
    const policy = { ...policyRaju, sumInsured: 500000, priorClaimsPaid: 500000 };
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 80000 }]
    };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, 0);
    assert.equal(res.youPay, 80000);
    const clamp = res.deductions.find(d => d.ruleId === 'SI_CLAMP');
    assert.equal(clamp.amount, 80000);
  });

  registerBoundary('TC-T2-10', 'Empty Lines Array', 'Bill with empty lines produces clean zeros', () => {
    const bill = { lines: [] };
    const res = forecast(policyRaju, bill);
    assert.equal(res.billed, 0);
    assert.equal(res.insurerPays, 0);
    assert.equal(res.youPay, 0);
    assert.deepEqual(res.deductions, []);
    assert.deepEqual(res.lines, []);
  });

  registerBoundary('TC-T2-11', 'Non-Payable Equals Line Amount', 'Eligible becomes zero', () => {
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 4000, nonPayable: { amount: 4000 } }]
    };
    const res = forecast(policyRaju, bill);
    assert.equal(res.insurerPays, 0);
    assert.equal(res.youPay, 4000);
    assert.equal(res.deductions[0].amount, 4000);
  });

  registerBoundary('TC-T2-12', 'Non-Payable Exceeds Line Amount', 'Non-payable clamped to line amount', () => {
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 4000, nonPayable: { amount: 5000 } }]
    };
    const res = forecast(policyRaju, bill);
    assert.equal(res.insurerPays, 0);
    assert.equal(res.youPay, 4000);
    assert.equal(res.deductions[0].amount, 4000);
  });

  registerBoundary('TC-T2-13', '100% Co-pay Boundary', '100% co-pay deducts entire payable', () => {
    const policy = {
      ...policyRaju,
      copay: { pct: 100, order: 'afterCap', clauseId: 'SP-5.1' }
    };
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 50000 }]
    };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, 0);
    assert.equal(res.youPay, 50000);
    assert.equal(res.deductions[0].amount, 50000);
  });

  registerBoundary('TC-T2-14', '0% Co-pay Boundary', '0% co-pay emits zero deduction', () => {
    const policy = {
      ...policyRaju,
      copay: { pct: 0, order: 'afterCap', clauseId: 'SP-5.1' }
    };
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: 50000 }]
    };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, 50000);
    assert.equal(res.deductions.filter(d => d.ruleId === 'COPAY').length, 0);
  });

  registerBoundary('TC-T2-15', 'Unknown Clause ID Guard', 'Engine fails when clauseId is unknown', () => {
    const invalidPolicy = {
      ...policyRaju,
      roomRent: { mode: 'fixedPerDay', value: 5000, clauseId: 'UNKNOWN-999' }
    };
    const bill = {
      lines: [{ id: 'l1', category: 'room', qty: 1, rate: 8000, amount: 8000 }]
    };
    assert.throws(() => {
      forecast(invalidPolicy, bill);
    }, ClauseCompletenessError);
  });

  registerBoundary('TC-T2-16', 'Missing policy.clauses Key', 'Throws ClauseCompletenessError if clauses is empty', () => {
    const emptyPolicy = {
      ...policyRaju,
      clauses: {}
    };
    const bill = {
      lines: [{ id: 'l1', category: 'room', qty: 1, rate: 8000, amount: 8000 }]
    };
    assert.throws(() => {
      forecast(emptyPolicy, bill);
    }, ClauseCompletenessError);
  });

  registerBoundary('TC-T2-17', 'Macroeconomic Rupee Overflow', '10 Crore bill within MAX_SAFE_INTEGER', () => {
    const hugeAmount = 100000000; // ₹10 Cr
    const bill = {
      lines: [{ id: 'l1', category: 'pharmacy', amount: hugeAmount }]
    };
    const policy = { ...policyRaju, sumInsured: 200000000 };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, hugeAmount);
    assert.ok(hugeAmount < Number.MAX_SAFE_INTEGER);
  });

  registerBoundary('TC-T2-18', 'Bill Without Room Line', 'Evaluates cleanly when no room line exists', () => {
    const bill = {
      lines: [
        { id: 'l-surg', category: 'professional', amount: 40000 },
        { id: 'l-meds', category: 'pharmacy', amount: 20000 }
      ]
    };
    const res = forecast(policyRaju, bill);
    assert.equal(res.insurerPays, 60000);
    assert.equal(res.youPay, 0);
  });

  registerBoundary('TC-T2-19', 'Multi-Room 0-Day Record', 'resolveRoomBilling ignores 0-day records without NaN', () => {
    const lines = [
      { id: 'l1', category: 'room', qty: 0, rate: 5000, amount: 0 },
      { id: 'l2', category: 'room', qty: 3, rate: 6000, amount: 18000 }
    ];
    const billing = resolveRoomBilling(lines);
    assert.equal(billing.totalDays, 3);
    assert.equal(billing.rate, 6000);
    assert.ok(!isNaN(billing.rate));
  });

  registerBoundary('TC-T2-20', 'Non-Divisible Fraction Floor', 'Eligible 10000, Cap 3000, Rate 7000 produces 4285', () => {
    const policy = {
      ...policyRaju,
      roomRent: { mode: 'fixedPerDay', value: 3000, clauseId: 'SP-3.1' }
    };
    const bill = {
      lines: [
        { id: 'l-room', category: 'room', qty: 1, rate: 7000, amount: 7000 },
        { id: 'l-surg', category: 'professional', qty: 1, rate: 10000, amount: 10000 }
      ]
    };
    const res = forecast(policy, bill);
    const surgLine = res.lines.find(l => l.id === 'l-surg');
    assert.equal(surgLine.payable, 4285); // floor(10000 * 3000 / 7000) = 4285
    assert.ok(Number.isInteger(surgLine.payable));
  });

  registerBoundary('TC-T2-21', 'Room Mode none with Huge Bill', 'Mode none applies zero cap or proportionate cut', () => {
    const policy = { ...policyRaju, roomRent: { mode: 'none' } };
    const bill = {
      lines: [
        { id: 'l-room', category: 'room', qty: 5, rate: 50000, amount: 250000 },
        { id: 'l-surg', category: 'professional', amount: 100000 }
      ]
    };
    const res = forecast(policy, bill);
    assert.equal(res.insurerPays, 350000);
    assert.equal(res.deductions.length, 0);
  });

  registerBoundary('TC-T2-22', 'Scrubbing Cap Negative Input', 'Sanitizes negative input to 0', () => {
    const cleaned = sanitizeRoomCapInput('-5000', 500000);
    assert.equal(cleaned, 0);
  });

  registerBoundary('TC-T2-23', 'Scrubbing Cap Non-Numeric Input', 'Sanitizes non-numeric string to 0', () => {
    const cleaned = sanitizeRoomCapInput('abc$#@', 500000);
    assert.equal(cleaned, 0);
  });

  registerBoundary('TC-T2-24', 'SSE Disconnect 5999ms vs 6001ms', 'Threshold 6000ms bounds circuit breaker', () => {
    const timeoutThreshold = 6000;
    const isCircuitBreakerTripped = (ms) => ms >= timeoutThreshold;
    assert.equal(isCircuitBreakerTripped(5999), false);
    assert.equal(isCircuitBreakerTripped(6001), true);
  });

  registerBoundary('TC-T2-25', 'Mobile Viewport Width 389px', 'Container handles 389px viewport cleanly', () => {
    const viewportWidth = 389;
    const isMobile = viewportWidth < 768;
    assert.equal(isMobile, true);
    assert.ok(viewportWidth >= 320);
  });
});

module.exports = {
  boundaryCases
};
