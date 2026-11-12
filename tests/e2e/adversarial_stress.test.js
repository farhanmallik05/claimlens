/**
 * Empirical Adversarial Stress Test Suite for ClaimLens Rules Engine
 * Authors: teamwork_challenger
 * Tests:
 *  1. Extreme currency values (₹1 to ₹10,00,00,000)
 *  2. Zero-day and zero-rupee line items
 *  3. Non-payable amounts exceeding line amount
 *  4. Bills with 50+ line items and multiple room transfers
 *  5. Missing or unexpected clause IDs (ClauseCompletenessError)
 *  6. Numerical stability (NaN, Infinity, overflows)
 *  7. Memory leak & performance stress harness (10,000 runs)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  forecast,
  resolveRoomBilling,
  sanitizeRoomCapInput,
  avoidableShortfall,
  auditSettlement,
  generateAppeal,
  ClauseCompletenessError,
  ValidationError
} = require('./engine.js');

const fixturesDir = path.resolve(__dirname, '../../fixtures');
const policyRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));

describe('Empirical Adversarial Stress Suite', () => {

  // =========================================================================
  // 1. Extreme Currency Values (₹1 to ₹10,00,00,000)
  // =========================================================================
  describe('1. Extreme Currency Values (₹1 to ₹10,00,00,000)', () => {
    test('Extreme Minimum: ₹1 bill, ₹1 cap, ₹1 SI', () => {
      const pol = {
        ...policyRaju,
        sumInsured: 1,
        roomRent: { mode: 'fixedPerDay', value: 1, clauseId: 'SP-3.1' }
      };
      const bill = {
        lines: [
          { id: 'l1', category: 'room', qty: 1, rate: 1, amount: 1 }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.billed, 1);
      assert.equal(res.insurerPays, 1);
      assert.equal(res.youPay, 0);
      assert.equal(res.deductions.length, 0);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      assert.ok(Number.isInteger(res.billed));
      assert.ok(Number.isInteger(res.insurerPays));
      assert.ok(Number.isInteger(res.youPay));
    });

    test('₹1 over cap: ₹2 room with ₹1 cap', () => {
      const pol = {
        ...policyRaju,
        sumInsured: 100,
        roomRent: { mode: 'fixedPerDay', value: 1, clauseId: 'SP-3.1' }
      };
      const bill = {
        lines: [
          { id: 'l1', category: 'room', qty: 1, rate: 2, amount: 2 }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.billed, 2);
      assert.equal(res.insurerPays, 1);
      assert.equal(res.youPay, 1);
      assert.equal(res.deductions.length, 1);
      assert.equal(res.deductions[0].amount, 1);
      assert.equal(res.insurerPays + res.youPay, res.billed);
    });

    test('Extreme Maximum: ₹10 Crore (₹10,00,00,000) bill fully within ₹10 Crore SI', () => {
      const TEN_CRORE = 100000000;
      const pol = {
        ...policyRaju,
        sumInsured: TEN_CRORE,
        roomRent: { mode: 'fixedPerDay', value: 500000, clauseId: 'SP-3.1' }
      };
      const bill = {
        lines: [
          { id: 'room', category: 'room', qty: 10, rate: 200000, amount: 2000000 },
          { id: 'surg', category: 'professional', amount: 50000000 },
          { id: 'pharm', category: 'pharmacy', amount: 48000000 }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.billed, TEN_CRORE);
      assert.equal(res.insurerPays, TEN_CRORE);
      assert.equal(res.youPay, 0);
      assert.equal(res.deductions.length, 0);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      assert.ok(Number.isInteger(res.billed));
      assert.ok(Number.isInteger(res.insurerPays));
      assert.ok(Number.isInteger(res.youPay));
    });

    test('Extreme Maximum: ₹10 Crore bill with ₹5 Lakh SI (severe SI clamp)', () => {
      const TEN_CRORE = 100000000;
      const pol = {
        ...policyRaju,
        sumInsured: 500000,
        roomRent: { mode: 'fixedPerDay', value: 5000, clauseId: 'SP-3.1' }
      };
      const bill = {
        lines: [
          { id: 'room', category: 'room', qty: 10, rate: 10000, amount: 100000 },
          { id: 'surg', category: 'professional', amount: 50000000 },
          { id: 'pharm', category: 'pharmacy', amount: 49900000 }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.billed, TEN_CRORE);
      assert.equal(res.insurerPays, 500000);
      assert.equal(res.youPay, TEN_CRORE - 500000);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      const sumDeductions = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(res.billed - res.insurerPays, sumDeductions);
      assert.ok(Number.isInteger(res.insurerPays));
      assert.ok(Number.isInteger(res.youPay));
    });

    test('Extreme Ratio: ₹10 Crore room charge with ₹5,000 cap', () => {
      const pol = {
        ...policyRaju,
        sumInsured: 200000000,
        roomRent: { mode: 'fixedPerDay', value: 5000, clauseId: 'SP-3.1' }
      };
      const bill = {
        lines: [
          { id: 'room', category: 'room', qty: 1, rate: 100000000, amount: 100000000 },
          { id: 'surg', category: 'professional', amount: 50000000 }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.billed, 150000000);
      // Room allowed: 1 * 5000 = 5000. Cut = 99995000.
      // Rate = 100000000. Cap = 5000.
      // Surg payable = Math.floor(50000000 * 5000 / 100000000) = 2500. Cut = 49997500.
      const roomLine = res.lines.find(l => l.id === 'room');
      const surgLine = res.lines.find(l => l.id === 'surg');
      assert.equal(roomLine.payable, 5000);
      assert.equal(surgLine.payable, 2500);
      assert.equal(res.insurerPays, 7500);
      assert.equal(res.youPay, 150000000 - 7500);
      assert.equal(res.insurerPays + res.youPay, res.billed);
    });
  });

  // =========================================================================
  // 2. Zero-Day and Zero-Rupee Line Items
  // =========================================================================
  describe('2. Zero-Day and Zero-Rupee Line Items', () => {
    test('Zero-rupee bill (empty lines or amount 0)', () => {
      const bill = { lines: [{ id: 'zero-line', category: 'pharmacy', amount: 0 }] };
      const res = forecast(policyRaju, bill);
      assert.equal(res.billed, 0);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 0);
      assert.equal(res.deductions.length, 0);
    });

    test('Zero-day room line item with zero amount', () => {
      const bill = {
        lines: [
          { id: 'room-zero', category: 'room', qty: 0, rate: 0, amount: 0 },
          { id: 'surg', category: 'professional', amount: 50000 }
        ]
      };
      const res = forecast(policyRaju, bill);
      assert.equal(res.billed, 50000);
      assert.equal(res.insurerPays, 50000);
      assert.equal(res.youPay, 0);
      assert.equal(res.deductions.length, 0);
      assert.equal(res.insurerPays + res.youPay, res.billed);
    });

    test('Zero-day room line alongside positive-day room line', () => {
      const bill = {
        lines: [
          { id: 'room-active', category: 'room', qty: 5, rate: 8000, amount: 40000 },
          { id: 'room-cancelled', category: 'room', qty: 0, rate: 10000, amount: 0 },
          { id: 'surg', category: 'professional', amount: 30000 }
        ]
      };
      const res = forecast(policyRaju, bill);
      assert.equal(res.billed, 70000);
      // Rate = 40000 / 5 = 8000. Cap = 5000. Over cap!
      // Room allowed = 5 * 5000 = 25000. Room cut = 15000.
      // Surg payable = floor(30000 * 5000 / 8000) = 18750. Prof cut = 11250.
      // Cancelled room payable = 0, cut = 0.
      assert.equal(res.insurerPays, 25000 + 18750);
      assert.equal(res.youPay, 70000 - (25000 + 18750));
      assert.equal(res.insurerPays + res.youPay, res.billed);
    });

    test('Zero-rupee line item alongside normal line items', () => {
      const bill = {
        lines: [
          { id: 'l1', category: 'room', qty: 5, rate: 5000, amount: 25000 },
          { id: 'l2', category: 'pharmacy', amount: 0 },
          { id: 'l3', category: 'investigation', amount: 15000 }
        ]
      };
      const res = forecast(policyRaju, bill);
      assert.equal(res.billed, 40000);
      assert.equal(res.insurerPays, 40000);
      assert.equal(res.youPay, 0);
      assert.equal(res.deductions.length, 0);
    });

    test('Negative qty throws ValidationError', () => {
      const bill = {
        lines: [{ id: 'l1', category: 'room', qty: -2, rate: 5000, amount: 10000 }]
      };
      assert.throws(() => forecast(policyRaju, bill), ValidationError);
    });

    test('Negative amount throws ValidationError', () => {
      const bill = {
        lines: [{ id: 'l1', category: 'pharmacy', amount: -500 }]
      };
      assert.throws(() => forecast(policyRaju, bill), ValidationError);
    });
  });

  // =========================================================================
  // 3. Non-Payable Amounts Exceeding Line Amount
  // =========================================================================
  describe('3. Non-Payable Amounts Exceeding Line Amount', () => {
    test('Non-payable equal to line amount: eligible becomes 0', () => {
      const bill = {
        lines: [
          { id: 'l1', category: 'pharmacy', amount: 5000, nonPayable: { amount: 5000 } }
        ]
      };
      const res = forecast(policyRaju, bill);
      assert.equal(res.billed, 5000);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 5000);
      assert.equal(res.deductions.length, 1);
      assert.equal(res.deductions[0].ruleId, 'NON_PAYABLE');
      assert.equal(res.deductions[0].amount, 5000);
      assert.equal(res.insurerPays + res.youPay, res.billed);
    });

    test('Non-payable strictly exceeding line amount: clamped to line amount, eligible never negative', () => {
      const bill = {
        lines: [
          { id: 'l1', category: 'pharmacy', amount: 4000, nonPayable: { amount: 15000 } }
        ]
      };
      const res = forecast(policyRaju, bill);
      assert.equal(res.billed, 4000);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 4000);
      assert.equal(res.deductions.length, 1);
      assert.equal(res.deductions[0].amount, 4000); // Clamped to line amount
      assert.equal(res.lines[0].payable, 0);
      assert.equal(res.lines[0].deducted, 4000);
      assert.equal(res.insurerPays + res.youPay, res.billed);
    });

    test('Multiple lines with non-payables exceeding line amounts + co-pay + over-cap', () => {
      const pol = {
        ...policyRaju,
        copay: { pct: 10, order: 'afterCap', clauseId: 'SP-5.1' }
      };
      const bill = {
        lines: [
          { id: 'room', category: 'room', qty: 5, rate: 8000, amount: 40000, nonPayable: { amount: 50000 } },
          { id: 'surg', category: 'professional', amount: 30000, nonPayable: { amount: 60000 } },
          { id: 'pharm', category: 'pharmacy', amount: 10000, nonPayable: { amount: 2000 } }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.billed, 80000);
      // room nonPayable clamped to 40000 -> eligible = 0, payable = 0, deducted = 40000
      // surg nonPayable clamped to 30000 -> eligible = 0, payable = 0, deducted = 30000
      // pharm nonPayable 2000 -> eligible = 8000, copay 10% after cap = 800 -> payable = 7200, deducted = 2800
      assert.equal(res.insurerPays, 7200);
      assert.equal(res.youPay, 80000 - 7200);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      const sumD = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(res.billed - res.insurerPays, sumD);
    });
  });

  // =========================================================================
  // 4. Bills with 50+ Line Items and Multiple Room Transfers
  // =========================================================================
  describe('4. Bills with 50+ Line Items & Room Transfers', () => {
    test('60 line items with 5 room transfers (Ward, Semi-pvt, Deluxe, ICU, Suite)', () => {
      const lines = [
        // 5 Room Transfers
        { id: 'rm-gen', category: 'room', label: 'General Ward', qty: 2, rate: 2000, amount: 4000 },
        { id: 'rm-semi', category: 'room', label: 'Semi-Private', qty: 3, rate: 3500, amount: 10500 },
        { id: 'rm-deluxe', category: 'room', label: 'Deluxe Ward', qty: 4, rate: 8000, amount: 32000 },
        { id: 'rm-icu', category: 'room', label: 'Intensive Care Unit (ICU)', qty: 2, rate: 20000, amount: 40000 },
        { id: 'rm-suite', category: 'room', label: 'Executive Suite', qty: 1, rate: 15000, amount: 15000 }
      ];

      // 20 Professional lines
      for (let i = 1; i <= 20; i++) {
        lines.push({
          id: `prof-${i}`,
          category: 'professional',
          label: `Doctor Fee #${i}`,
          amount: 5000 + i * 500
        });
      }

      // 20 Pharmacy lines (some with non-payable)
      for (let i = 1; i <= 20; i++) {
        lines.push({
          id: `pharm-${i}`,
          category: 'pharmacy',
          label: `Medication #${i}`,
          amount: 2000 + i * 200,
          nonPayable: i % 3 === 0 ? { amount: 500 } : undefined
        });
      }

      // 15 Investigation / diagnostic lines
      for (let i = 1; i <= 15; i++) {
        lines.push({
          id: `diag-${i}`,
          category: 'investigation',
          label: `Test Panel #${i}`,
          amount: 1500 + i * 300
        });
      }

      assert.equal(lines.length, 60);

      const pol = {
        ...policyRaju,
        sumInsured: 500000,
        roomRent: { mode: 'fixedPerDay', value: 5000, clauseId: 'SP-3.1' }
      };

      const bill = { lines };
      const startMs = performance.now();
      const res = forecast(pol, bill);
      const endMs = performance.now();

      // Ensure rapid evaluation (<10ms for 60 lines)
      assert.ok(endMs - startMs < 50, `Execution time was ${endMs - startMs}ms`);

      // Verify invariants
      assert.equal(res.lines.length, 60);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      const sumD = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(res.billed - res.insurerPays, sumD);

      // Verify ICU was exempt from room cap cut
      const icuResult = res.lines.find(l => l.id === 'rm-icu');
      assert.equal(icuResult.payable, 40000);
      assert.equal(icuResult.deducted, 0);

      // Verify all amounts are pure integers
      assert.ok(Number.isInteger(res.billed));
      assert.ok(Number.isInteger(res.insurerPays));
      assert.ok(Number.isInteger(res.youPay));
      for (const d of res.deductions) {
        assert.ok(Number.isInteger(d.amount));
        assert.ok(pol.clauses[d.clauseId]);
      }
    });

    test('100 line items under severe Sum Insured clamp (Hare-Niemeyer stress)', () => {
      const lines = [];
      for (let i = 1; i <= 100; i++) {
        lines.push({
          id: `line-${i}`,
          category: i % 4 === 0 ? 'room' : i % 4 === 1 ? 'professional' : i % 4 === 2 ? 'pharmacy' : 'investigation',
          amount: 10000,
          qty: 1
        });
      }

      // Total billed = 100 * 10,000 = 10,00,000
      // Sum Insured = 2,50,000
      const pol = {
        ...policyRaju,
        sumInsured: 250000,
        roomRent: { mode: 'fixedPerDay', value: 20000, clauseId: 'SP-3.1' } // in cap
      };

      const bill = { lines };
      const res = forecast(pol, bill);

      assert.equal(res.billed, 1000000);
      assert.equal(res.insurerPays, 250000);
      assert.equal(res.youPay, 750000);
      assert.equal(res.insurerPays + res.youPay, res.billed);

      const sumD = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(res.billed - res.insurerPays, sumD);

      // Verify Hare-Niemeyer line item proration
      const totalLinePayable = res.lines.reduce((s, l) => s + l.payable, 0);
      assert.equal(totalLinePayable, 250000);
    });
  });

  // =========================================================================
  // 5. Missing or Unexpected Clause IDs (ClauseCompletenessError)
  // =========================================================================
  describe('5. Missing or Unexpected Clause IDs', () => {
    const baseOverCapBill = {
      lines: [
        { id: 'l1', category: 'room', qty: 5, rate: 8000, amount: 40000 },
        { id: 'l2', category: 'professional', amount: 30000 }
      ]
    };

    test('Throws ClauseCompletenessError when policy.clauses is missing or null', () => {
      const pol = { ...policyRaju, clauses: null };
      assert.throws(() => forecast(pol, baseOverCapBill), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('missing');
      });
    });

    test('Throws ClauseCompletenessError when policy.clauses is empty object', () => {
      const pol = { ...policyRaju, clauses: {} };
      assert.throws(() => forecast(pol, baseOverCapBill), ClauseCompletenessError);
    });

    test('Throws ClauseCompletenessError on missing ROOM_CAP clause', () => {
      const clauses = { ...policyRaju.clauses };
      delete clauses['SP-3.1'];
      const pol = { ...policyRaju, clauses };
      assert.throws(() => forecast(pol, baseOverCapBill), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('SP-3.1');
      });
    });

    test('Throws ClauseCompletenessError on missing PROPORTIONATE clause', () => {
      const clauses = { ...policyRaju.clauses };
      delete clauses['SP-3.2'];
      const pol = { ...policyRaju, clauses };
      assert.throws(() => forecast(pol, baseOverCapBill), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('SP-3.2');
      });
    });

    test('Throws ClauseCompletenessError on missing NON_PAYABLE clause', () => {
      const clauses = { ...policyRaju.clauses };
      delete clauses['SP-4.1'];
      const pol = { ...policyRaju, clauses };
      const billWithNonPayable = {
        lines: [{ id: 'pharm', category: 'pharmacy', amount: 5000, nonPayable: { amount: 1000 } }]
      };
      assert.throws(() => forecast(pol, billWithNonPayable), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('SP-4.1');
      });
    });

    test('Throws ClauseCompletenessError on missing COPAY clause', () => {
      const clauses = { ...policyRaju.clauses };
      delete clauses['SP-5.1'];
      const pol = {
        ...policyRaju,
        copay: { pct: 10, order: 'afterCap', clauseId: 'SP-5.1' },
        clauses
      };
      const bill = {
        lines: [{ id: 'pharm', category: 'pharmacy', amount: 5000 }]
      };
      assert.throws(() => forecast(pol, bill), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('SP-5.1');
      });
    });

    test('Throws ClauseCompletenessError on missing SI_CLAMP clause', () => {
      const clauses = { ...policyRaju.clauses };
      delete clauses['SP-2.1'];
      const pol = {
        ...policyRaju,
        sumInsured: 10000,
        clauses
      };
      const bill = {
        lines: [{ id: 'pharm', category: 'pharmacy', amount: 50000 }]
      };
      assert.throws(() => forecast(pol, bill), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('SP-2.1');
      });
    });

    test('Throws ClauseCompletenessError when custom clauseId does not exist', () => {
      const pol = {
        ...policyRaju,
        roomRent: { mode: 'fixedPerDay', value: 3000, clauseId: 'CUSTOM-UNKNOWN-CLAUSE-999' }
      };
      assert.throws(() => forecast(pol, baseOverCapBill), (err) => {
        return err instanceof ClauseCompletenessError && err.message.includes('CUSTOM-UNKNOWN-CLAUSE-999');
      });
    });
  });

  // =========================================================================
  // 6. Numerical Stability (No NaN, No Infinity, No -0)
  // =========================================================================
  describe('6. Numerical Stability (No NaN, Infinity, -0)', () => {
    test('Large number calculations remain exact integers without NaN or Infinity', () => {
      const pol = {
        ...policyRaju,
        sumInsured: 50000000,
        roomRent: { mode: 'fixedPerDay', value: 17333, clauseId: 'SP-3.1' }
      };
      const bill = {
        lines: [
          { id: 'rm', category: 'room', qty: 7, rate: 39451, amount: 7 * 39451 },
          { id: 'dr', category: 'professional', amount: 847291 },
          { id: 'rx', category: 'pharmacy', amount: 391823, nonPayable: { amount: 8491 } }
        ]
      };
      const res = forecast(pol, bill);
      assert.ok(!isNaN(res.billed));
      assert.ok(!isNaN(res.insurerPays));
      assert.ok(!isNaN(res.youPay));
      assert.ok(isFinite(res.billed));
      assert.ok(isFinite(res.insurerPays));
      assert.ok(isFinite(res.youPay));
      assert.equal(Object.is(res.youPay, -0), false);
      assert.equal(Object.is(res.insurerPays, -0), false);
    });

    test('sanitizeRoomCapInput bounds sanitization against edge values', () => {
      assert.equal(sanitizeRoomCapInput('₹ 5,000 / day', 500000), 5000);
      assert.equal(sanitizeRoomCapInput('-5000', 500000), 0);
      assert.equal(sanitizeRoomCapInput('invalid text', 500000), 0);
      assert.equal(sanitizeRoomCapInput(NaN, 500000), 0);
      assert.equal(sanitizeRoomCapInput(Infinity, 500000), 0);
      assert.equal(sanitizeRoomCapInput(undefined, 500000), 0);
      assert.equal(sanitizeRoomCapInput(null, 500000), 0);
      assert.equal(sanitizeRoomCapInput(10000000, 500000), 500000); // clamped to maxSI
    });
  });

  // =========================================================================
  // 7. Memory Leak & Performance Stress Harness (10,000 Runs)
  // =========================================================================
  describe('7. Memory Leak & Performance Stress Harness', () => {
    test('10,000 iterations execute without heap exhaustion or performance degradation', () => {
      if (global.gc) global.gc();
      const initialMem = process.memoryUsage().heapUsed;
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        const bill = {
          lines: [
            { id: 'l1', category: 'room', qty: 5, rate: 8000, amount: 40000 },
            { id: 'l2', category: 'professional', amount: 30000 },
            { id: 'l3', category: 'pharmacy', amount: 15000, nonPayable: { amount: 2000 } }
          ]
        };
        const res = forecast(policyRaju, bill);
        assert.equal(res.insurerPays + res.youPay, res.billed);
      }

      const elapsed = Date.now() - startTime;
      if (global.gc) global.gc();
      const endMem = process.memoryUsage().heapUsed;
      const memDiffMb = (endMem - initialMem) / (1024 * 1024);

      // Verify that 10,000 executions took under 2000ms (<0.2ms per call)
      assert.ok(elapsed < 2000, `10,000 runs took ${elapsed}ms (expected < 2000ms)`);
      // Verify heap didn't inflate uncontrollably (< 50MB growth)
      assert.ok(memDiffMb < 50, `Heap grew by ${memDiffMb.toFixed(2)} MB`);
    });
  });

});
