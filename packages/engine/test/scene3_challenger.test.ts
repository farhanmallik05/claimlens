/**
 * Challenger 1: Empirical Verification Harness for Scene 3 Reactive Engine
 * Direct TypeScript integration against @claimlens/engine
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calculateForecast,
  getRoomAdvice,
  sanitizeRoomCapInput,
  Policy,
  Bill,
} from '../src/index.js';

const fixturesDir = path.resolve(__dirname, '../../../fixtures');
const policyRaju: Policy = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));
const billRaju: Bill = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'bill.raju.json'), 'utf8'));
const goldenJson = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'golden.json'), 'utf8'));

// Helper matching Scene3Ripple.tsx reactive logic exactly
function simulateScene3(roomRate: number, customCap: number | null = null) {
  let activePolicy: Policy = policyRaju;
  if (customCap !== null && customCap > 0) {
    activePolicy = {
      ...policyRaju,
      roomRent: {
        mode: 'fixedPerDay',
        value: customCap,
        clauseId: 'SP-3.1',
      },
    };
  }

  const activeBill: Bill = {
    ...billRaju,
    lines: billRaju.lines.map((line) => {
      if (line.category === 'room') {
        return {
          ...line,
          rate: roomRate,
          amount: line.qty * roomRate,
        };
      }
      return line;
    }),
  };

  const forecastResult = calculateForecast(activePolicy, activeBill);
  const roomAdvice = getRoomAdvice(activePolicy, activeBill);

  return { activePolicy, activeBill, forecastResult, roomAdvice };
}

describe('Challenger 1: Scene 3 Empirical Stress Harness (Vitest)', () => {
  // --------------------------------------------------------------------------
  // 1. All 5 Golden Tiers Exact Reconciliation
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
        avoidable: 0,
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
        avoidable: 0,
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
        avoidable: 0,
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
        avoidable: 37500,
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
        avoidable: 70001,
      },
    ];

    for (const exp of expectedTiers) {
      it(`Tier: ${exp.name} (Rate ₹${exp.rate}) matches exact financial invariants`, () => {
        const { forecastResult, roomAdvice } = simulateScene3(exp.rate);

        // Assert exact totals
        expect(forecastResult.billed).toBe(exp.billed);
        expect(forecastResult.insurerPays).toBe(exp.insurerPays);
        expect(forecastResult.youPay).toBe(exp.youPay);

        // Assert Conservation Law: billed - insurerPays === youPay
        expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);

        // Assert Deduction breakdown
        const roomCut = forecastResult.deductions
          .filter((d) => d.ruleId === 'ROOM_CAP')
          .reduce((s, d) => s + d.amount, 0);
        const profCut = forecastResult.deductions
          .filter((d) => d.ruleId === 'PROPORTIONATE')
          .reduce((s, d) => s + d.amount, 0);
        const nonPay = forecastResult.deductions
          .filter((d) => d.ruleId === 'NON_PAYABLE')
          .reduce((s, d) => s + d.amount, 0);

        expect(roomCut).toBe(exp.roomCut);
        expect(profCut).toBe(exp.profCut);
        expect(nonPay).toBe(exp.nonPayable);

        // Assert Room Advice
        expect(roomAdvice.isOverCap).toBe(exp.isOverCap);
        expect(roomAdvice.avoidableShortfall).toBe(exp.avoidable);
        expect(roomAdvice.maxEligiblePerDay).toBe(5000);

        // Assert Line-level reconciliation against golden.json
        const goldenTier = goldenJson.tiers.find((t: any) => t.id === exp.id);
        expect(goldenTier).toBeDefined();
        for (const [key, expLine] of Object.entries(goldenTier.expectedLines) as [string, any][]) {
          const actualLine = forecastResult.lines.find((l) => l.id === `line-${key}`);
          expect(actualLine).toBeDefined();
          expect(actualLine?.billed).toBe(expLine.billed);
          expect(actualLine?.payable).toBe(expLine.payable);
          expect(actualLine?.deducted).toBe(expLine.deducted);
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 2. Boundary Room Rates & Custom Cap Inputs
  // --------------------------------------------------------------------------
  describe('Task 2: Boundary Room Rate Stress Scenarios', () => {
    it('Boundary 1: Rate = 0 (Free Room)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(0);

      const roomLine = forecastResult.lines.find((l) => l.id === 'line-room');
      expect(roomLine?.billed).toBe(0);
      expect(roomLine?.payable).toBe(0);
      expect(roomLine?.deducted).toBe(0);

      expect(forecastResult.billed).toBe(110000);
      expect(forecastResult.insurerPays).toBe(106000);
      expect(forecastResult.youPay).toBe(4000);
      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
      expect(roomAdvice.isOverCap).toBe(false);
      expect(roomAdvice.avoidableShortfall).toBe(0);
    });

    it('Boundary 2: Rate = 5,000 (Exact Cap Boundary)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(5000);

      expect(forecastResult.billed).toBe(135000);
      expect(forecastResult.insurerPays).toBe(131000);
      expect(forecastResult.youPay).toBe(4000);
      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
      expect(roomAdvice.isOverCap).toBe(false);
      expect(roomAdvice.avoidableShortfall).toBe(0);
      expect(forecastResult.deductions.filter((d) => d.ruleId === 'ROOM_CAP')).toHaveLength(0);
      expect(forecastResult.deductions.filter((d) => d.ruleId === 'PROPORTIONATE')).toHaveLength(0);
    });

    it('Boundary 3: Rate = 5,001 (1 Rupee Over Cap)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(5001);

      const roomLine = forecastResult.lines.find((l) => l.id === 'line-room');
      expect(roomLine?.billed).toBe(25005);
      expect(roomLine?.payable).toBe(25000);
      expect(roomLine?.deducted).toBe(5);

      const surgeonLine = forecastResult.lines.find((l) => l.id === 'line-surgeon');
      expect(surgeonLine?.payable).toBe(29994);
      expect(surgeonLine?.deducted).toBe(6);

      const otLine = forecastResult.lines.find((l) => l.id === 'line-ot');
      expect(otLine?.payable).toBe(19996);
      expect(otLine?.deducted).toBe(4);

      const nursingLine = forecastResult.lines.find((l) => l.id === 'line-nursing');
      expect(nursingLine?.payable).toBe(9998);
      expect(nursingLine?.deducted).toBe(2);

      expect(forecastResult.billed).toBe(135005);
      expect(forecastResult.insurerPays).toBe(130988);
      expect(forecastResult.youPay).toBe(4017);

      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
      expect(roomAdvice.isOverCap).toBe(true);
    });

    it('Boundary 4: Rate = 500,000 (Sum Insured)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(500000);

      expect(forecastResult.billed).toBe(2610000);
      expect(forecastResult.insurerPays).toBe(71600);
      expect(forecastResult.youPay).toBe(2538400);

      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
      expect(roomAdvice.isOverCap).toBe(true);
    });

    it('Boundary 5: Rate = 1,000,000 (Exceeds Sum Insured)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(1000000);

      expect(forecastResult.billed).toBe(5110000);
      expect(forecastResult.insurerPays).toBe(71300);
      expect(forecastResult.youPay).toBe(5038700);

      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
      expect(roomAdvice.isOverCap).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Robustness of sanitizeRoomCapInput
  // --------------------------------------------------------------------------
  describe('Task 3: sanitizeRoomCapInput Adversarial Test Suite', () => {
    const maxSI = 500000;

    const testCases: { input: unknown; expected: number; desc: string }[] = [
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
      { input: false, expected: 0, desc: 'boolean false -> returns 0' },
    ];

    for (const tc of testCases) {
      it(`Sanitizer: ${tc.desc} [${String(tc.input)}] => ${tc.expected}`, () => {
        const actual = sanitizeRoomCapInput(tc.input, maxSI);
        expect(actual).toBe(tc.expected);
        expect(Number.isInteger(actual)).toBe(true);
        expect(actual).toBeGreaterThanOrEqual(0);
        expect(actual).toBeLessThanOrEqual(maxSI);
      });
    }
  });

  // --------------------------------------------------------------------------
  // 4. Custom Cap Dynamic Policy Switching in Scene 3
  // --------------------------------------------------------------------------
  describe('Task 4: Custom Cap Dynamic Policy Switching in Scene 3', () => {
    it('Custom Cap = 3,000 on Deluxe Room (₹8,000)', () => {
      const { forecastResult, roomAdvice } = simulateScene3(8000, 3000);

      const roomLine = forecastResult.lines.find((l) => l.id === 'line-room');
      expect(roomLine?.payable).toBe(15000);
      expect(roomLine?.deducted).toBe(25000);

      const surgeon = forecastResult.lines.find((l) => l.id === 'line-surgeon');
      expect(surgeon?.payable).toBe(11250);
      expect(surgeon?.deducted).toBe(18750);

      const ot = forecastResult.lines.find((l) => l.id === 'line-ot');
      expect(ot?.payable).toBe(7500);
      expect(ot?.deducted).toBe(12500);

      const nursing = forecastResult.lines.find((l) => l.id === 'line-nursing');
      expect(nursing?.payable).toBe(3750);
      expect(nursing?.deducted).toBe(6250);

      expect(forecastResult.insurerPays).toBe(83500);
      expect(forecastResult.billed).toBe(150000);
      expect(forecastResult.youPay).toBe(66500);

      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
      expect(roomAdvice.isOverCap).toBe(true);
      expect(roomAdvice.maxEligiblePerDay).toBe(3000);
    });

    it('Custom Cap = 10,000 on Deluxe Room (₹8,000) eliminates all cuts', () => {
      const { forecastResult, roomAdvice } = simulateScene3(8000, 10000);

      expect(roomAdvice.isOverCap).toBe(false);
      expect(roomAdvice.avoidableShortfall).toBe(0);

      expect(forecastResult.billed).toBe(150000);
      expect(forecastResult.insurerPays).toBe(146000);
      expect(forecastResult.youPay).toBe(4000);
      expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);
    });
  });

  // --------------------------------------------------------------------------
  // 5. 1,000-Point Sweep Fuzzing (Conservation Law FR-7 & Monotonicity FR-8)
  // --------------------------------------------------------------------------
  describe('Task 5: 1,000-Point Room Rate Sweep (FR-7 & FR-8)', () => {
    it('Conservation Law (FR-7) holds across 1,000 continuous room rates [₹0 to ₹50,000]', () => {
      let prevYouPay = 0;
      let count = 0;

      for (let rate = 0; rate <= 50000; rate += 50) {
        const { forecastResult } = simulateScene3(rate);

        // Invariant 1: billed - insurerPays === youPay
        expect(forecastResult.billed - forecastResult.insurerPays).toBe(forecastResult.youPay);

        // Invariant 2: billed - insurerPays === sum(deductions.amount)
        const sumDeductions = forecastResult.deductions.reduce((s, d) => s + d.amount, 0);
        expect(forecastResult.billed - forecastResult.insurerPays).toBe(sumDeductions);

        // Invariant 3: Line level balance and zero float
        for (const line of forecastResult.lines) {
          expect(line.billed - line.payable).toBe(line.deducted);
          expect(Number.isInteger(line.billed)).toBe(true);
          expect(Number.isInteger(line.payable)).toBe(true);
          expect(Number.isInteger(line.deducted)).toBe(true);
        }

        // Invariant 4: Monotonicity (FR-8)
        expect(forecastResult.youPay).toBeGreaterThanOrEqual(prevYouPay);

        prevYouPay = forecastResult.youPay;
        count++;
      }

      expect(count).toBe(1001);
    });
  });
});
