import { describe, it, expect } from 'vitest';
import {
  ENGINE_VERSION,
  getEngineHealth,
  Bill,
  Policy,
  calculateForecast,
  resolveCap,
} from '../src/index';

describe('Engine Baseline Smoke Tests', () => {
  it('exports correct engine version', () => {
    expect(ENGINE_VERSION).toBe('0.1.0');
  });

  it('returns valid health status', () => {
    const health = getEngineHealth();
    expect(health).toEqual({
      status: 'ok',
      version: '0.1.0',
    });
  });

  it('can typecheck Bill and Policy models cleanly', () => {
    const sampleBill: Bill = {
      id: 'test-bill',
      patientAlias: 'Test Patient',
      hospital: 'Test Hospital',
      days: 2,
      lines: [
        {
          id: 'L1',
          category: 'room',
          label: 'Room Rent',
          qty: 2,
          rate: 5000,
          amount: 10000,
        },
      ],
    };

    const samplePolicy: Policy = {
      id: 'test-policy',
      insurer: 'Demo Insurer',
      planName: 'Demo Plan',
      sumInsured: 500000,
      priorClaimsPaid: 0,
      clauses: {
        'SP-3.1': {
          page: 3,
          heading: 'Room Rent Limit',
          text: 'Room rent is capped at 1% of Sum Insured per day.',
        },
      },
      roomRent: {
        mode: 'pctSI',
        value: 1,
        clauseId: 'SP-3.1',
      },
    };

    expect(sampleBill.lines.length).toBe(1);
    expect(samplePolicy.sumInsured).toBe(500000);
    expect(resolveCap(samplePolicy)).toBe(5000);

    const result = calculateForecast(samplePolicy, sampleBill);
    expect(result.billed).toBe(10000);
    expect(result.insurerPays).toBe(10000);
    expect(result.youPay).toBe(0);
  });
});
