# Due Diligence Evaluation: `plan/appendix.md`

**Evaluated Target:** `plan/appendix.md`  
**Lines:** 175  
**Size:** 7,034 bytes  
**Evaluator:** Worker M1 (Core Strategy & PRD Due Diligence Evaluator)  
**Framework:** `evaluation-agent` (`C:\Users\farhan\.gemini\config\skills\evaluation-agent\SKILL.md`)  
**Integrity Mode:** Demo Integrity Mode (strictly grounded in plan data; zero outside assumptions)  

---

## 1. Context Declaration

- **Evaluated Target:** `plan/appendix.md` (Lines 1–175, 7,034 bytes).
- **Project Stage:** `Concept` / Source Deck Historical Record (`ClaimLens.pptx`).
- **Team Context:** Formally declared on Slide 6 as a `"Team of 3: AI and backend · Frontend and UX · Data, QA and demo"` (`appendix.md:153`), though superseded in `plan.md:40` as a solo build.
- **Information Available:**
  - Complete, slide-by-slide verbatim transcription of the original 7-slide widescreen presentation deck (`ClaimLens.pptx`) created 2026-10-31.
  - Slide 1: Problem statement, complete illustrative bill review card with worked arithmetic (Raju ₹1,50,000 bill, ₹41,500 shortfall, 27.67% out-of-pocket).
  - Slide 2: FY24 statistics (57 crore lives, ₹26,038 cr disallowed, 71% payout ratio) sourced to IRDAI via press reports, 3 root causes, target users, and Raju persona.
  - Slide 3: 4-step pipeline (Add policy, Add bill, See forecast, Take action), 6 key features, and verbatim USP (*"Your shortfall, forecast before discharge, with the clause behind every rupee"*).
  - Slide 4: 6-capability competitive comparison table vs aggregators, insurer portals, and generic chatbots; 3 innovation pillars (Neuro-symbolic, Provenance, Appeal engine).
  - Slide 5: Architectural stack diagram: Web app, API gateway, LangGraph pipeline, Supabase (Postgres, pgvector, Auth), LiteLLM gateway, and testing tools.
  - Slide 6: Original 14-day 4-sprint implementation schedule (Sprints 1–4, 2–15 Nov), GitHub workflow (Dependabot, CodeQL), and team division of labor.
  - Slide 7: Impact, feasibility, and scalability: original MVP targets (<60s upload, ±10% error, 100% citations), beneficiary breakdown, and illustrative ₹100 crore impact estimate.
- **Information Missing:**
  - Actual codebase repository links or live commit logs demonstrating that Sprints 1 and 2 were executed as claimed.
  - Resolution of the critical contradiction between "±10% forecast error" (`appendix.md:167`) and "deterministic rules engine" (`appendix.md:108`).
  - Explanation of how arbitrary policy/bill uploads (`appendix.md:72-74`) are achieved without real user data storage or PII leakage.
  - Verification of commercial pricing or customer willingness-to-pay data.
  - *Confidence Impact:* High confidence in evaluating the conceptual ambition and mathematical model of the source pitch deck; Low confidence in execution feasibility given the documented failure of Sprints 1 and 2.
- **Evaluation Lens:** Because `appendix.md` preserves the original source pitch deck (`ClaimLens.pptx`), the primary evaluative lens is **Forensic Gap Analysis**: comparing the original idealized claims against technical reality, identifying early warning signs of overclaiming, and verifying the mathematical durability of the foundational Raju case study.

---

## 2. Category Scoring

### 2.1 Problem, User & Market Fit
- **Score:** 6/10
- **Confidence:** High
- **Category Weight:** High (Concept Stage: ████)
- **Direct Plan Evidence:**
  - `appendix.md:24-25`: Slide 1 Problem Statement: *"Families learn about claim shortfalls only after the bill is due. ClaimLens forecasts the payout up front, cites the clause behind every deduction and drafts the appeal."*
  - `appendix.md:48-52`: Slide 2 Statistics: *"57 crore lives covered... ₹26,038 cr of claims disallowed or repudiated... 71% of claimed value was actually paid out. Source: IRDAI Annual Report 2023-24, as reported by PTI and Business Standard"*.
  - `appendix.md:64`: Slide 2 Persona: *"Meet Raju (example). His mother needs hip surgery; a room upgrade leaves her ₹41,500 short."*
