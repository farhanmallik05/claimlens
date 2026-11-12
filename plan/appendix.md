# ClaimLens — Appendix A: Original Deck Facts (Preserved)

> *Verbatim facts from the original ClaimLens.pptx — preserved so nothing from the source deck is lost. Cross-reference with idea.md, design.md, and trd.md for how each fact is used.*

---

## Metadata

- **Project Name:** ClaimLens
- **Tagline:** *Know what your insurer will pay before you're discharged*
- **Event:** CodeQuest · National Tech Hackathon 2026 · Idea Submission
- **Author:** Farhan Mallik · KCC Institute of Technology and Management
- **Slide count:** 7 slides, 16:9 widescreen
- **Running footer on slides 2–7:** `ClaimLens · CodeQuest: National Tech Hackathon 2026`
- **Created:** 2026-10-31T03:08:20Z
- **Last modified:** 2026-10-31T13:48:25Z

---

## Slide 1 — Title and Illustrative Bill Review

**Kicker:** `CODEQUEST · NATIONAL TECH HACKATHON 2026 · IDEA SUBMISSION`

**Problem statement (verbatim):**
> *"Families learn about claim shortfalls only after the bill is due. ClaimLens forecasts the payout up front, cites the clause behind every deduction and drafts the appeal."*

**Illustrative bill review card:**
- Policy parameters: `₹5 lakh cover · room cap ₹5,000 a day`
- Room rent: `5 days × ₹8,000 = ₹40,000` → deduction `−₹15,000`
- Surgeon, OT, nursing: `₹60,000`, proportionate cut `62.5%` → deduction `−₹22,500`
- Pharmacy, consumables: `₹30,000`, non-payable items removed → deduction `−₹4,000`
- Diagnostics: `₹20,000` → fully payable
- **Billed:** ₹1,50,000 · **Insurer pays:** ₹1,08,500 · **You pay:** ₹41,500
- Disclaimer: *"Rules vary by policy. Example for illustration."*

**Worked arithmetic:**
- Room cap: `1% × ₹5,00,000 = ₹5,000/day`
- Admissibility ratio: `₹5,000 ÷ ₹8,000 = 62.5%`
- OT/surgeon proportionate: `₹60,000 × 62.5% = ₹37,500 payable` → `₹22,500 deducted`
- Summary: `₹25,000 + ₹37,500 + ₹26,000 + ₹20,000 = ₹1,08,500`; you pay `₹41,500` = **27.67%** of the bill

---

## Slide 2 — Problem and Target Users

**Main heading:** *Insured, yet still left with the bill*

**Statistics (FY24):**
- `57 crore` lives covered by health insurance
- `₹26,038 cr` of claims disallowed or repudiated
- `71%` of claimed value was actually paid out
- **Source:** IRDAI Annual Report 2023-24, as reported by PTI and Business Standard

**Root causes:**
1. Dense wordings hide room-rent caps, co-pay and sub-limits.
2. Shortfalls surface at final settlement, after the bill is incurred.
3. Appealing means insurer grievance cells, then the Ombudsman.

**Who we serve:**
- Policyholders and caregivers
- First-time and group-cover buyers
- Hospital desks and patient NGOs

**Raju persona:** *"Meet Raju (example). His mother needs hip surgery; a room upgrade leaves her ₹41,500 short."*

---

## Slide 3 — Proposed Solution and USP

**Main heading:** *From policy PDF to payout forecast*

**4-step pipeline:**
1. Add policy — PDF or phone photo becomes structured coverage rules.
2. Add bill — Estimate or final bill, read line by line.
3. See forecast — Payable vs. deducted, each line tied to a clause.
4. Take action — Pre-admission checklist and a cited appeal letter.

**Key features:**
- Policy decoder
- Bill auditor
- Payout forecast engine
- Clause citations
- Appeal and escalation kit
- Private by design: PII masked

**USP (verbatim):** *"Your shortfall, forecast before discharge, with the clause behind every rupee"*

---

## Slide 4 — Innovation and Uniqueness

