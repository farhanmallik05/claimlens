/**
 * Challenger 1: Empirical Verification Harness for Scene 3 Reactive Engine
 * 
 * Tests:
 * 1. 5 Golden Tiers Exact Reconciliation (General, Semi-private, Single AC, Deluxe, Suite)
 * 2. Boundary Room Rates (0, 5000 exact cap, 5001 +1 over cap, 500000 SI, 1000000 >SI)
 * 3. Robustness of sanitizeRoomCapInput against adversarial strings, negatives, floats, NaN, objects
 * 4. 1,000-Point Sweep Fuzzing (Conservation Law FR-7, Monotonicity FR-8, Zero Float Audit)
 * 5. Pre-Admission Room Advice Calculation across all tiers
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  forecast,
  resolveRoomBilling,
  sanitizeRoomCapInput,
  avoidableShortfall
} = require('./engine.js');

const rootDir = path.resolve(__dirname, '../..');
const fixturesDir = path.join(rootDir, 'fixtures');

const policyRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));
const billRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'bill.raju.json'), 'utf8'));
const goldenJson = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'golden.json'), 'utf8'));

// Helper resolving room cap from policy, mirroring packages/engine/src/forecast.ts
function resolveCap(policy) {
  if (!policy || !policy.roomRent) return Infinity;
  if (policy.roomRent.mode === 'pctSI') {
    return Math.floor(((policy.sumInsured || 0) * (policy.roomRent.value || 0)) / 100);
  }
  if (policy.roomRent.mode === 'fixedPerDay' || policy.roomRent.mode === 'fixed') {
    return Math.floor(policy.roomRent.value || 0);
  }
  return Infinity;
}

// Mirroring getRoomAdvice from packages/engine/src/advice.ts
function getRoomAdvice(policy, bill) {
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

// Helper to simulate Scene 3 reactive state updater
function simulateScene3(roomRate, customCap = null) {
  let activePolicy = policyRaju;
  if (customCap !== null && customCap > 0) {
    activePolicy = {
      ...policyRaju,
      roomRent: {
        mode: 'fixedPerDay',
        value: customCap,
        clauseId: 'SP-3.1'
      }
    };
  }

  const activeBill = {
    ...billRaju,
    lines: billRaju.lines.map(line => {
      if (line.category === 'room') {
        return {
          ...line,
          rate: roomRate,
          amount: line.qty * roomRate
        };
      }
      return line;
    })
  };

  const forecastResult = forecast(activePolicy, activeBill);
  const roomAdvice = getRoomAdvice(activePolicy, activeBill);

  return { activePolicy, activeBill, forecastResult, roomAdvice };
}

describe('Challenger 1: Scene 3 Empirical Stress Harness (Node --test)', () => {

  // --------------------------------------------------------------------------
  // 1. All 5 Golden Tiers Exact Match & Conservation Law
  // --------------------------------------------------------------------------
  describe('Task 1: All 5 Golden Room Tiers Exact Reconciliation', () => {
    const expectedTiers = [
      {
        id: 'general',
        name: 'General Ward',
        rate: 2000,
        billed: 120000,
        insurerPays: 116000,
        youPay: 4000,
        roomCut: 0,
        profCut: 0,
        nonPayable: 4000,
        isOverCap: false,
        avoidable: 0
      },
      {
        id: 'semi-private',
        name: 'Semi-Private Room',
        rate: 3500,
        billed: 127500,
        insurerPays: 123500,
        youPay: 4000,
        roomCut: 0,
        profCut: 0,
        nonPayable: 4000,
        isOverCap: false,
        avoidable: 0
      },
      {
        id: 'single-ac',
        name: 'Single AC (At Cap)',
        rate: 5000,
        billed: 135000,
        insurerPays: 131000,
        youPay: 4000,
        roomCut: 0,
        profCut: 0,
        nonPayable: 4000,
        isOverCap: false,
        avoidable: 0
      },
      {
        id: 'deluxe',
        name: 'Deluxe Room (Raju Verma)',
        rate: 8000,
        billed: 150000,
        insurerPays: 108500,
        youPay: 41500,
        roomCut: 15000,
        profCut: 22500,
        nonPayable: 4000,
        isOverCap: true,
        avoidable: 37500
      },
      {
        id: 'suite',
        name: 'Executive Suite',
        rate: 12000,
        billed: 170000,
        insurerPays: 95999,
        youPay: 74001,
        roomCut: 35000,
        profCut: 35001,
        nonPayable: 4000,
        isOverCap: true,
        avoidable: 70001
      }
    ];

    for (const exp of expectedTiers) {
      test(`Tier: ${exp.name} (Rate ₹${exp.rate}) matches exact financial invariants`, () => {
        const { forecastResult, roomAdvice } = simulateScene3(exp.rate);

        // Assert exact totals
        assert.equal(forecastResult.billed, exp.billed, `Billed mismatch for ${exp.id}`);
        assert.equal(forecastResult.insurerPays, exp.insurerPays, `Insurer pays mismatch for ${exp.id}`);
        assert.equal(forecastResult.youPay, exp.youPay, `You pay mismatch for ${exp.id}`);

        // Assert Conservation Law: billed - insurerPays === youPay
        assert.equal(
          forecastResult.billed - forecastResult.insurerPays,
          forecastResult.youPay,
          `Conservation Law failed for ${exp.id}: billed (${forecastResult.billed}) - insurerPays (${forecastResult.insurerPays}) !== youPay (${forecastResult.youPay})`
        );

        // Assert Deduction breakdown
        const roomCut = forecastResult.deductions
          .filter(d => d.ruleId === 'ROOM_CAP')
          .reduce((s, d) => s + d.amount, 0);
        const profCut = forecastResult.deductions
          .filter(d => d.ruleId === 'PROPORTIONATE')
          .reduce((s, d) => s + d.amount, 0);
        const nonPay = forecastResult.deductions
          .filter(d => d.ruleId === 'NON_PAYABLE')
          .reduce((s, d) => s + d.amount, 0);

        assert.equal(roomCut, exp.roomCut, `Room cut mismatch for ${exp.id}`);
        assert.equal(profCut, exp.profCut, `Proportionate cut mismatch for ${exp.id}`);
        assert.equal(nonPay, exp.nonPayable, `Non-payable mismatch for ${exp.id}`);

        // Assert Room Advice
        assert.equal(roomAdvice.isOverCap, exp.isOverCap, `isOverCap mismatch for ${exp.id}`);
        assert.equal(roomAdvice.avoidableShortfall, exp.avoidable, `avoidableShortfall mismatch for ${exp.id}`);
        assert.equal(roomAdvice.maxEligiblePerDay, 5000, `maxEligiblePerDay mismatch for ${exp.id}`);

        // Assert Line-level reconciliation against golden.json
        const goldenTier = goldenJson.tiers.find(t => t.id === exp.id);
        assert.ok(goldenTier, `golden.json missing tier ${exp.id}`);
        for (const [key, expLine] of Object.entries(goldenTier.expectedLines)) {
          const actualLine = forecastResult.lines.find(l => l.id === `line-${key}`);
          assert.ok(actualLine, `Missing line item line-${key} in results`);
          assert.equal(actualLine.billed, expLine.billed, `Line ${key} billed mismatch`);
          assert.equal(actualLine.payable, expLine.payable, `Line ${key} payable mismatch`);
          assert.equal(actualLine.deducted, expLine.deducted, `Line ${key} deducted mismatch`);
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 2. Boundary Room Rates & Custom Cap Inputs
  // --------------------------------------------------------------------------
  describe('Task 2: Boundary Room Rate Stress Scenarios', () => {

    test('Boundary 1: Rate = 0 (Free Room)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(0);

      // Room billed: 0, payable: 0, deducted: 0
      const roomLine = forecastResult.lines.find(l => l.id === 'line-room');
      assert.equal(roomLine.billed, 0);
      assert.equal(roomLine.payable, 0);
      assert.equal(roomLine.deducted, 0);

      // Total billed: 110,000, insurerPays: 106,000, youPay: 4,000
      assert.equal(forecastResult.billed, 110000);
      assert.equal(forecastResult.insurerPays, 106000);
      assert.equal(forecastResult.youPay, 4000);
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
      assert.equal(roomAdvice.isOverCap, false);
      assert.equal(roomAdvice.avoidableShortfall, 0);
    });

    test('Boundary 2: Rate = 5,000 (Exact Cap Boundary)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(5000);

      assert.equal(forecastResult.billed, 135000);
      assert.equal(forecastResult.insurerPays, 131000);
      assert.equal(forecastResult.youPay, 4000);
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
      assert.equal(roomAdvice.isOverCap, false);
      assert.equal(roomAdvice.avoidableShortfall, 0);
      assert.equal(forecastResult.deductions.filter(d => d.ruleId === 'ROOM_CAP').length, 0);
      assert.equal(forecastResult.deductions.filter(d => d.ruleId === 'PROPORTIONATE').length, 0);
    });

    test('Boundary 3: Rate = 5,001 (1 Rupee Over Cap)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(5001);

      // Room billed: 5 * 5001 = 25005. Room cut: 5.
      const roomLine = forecastResult.lines.find(l => l.id === 'line-room');
      assert.equal(roomLine.billed, 25005);
      assert.equal(roomLine.payable, 25000);
      assert.equal(roomLine.deducted, 5);

      // Professional cuts:
      // Surgeon (30,000): floor(30000 * 5000 / 5001) = floor(29994.001) = 29994. Cut: 6.
      // OT (20,000): floor(20000 * 5000 / 5001) = floor(19996.0007) = 19996. Cut: 4.
      // Nursing (10,000): floor(10000 * 5000 / 5001) = floor(9998.0003) = 9998. Cut: 2.
      const surgeonLine = forecastResult.lines.find(l => l.id === 'line-surgeon');
      assert.equal(surgeonLine.payable, 29994);
      assert.equal(surgeonLine.deducted, 6);

      const otLine = forecastResult.lines.find(l => l.id === 'line-ot');
      assert.equal(otLine.payable, 19996);
      assert.equal(otLine.deducted, 4);

      const nursingLine = forecastResult.lines.find(l => l.id === 'line-nursing');
      assert.equal(nursingLine.payable, 9998);
      assert.equal(nursingLine.deducted, 2);

      // Exempt: Medicines (22,000), Consumables (4,000 payable, 4,000 cut), Lab (12,000), Imaging (8,000)
      assert.equal(forecastResult.billed, 135005);
      assert.equal(forecastResult.insurerPays, 130988);
      assert.equal(forecastResult.youPay, 4017);

      // Conservation Law check
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
      assert.equal(roomAdvice.isOverCap, true);
    });

    test('Boundary 4: Rate = 500,000 (Sum Insured)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(500000);

      // Room billed: 5 * 500000 = 2,500,000. Total billed: 2,610,000
      assert.equal(forecastResult.billed, 2610000);

      // Room allowed: 25,000. Prof allowed: Surgeon 300, OT 200, Nursing 100.
      // Exempt allowed: Medicines 22,000, Consumables 4,000, Lab 12,000, Imaging 8,000.
      // Total insurer pays: 25000 + 300 + 200 + 100 + 22000 + 4000 + 12000 + 8000 = 71,600.
      assert.equal(forecastResult.insurerPays, 71600);
      assert.equal(forecastResult.youPay, 2538400);

      // Conservation Law
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
      assert.equal(roomAdvice.isOverCap, true);
    });

    test('Boundary 5: Rate = 1,000,000 (Exceeds Sum Insured)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(1000000);

      // Room billed: 5 * 1000000 = 5,000,000. Total billed: 5,110,000
      assert.equal(forecastResult.billed, 5110000);

      // Room allowed: 25,000.
      // Surgeon allowed: floor(30000 * 5000 / 1000000) = 150.
      // OT allowed: floor(20000 * 5000 / 1000000) = 100.
      // Nursing allowed: floor(10000 * 5000 / 1000000) = 50.
      // Total insurer pays: 25000 + 150 + 100 + 50 + 22000 + 4000 + 12000 + 8000 = 71,300.
      assert.equal(forecastResult.insurerPays, 71300);
      assert.equal(forecastResult.youPay, 5038700);

      // Conservation Law
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
      assert.equal(roomAdvice.isOverCap, true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Robustness of sanitizeRoomCapInput
  // --------------------------------------------------------------------------
  describe('Task 3: sanitizeRoomCapInput Adversarial Test Suite', () => {
    const maxSI = 500000;

    const testCases = [
      { input: '5000', expected: 5000, desc: 'Clean numeric string' },
      { input: '₹5,000', expected: 5000, desc: 'Rupee currency symbol with comma' },
      { input: '  3500  ', expected: 3500, desc: 'Whitespace padding' },
      { input: 8000, expected: 8000, desc: 'Raw integer' },
      { input: 5000.99, expected: 5000, desc: 'Float truncation' },
      { input: '4999.85', expected: 4999, desc: 'Float in string truncation' },
      { input: '1000000', expected: 500000, desc: 'Exceeds maxSI -> clamped to maxSI' },
      { input: 9999999, expected: 500000, desc: 'Number exceeds maxSI -> clamped' },
      { input: 0, expected: 0, desc: 'Zero number' },
      { input: '0', expected: 0, desc: 'Zero string' },
      { input: -500, expected: 0, desc: 'Negative number -> clamped to 0' },
      { input: '-3000', expected: 0, desc: 'Negative string -> clamped to 0' },
      { input: 'abc', expected: 0, desc: 'Alphabetic string -> returns 0' },
      { input: '', expected: 0, desc: 'Empty string -> returns 0' },
      { input: '   ', expected: 0, desc: 'Whitespace only -> returns 0' },
      { input: '₹', expected: 0, desc: 'Symbol only -> returns 0' },
      { input: 'NaN', expected: 0, desc: 'String "NaN" -> returns 0' },
      { input: NaN, expected: 0, desc: 'Number NaN -> returns 0' },
      { input: Infinity, expected: 0, desc: 'Number Infinity -> returns 0' },
      { input: -Infinity, expected: 0, desc: 'Number -Infinity -> returns 0' },
      { input: null, expected: 0, desc: 'null -> returns 0' },
      { input: undefined, expected: 0, desc: 'undefined -> returns 0' },
      { input: {}, expected: 0, desc: 'object -> returns 0' },
      { input: [], expected: 0, desc: 'array -> returns 0' },
      { input: true, expected: 0, desc: 'boolean true -> returns 0' },
      { input: false, expected: 0, desc: 'boolean false -> returns 0' }
    ];

    for (const tc of testCases) {
      test(`Sanitizer: ${tc.desc} [${String(tc.input)}] => ${tc.expected}`, () => {
        const actual = sanitizeRoomCapInput(tc.input, maxSI);
        assert.equal(actual, tc.expected, `Failed for input: ${String(tc.input)}`);
        assert.ok(Number.isInteger(actual), `Result must be integer for input: ${String(tc.input)}`);
        assert.ok(actual >= 0, `Result must be non-negative for input: ${String(tc.input)}`);
        assert.ok(actual <= maxSI, `Result must not exceed maxSI for input: ${String(tc.input)}`);
      });
    }
  });

  // --------------------------------------------------------------------------
  // 4. Custom Cap Scenarios in Scene 3
  // --------------------------------------------------------------------------
  describe('Task 4: Custom Cap Dynamic Policy Switching in Scene 3', () => {
    test('Custom Cap = 3,000 on Deluxe Room (₹8,000)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(8000, 3000);

      // Room allowed: 5 * 3000 = 15000. Room cut: 40000 - 15000 = 25000.
      const roomLine = forecastResult.lines.find(l => l.id === 'line-room');
      assert.equal(roomLine.payable, 15000);
      assert.equal(roomLine.deducted, 25000);

      // Proportionate ratio: 3000 / 8000 = 0.375
      // Surgeon: floor(30000 * 0.375) = 11250. Cut: 18750
      // OT: floor(20000 * 0.375) = 7500. Cut: 12500
      // Nursing: floor(10000 * 0.375) = 3750. Cut: 6250
      const surgeon = forecastResult.lines.find(l => l.id === 'line-surgeon');
      assert.equal(surgeon.payable, 11250);
      assert.equal(surgeon.deducted, 18750);

      const ot = forecastResult.lines.find(l => l.id === 'line-ot');
      assert.equal(ot.payable, 7500);
      assert.equal(ot.deducted, 12500);

      const nursing = forecastResult.lines.find(l => l.id === 'line-nursing');
      assert.equal(nursing.payable, 3750);
      assert.equal(nursing.deducted, 6250);

      // Insurer pays: 15000 + 11250 + 7500 + 3750 + 22000 + 4000 + 12000 + 8000 = 83500.
      assert.equal(forecastResult.insurerPays, 83500);
      assert.equal(forecastResult.billed, 150000);
      assert.equal(forecastResult.youPay, 66500);

      // Conservation Law
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
      assert.equal(roomAdvice.isOverCap, true);
      assert.equal(roomAdvice.maxEligiblePerDay, 3000);
    });

    test('Custom Cap = 10,000 on Deluxe Room (₹8,000) eliminates all cuts', () => {
      const { forecastResult, roomAdvice } = simulateScene3(8000, 10000);

      // 8,000 is now within 10,000 cap!
      assert.equal(roomAdvice.isOverCap, false);
      assert.equal(roomAdvice.avoidableShortfall, 0);

      // Zero room cut, zero professional cut, only 4,000 non-payable
      assert.equal(forecastResult.billed, 150000);
      assert.equal(forecastResult.insurerPays, 146000);
      assert.equal(forecastResult.youPay, 4000);
      assert.equal(forecastResult.billed - forecastResult.insurerPays, forecastResult.youPay);
    });
  });

  // --------------------------------------------------------------------------
  // 5. 1,000-Point Sweep Fuzzing (Conservation Law FR-7 & Monotonicity FR-8)
  // --------------------------------------------------------------------------
  describe('Task 5: 1,000-Point Room Rate Sweep (FR-7 & FR-8)', () => {
    test('Conservation Law (FR-7) holds across 1,000 continuous room rates [₹0 to ₹50,000]', () => {
      let prevYouPay = 0;
      let count = 0;

      for (let rate = 0; rate <= 50000; rate += 50) {
        const { forecastResult } = simulateScene3(rate);

        // Invariant 1: billed - insurerPays === youPay
        assert.equal(
          forecastResult.billed - forecastResult.insurerPays,
          forecastResult.youPay,
          `Conservation failure at rate ₹${rate}`
        );

        // Invariant 2: billed - insurerPays === sum(deductions.amount)
        const sumDeductions = forecastResult.deductions.reduce((s, d) => s + d.amount, 0);
        assert.equal(
          forecastResult.billed - forecastResult.insurerPays,
          sumDeductions,
          `Deduction sum mismatch at rate ₹${rate}`
        );

        // Invariant 3: Line level balance
        for (const line of forecastResult.lines) {
          assert.equal(
            line.billed - line.payable,
            line.deducted,
            `Line level failure on ${line.id} at rate ₹${rate}`
          );
          // Integer check
          assert.ok(Number.isInteger(line.billed));
          assert.ok(Number.isInteger(line.payable));
          assert.ok(Number.isInteger(line.deducted));
        }

        // Invariant 4: Monotonicity (FR-8)
        assert.ok(
          forecastResult.youPay >= prevYouPay,
          `Monotonicity inversion at rate ₹${rate}: youPay (${forecastResult.youPay}) < prevYouPay (${prevYouPay})`
        );

        prevYouPay = forecastResult.youPay;
        count++;
      }

      assert.equal(count, 1001, 'Completed exactly 1,001 sweep points');
    });
  });
});