- **Strengths Observed:**
  - The core problem definition is acute, compelling, and grounded in massive macro financial disallowance figures (₹26,038 crore).
  - Raju's illustrative case study on Slide 1 is brilliantly conceived, providing a relatable, emotionally charged hook.
- **Weaknesses & Vulnerabilities:**
  - Secondary user categories on Slide 2 (*"Hospital desks and patient NGOs"*, line 62) are tacked on without workflow definitions or economic validation.
  - Reliance on secondary press clippings (*"as reported by PTI and Business Standard"*, line 52) rather than direct statutory report tables.
- **+2 Points Action Plan:**
  1. Replace secondary news wire citations with exact table and page references from the primary IRDAI 2023-24 Annual Report.
  2. Provide empirical evidence of hospital billing desk friction through at least 3 documented desk-clerk interviews.

---

### 2.2 Product Strategy & Experience
- **Score:** 5/10
- **Confidence:** Medium
- **Category Weight:** High (Concept Stage: ████)
- **Direct Plan Evidence:**
  - `appendix.md:72-76`: Slide 3: 4-step pipeline: *"1. Add policy — PDF or phone photo... 2. Add bill — Estimate or final bill... 3. See forecast... 4. Take action"*.
  - `appendix.md:96-104`: Slide 4: Comparison table claiming ClaimLens is the only solution that understands exact policies, audits line-by-line, forecasts pre-discharge, cites clauses, and drafts appeals.
- **Strengths Observed:**
  - High-converting 4-step product promise that intuitively explains the user journey in plain language.
  - Clear competitive differentiation matrix highlighting existing aggregator conflicts of interest (commissions).
- **Weaknesses & Vulnerabilities:**
  - Severe credibility gap: Slide 3 promises arbitrary document ingestion (*"Add policy — PDF or phone photo... Add bill"*, lines 73-74), but in actual implementation, arbitrary uploads were cancelled due to lack of a PII redaction pipeline.
  - Presenting a product promise that the MVP cannot fulfill undermines user trust.
- **+2 Points Action Plan:**
  1. Re-frame the 4-step pipeline on Slide 3 to honestly reflect the demo scope: "1. Select sample policy & bill sandbox -> 2. Explore line-by-line audit -> 3. Forecast out-of-pocket shortfall -> 4. Generate cited appeal".
  2. Clearly mark future upload capabilities as "Phase 2 Roadmap" on the slide.

---

### 2.3 System Architecture & Technical Design
- **Score:** 4/10
- **Confidence:** High
- **Category Weight:** Medium (Concept Stage: ██○○)
- **Direct Plan Evidence:**
  - `appendix.md:118-125`: Slide 5 Architecture:
    - *"Web app · upload, forecast dashboard, appeal kit"*
    - *"API gateway · FastAPI, auth, file checks, PII masking"*
    - *"LangGraph agent pipeline: Policy Parser → Bill Reader → Rules Engine → Explainer → Appeal Drafter"*
    - *"Supabase: Postgres · pgvector · Auth"*
    - *"Knowledge base: IRDAI rules · policy PDFs"*
    - *"LLM gateway: LiteLLM · swappable models"*
- **Complexity Verdict:** `Over-engineered` (Aspirational bloat).
- **Strengths Observed:**
  - Correctly conceptualized the multi-agent orchestration pipeline (Policy Parser → Bill Reader → Rules Engine → Explainer → Appeal Drafter).
- **Weaknesses & Vulnerabilities:**
  - Classic early-stage architectural over-engineering: incorporates Supabase Postgres, pgvector, user auth, and persistent knowledge bases for what is fundamentally an in-browser deterministic calculation demo.
  - Adding pgvector/RAG introduces vector embedding latency and index synchronization overhead where structured regex/schema extraction is vastly superior.
- **+2 Points Action Plan:**
  1. Formally remove Supabase, pgvector, and Auth from the Slide 5 architecture diagram, replacing them with a streamlined local-first edge topology.
  2. Highlight the in-browser execution (<1 ms) of the deterministic rules engine on the slide.

