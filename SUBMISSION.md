# ClaimLens — CodeQuest 2026 Submission Document

**Project Name:** ClaimLens  
**Repository:** [https://github.com/farhanmallik05/claimlens](https://github.com/farhanmallik05/claimlens)  
**Track:** AI Agent Workflow / FinTech / Healthcare Adjudication  
**License:** MIT  

---

## 1. Executive Summary

Every year in India, over **7 million insured families** face unexpected out-of-pocket hospital deductions at discharge. The primary culprit is **Clause SP-3.1 Room Rent Capping** and **Clause SP-3.2 Proportionate Deductions**, which trigger a hidden cascading haircut across surgeon fees, operating theatre costs, and ICU days whenever a patient occupies a room above their policy threshold.

Hospitals rarely explain the cascade, and insurers issue opaque, jargon-heavy settlement sheets. Patients have no way to verify if deductions were calculated correctly or if statutory protections (such as IRDAI-mandated carve-outs for medicines and diagnostics) were violated.

**ClaimLens** solves this crisis with a **deterministic adjudication and counterfactual simulation platform**:
1. **Multimodal Agent Pipeline:** Dual vision-language models parse messy hospital bills and fine-print policy contracts into typed JSON schemas.
2. **Deterministic Rules Engine:** Pure TypeScript engine running pure integer rupee arithmetic in **<0.05ms** with zero floating point drift.
3. **100% Clause Provenance:** Every single deduction line item links directly to verbatim insurer contract wording.
4. **1-Click Appeal Architect:** Automatically detects illegal deductions (e.g. haircuts on medicines) and drafts an IRDAI-compliant dispute letter with statutory citations in seconds.
5. **Offline Reliability SLA:** A 6-second circuit breaker ensures the public showcase runs 100% offline using synthetic recorded traces if the backend is unavailable.

---

## 2. Key "Wow" Moments

### Wow 1: The Receipt & Tear Strip (Scene 1)
- Recreates the visceral physical reality of an Indian hospital checkout counter.
- Interactive tear strip peels away to reveal the discrepancy between what Raju paid (₹45,500) and what his ₹2,00,000 policy should have covered.

### Wow 2: The Silent Ripple Slider (Scene 3)
- An interactive 5-tier room tariff slider (`₹2,000` to `₹8,000/day`).
- As the user drags the slider to ₹3,000/day, they witness Raju's out-of-pocket drop from **₹41,500 to ₹4,000**.
- Downstream surgeon fees, OT tariffs, and nursing charges update in real-time with zero lag (<1ms).

### Wow 3: The 1-Click Appeal Drafter (Scene 7)
- Detects that the insurer wrongfully deducted ₹9,750 from pharmacy and diagnostic charges.
- Generates a formal grievance brief citing **IRDAI Non-Medical Expenses Circular (2020)** and Consumer Disputes Redressal Commission precedents.
- Instant copy to clipboard and court-ready PDF download.

---

## 3. Verified Performance & Reliability Metrics

All metrics are measured from actual test runs recorded in `metrics.json`:

| Metric Category | Target SLA | Measured Result | Verification Command |
|---|---|---|---|
| **E2E Test Pass Rate** | 100% | **100% (148/148 passed)** | `node scripts/run_e2e_suite.js` |
| **Float Leakage** | 0 float values | **0 (100% Integer Rupees)** | `node scripts/verify_all.js` |
| **Rules Engine Latency** | < 1.0 ms | **0.04 ms (<1ms)** | `pnpm --filter @claimlens/engine test` |
| **Invariant Stress Tests** | > 1,000 runs | **2,112 runs passed (FR-7, FR-8)** | `node scripts/verify_challenger_invariants.js` |
| **Offline Fallback SLA** | < 6.0 seconds | **Trips at 2.5s -> 100% offline** | `apps/web/lib/events.ts` |
| **Git Delivery Rigor** | 10+ PR merges | **10 Merged PRs on GitHub** | `gh pr list --state all` |

---

## 4. Architecture Overview

```
               [ User Input / Hospital Bill PDF ]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [ Policy Parser ]               [ Bill Reader ]
   (Extracts caps & clauses)       (Itemizes line items)
               └───────────────┬───────────────┘
                               │
               [ Deterministic Rules Engine ]
             (Integer arithmetic · <0.05ms)
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     [ Clause Explainer ]             [ Appeal Architect ]
 (100% contract provenance)       (Statutory grievance letter)
```

- **Frontend:** Next.js 14 App Router, Tailwind CSS, Lucide icons, Paper UI design system.
- **Rules Engine:** TypeScript `@claimlens/engine` (independent package, zero runtime dependencies, pure integer arithmetic).
- **Backend API:** FastAPI (Python 3.13), Server-Sent Events (SSE) streaming, in-memory rate limiting guards.
- **Fixtures & Replay:** Authoritative JSON fixtures (`fixtures/raju_trace.json`, `policy.raju.json`, `bill.raju.json`, `settlement.raju.json`).

---

## 5. Quickstart & Verification Commands

```bash
# 1. Clone repository
git clone https://github.com/farhanmallik05/claimlens.git
cd claimlens

# 2. Install dependencies
pnpm install

# 3. Run the unified monorepo verification suite (Engine, API, E2E, Invariants, Float Audit)
node scripts/verify_all.js

# 4. Start Next.js showcase web application
pnpm --filter web dev
# Open http://localhost:3000

# 5. Start FastAPI agent backend (optional; showcase has 6s offline circuit breaker)
cd apps/api
python -m uvicorn app.main:app --port 8000 --reload
```

---

## 6. Regulatory & Statutory Framework References

1. **IRDAI/HLT/REG/CIR/194/07/2020:** Guidelines on Standardization of General Terms in Health Insurance Contracts.
2. **IRDAI (Health Insurance) Regulations, 2016:** Regulation 19 on proportionate deductions and explicit exclusions.
3. **Consumer Protection Act, 2019:** Redressal mechanism for unfair trade practices in health claim deductions.
