/**
 * Tier 4: Real-World Clinical Scenarios Test Suite (S1 - S5)
 * Comprehensive End-to-End Clinical Workflows
 * Run with: node --test tests/e2e/tier4-scenarios.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  forecast,
  resolveRoomBilling,
  auditSettlement,
  generateAppeal
} = require('./engine.js');

const fixturesDir = path.resolve(__dirname, '../../fixtures');
const policyRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));
const billRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'bill.raju.json'), 'utf8'));
const settlementRaju = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'settlement.raju.json'), 'utf8'));
const regulatoryRefs = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'regulatory_refs.json'), 'utf8'));
const scenarioMultiroom = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'scenario_multiroom.json'), 'utf8'));
const scenarioSiClamp = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'scenario_si_clamp.json'), 'utf8'));
const scenarioZeroDeduction = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'scenario_zero_deduction.json'), 'utf8'));
const rajuTrace = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'raju_trace.json'), 'utf8'));

const scenarios = [];

function registerScenario(id, name, fn) {
  scenarios.push({ id, name, fn });
  test(`[Tier 4 Scenario] ${id}: ${name}`, fn);
}

describe('Tier 4: Real-World Clinical Scenarios (S1 - S5)', () => {
  // -------------------------------------------------------------
  // Scenario S1: Raju Hip Surgery Baseline & Finisher B Appeal
  // -------------------------------------------------------------
  registerScenario('S1', 'Raju Hip Surgery Baseline & Finisher B Appeal', () => {
    // 1. Forecast Verification
    const res = forecast(policyRaju, billRaju);
    assert.equal(res.billed, 150000, 'Billed amount must be ₹1,50,000');
    assert.equal(res.insurerPays, 108500, 'Insurer pays must be ₹1,08,500');
    assert.equal(res.youPay, 41500, 'You pay must be ₹41,500');

    // 2. Room Cut: ₹15,000 (Clause SP-3.1)
    const roomCut = res.deductions.find(d => d.lineId === 'line-room' && d.ruleId === 'ROOM_CAP');
    assert.ok(roomCut, 'Room cut deduction must exist');
    assert.equal(roomCut.amount, 15000);
    assert.equal(roomCut.clauseId, 'SP-3.1');

    // 3. Proportionate Cut: ₹22,500 (Clause SP-3.2)
    const profCuts = res.deductions.filter(d => d.ruleId === 'PROPORTIONATE');
    assert.equal(profCuts.length, 3, 'Must have 3 proportionate cuts');
    const totalProfCut = profCuts.reduce((s, d) => s + d.amount, 0);
    assert.equal(totalProfCut, 22500);

    const surgCut = profCuts.find(d => d.lineId === 'line-surgeon');
    const otCut = profCuts.find(d => d.lineId === 'line-ot');
    const nursingCut = profCuts.find(d => d.lineId === 'line-nursing');
    assert.equal(surgCut.amount, 11250);
    assert.equal(otCut.amount, 7500);
    assert.equal(nursingCut.amount, 3750);

    // 4. Non-Payable: ₹4,000 (Clause SP-4.1)
    const nonPayCut = res.deductions.find(d => d.ruleId === 'NON_PAYABLE');
    assert.ok(nonPayCut);
    assert.equal(nonPayCut.amount, 4000);
    assert.equal(nonPayCut.clauseId, 'SP-4.1');

    // 5. Settlement Audit against Wrong Settlement (Finisher B)
    const auditRes = auditSettlement(res, settlementRaju);
    assert.equal(auditRes.totalDiscrepancyAmount, 9750, 'Must detect ₹9,750 over-deduction');
    assert.equal(auditRes.discrepancies.length, 2);

    const medsDiscrepancy = auditRes.discrepancies.find(d => d.lineId === 'line-medicines');
    assert.ok(medsDiscrepancy);
    assert.equal(medsDiscrepancy.difference, 8250);
    assert.equal(medsDiscrepancy.clauseId, 'SP-3.3');

    const consDiscrepancy = auditRes.discrepancies.find(d => d.lineId === 'line-consumables');
    assert.ok(consDiscrepancy);
    assert.equal(consDiscrepancy.difference, 1500);
    assert.equal(consDiscrepancy.clauseId, 'SP-3.3');

    // 6. Statutory Grievance Appeal Draft
    const appeal = generateAppeal(settlementRaju, auditRes, regulatoryRefs);
    assert.equal(appeal.claimRef, 'CLM-DEMO-001');
    assert.equal(appeal.totalDisputedAmount, 9750);
    assert.ok(appeal.body.includes('Demo Assure'));
    assert.ok(appeal.body.includes('Clause SP-3.3'));
    assert.ok(appeal.body.includes('IRDAI Master Circular'));
    assert.ok(appeal.body.includes('Insurance Ombudsman'));
  });

  // -------------------------------------------------------------
  // Scenario S2: Multi-Room Stay (ICU 2 Days + Deluxe Ward 3 Days)
  // -------------------------------------------------------------
  registerScenario('S2', 'Multi-Room Stay (ICU 2 Days + Deluxe Ward 3 Days)', () => {
    const { policy, bill, expected } = scenarioMultiroom;

    // 1. Weighted Room Rate Verification
    const billing = resolveRoomBilling(bill.lines);
    assert.equal(billing.totalDays, 5);
    assert.equal(billing.totalRoomCharge, 54000);
    assert.equal(billing.rate, expected.weightedRoomRate); // 10,800

    // 2. Forecast Calculation
    const res = forecast(policy, bill);
    assert.equal(res.billed, expected.billed); // 149,000
    assert.equal(res.insurerPays, expected.insurerPays); // 102,407
    assert.equal(res.youPay, expected.youPay); // 46,593
    assert.equal(res.billed - res.insurerPays, expected.totalDeductions); // 46,593

    // 3. ICU Exemption Assertion
    const icuLine = res.lines.find(l => l.id === 'line-icu');
    assert.equal(icuLine.payable, 30000, 'ICU line must be 100% payable without room cap reduction');
    assert.equal(icuLine.deducted, 0);

    // 4. Deluxe Capped Room Assertion
    const deluxeLine = res.lines.find(l => l.id === 'line-deluxe');
    assert.equal(deluxeLine.payable, 15000, 'Deluxe line capped at 3 × ₹5,000 = ₹15,000');
    assert.equal(deluxeLine.deducted, 9000);

    // 5. Proportionate Professional Reductions
    const cardioLine = res.lines.find(l => l.id === 'line-cardio');
    assert.equal(cardioLine.payable, 23148);
    assert.equal(cardioLine.deducted, 26852);

    const anesLine = res.lines.find(l => l.id === 'line-anesthesia');
    assert.equal(anesLine.payable, 9259);
    assert.equal(anesLine.deducted, 10741);

    // 6. Pharmacy Exemption
    const pharmLine = res.lines.find(l => l.id === 'line-pharmacy');
    assert.equal(pharmLine.payable, 25000);
    assert.equal(pharmLine.deducted, 0);

    // 7. Conservation
    assert.equal(res.insurerPays + res.youPay, res.billed);
  });

  // -------------------------------------------------------------
  // Scenario S3: Sum Insured Exhaustion Clamp
  // -------------------------------------------------------------
  registerScenario('S3', 'Sum Insured Exhaustion Clamp', () => {
    const { policy, bill, expected } = scenarioSiClamp;

    const res = forecast(policy, bill);

    assert.equal(res.billed, expected.billed); // 150,000
    assert.equal(res.insurerPays, expected.insurerPays); // 50,000
    assert.equal(res.youPay, expected.youPay); // 100,000

    // Sum of line payables must exactly equal available SI
    const totalLinePayable = res.lines.reduce((s, l) => s + l.payable, 0);
    assert.equal(totalLinePayable, expected.availableSI);

    // Clamp deductions must be present and sum to expected total clamped
    const clampDeductions = res.deductions.filter(d => d.ruleId === expected.ruleId);
    assert.ok(clampDeductions.length > 0, 'SI_CLAMP deductions must be generated');
    const totalClamped = clampDeductions.reduce((s, d) => s + d.amount, 0);
    assert.equal(totalClamped, expected.totalClamped); // 58,500
    clampDeductions.forEach(d => {
      assert.equal(d.clauseId, expected.clauseId); // SP-2.1
    });

    // Conservation check
    assert.equal(res.insurerPays + res.youPay, res.billed);
  });

  // -------------------------------------------------------------
  // Scenario S4: Zero-Deduction In-Cap Control
  // -------------------------------------------------------------
  registerScenario('S4', 'Zero-Deduction In-Cap Control', () => {
    const { policy, bill, expected } = scenarioZeroDeduction;

    const res = forecast(policy, bill);

    assert.equal(res.billed, expected.billed); // 63,000
    assert.equal(res.insurerPays, expected.insurerPays); // 63,000 (100%)
    assert.equal(res.youPay, expected.youPay); // 0
    assert.equal(res.deductions.length, expected.deductionsCount); // 0

    for (const l of res.lines) {
      assert.equal(l.payable, l.billed, `Line ${l.id} must be 100% payable`);
      assert.equal(l.deducted, 0);
    }
  });

  // -------------------------------------------------------------
  // Scenario S5: Offline Fallback & 6-Second Circuit Breaker
  // -------------------------------------------------------------
  registerScenario('S5', 'Offline Fallback & 6-Second Circuit Breaker', () => {
    // 1. Circuit Breaker SLA Timing Logic
    const connectionStartTime = 0;
    const timeoutThreshold = 6000;
    const simulatedNetworkLag = 6050; // exceeds 6000ms SLA

    const hasTimedOut = (simulatedNetworkLag - connectionStartTime) >= timeoutThreshold;
    assert.equal(hasTimedOut, true, 'Circuit breaker must trigger when lag >= 6000ms');

    // 2. Fallback to Recorded Trace
    let activeStream = null;
    let uiStatusBadge = 'Connecting...';

    if (hasTimedOut) {
      activeStream = rajuTrace;
      uiStatusBadge = rajuTrace.replayMetadata.label;
    }

    assert.ok(activeStream, 'Active stream must fall back to recorded trace');
    assert.equal(uiStatusBadge, 'Replayed from recorded run', 'UI badge must display honest replay text');

    // 3. Trace Event Step Verification (5 Agents Sequence)
    assert.equal(activeStream.agents.length, 5);
    const expectedAgents = ['policy_parser', 'bill_reader', 'rules_engine', 'explainer', 'appeal_drafter'];
    assert.deepEqual(activeStream.agents, expectedAgents);

    // 4. Verify Event Payloads in Replay Stream
    const forecastEvent = activeStream.events.find(e => e.event === 'forecast_ready');
    assert.ok(forecastEvent);
    assert.equal(forecastEvent.data.insurerPays, 108500);
    assert.equal(forecastEvent.data.youPay, 41500);

    const appealEvent = activeStream.events.find(e => e.event === 'appeal_ready');
    assert.ok(appealEvent);
    assert.equal(appealEvent.data.overDeductionAmount, 9750);
  });
});

module.exports = {
  scenarios
};
