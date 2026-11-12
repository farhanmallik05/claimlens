import type { Bill, Policy, Settlement } from '@claimlens/engine';
import billRajuJson from '../../../fixtures/bill.raju.json';
import policyRajuJson from '../../../fixtures/policy.raju.json';
import goldenJson from '../../../fixtures/golden.json';
import settlementRajuJson from '../../../fixtures/settlement.raju.json';
import regulatoryRefsJson from '../../../fixtures/regulatory_refs.json';

export const billRaju: Bill = billRajuJson as Bill;
export const policyRaju: Policy = policyRajuJson as unknown as Policy;
export const goldenTiers = goldenJson.tiers;
export const settlementRaju: Settlement = settlementRajuJson as Settlement;
export const regulatoryRefs = regulatoryRefsJson.references;
export const regulatoryRefsDoc = regulatoryRefsJson;
