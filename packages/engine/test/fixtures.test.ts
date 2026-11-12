/**
 * packages/engine/test/fixtures.test.ts
 * Vitest Test Suite: 100% Authoritative Fixture Coverage
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  forecast,
  resolveRoomBilling,
  avoidableShortfall,
  auditSettlement,
  generateAppeal,
  ClauseCompletenessError,
  Policy,
  Bill,
} from '../src/index.js';

// Helper to resolve fixtures directory
const fixturesDir = path.resolve(__dirname, '../../../fixtures');
function loadFixture<T = any>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, filename), 'utf8'));
}

const policyRaju: Policy = loadFixture('policy.raju.json');
const billRaju: Bill = loadFixture('bill.raju.json');
const goldenTiers = loadFixture('golden.json');
const settlementRaju = loadFixture('settlement.raju.json');
const scenarioMultiroom = loadFixture('scenario_multiroom.json');
const scenarioSiClamp = loadFixture('scenario_si_clamp.json');
const scenarioZeroDeduction = loadFixture('scenario_zero_deduction.json');
const regulatoryRefs = loadFixture('regulatory_refs.json');
const rajuTrace = loadFixture('raju_trace.json');

describe('Milestone 2 Fixture Verification Suite', () => {
  // -------------------------------------------------------------
  // Test Suite 1: Raju Hip Surgery Baseline Gate Test
  // -------------------------------------------------------------
  describe('Suite 1: Raju Hip Surgery Baseline (bill.raju.json + policy.raju.json)', () => {
    it('satisfies the Gate Test: Insurer pays ₹1,08,500 and You Pay ₹41,500', () => {
      const res = forecast(policyRaju, billRaju);
      expect(res.billed).toBe(150000);
      expect(res.insurerPays).toBe(108500);
      expect(res.youPay).toBe(41500);
      expect(res.billed - res.insurerPays).toBe(41500);
    });

    it('emits exact line-level deductions with formulas and clause citations', () => {
      const res = forecast(policyRaju, billRaju);

      // Room cut: ₹15,000 (SP-3.1)
      const roomCut = res.deductions.find(d => d.lineId === 'line-room' && d.ruleId === 'ROOM_CAP');
      expect(roomCut).toBeDefined();
      expect(roomCut?.amount).toBe(15000);
      expect(roomCut?.clauseId).toBe('SP-3.1');

      // Professional cuts: ₹22,500 total (SP-3.2)
      const profCuts = res.deductions.filter(d => d.ruleId === 'PROPORTIONATE');
      expect(profCuts).toHaveLength(3);
      expect(profCuts.reduce((s, d) => s + d.amount, 0)).toBe(22500);

      // Non-payable: ₹4,000 (SP-4.1)
      const nonPay = res.deductions.find(d => d.ruleId === 'NON_PAYABLE');
      expect(nonPay).toBeDefined();
      expect(nonPay?.amount).toBe(4000);
      expect(nonPay?.clauseId).toBe('SP-4.1');
    });

    it('correctly calculates avoidable shortfall of ₹37,500', () => {
      const avoidable = avoidableShortfall(policyRaju, billRaju);
      expect(avoidable).toBe(37500);
    });
  });

  // -------------------------------------------------------------
  // Test Suite 2: All 5 Golden Room Tiers (golden.json)
  // -------------------------------------------------------------
  describe('Suite 2: 5 Golden Room Tiers (golden.json)', () => {
    for (const tier of goldenTiers.tiers) {
      it(`evaluates tier "${tier.name}" (${tier.id}) to exact golden values`, () => {
        const tierBill: Bill = {
          ...billRaju,
          lines: billRaju.lines.map(l =>
            l.category === 'room' ? { ...l, rate: tier.ratePerDay, amount: l.qty * tier.ratePerDay } : l
          ),
        };

        const res = forecast(policyRaju, tierBill);

        expect(res.billed).toBe(tier.billed);
        expect(res.insurerPays).toBe(tier.insurerPays);
        expect(res.youPay).toBe(tier.youPay);

        // Deductions totals
        const roomCut = res.deductions.filter(d => d.ruleId === 'ROOM_CAP').reduce((s, d) => s + d.amount, 0);
        const profCut = res.deductions.filter(d => d.ruleId === 'PROPORTIONATE').reduce((s, d) => s + d.amount, 0);
        const nonPay = res.deductions.filter(d => d.ruleId === 'NON_PAYABLE').reduce((s, d) => s + d.amount, 0);

        expect(roomCut).toBe(tier.deductions.roomCut);
        expect(profCut).toBe(tier.deductions.professionalCut);
        expect(nonPay).toBe(tier.deductions.nonPayable);

        // Exact line-level checks
        for (const [key, exp] of Object.entries<any>(tier.expectedLines)) {
          const matchedLine = res.lines.find(l => l.id.includes(key));
          if (matchedLine) {
            expect(matchedLine.billed).toBe(exp.billed);
            expect(matchedLine.payable).toBe(exp.payable);
            expect(matchedLine.deducted).toBe(exp.deducted);
          }
        }
      });
    }
  });

  // -------------------------------------------------------------
  // Test Suite 3: Multi-Room Stay (scenario_multiroom.json)
  // -------------------------------------------------------------
  describe('Suite 3: Multi-Room Stay ICU + Deluxe (scenario_multiroom.json)', () => {
    const { policy, bill, expected } = scenarioMultiroom;

    it('computes weighted daily room rate of ₹10,800', () => {
      const billing = resolveRoomBilling(bill.lines);
      expect(billing.totalDays).toBe(5);
      expect(billing.totalRoomCharge).toBe(54000);
      expect(billing.rate).toBe(expected.weightedRoomRate);
    });

    it('exempts ICU from room cap while Deluxe is capped at ₹5,000/day', () => {
      const res = forecast(policy, bill);
      expect(res.billed).toBe(expected.billed);
      expect(res.insurerPays).toBe(expected.insurerPays);
      expect(res.youPay).toBe(expected.youPay);

      const icuLine = res.lines.find(l => l.id === 'line-icu');
      expect(icuLine?.payable).toBe(30000);
      expect(icuLine?.deducted).toBe(0);

      const deluxeLine = res.lines.find(l => l.id === 'line-deluxe');
      expect(deluxeLine?.payable).toBe(15000);
      expect(deluxeLine?.deducted).toBe(9000);
    });

    it('applies proportionate reduction using the ₹10,800 weighted rate', () => {
      const res = forecast(policy, bill);
      const cardio = res.lines.find(l => l.id === 'line-cardio');
      expect(cardio?.payable).toBe(23148);
      expect(cardio?.deducted).toBe(26852);

      const anesthesia = res.lines.find(l => l.id === 'line-anesthesia');
      expect(anesthesia?.payable).toBe(9259);
      expect(anesthesia?.deducted).toBe(10741);
    });
  });

  // -------------------------------------------------------------
  // Test Suite 4: Sum Insured Clamp (scenario_si_clamp.json)
  // -------------------------------------------------------------
  describe('Suite 4: Sum Insured Exhaustion Clamp (scenario_si_clamp.json)', () => {
    const { policy, bill, expected } = scenarioSiClamp;

    it('clamps insurer payout to available sum insured (₹50,000)', () => {
      const res = forecast(policy, bill);
      expect(res.insurerPays).toBe(expected.insurerPays);
      expect(res.youPay).toBe(expected.youPay);

      const totalLinePayable = res.lines.reduce((s, l) => s + l.payable, 0);
      expect(totalLinePayable).toBe(expected.availableSI);
    });

    it('emits SI_CLAMP deductions totaling ₹58,500 referencing SP-2.1', () => {
      const res = forecast(policy, bill);
      const clampDeductions = res.deductions.filter(d => d.ruleId === 'SI_CLAMP');
      expect(clampDeductions.length).toBeGreaterThan(0);
      const totalClamped = clampDeductions.reduce((s, d) => s + d.amount, 0);
      expect(totalClamped).toBe(expected.totalClamped);
      clampDeductions.forEach(d => expect(d.clauseId).toBe(expected.clauseId));
    });
  });

  // -------------------------------------------------------------
  // Test Suite 5: Zero-Deduction In-Cap Control (scenario_zero_deduction.json)
  // -------------------------------------------------------------
  describe('Suite 5: Zero-Deduction Control (scenario_zero_deduction.json)', () => {
    const { policy, bill, expected } = scenarioZeroDeduction;

    it('produces 100% insurer coverage with zero out-of-pocket shortfall', () => {
      const res = forecast(policy, bill);
      expect(res.billed).toBe(expected.billed);
      expect(res.insurerPays).toBe(expected.insurerPays);
      expect(res.youPay).toBe(0);
      expect(res.deductions).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------
  // Test Suite 6: Settlement Audit & Appeal Drafter
  // -------------------------------------------------------------
  describe('Suite 6: Settlement Audit & Legal Appeal Drafter', () => {
    it('detects ₹9,750 illegal over-deduction on pharmacy items in settlement.raju.json', () => {
      const forecastRes = forecast(policyRaju, billRaju);
      const auditRes = auditSettlement(forecastRes, settlementRaju);

      expect(auditRes.totalDiscrepancyAmount).toBe(9750);
      expect(auditRes.discrepancies).toHaveLength(2);

      const meds = auditRes.discrepancies.find(d => d.lineId === 'line-medicines');
      expect(meds?.difference).toBe(8250);
      expect(meds?.clauseId).toBe('SP-3.3');

      const consumables = auditRes.discrepancies.find(d => d.lineId === 'line-consumables');
      expect(consumables?.difference).toBe(1500);
      expect(consumables?.clauseId).toBe('SP-3.3');
    });

    it('generates formal grievance appeal letter citing IRDAI directives and Ombudsman rules', () => {
      const forecastRes = forecast(policyRaju, billRaju);
      const auditRes = auditSettlement(forecastRes, settlementRaju);
      const appeal = generateAppeal(settlementRaju, auditRes, regulatoryRefs);

      expect(appeal.totalDisputedAmount).toBe(9750);
      expect(appeal.claimRef).toBe('CLM-DEMO-001');
      expect(appeal.body).toContain('Demo Assure');
      expect(appeal.body).toContain('Clause SP-3.3');
      expect(appeal.body).toContain('IRDAI Master Circular');
      expect(appeal.body).toContain('Insurance Ombudsman');
    });
  });

  // -------------------------------------------------------------
  // Test Suite 7: Circuit Breaker & Replay Trace Validation
  // -------------------------------------------------------------
  describe('Suite 7: Circuit Breaker Replay Trace (raju_trace.json)', () => {
    it('contains all 5 agents and valid step sequences', () => {
      expect(rajuTrace.agents).toEqual(['policy_parser', 'bill_reader', 'rules_engine', 'explainer', 'appeal_drafter']);
      expect(rajuTrace.replayMetadata.circuitBreakerThresholdMs).toBe(6000);

      const forecastEvent = rajuTrace.events.find((e: any) => e.event === 'forecast_ready');
      expect(forecastEvent.data.insurerPays).toBe(108500);
      expect(forecastEvent.data.youPay).toBe(41500);

      const appealEvent = rajuTrace.events.find((e: any) => e.event === 'appeal_ready');
      expect(appealEvent.data.overDeductionAmount).toBe(9750);
    });
  });

  // -------------------------------------------------------------
  // Test Suite 8: Mathematical Invariants & Clause Completeness
  // -------------------------------------------------------------
  describe('Suite 8: Mathematical Invariants (FR-7, FR-8, FR-12)', () => {
    it('[FR-7] verifies Conservation Law across all fixtures', () => {
      const scenarios = [
        forecast(policyRaju, billRaju),
        forecast(scenarioMultiroom.policy, scenarioMultiroom.bill),
        forecast(scenarioSiClamp.policy, scenarioSiClamp.bill),
        forecast(scenarioZeroDeduction.policy, scenarioZeroDeduction.bill),
      ];

      for (const res of scenarios) {
        expect(res.insurerPays + res.youPay).toBe(res.billed);
        const sumDeductions = res.deductions.reduce((s, d) => s + d.amount, 0);
        expect(res.billed - res.insurerPays).toBe(sumDeductions);
      }
    });

    it('[FR-12] throws ClauseCompletenessError when deduction references an unregistered clause', () => {
      const corruptedPolicy: Policy = {
        ...policyRaju,
        roomRent: { mode: 'fixedPerDay', value: 4000, clauseId: 'UNREGISTERED_CLAUSE' },
      };

      expect(() => {
        forecast(corruptedPolicy, billRaju);
      }).toThrow(ClauseCompletenessError);
    });
  });
});