---

### 2.4 Engineering Execution (Historical Sprint Plan)
- **Score:** 2/10
- **Confidence:** High
- **Category Weight:** Low (Concept Stage: █○○○)
- **Direct Plan Evidence:**
  - `appendix.md:143-150`: Slide 6 Sprint Schedule:
    - *"Sprint 1 (2–5 Nov): Foundations: Repo, CI, Supabase schema, Auth and file uploads... Exit gate: Upload flow live"*
    - *"Sprint 2 (6–9 Nov): Intelligence: Policy parser... Bill reader... Rules engine... Exit gate: Forecast API passes tests"*
    - *"Sprint 3 (10–12 Nov): Experience... Full demo flow"*
    - *"Sprint 4 (13–15 Nov): Ship... v1.0 tagged, submitted"*
  - `appendix.md:150`: Callout note: *"Sprints 1–2 are in the past. See schedule.md for the revised 5-day plan."*
- **Code Review Disclaimer:** Code has not been reviewed directly. Evaluation is restricted to the documented specifications within this markdown plan.
- **Strengths Observed:**
  - Preserves the historical sprint record with explicit exit gates for each sprint.
- **Weaknesses & Vulnerabilities:**
  - Complete execution failure of the original plan: Sprints 1 and 2 (covering 8 full calendar days, 2–9 Nov) elapsed with zero code, zero repo, and zero upload flow delivered (`plan.md:39, 52`).
  - Highlights the fatal danger of planning elaborate infrastructure (Supabase, Auth, CI) that paralyzes early-stage velocity.
- **+2 Points Action Plan:**
  1. Annotate Slide 6 with a retrospective root-cause post-mortem explaining why Sprints 1 and 2 stalled.
  2. Adopt the compressed 5-day fallback schedule (`schedule.md`) as the primary presentation slide.

---

### 2.5 AI Engineering
- **Score:** 4/10
- **Confidence:** High
- **Category Weight:** Medium
- **Direct Plan Evidence:**
  - `appendix.md:108`: *"Neuro-symbolic: LLMs extract, rules compute"*
  - `appendix.md:121`: LangGraph 5-agent pipeline.
  - `appendix.md:167`: Slide 7 MVP target: *"`± 10%` forecast error on test bills (superseded — see schedule.md §8.3)"*
