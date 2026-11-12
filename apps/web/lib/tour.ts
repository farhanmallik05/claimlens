/**
 * ClaimLens 90-Second Guided Tour Definitions
 * Provides metadata, timings, and narrative captions for the judge tour.
 * Follows plan/trd.md §6.4 and PROJECT.md § Guided Tour.
 */

export interface TourStep {
  id: string;
  sceneId: string;
  stepNumber: number;
  totalSteps: number;
  durationMs: number;
  title: string;
  subtitle: string;
  caption: string;
  badge: string;
  statHighlight?: {
    label: string;
    value: string;
  };
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'receipt-breakdown',
    sceneId: 'scene-1',
    stepNumber: 1,
    totalSteps: 8,
    durationMs: 11000,
    title: 'The Bill & Out-of-Pocket Shock',
    subtitle: 'Raju’s ₹1,55,500 Hospital Bill',
    caption:
      'Every claim begins with receipt shock. Raju paid ₹45,500 out-of-pocket on a ₹2,00,000 policy. The hospital applied a 2% room rent cap that penalized his entire treatment.',
    badge: 'WOW 1 · RECEIPT BREAKDOWN',
    statHighlight: {
      label: 'Initial Out-of-Pocket',
      value: '₹45,500',
    },
  },
  {
    id: 'coverage-gap',
    sceneId: 'scene-2',
    stepNumber: 2,
    totalSteps: 8,
    durationMs: 10000,
    title: 'The Hidden Proportionate Deduction',
    subtitle: '₹4,000 Room vs ₹2,000 Allowed',
    caption:
      'Because Raju chose a ₹4,000/day Deluxe room when his policy allowed ₹2,000/day, the insurer deducted 50% across room, ICU, and surgical fees as proportionate deductions.',
    badge: 'THE COVERAGE GAP',
    statHighlight: {
      label: 'Room Rent Ratio',
      value: '2,000 / 4,000 (50%)',
    },
  },
  {
    id: 'room-slider-ripple',
    sceneId: 'scene-3',
    stepNumber: 3,
    totalSteps: 8,
    durationMs: 13000,
    title: 'The Silent Ripple Slider',
    subtitle: 'Reactive 5-Tier Counterfactual Engine',
    caption:
      'Drag the slider from ₹4,000 to ₹3,000/day. Watch out-of-pocket drop instantly from ₹41,500 to ₹4,000. All downstream line items recalculate deterministically with zero float errors.',
    badge: 'WOW 2 · COUNTERFACTUAL SLIDER',
    statHighlight: {
      label: 'At ₹3,000/day Room',
      value: '₹4,000 Deducted',
    },
  },
  {
    id: 'deduction-waterfall',
    sceneId: 'scene-4',
    stepNumber: 4,
    totalSteps: 8,
    durationMs: 11000,
    title: 'Deduction Waterfall Architecture',
    subtitle: 'Pure Integer Math in <1ms',
    caption:
      'The engine applies Room Cap → Proportionate Deduction → Copay → Sublimits → Deductible sequentially. Every rupee is accounted for with mathematical certainty.',
    badge: 'DETERMINISTIC WATERFALL',
    statHighlight: {
      label: 'Calculation Time',
      value: '< 1ms',
    },
  },
  {
    id: 'clause-inspector',
    sceneId: 'scene-5',
    stepNumber: 5,
    totalSteps: 8,
    durationMs: 12000,
    title: 'Verbatim Clause Traceability',
    subtitle: 'Policy Contract Section 3.2 Inspector',
    caption:
      'No black-box hallucinations. Every deduction line item links directly to verbatim contract wording. Click any chip to inspect the insurer’s clause side-by-side.',
    badge: 'AUDITABLE CLAUSES',
    statHighlight: {
      label: 'Ground Truth',
      value: 'Contract §3.2',
    },
  },
  {
    id: 'multiroom-simulation',
    sceneId: 'scene-6',
    stepNumber: 6,
    totalSteps: 8,
    durationMs: 11000,
    title: 'Multi-Room Counterfactual Matrix',
    subtitle: 'ICU Day 1 vs Twin Sharing Days 2–3',
    caption:
      'Real hospital stays transition between rooms. Our multi-room simulation models Day 1 ICU without proportionate penalty and Twin Sharing days with zero tariff penalties.',
    badge: 'MULTI-ROOM SIMULATION',
    statHighlight: {
      label: 'Optimized Out-of-Pocket',
      value: '₹14,500 (Saved ₹31,000)',
    },
  },
  {
    id: 'appeal-architect',
    sceneId: 'scene-7',
    stepNumber: 7,
    totalSteps: 8,
    durationMs: 12000,
    title: 'The Appeal Architect',
    subtitle: 'Statutory Citations & Ombudsman Brief',
    caption:
      'Generate an IRDAI-compliant grievance appeal letter in seconds. Automatically quotes IRDAI Non-Medical Expenses Circular (2020) and Consumer Forum precedents with copy & download.',
    badge: 'WOW 3 · 1-CLICK APPEAL DRAFT',
    statHighlight: {
      label: 'Statutory Citation',
      value: 'IRDAI/HLT/REG/2020',
    },
  },
  {
    id: 'verified-export',
    sceneId: 'scene-8',
    stepNumber: 8,
    totalSteps: 8,
    durationMs: 10000,
    title: 'Export & Regulatory Evidence Package',
    subtitle: 'Cryptographic SHA-256 Audit Trail',
    caption:
      'Every calculation, clause reference, and appeal is bundled with a SHA-256 hash. Ready for submission to the Insurance Ombudsman, Grievance Officer, or legal counsel.',
    badge: 'EVIDENCE EXPORT',
    statHighlight: {
      label: 'Verification Integrity',
      value: 'SHA-256 Verified',
    },
  },
];

export const TOTAL_TOUR_DURATION_MS = TOUR_STEPS.reduce(
  (acc, step) => acc + step.durationMs,
  0
);