**Main heading:** *Forecast-first, auditable, appeal-ready*

**Comparison table:**

| Capability | Aggregators | Insurer / TPA portals | Generic chatbots | ClaimLens |
| :--- | :---: | :---: | :---: | :---: |
| Understands your exact policy | Partial | Partial | Partial | Yes |
| Audits the bill line by line | No | Partial | Partial | Yes |
| Forecasts payout pre-discharge | No | Partial | No | Yes |
| Cites the clause per deduction | No | No | Partial | Yes |
| Drafts appeal and escalation | Partial | No | Partial | Yes |
| Independent of commissions | No | No | Yes | Yes |

*Table footnote: "Our assessment of expected typical offerings; capabilities vary by provider."*

**Innovation pillars:**
- Neuro-symbolic: LLMs extract, rules compute
- Provenance: every deduction links to its clause
- Appeal engine: cited letters, right escalation

---

## Slide 5 — Technology Stack and Architecture

**Main heading:** *LLMs read, rules decide, clauses prove*

**Architecture layers:**
- Web app · upload, forecast dashboard, appeal kit
- API gateway · FastAPI, auth, file checks, PII masking
- LangGraph agent pipeline: Policy Parser → Bill Reader → Rules Engine → Explainer → Appeal Drafter
- Supabase: Postgres · pgvector · Auth
- Knowledge base: IRDAI rules · policy PDFs
- LLM gateway: LiteLLM · swappable models

**Stack at a glance:**

| Domain | Technologies |
| :--- | :--- |
| Frontend | Next.js, TypeScript, Tailwind |
| Backend | FastAPI, Pydantic, LangGraph |
| AI | Vision LLM, RAG, LiteLLM gateway |
| Data | Supabase: Postgres, pgvector, Auth |
| Quality | pytest eval set, Playwright |
| DevOps | GitHub Actions, Vercel, Render |

---

## Slide 6 — Implementation Plan (original — superseded by schedule.md)

**Main heading:** *14 days, 4 sprints, one shippable MVP*

| Sprint | Dates | Focus | Exit gate |
| :--- | :--- | :--- | :--- |
| Sprint 1 | 2–5 Nov | Foundations: Repo, CI, Supabase schema, Auth and file uploads, 5 policies, 10 sample bills | Upload flow live |
| Sprint 2 | 6–9 Nov | Intelligence: Policy parser (coverage JSON), Bill reader (line items), Rules engine (caps, co-pay) | Forecast API passes tests |
| Sprint 3 | 10–12 Nov | Experience: Forecast dashboard, Appeal and escalation kit, Hindi and English UI | Full demo flow |
| Sprint 4 | 13–15 Nov | Ship: Evals, fixes, PII masking, Deploy, README, demo video, Submit by 15 Nov 11:59 PM IST | v1.0 tagged, submitted |

> [!NOTE]
> Sprints 1–2 are in the past. See schedule.md for the revised 5-day plan.

**Team of 3 (original):** AI and backend · Frontend and UX · Data, QA and demo

**GitHub workflow:** Projects board per sprint · Issues, PR reviews, CI · Dependabot, CodeQL, v1.0 tag

**Scope guard (original):** MVP: forecast + appeal · Later: mobile, voice, TPA links

---

## Slide 7 — Impact, Feasibility and Scalability

**Main heading:** *Fewer surprise bills, stronger appeals*

**Original MVP targets (from the deck):**
- `< 60 s` from upload to forecast
- `± 10%` forecast error on test bills *(superseded — see schedule.md §8.3)*
- `100%` of deductions cited to a clause

**Who benefits:** Families decide before admission · Hospital desks see fewer disputes · NGOs file evidence-backed appeals

**Expected impact:** Avoidable deductions flagged early · More appeals with correct clauses cited · At scale: 1 lakh families × ₹10,000 = ₹100 crore *(illustrative)*

**Feasibility:** Off-the-shelf OCR and LLMs plus rules · Scales by insurer, language, B2B2C · Cites sources, not legal advice