- **AI Role Verdict:** `Net liability` (as specified in Slide 7's error tolerance).
- **Strengths Observed:**
  - Proclaims the correct neuro-symbolic division of labor on Slide 4 ("LLMs extract, rules compute").
- **Weaknesses & Vulnerabilities:**
  - Fatal mathematical contradiction on Slide 7: accepting a *"±10% forecast error"* completely invalidates the product. In financial insurance claim arbitration, a 10% calculation error on a ₹5,00,000 claim is ₹50,000—larger than Raju's entire shortfall!
  - Conflates extraction fuzziness with mathematical computation error.
- **+2 Points Action Plan:**
  1. Strike the "±10% forecast error" target completely; replace it with: "Deterministic calculation error = 0%; Document extraction accuracy target ≥90% with mandatory human confirmation on low-confidence fields."
  2. Specify the exact prompt schemas and temperature settings (0.0) for the extraction agents.

---

### 2.6 Security, Privacy & Trust
- **Score:** 5/10
- **Confidence:** Medium
- **Category Weight:** Low (Concept Stage: █○○○)
- **Direct Plan Evidence:**
  - `appendix.md:84`: Slide 3: *"Private by design: PII masked"*
  - `appendix.md:120`: Slide 5: *"API gateway · FastAPI, auth, file checks, PII masking"*
  - `appendix.md:174`: Slide 7: *"Cites sources, not legal advice"*
- **Strengths Observed:**
  - Acknowledges the necessity of PII masking and legal disclaimers from the very inception of the pitch deck.
- **Weaknesses & Vulnerabilities:**
  - Superficial treatment of privacy: states "PII masked" as a bullet point without defining whether masking occurs client-side or server-side, what regex/NER patterns are used, or how patient names in hospital bills are redacted.
- **+2 Points Action Plan:**
  1. Specify the client-side PII redaction pipeline directly on Slide 5.
  2. Add an explicit zero-data-retention architectural constraint to the security overview.

---

### 2.7 Infrastructure & Operational Readiness
- **Score:** 3/10
- **Confidence:** High
- **Category Weight:** None (Concept Stage: ○○○○)
- **Direct Plan Evidence:**
  - `appendix.md:135`: DevOps stack: *"GitHub Actions, Vercel, Render"*
  - `appendix.md:166`: Slide 7 target: *"`< 60 s` from upload to forecast"*
- **Strengths Observed:**
  - Realistic multi-cloud split: static Vercel frontend paired with Python FastAPI backend on Render.
- **Weaknesses & Vulnerabilities:**
  - A target latency of "< 60 s" (`appendix.md:166`) is agonizingly slow for a web application and guarantees high user bounce rates during a 2-minute judge evaluation.
  - Ignores Render free-tier container sleep latency (60s spin-up time).
- **+2 Points Action Plan:**
  1. Revise latency target from "< 60 s" to "< 5 s for full multi-agent extraction; < 1 ms for deterministic slider recomputation".
  2. Document the keep-alive ping and pre-rendered static replay architecture on Slide 5.

---

### 2.8 Design & User Experience
- **Score:** 7/10
- **Confidence:** High
- **Category Weight:** Medium (Concept Stage: ██○○)
- **Direct Plan Evidence:**
  - `appendix.md:27-41`: Slide 1 Illustrative Bill Review Card:
    - Policy: `₹5 lakh cover · room cap ₹5,000 a day`
    - Room rent: `5 days × ₹8,000 = ₹40,000 → deduction −₹15,000`
    - Surgeon, OT: `₹60,000, proportionate cut 62.5% → deduction −₹22,500`
    - Pharmacy: `₹30,000, non-payables removed → deduction −₹4,000`
    - Diagnostics: `₹20,000 → fully payable`
    - Totals: `Billed: ₹1,50,000 · Insurer pays: ₹1,08,500 · You pay: ₹41,500 (27.67%)`
- **Strengths Observed:**
  - The bill review card on Slide 1 is the crown jewel of the deck: crystal-clear tabular accounting, step-by-step arithmetic breakdown, and undeniable visual clarity.
  - Directly exposes the proportionate deduction multiplier (62.5%), demystifying a predatory insurance clause.
- **Weaknesses & Vulnerabilities:**
  - The slide deck design lacks responsive mobile layout considerations, assuming presentation only on 16:9 widescreen conference displays (`appendix.md:13`).
- **+2 Points Action Plan:**
  1. Add a mobile smartphone mockup frame illustrating how the Slide 1 receipt scales down to a 390px mobile viewport.
  2. Incorporate explicit micro-copy explaining the mathematical formula behind the 62.5% ratio directly on the bill card.

---

### 2.9 Business & Commercial Viability
- **Score:** 3/10
- **Confidence:** Medium
- **Category Weight:** Medium (Concept Stage: ██○○)
- **Direct Plan Evidence:**
  - `appendix.md:172`: Slide 7 Expected Impact: *"At scale: 1 lakh families × ₹10,000 = ₹100 crore (illustrative)"*
  - `appendix.md:174`: Slide 7 Feasibility: *"Scales by insurer, language, B2B2C"*
- **Strengths Observed:**
  - Intuitive top-down TAM/impact metric: ₹10,000 saved per family across 1 lakh families equals ₹100 crore in prevented out-of-pocket leakage.
- **Weaknesses & Vulnerabilities:**
  - The ₹100 crore figure is purely decorative and speculative. It lacks a conversion funnel, unit economic basis, or customer acquisition strategy.
  - "Scales by insurer, language, B2B2C" is a string of buzzwords without an operational go-to-market plan.
- **+2 Points Action Plan:**
  1. Replace the illustrative ₹100 crore multiplication with a concrete B2B2C distribution partnership model (e.g. licensing to health insurance brokers or corporate employee benefits portals).
  2. Model customer acquisition costs (CAC) against average recovered claim value.

---

### 2.10 Execution Feasibility
- **Score:** 4/10
- **Confidence:** High
- **Category Weight:** High (Concept Stage: ████)
- **Direct Plan Evidence:**
  - `appendix.md:153`: Slide 6: *"Team of 3 (original): AI and backend · Frontend and UX · Data, QA and demo"*
  - `appendix.md:150`: *"Sprints 1–2 are in the past."*
- **Strengths Observed:**
  - Sensibly scoped original intent: prioritizing MVP forecast + appeal while deferring mobile native apps, voice, and TPA links to "Later" (`appendix.md:157`).
- **Weaknesses & Vulnerabilities:**
  - Severe team and schedule fiction: the deck claims a "Team of 3" executing 4 sprints over 14 days, when in reality the team is a solo developer who lost the first 8 days of the sprint window without shipping.
  - Unrealistic scope for the available time remaining.
- **+2 Points Action Plan:**
  1. Formally update Slide 6 to reflect the actual solo developer capacity, replacing the Team of 3 breakdown with the 3 AI-agent lanes.
  2. Replace the 14-day 4-sprint plan with the compressed 5-day daily exit-gate roadmap from `schedule.md`.

---

## 3. Key Decision Audit

| Decision | Justified? | Risk Level | Better Alternative |
|---|---|---|---|
| **Raju bill arithmetic model (`appendix.md:27-41`)** | Yes | Low | None. This is the single strongest asset in the entire project. |
| **"±10% forecast error" target (`appendix.md:167`)** | No | Critical | Replace with "0% math calculation error; ≥90% extraction precision with human review". |
| **Supabase + pgvector in MVP (`appendix.md:122`)** | No | High | Drop database entirely; use in-browser memory and static JSON fixtures. |
| **Claiming arbitrary uploads on Slide 3 (`appendix.md:72`)** | No | High | Scope down presentation promise to the Raju synthetic sandbox. |
| **14-day sprint schedule for Team of 3 (`appendix.md:143`)** | No | Critical | Supersede immediately with the 5-day solo schedule (`schedule.md`). |

---

## 4. Red Team Analysis (7 Failure Modes)

1. **Failure Mode 1 (Technical / Mathematical - The ±10% Credibility Suicide):**
   - *Why dangerous:* A judge reads Slide 7 (`appendix.md:167`), notices "±10% forecast error", and immediately concludes the author does not understand that insurance policy arithmetic is legally deterministic.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Immediately strike the ±10% error bullet from all slide decks and presentation materials, replacing it with measured extraction accuracy.
2. **Failure Mode 2 (Execution - The Sprint 1 & 2 Ghost Ship):**
   - *Why dangerous:* A judge reviews Slide 6 (`appendix.md:143-149`), asks to see the "Upload flow live" from Sprint 1 (2–5 Nov), and discovers that nothing was built during that entire 8-day window.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Present the updated `schedule.md` timeline exclusively; never present Slide 6 as active project reality.
3. **Failure Mode 3 (Product - The Upload Bait-and-Switch):**
   - *Why dangerous:* A judge tests the live product expecting to upload their own parent's insurance policy based on Slide 3, only to find upload buttons disabled or missing.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Explicitly label the product on Slide 3 as an "Interactive Sandbox & Decision Copilot" rather than an open upload portal.
4. **Failure Mode 4 (Operational - The 60-Second Latency Death):**
   - *Why dangerous:* Slide 7 promises "< 60 s" latency (`appendix.md:166`). In a 120-second judge visit, waiting 59 seconds for a backend API response causes the judge to navigate away.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Enforce client-side calculation (<1 ms) for all interactive demos, reserving API calls for optional deep-dive live reads.
5. **Failure Mode 5 (Architectural - The Supabase/pgvector Dead Weight):**
   - *Why dangerous:* The developer spends 2 critical days wrestling with Supabase migrations and pgvector embeddings that are never seen or appreciated by hackathon judges.
   - *Probability:* High | *Severity:* High
   - *Mitigation:* Execute the surgical pruning ordered in `plan.md:55` and `adrs.md`, removing Supabase entirely from the build.
6. **Failure Mode 6 (Project-Specific - The ₹100 Crore Fantasy Multiplier):**
   - *Why dangerous:* Savvy venture capital or business judges dissect the "1 lakh families × ₹10,000 = ₹100 crore" claim (`appendix.md:172`), exposing the complete absence of customer acquisition mechanics.
   - *Probability:* Medium | *Severity:* High
   - *Mitigation:* Anchor impact to demonstrable individual case savings (e.g. "Saves Raju's family ₹41,500 before discharge") rather than macro multiplication.
7. **Failure Mode 7 (Project-Specific - Press Report Dispute):**
   - *Why dangerous:* If an evaluator challenges the ₹26,038 cr figure, quoting secondary news sources (PTI) makes the team look amateurish.
   - *Probability:* Low | *Severity:* High
   - *Mitigation:* Complete Task V-1 by directly citing the official IRDAI Annual Report 2023-24 table and page number.

---

## 5. Missing Elements Matrix

| Gap | Type | Priority | Impact on Evaluation |
|---|---|---|---|
| Repudiation of "±10% forecast error" | Technical | Must Have | Eliminates fatal mathematical credibility flaw |
| Replacement of dead Sprint 1-4 schedule | Operational | Must Have | Restores project timeline integrity |
| Removal of Supabase/pgvector architectural claims | Technical | Must Have | Aligns slide claims with actual working code |
| Re-framing arbitrary upload promises to sandbox | Product | Should Have | Prevents judge bait-and-switch frustration |
| Replacement of news clippings with primary IRDAI tables | Research | Should Have | Strengthens market problem validation |
| Bottom-up unit economics replacing ₹100 cr estimate | Business | Nice to Have | Improves commercial viability standing |

---

## 6. Strengths & Durability Analysis

1. **Foundational Raju Case Arithmetic (`appendix.md:27-41`):**
   - *Why it matters:* Lays out the exact, indisputable rupee breakdown of the ₹41,500 shortfall, establishing the golden mathematical fixture for the entire project.
   - *Prime beneficiary:* Engineers, judges, and policyholders.
   - *Durability:* World-class durability; this arithmetic survives all rewrites and powers the final demo.
2. **Proportionate Cut Dissection (`appendix.md:30, 38-39`):**
   - *Why it matters:* Exposes the predatory "admissibility ratio" (₹5,000 / ₹8,000 = 62.5%) that quietly slashes surgeon and OT fees when a patient upgrades their room.
   - *Prime beneficiary:* Caregivers facing hidden discharge traps.
   - *Durability:* Highly durable; targets the single most unfair mechanism in Indian health insurance.
3. **Core Value Proposition / USP (`appendix.md:86`):**
   - *Why it matters:* *"Your shortfall, forecast before discharge, with the clause behind every rupee"* is an exceptional, punchy, customer-centric tagline.
   - *Prime beneficiary:* Product marketing and judge recall.
   - *Durability:* Highly durable branding asset.
4. **Neuro-Symbolic Conceptual Clarity (`appendix.md:108`):**
   - *Why it matters:* Recognizes early that LLMs must read documents while deterministic rules compute financial math.
   - *Prime beneficiary:* Architectural stability.
   - *Durability:* High; correctly identifies the winning AI architectural pattern.
5. **Preservation of Verbatim Project History (`appendix.md:1-5`):**
   - *Why it matters:* Preserving the exact source facts enables rigorous auditing, forensic gap analysis, and honest self-correction.
   - *Prime beneficiary:* Due diligence evaluators and project historians.
   - *Durability:* Exceptional archival value.

---

## 7. Comparative Benchmark

| Benchmark | Standing | Evidence from Plan Text |
|---|---|---|
| **Typical student project** | **At** | The original deck exhibits classic student project traits: aspirational sprint schedules, dead dates, unbuilt tech stacks (pgvector/Supabase), and speculative TAM numbers (`appendix.md:122, 143, 172`). |
| **Competitive internship portfolio** | **At** | Saved from mediocrity by the brilliant Raju mathematical calculation card on Slide 1 (`appendix.md:27-41`). |
| **Strong indie hacker product** | **Below** | An experienced indie hacker would never promise a 60-second API latency or include vector databases for a simple arithmetic tool. |
| **Seed-stage startup MVP** | **Below** | Suffers from execution failure of Sprints 1 and 2 and lacks primary customer validation. |
| **Professional SaaS product** | **Below** | Unviable due to contradictory "±10% forecast error" and absence of PII masking architecture. |

---

## 8. Strategic Roadmap

### Immediate (0–30 Days / Deck Remediation)
- Purge Contradictory Error Claim: Replace "±10% forecast error" with exact deterministic calculation benchmarks on all slide materials.
- Align Slide 6 with Reality: Replace the defunct 14-day 4-sprint schedule with the revised 5-day roadmap from `schedule.md`.
- Prune Architecture Diagram: Remove Supabase, pgvector, and Auth from Slide 5, showcasing the clean, local-first in-browser engine.

### Short-Term (1–3 Months / Post-Hackathon Pitch Hardening)
- Re-architect Ingestion: Design a genuine client-side PII masking engine to fulfill the Slide 3 product promise ("Add policy / Add bill").
- Formalize Ombudsman Format: Expand the appeal drafter into a verified legal document generator complying with Insurance Ombudsman filing guidelines.
- Primary Data Validation: Conduct structured interviews with 10 policyholders who faced proportionate deductions to build an empirical case archive.

### Medium-Term (3–12 Months / Commercial Evolution)
- Hospital Integration: Develop a B2B pre-admission clearance widget for hospital billing desks to eliminate discharge disputes.
- Real Policy Coverage: Ingest and maintain a structured rule repository of India's top 20 retail health insurance policies.
- Unit Economics Validation: Establish a commercial revenue model charging a success fee or subscription for claim arbitration.

---

## 9. Final Verdict

**Overall Score:** 4.5 / 10  
**Evaluation Confidence:** High  

| Dimension | Rating |
|---|---|
| Engineering Grade | C (Aspirational stack with pgvector/Supabase; dead sprint execution) |
| Product Grade | B- (Brilliant Slide 1 Raju math, but unfulfilled upload promises) |
| Execution Risk | Critical (Sprints 1 and 2 completely failed to deliver) |
| Technical Risk | Critical ("±10% error" claim destroys mathematical credibility) |
| Business Risk | High (Speculative ₹100 crore multiplication without GTM) |
| Portfolio Impact | Average (Classic hackathon pitch deck requiring deep engineering remediation) |

### Direct Answers

1. **Is this project genuinely impressive at its current stage?**  
   The source deck (`appendix.md`) is impressive in its financial problem intuition and mathematical bill review card (Slide 1), but thoroughly unimpressive in its execution history, having completely missed Sprints 1 and 2 while accumulating aspirational buzzwords.

2. **Is it over-engineered, correctly engineered, or under-engineered?**  
   In this original deck, it is grossly over-engineered in architecture (proposing Supabase, pgvector, RAG, and LangGraph for an arithmetic problem) while dangerously under-engineered in error tolerances (proposing a fatal "±10% forecast error").

3. **What is the single strongest decision made?**  
   The worked arithmetic breakdown of the Raju hip surgery case on Slide 1 (`appendix.md:27-41`), which provides the permanent mathematical anchor for the entire project.

4. **What is the single most dangerous mistake?**  
   Listing "±10% forecast error on test bills" on Slide 7 (`appendix.md:167`), which directly contradicts the claim of a deterministic calculation engine and destroys trust in a financial product.

5. **What should the creator stop doing immediately?**  
   Stop presenting the defunct 14-day 4-sprint timeline and stop promising unconstrained document uploads before a client-side PII redaction pipeline is built.

6. **What is the single highest-leverage next action?**  
   Completely align all presentations and documentation with the remediated plans in `plan.md`, `schedule.md`, and `trd.md`, treating `appendix.md` strictly as a historical audit artifact.

7. **What would it concretely take to make this world-class?**  
   Build the working deterministic TypeScript engine, eliminate the fictional sprint history, demonstrate real-time in-browser calculation at 60 fps, and back every single claim with measured code rather than slide deck promises.
