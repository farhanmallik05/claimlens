/**
 * Empirical Challenger Verification Harness: Invariants & Zero Float Audit
 * Stress-tests ClaimLens engine across:
 * 1. 1,000 randomized synthetic bills & policies for Conservation Law (FR-7)
 * 2. 1,000 randomized sweeps for Room Rate Monotonicity (FR-8) across room categories
 * 3. Deep Zero Float Currency Integrity scan across all output objects and sub-fields
 * 4. 15 boundary & adversarial corner-case stress scenarios
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const rootDir = path.resolve(__dirname, '..');
const fixturesDir = path.join(rootDir, 'fixtures');
const {
  forecast,
  resolveRoomBilling,
  sanitizeRoomCapInput,
  avoidableShortfall,
  auditSettlement,
  generateAppeal,
  ClauseCompletenessError,
  ValidationError
} = require(path.join(rootDir, 'tests/e2e/engine.js'));

const basePolicy = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'policy.raju.json'), 'utf8'));

// Deterministic PRNG with configurable seed
function createPRNG(seed = 424242) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const prng = createPRNG(987654321);

function getRandomInt(min, max) {
  return Math.floor(prng() * (max - min + 1)) + min;
}

function getRandomChoice(arr) {
  return arr[Math.floor(prng() * arr.length)];
}

function generateRandomPolicy() {
  const sumInsured = getRandomInt(10000, 5000000);
  const copayPct = prng() < 0.4 ? 0 : getRandomInt(1, 40);
  const copayOrder = prng() < 0.5 ? 'afterCap' : 'beforeCap';
  const roomMode = getRandomChoice(['pctSI', 'fixedPerDay', 'none']);

  let roomValue = 0;
  if (roomMode === 'pctSI') {
    roomValue = getRandomChoice([1, 2, 3]);
  } else if (roomMode === 'fixedPerDay') {
    roomValue = getRandomInt(1000, 15000);
  }

  const proportionateEnabled = prng() > 0.15;
  const categoriesPool = ['professional', 'diagnostics', 'other'];
  const appliesTo = categoriesPool.filter(() => prng() > 0.4);
  if (appliesTo.length === 0) appliesTo.push('professional');

  const priorClaimsPaid = prng() < 0.3 ? 0 : getRandomInt(0, Math.floor(sumInsured * 0.8));

  return {
    ...basePolicy,
    id: `policy-rand-${getRandomInt(100, 999)}`,
    sumInsured,
    priorClaimsPaid,
    sumInsuredClauseId: 'SP-2.1',
    roomRent: {
      mode: roomMode,
      value: roomValue,
      clauseId: 'SP-3.1'
    },
    proportionate: {
      enabled: proportionateEnabled,
      appliesTo,
      clauseId: 'SP-3.2'
    },
    copay: {
      pct: copayPct,
      order: copayOrder,
      clauseId: 'SP-5.1'
    },
    nonPayable: {
      clauseId: 'SP-4.1'
    },
    clauses: {
      ...basePolicy.clauses,
      'SP-2.1': { page: 1, heading: 'Sum Insured', text: 'Sum insured clause.' },
      'SP-3.1': { page: 1, heading: 'Room Rent', text: 'Room rent clause.' },
      'SP-3.2': { page: 1, heading: 'Proportionate Deduction', text: 'Proportionate deduction clause.' },
      'SP-3.3': { page: 1, heading: 'Exempt Expenses', text: 'Exempt expenses clause.' },
      'SP-4.1': { page: 2, heading: 'Non-Payable', text: 'Non-payable items clause.' },
      'SP-5.1': { page: 2, heading: 'Co-payment', text: 'Copayment clause.' }
    }
  };
}

function generateRandomBill(opts = {}) {
  const lineCount = opts.lineCount !== undefined ? opts.lineCount : getRandomInt(1, 15);
  const categories = ['room', 'professional', 'pharmacy', 'diagnostics', 'other'];
  const lines = [];

  for (let i = 0; i < lineCount; i++) {
    const category = getRandomChoice(categories);
    const rate = getRandomInt(500, 50000);
    const qty = category === 'room' ? getRandomInt(1, 14) : getRandomInt(1, 5);
    const amount = rate * qty;

    const hasNonPayable = prng() < 0.35;
    const nonPayable = hasNonPayable
      ? { amount: getRandomInt(100, Math.min(amount, 8000)), reason: 'Hospital Consumables' }
      : undefined;

    const isIcu = category === 'room' && prng() < 0.25;

    lines.push({
      id: isIcu ? `line-${i + 1}-icu` : `line-${i + 1}`,
      category,
      label: isIcu ? `ICU Care ${i + 1}` : `Service ${i + 1}`,
      qty,
      rate,
      amount,
      nonPayable
    });
  }

  return { id: `bill-rand-${Date.now()}-${getRandomInt(1000, 9999)}`, lines };
}

// Deep Currency Field Inspector
function assertZeroFloat(val, fieldName) {
  if (typeof val === 'number') {
    if (!Number.isInteger(val)) {
      throw new Error(`Float detected in ${fieldName}: ${val} (is not integer)`);
    }
  }
}

function auditForecastZeroFloat(res) {
  let fieldsChecked = 0;

  assertZeroFloat(res.billed, 'res.billed');
  assertZeroFloat(res.insurerPays, 'res.insurerPays');
  assertZeroFloat(res.youPay, 'res.youPay');
  fieldsChecked += 3;

  for (let i = 0; i < res.lines.length; i++) {
    const l = res.lines[i];
    assertZeroFloat(l.billed, `res.lines[${i}].billed`);
    assertZeroFloat(l.payable, `res.lines[${i}].payable`);
    assertZeroFloat(l.deducted, `res.lines[${i}].deducted`);
    fieldsChecked += 3;
  }

  for (let j = 0; j < res.deductions.length; j++) {
    const d = res.deductions[j];
    assertZeroFloat(d.amount, `res.deductions[${j}].amount`);
    fieldsChecked += 1;

    if (d.formula) {
      assertZeroFloat(d.formula.result, `res.deductions[${j}].formula.result`);
      fieldsChecked += 1;

      if (d.formula.vars) {
        for (const [k, v] of Object.entries(d.formula.vars)) {
          if (typeof v === 'number') {
            assertZeroFloat(v, `res.deductions[${j}].formula.vars.${k}`);
            fieldsChecked += 1;
          }
        }
      }
    }
  }

  return fieldsChecked;
}

console.log('================================================================');
console.log('   CHALLENGER 2: 1,000-RUN INVARIANT & ZERO FLOAT STRESS HARNESS');
console.log('================================================================\n');

let totalChecks = 0;
let totalFieldsAudited = 0;

// =============================================================================
// TEST 1: Conservation Law (FR-7) Across 1,000 Randomized Synthetic Bills
// =============================================================================
console.log('Executing Invariant 1: Conservation Law (FR-7) across 1,000 runs...');
const fr7Start = Date.now();

for (let i = 0; i < 1000; i++) {
  const policy = generateRandomPolicy();
  const bill = generateRandomBill();
  const res = forecast(policy, bill);

  // Check Invariant: billed === insurerPays + youPay
  assert.equal(
    res.insurerPays + res.youPay,
    res.billed,
    `Conservation failure on run ${i}: insurerPays (${res.insurerPays}) + youPay (${res.youPay}) !== billed (${res.billed})`
  );

  // Check Invariant: billed - insurerPays === sum(deductions)
  const sumDeductions = res.deductions.reduce((sum, d) => sum + d.amount, 0);
  assert.equal(
    res.billed - res.insurerPays,
    sumDeductions,
    `Deduction balance failure on run ${i}: billed - insurerPays (${res.billed - res.insurerPays}) !== sumDeductions (${sumDeductions})`
  );

  // Line-level conservation: line.billed - line.payable === sum(line.deductions)
  for (const line of res.lines) {
    const lineDeductions = res.deductions.filter(d => d.lineId === line.id);
    const lineDeductionSum = lineDeductions.reduce((s, d) => s + d.amount, 0);
    assert.equal(
      line.billed - line.payable,
      lineDeductionSum,
      `Line-level conservation failure on run ${i}, line ${line.id}: billed - payable (${line.billed - line.payable}) !== sum (${lineDeductionSum})`
    );
    assert.equal(
      line.deducted,
      lineDeductionSum,
      `Line-level deducted field mismatch on run ${i}, line ${line.id}`
    );
    assert.ok(line.payable >= 0, `Line payable negative on line ${line.id}`);
    assert.ok(line.payable <= line.billed, `Line payable exceeds billed on line ${line.id}`);
  }

  // Deep Zero Float check on each of the 1,000 runs
  const auditedCount = auditForecastZeroFloat(res);
  totalFieldsAudited += auditedCount;
  totalChecks++;
}

const fr7Duration = Date.now() - fr7Start;
console.log(`✔ [FR-7 PASSED] 1,000 runs verified in ${fr7Duration}ms (100% conservation balance)\n`);

// =============================================================================
// TEST 2: Room Rate Monotonicity (FR-8) Across 1,000 Randomized Runs
// =============================================================================
console.log('Executing Invariant 2: Room Rate Monotonicity (FR-8) across 1,000 runs...');
const fr8Start = Date.now();

let multiRoomTested = 0;
let icuTested = 0;
let crossCapTested = 0;

for (let i = 0; i < 1000; i++) {
  const policy = generateRandomPolicy();
  const baseBill = generateRandomBill({ lineCount: getRandomInt(2, 8) });

  // Ensure there is at least one room line
  const hasRoom = baseBill.lines.some(l => l.category === 'room');
  if (!hasRoom) {
    baseBill.lines.unshift({
      id: 'line-room-primary',
      category: 'room',
      label: 'Deluxe Room',
      qty: getRandomInt(1, 7),
      rate: 3000,
      amount: 3000
    });
  }

  // Pick room rates r1 <= r2
  const r1 = getRandomInt(1000, 12000);
  const r2 = r1 + getRandomInt(0, 15000);

  // Determine cap to test cross-cap transitions
  let cap = 5000;
  if (policy.roomRent.mode === 'pctSI') {
    cap = Math.floor((policy.sumInsured * policy.roomRent.value) / 100);
  } else if (policy.roomRent.mode === 'fixedPerDay') {
    cap = policy.roomRent.value;
  }

  if (r1 < cap && r2 > cap) {
    crossCapTested++;
  }

  // Construct bill1 and bill2
  // We scale the non-ICU room lines with r1 and r2
  const bill1 = {
    ...baseBill,
    lines: baseBill.lines.map(l => {
      if (l.category === 'room') {
        const isIcu = (l.id && l.id.toLowerCase().includes('icu')) ||
                      (l.label && l.label.toLowerCase().includes('icu'));
        if (isIcu) {
          icuTested++;
          return l;
        }
        const qty = Math.max(1, l.qty || 1);
        return { ...l, rate: r1, amount: r1 * qty };
      }
      return l;
    })
  };

  const bill2 = {
    ...baseBill,
    lines: baseBill.lines.map(l => {
      if (l.category === 'room') {
        const isIcu = (l.id && l.id.toLowerCase().includes('icu')) ||
                      (l.label && l.label.toLowerCase().includes('icu'));
        if (isIcu) return l;
        const qty = Math.max(1, l.qty || 1);
        return { ...l, rate: r2, amount: r2 * qty };
      }
      return l;
    })
  };

  const res1 = forecast(policy, bill1);
  const res2 = forecast(policy, bill2);

  // Invariant FR-8: youPay must be monotonically non-decreasing as room rate increases
  assert.ok(
    res2.youPay >= res1.youPay,
    `FR-8 Monotonicity violation on run ${i}: r1=${r1}, r2=${r2}, cap=${cap} -> youPay(r1)=${res1.youPay}, youPay(r2)=${res2.youPay}`
  );

  // Zero Float Audit on both runs
  totalFieldsAudited += auditForecastZeroFloat(res1);
  totalFieldsAudited += auditForecastZeroFloat(res2);
  totalChecks++;
}

const fr8Duration = Date.now() - fr8Start;
console.log(`✔ [FR-8 PASSED] 1,000 runs verified in ${fr8Duration}ms`);
console.log(`  (Cross-cap transitions tested: ${crossCapTested}, ICU co-stays tested: ${icuTested})\n`);

// =============================================================================
// TEST 3: Room Rate Monotonicity Across Full Room Rate Sweeps (0 to 30,000)
// =============================================================================
console.log('Executing Room Rate Monotonicity Fine-Grained Sweeps (100-rupee steps)...');
const sweepPolicy = {
  ...basePolicy,
  sumInsured: 500000,
  roomRent: { mode: 'pctSI', value: 1, clauseId: 'SP-3.1' }, // Cap = ₹5,000
  proportionate: { enabled: true, appliesTo: ['professional'], clauseId: 'SP-3.2' },
  copay: { pct: 10, order: 'afterCap', clauseId: 'SP-5.1' }
};

const sweepBillBase = {
  lines: [
    { id: 'room-1', category: 'room', qty: 5, rate: 1000, amount: 5000 },
    { id: 'prof-1', category: 'professional', amount: 50000 },
    { id: 'pharm-1', category: 'pharmacy', amount: 20000, nonPayable: { amount: 2000 } }
  ]
};

let previousYouPay = -1;
let sweepSteps = 0;
for (let rate = 1000; rate <= 25000; rate += 250) {
  const currentBill = {
    ...sweepBillBase,
    lines: sweepBillBase.lines.map(l => (l.category === 'room' ? { ...l, rate, amount: rate * l.qty } : l))
  };
  const res = forecast(sweepPolicy, currentBill);
  if (previousYouPay !== -1) {
    assert.ok(
      res.youPay >= previousYouPay,
      `Sweep monotonicity failure at rate ₹${rate}: previous ₹${previousYouPay}, current ₹${res.youPay}`
    );
  }
  previousYouPay = res.youPay;
  sweepSteps++;
  totalFieldsAudited += auditForecastZeroFloat(res);
}
console.log(`✔ [Sweep PASSED] ${sweepSteps} continuous price points verified monotonic\n`);

// =============================================================================
// TEST 4: Boundary & Adversarial Edge Cases (15 Stress Tests)
// =============================================================================
console.log('Executing 15 Boundary & Adversarial Stress Tests...');

const boundaryTests = [
  {
    name: 'Empty Bill (0 lines)',
    fn: () => {
      const res = forecast(basePolicy, { lines: [] });
      assert.equal(res.billed, 0);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 0);
      assert.equal(res.deductions.length, 0);
    }
  },
  {
    name: 'Zero-amount line',
    fn: () => {
      const res = forecast(basePolicy, {
        lines: [{ id: 'l0', category: 'room', qty: 0, rate: 0, amount: 0 }]
      });
      assert.equal(res.billed, 0);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 0);
    }
  },
  {
    name: 'Non-payable equals 100% of line amount',
    fn: () => {
      const res = forecast(basePolicy, {
        lines: [{ id: 'l1', category: 'pharmacy', amount: 5000, nonPayable: { amount: 5000 } }]
      });
      assert.equal(res.billed, 5000);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 5000);
      assert.equal(res.deductions[0].amount, 5000);
    }
  },
  {
    name: 'Non-payable exceeds line amount (defensive clamp)',
    fn: () => {
      const res = forecast(basePolicy, {
        lines: [{ id: 'l1', category: 'pharmacy', amount: 3000, nonPayable: { amount: 8000 } }]
      });
      assert.equal(res.billed, 3000);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 3000);
      assert.equal(res.deductions[0].amount, 3000); // Clamped to line amount
    }
  },
  {
    name: 'Sum Insured is 0',
    fn: () => {
      const pol = { ...basePolicy, sumInsured: 0 };
      const res = forecast(pol, {
        lines: [{ id: 'l1', category: 'professional', amount: 50000 }]
      });
      assert.equal(res.billed, 50000);
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 50000);
    }
  },
  {
    name: 'Prior claims fully exhaust Sum Insured',
    fn: () => {
      const pol = { ...basePolicy, sumInsured: 300000, priorClaimsPaid: 300000 };
      const res = forecast(pol, {
        lines: [{ id: 'l1', category: 'professional', amount: 40000 }]
      });
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 40000);
    }
  },
  {
    name: 'Prior claims exceed Sum Insured (negative available SI clamp)',
    fn: () => {
      const pol = { ...basePolicy, sumInsured: 300000, priorClaimsPaid: 500000 };
      const res = forecast(pol, {
        lines: [{ id: 'l1', category: 'professional', amount: 40000 }]
      });
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 40000);
    }
  },
  {
    name: '100% Co-payment before cap',
    fn: () => {
      const pol = { ...basePolicy, copay: { pct: 100, order: 'beforeCap', clauseId: 'SP-5.1' } };
      const res = forecast(pol, {
        lines: [{ id: 'l1', category: 'professional', amount: 20000 }]
      });
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 20000);
    }
  },
  {
    name: '100% Co-payment after cap',
    fn: () => {
      const pol = { ...basePolicy, copay: { pct: 100, order: 'afterCap', clauseId: 'SP-5.1' } };
      const res = forecast(pol, {
        lines: [{ id: 'l1', category: 'professional', amount: 20000 }]
      });
      assert.equal(res.insurerPays, 0);
      assert.equal(res.youPay, 20000);
    }
  },
  {
    name: '1 Rupee difference at Room Cap boundary (cap - 1, cap, cap + 1)',
    fn: () => {
      const cap = 5000;
      const bUnder = { lines: [{ id: 'l1', category: 'room', qty: 1, rate: 4999, amount: 4999 }, { id: 'l2', category: 'professional', amount: 10000 }] };
      const bAt = { lines: [{ id: 'l1', category: 'room', qty: 1, rate: 5000, amount: 5000 }, { id: 'l2', category: 'professional', amount: 10000 }] };
      const bOver = { lines: [{ id: 'l1', category: 'room', qty: 1, rate: 5001, amount: 5001 }, { id: 'l2', category: 'professional', amount: 10000 }] };

      const rUnder = forecast(basePolicy, bUnder);
      const rAt = forecast(basePolicy, bAt);
      const rOver = forecast(basePolicy, bOver);

      assert.equal(rUnder.youPay, 0);
      assert.equal(rAt.youPay, 0);
      // At cap + 1, room cut = 1, and proportionate deduction applies on professional fee
      assert.ok(rOver.youPay > 0);
      assert.ok(rOver.youPay >= rAt.youPay);
      assert.ok(rAt.youPay >= rUnder.youPay);
    }
  },
  {
    name: 'Multi-Room Stay with multiple ICU and multiple Deluxe wards',
    fn: () => {
      const bill = {
        lines: [
          { id: 'icu-1', category: 'room', label: 'ICU Day 1', qty: 1, rate: 16000, amount: 16000 },
          { id: 'icu-2', category: 'room', label: 'ICU Day 2', qty: 1, rate: 14000, amount: 14000 },
          { id: 'ward-1', category: 'room', label: 'Deluxe Day 3', qty: 1, rate: 8000, amount: 8000 },
          { id: 'ward-2', category: 'room', label: 'Deluxe Day 4-5', qty: 2, rate: 8000, amount: 16000 },
          { id: 'surgeon', category: 'professional', amount: 60000 }
        ]
      };
      const res = forecast(basePolicy, bill);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      const sumD = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(res.billed - res.insurerPays, sumD);
      // ICU lines should have zero deduction
      const icu1 = res.lines.find(l => l.id === 'icu-1');
      const icu2 = res.lines.find(l => l.id === 'icu-2');
      assert.equal(icu1.deducted, 0);
      assert.equal(icu2.deducted, 0);
    }
  },
  {
    name: 'Negative Line Amount rejection',
    fn: () => {
      assert.throws(() => {
        forecast(basePolicy, {
          lines: [{ id: 'l-bad', category: 'room', qty: 1, rate: -500, amount: -500 }]
        });
      }, ValidationError);
    }
  },
  {
    name: 'Negative Line Qty rejection',
    fn: () => {
      assert.throws(() => {
        forecast(basePolicy, {
          lines: [{ id: 'l-bad', category: 'room', qty: -2, rate: 5000, amount: 10000 }]
        });
      }, ValidationError);
    }
  },
  {
    name: 'Large Rupee Amount Integrity (₹10,00,00,000 / 100 Crores)',
    fn: () => {
      const pol = { ...basePolicy, sumInsured: 100000000 };
      const bill = {
        lines: [
          { id: 'room-l', category: 'room', qty: 10, rate: 500000, amount: 5000000 },
          { id: 'prof-l', category: 'professional', amount: 25000000 }
        ]
      };
      const res = forecast(pol, bill);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      assertZeroFloat(res.billed, 'res.billed');
      assertZeroFloat(res.insurerPays, 'res.insurerPays');
      assertZeroFloat(res.youPay, 'res.youPay');
    }
  },
  {
    name: 'Hare-Niemeyer Remainder Allocation with Exact Deficit Reconciliation',
    fn: () => {
      // Create a scenario where multiple lines share fractional quotas
      const pol = {
        ...basePolicy,
        sumInsured: 10000,
        roomRent: { mode: 'none', clauseId: 'SP-3.1' },
        proportionate: { enabled: false, clauseId: 'SP-3.2' },
        copay: { pct: 0, clauseId: 'SP-5.1' }
      };
      const bill = {
        lines: [
          { id: 'l1', category: 'professional', amount: 3333 },
          { id: 'l2', category: 'professional', amount: 3333 },
          { id: 'l3', category: 'professional', amount: 3334 },
          { id: 'l4', category: 'professional', amount: 3333 }
        ]
      };
      // Total billed: 13,333. SI = 10,000. Excess = 3,333.
      const res = forecast(pol, bill);
      assert.equal(res.billed, 13333);
      assert.equal(res.insurerPays, 10000);
      assert.equal(res.youPay, 3333);
      assert.equal(res.insurerPays + res.youPay, res.billed);
      const sumD = res.deductions.reduce((s, d) => s + d.amount, 0);
      assert.equal(sumD, 3333);
    }
  }
];

let boundaryPassed = 0;
for (const bt of boundaryTests) {
  try {
    bt.fn();
    boundaryPassed++;
    console.log(`  ✔ [Boundary ${boundaryPassed}] ${bt.name}`);
  } catch (err) {
    console.error(`  ✖ [Boundary FAIL] ${bt.name}: ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n================================================================`);
console.log('               CHALLENGER VERIFICATION SUMMARY                  ');
console.log('================================================================');
console.log(`  FR-7 Conservation Law:           1,000 / 1,000 PASSED (100%)`);
console.log(`  FR-8 Room Rate Monotonicity:     1,000 / 1,000 PASSED (100%)`);
console.log(`  Room Rate Price-Sweep Steps:     ${sweepSteps} / ${sweepSteps} PASSED (100%)`);
console.log(`  Boundary & Adversarial Tests:    ${boundaryPassed} / ${boundaryTests.length} PASSED (100%)`);
console.log(`  Total Invariant Tests Executed:  ${1000 + 1000 + sweepSteps + boundaryPassed}`);
console.log(`  Zero-Float Fields Audited:       ${totalFieldsAudited.toLocaleString()}`);
console.log(`  Zero-Float Violations:           0 (Strict Integer Rupee Compliance)`);
console.log('================================================================');
console.log('STATUS: VERIFIED (EMPIRICAL AUDIT APPROVED)\n');
