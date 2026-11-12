# Due Diligence Evaluation: `plan/plan.md`

**Evaluated Target:** `plan/plan.md`  
**Lines:** 62  
**Size:** 4,068 bytes  
**Evaluator:** Worker M1 (Core Strategy & PRD Due Diligence Evaluator)  
**Framework:** `evaluation-agent` (`C:\Users\farhan\.gemini\config\skills\evaluation-agent\SKILL.md`)  
**Integrity Mode:** Demo Integrity Mode (strictly grounded in plan data; zero outside assumptions)  

---

## 1. Context Declaration

- **Evaluated Target:** `plan/plan.md` (Lines 1–62, 4,068 bytes).
- **Project Stage:** `Concept` / Master Plan Index & Orchestration Blueprint.
- **Team Context:** `Solo` developer utilizing three AI-agent execution lanes (`plan.md:40`).
- **Information Available:**
  - Header Metadata: Event (2026), Author (Farhan Mallik), Timeline (Wed 11 Nov to Sun 15 Nov 2026, target 6 PM IST), One-line pitch (*"Your shortfall, forecast before discharge, with the clause behind every rupee"*).
  - Master Navigation Index: 14-document catalog mapping every planning file (`idea.md`, `strategy.md`, `prd.md`, `flows.md`, `design.md`, `trd.md`, `adrs.md`, `schedule.md`, `prompts.md`, `content.md`, `qa.md`, `risks.md`, `appendix.md`) to its functional purpose and reading context.
  - Standing Workflow Rules: Spec-first → local-first dev → deterministic core → every claim backed by built/measured evidence.
  - Explicit Assumptions Table (A1–A7) with contingency paths: A1 (nothing built yet), A2 (solo + 3 lanes), A3 (cold link + ≤2 min video), A4 (synthetic docs, zero signup), A5 (TS engine + Python port), A6 (swappable LiteLLM vision model), A7 (unknown rubric).
  - Brutal Corrections to Original Deck: 5 explicit action items invalidating prior dead sprint schedules (Sprints 1–2), removing the contradictory "±10% forecast error", addressing Render 60s cold starts, cutting unbuilt buzzwords (Supabase Auth, pgvector, full Hindi UI), and mandating primary IRDAI report verification (Task V-1).
  - Core Principle: *"The landing page is the pitch"* (line 62).
- **Information Missing:**
  - Concrete versioning and change-log protocol across the 14 separate files.
  - Justification for maintaining dual TypeScript and Python engines (Assumption A5) in a 5-day solo sprint.
  - Default fallback model selection and token budget for Assumption A6 (Vision-LLM provider undecided).
  - Resolution protocol if Assumption A7 remains unresolved (rubric remains undiscovered).
  - *Confidence Impact:* Master architecture and execution orchestration confidence is High; individual category ratings reflect the document's role as an index rather than an implementation specification.
- **Evaluation Lens:** As a Master Plan Index, the primary evaluative criteria are: Does this document establish structural coherence across the planning corpus? Are assumptions explicitly stated with actionable fallbacks? Does it honestly repudiate prior false assumptions and overambitious claims?

---

## 2. Category Scoring

### 2.1 Problem, User & Market Fit
- **Score:** 7/10
- **Confidence:** High
- **Category Weight:** High (Concept Stage: ████)
- **Direct Plan Evidence:**
  - `plan.md:6`: *"One-line pitch: Your shortfall, forecast before discharge, with the clause behind every rupee."*
  - `plan.md:41`: Assumption A3: *"Judges open a link cold (laptop or phone) ~2 min, plus watch a ≤2 min video. If live screen-share, keep the tour (design.md §5.4) as the script."*
  - `plan.md:56`: *"Slide 2 statistics: footnote each with a link and re-verify against the IRDAI Annual Report 2023-24 before shipping (task V-1 in qa.md)."*
- **Strengths Observed:**
  - Crisp, disciplined value proposition: crystallizes the problem and solution into an unforgettable single sentence.
  - Realistic user assumption modeling: plans for cold 2-minute judge visits while providing a fallback script for live demonstrations.
  - Self-correcting integrity: explicitly calls out the need to re-verify slide statistics before shipping.
- **Weaknesses & Vulnerabilities:**
  - Relies on subsequent documents (`idea.md`, `appendix.md`) for detailed customer personas and problem narratives.
- **+2 Points Action Plan:**
  1. Add a 2-line summary of the core patient caregiver pain point directly underneath the one-line pitch.
  2. Embed the verified IRDAI report citation URL directly into the Master Index.

---

### 2.2 Product Strategy & Experience
- **Score:** 8/10
- **Confidence:** High
- **Category Weight:** High (Concept Stage: ████)
- **Direct Plan Evidence:**
  - `plan.md:33`: *"Working rules: spec-first → local-first dev → deterministic core → every claim on the page backed by something built or measured."*
  - `plan.md:52-55`:
    - *"Timeline is dead. Sprints 1–2 (2–9 Nov) are in the past. Use schedule.md."*
    - *"'±10% forecast error' contradicts 'deterministic.' With correct inputs the math is exact. Error lives in extraction and policy interpretation. Publish measured numbers only."*
    - *"Claims must match what's built. Supabase Auth, pgvector/RAG, Dependabot/CodeQL, full Hindi UI earn nothing in a 2-minute judge visit. Cut or shrink (see schedule.md §8.3)."*
- **Strengths Observed:**
  - World-class intellectual honesty: directly repudiates prior fantasy claims from the source deck ("±10% error", dead sprints, superficial buzzwords).
  - Establishes a strict product development philosophy: spec-first and measured claims only.
  - Master index table provides immediate navigational clarity across all project dimensions.
- **Weaknesses & Vulnerabilities:**
  - Does not define the dependency graph showing the order in which the 14 documents must be read or updated when changes occur.
- **+2 Points Action Plan:**
  1. Add an explicit sequence diagram or visual reading path indicating document prerequisites (e.g. `idea.md` → `prd.md` → `trd.md`).
  2. Define an explicit change management protocol when requirements in `prd.md` conflict with technical designs in `trd.md`.

---

### 2.3 System Architecture & Technical Design (Assumptions & Scope)
- **Score:** 6/10
- **Confidence:** Medium
- **Category Weight:** Medium (Concept Stage: ██○○)
- **Direct Plan Evidence:**
  - `plan.md:43`: Assumption A5: *"One deterministic TypeScript rules engine powers the page; a small Python port runs in the pipeline; both pass the same fixtures. See ADR-3 in adrs.md."*
  - `plan.md:54`: *"Render free tier spins down after idle; first request can take ~1 minute. Add a keep-alive ping and a recorded-replay fallback."*
- **Complexity Verdict:** `Over-engineered` (Specifically regarding Assumption A5).
- **Strengths Observed:**
  - Proactive infrastructure vulnerability detection: identifies Render free-tier cold-start delays (60s) before writing code and mandates a keep-alive ping and replay fallback.
- **Weaknesses & Vulnerabilities:**
  - Maintaining dual implementations of the rules engine (TypeScript in `packages/engine` and Python in `apps/api/engine_py.py`) passing the same fixtures creates unjustified architectural overhead for a 5-day solo build.
  - Violates the North Star metric ($\frac{\text{Value}}{\text{Complexity}}$) by duplicating domain logic across two language runtimes.
- **+2 Points Action Plan:**
  1. Eliminate the Python engine port entirely; execute the rules engine exclusively in TypeScript (via Node/Edge in Next.js or calling a single shared JS runtime), eliminating parity drift.
  2. Add an explicit architectural boundary definition in the index clarifying package import paths.

---

### 2.4 Engineering Execution
- **Score:** 7/10
- **Confidence:** High
- **Category Weight:** Low (Concept Stage: █○○○)
- **Direct Plan Evidence:**
  - `plan.md:39`: Assumption A1: *"Only the deck exists today; no repo/UI/engine built. If wrong: If the engine exists, skip Day 1 engine work and start Wow 2 tonight."*
  - `plan.md:40`: Assumption A2: *"Solo build with three parallel AI-agent lanes: Engine, Experience, Pipeline. If wrong: If 3 humans, map lanes 1:1 to people."*
- **Code Review Disclaimer:** Code has not been reviewed directly. Evaluation is restricted to the documented specifications within this markdown plan.
- **Strengths Observed:**
  - Explicit baseline calibration: starts from zero assumptions (acknowledges that only the PowerPoint deck exists today).
  - Clear branch conditions ("If wrong") for every assumption, preventing cognitive lock-in.
- **Weaknesses & Vulnerabilities:**
  - Does not specify the git branch or PR review strategy for managing changes across AI-agent lanes.
- **+2 Points Action Plan:**
  1. Add a git workflow standard (e.g. trunk-based development with atomic conventional commits) directly into the Working Rules.
  2. Specify an automated linting and formatting check (`prettier`, `eslint`) across all monorepo directories.

---

### 2.5 AI Engineering
- **Score:** 6/10
- **Confidence:** Medium
- **Category Weight:** Medium
- **Direct Plan Evidence:**
  - `plan.md:44`: Assumption A6: *"Vision-LLM provider is undecided; chosen via env var through LiteLLM. Set VISION_MODEL in .env."*
  - `plan.md:23`: Mapping to `prompts.md`: *"13 copy-paste prompts for AI agents (P0–P12) — Generating code with AI"*
- **AI Role Verdict:** `Useful enhancement`
- **Strengths Observed:**
  - Decouples AI model vendor lock-in by routing through LiteLLM proxy with environment variable configuration.
  - Structured prompt cataloging (P0–P12) establishes an auditable AI generation methodology.
- **Weaknesses & Vulnerabilities:**
  - Leaving the Vision-LLM provider completely undecided on Day 1 introduces API key, billing, and latency uncertainty into the critical path.
- **+2 Points Action Plan:**
  1. Establish a default primary model (e.g. Gemini 1.5 Flash or Claude 3.5 Sonnet) with a pre-configured API key and verified rate limits.
  2. Define token spend caps and request timeout defaults directly in Assumption A6.

---

### 2.6 Security, Privacy & Trust
- **Score:** 8/10
- **Confidence:** High
- **Category Weight:** Low (Concept Stage: █○○○)
- **Direct Plan Evidence:**
  - `plan.md:42`: Assumption A4: *"The demo needs no signup, no API keys, synthetic documents only. Keeps privacy/legal risk at zero."*
  - `plan.md:55`: Ruthless cut of Supabase Auth and unverified cloud data storage.
- **Strengths Observed:**
  - Flawless risk mitigation: recognizing that eliminating user logins and real document uploads reduces legal, security, and privacy liabilities to absolute zero.
  - Rejection of premature auth infrastructure preserves development focus and protects user anonymity.
- **Weaknesses & Vulnerabilities:**
  - Lacks guidance on how the architecture will eventually evolve to handle real user data securely post-hackathon.
- **+2 Points Action Plan:**
  1. Document a transitional security checklist for moving from synthetic demo mode to authenticated production mode.
  2. Specify secure client-side handling guidelines for local browser memory.

---

### 2.7 Infrastructure & Operational Readiness
- **Score:** 6/10
- **Confidence:** Medium
- **Category Weight:** None (Concept Stage: ○○○○)
- **Direct Plan Evidence:**
  - `plan.md:54`: *"Render free tier spins down after idle; first request can take ~1 minute. Add a keep-alive ping and a recorded-replay fallback."*
- **Strengths Observed:**
  - Pragmatic awareness of free-tier cloud infrastructure limitations.
  - Multi-layered defense: active keep-alive ping paired with passive static JSON replay fallback.
- **Weaknesses & Vulnerabilities:**
  - Does not specify the execution mechanism or hosting provider for the keep-alive ping (e.g. Cron job, GitHub Actions, or client ping).
- **+2 Points Action Plan:**
  1. Specify a free cron ping service (e.g. Cron-job.org or GitHub Actions scheduled workflow) to maintain backend container warmth during judging hours.
  2. Document the health check endpoint URL and response schema in the index.

---

### 2.8 Design & User Experience
- **Score:** 7/10
- **Confidence:** High
- **Category Weight:** Medium (Concept Stage: ██○○)
- **Direct Plan Evidence:**
  - `plan.md:62`: *"Core principle: The landing page is the pitch. A judge scrolls ~2 minutes, feels the shortfall, moves it with their own hands, then watches the product prove itself."*
  - `plan.md:19`: Index entry for `design.md`: *"Tokens, motion principles, all 8 scene specs, micro-detail checklist — Building the UI"*.
- **Strengths Observed:**
  - Coherent design philosophy: experiential, tactile interaction over passive slide viewing.
  - Treats UI polish as an integral component of the product's proof, not as superficial dressing.
- **Weaknesses & Vulnerabilities:**
  - Master index does not summarize the visual aesthetic or core design tokens (paper-and-ink).
- **+2 Points Action Plan:**
  1. Add a brief visual identity summary in the index highlighting the "Paper & Ink" theme and high-contrast accessibility targets.
  2. Embed a link to the primary design tokens stylesheet directly in the table.

---

### 2.9 Business & Commercial Viability
- **Score:** 3/10
- **Confidence:** Medium
- **Category Weight:** Medium (Concept Stage: ██○○)
- **Direct Plan Evidence:**
  - `plan.md:55`: *"Claims must match what's built. Supabase Auth, pgvector/RAG, Dependabot/CodeQL, full Hindi UI earn nothing in a 2-minute judge visit. Cut or shrink (see schedule.md §8.3)."*
- **Strengths Observed:**
  - Honest recognition of hackathon judging dynamics: unbuilt commercial features and enterprise certifications provide zero judging leverage.
- **Weaknesses & Vulnerabilities:**
  - Sacrifices all long-term business strategy to maximize immediate hackathon victory. The document contains zero commercial viability modeling.
- **+2 Points Action Plan:**
  1. Include a short "Post-Hackathon Commercial Horizon" appendix outlining customer acquisition and monetization pathways.
  2. Document target cost-per-claim audit under enterprise licensing terms.

---

### 2.10 Execution Feasibility
- **Score:** 8/10
- **Confidence:** High
- **Category Weight:** High (Concept Stage: ████)
- **Direct Plan Evidence:**
  - `plan.md:5`: *"Written: Wed 11 Nov 2026 · Deadline: Sun 15 Nov 2026, 11:59 PM IST (target: 6 PM)"*
  - `plan.md:37-46`: Assumptions A1–A7 with explicit fallback paths.
  - `plan.md:52`: *"Timeline is dead. Sprints 1–2 (2–9 Nov) are in the past. Use schedule.md."*
- **Strengths Observed:**
  - Aggressive 6-hour safety buffer: sets internal deadline for 6:00 PM IST on Sunday against an official 11:59 PM IST deadline.
  - Flawless situational awareness: immediately scraps defunct sprint schedules and resets the baseline to the actual calendar reality.
  - Comprehensive planning inventory: 14 tightly scoped files covering every necessary execution vector.
- **Weaknesses & Vulnerabilities:**
  - Execution relies on 13 complex AI prompts across 3 lanes running smoothly within 96 hours without severe agent hallucinations.
- **+2 Points Action Plan:**
  1. Establish a daily hard stop time (e.g. 11 PM each night) to review AI prompt outputs and resolve codebase drift.
  2. Define an explicit "Nuclear Fallback" where all backend APIs are dropped and only the static Next.js frontend ships if pipeline integration fails by Friday night.

---

## 3. Key Decision Audit

| Decision | Justified? | Risk Level | Better Alternative |
|---|---|---|---|
| **Formally repudiating deck errors (`plan.md:48-57`)** | Yes | Low | None. Essential for aligning reality with execution. |
| **Dual TypeScript & Python engine (`plan.md:43`)** | No | High | Single TypeScript engine shared between frontend and backend via Node runtime. |
| **6-hour submission buffer (6 PM vs 11:59 PM) (`plan.md:5`)** | Yes | Low | None. Exemplary project management practice. |
| **Deferring Vision-LLM choice to .env (`plan.md:44`)** | Partially | Medium | Commit to a tested primary model (e.g. Gemini 1.5 Flash) with fallback configured. |
| **Zero signup / synthetic docs only (`plan.md:42`)** | Yes | Low | None. Eliminates legal liability and auth bugs during judging. |

---

## 4. Red Team Analysis (7 Failure Modes)

1. **Failure Mode 1 (Technical - Dual Engine Divergence):**
   - *Why dangerous:* A subtle rounding bug or operator difference between TypeScript `Math.floor()` and Python `//` in `engine_py.py` causes the Python pipeline to emit ₹41,499 while the frontend computes ₹41,500, shattering demo credibility.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Eliminate `engine_py.py` entirely; execute the compiled TypeScript `packages/engine` inside a lightweight Node/Express or Next.js API route.
2. **Failure Mode 2 (Technical - LiteLLM Vendor Stumble):**
   - *Why dangerous:* Because the Vision model was left undecided (`Assumption A6`), the selected provider hits rate limits, requires unexpected credit billing, or changes API signatures on Saturday.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Test and hardcode a verified primary provider (e.g. Google Gemini 1.5 Flash) on Wednesday night during Day 1 scaffolding.
3. **Failure Mode 3 (Execution - Cross-Document Inconsistency Drift):**
   - *Why dangerous:* With 14 distinct markdown plan files, an edit made to math rules in `trd.md` is not updated in `design.md` or `appendix.md`, confusing AI agents during code generation.
   - *Probability:* High | *Severity:* High
   - *Mitigation:* Establish `trd.md` as the single source of truth for math and `prd.md` for scope; all other files must inherit from them without redefining constants.
4. **Failure Mode 4 (Operational - Render Free Tier Sleep Lock):**
   - *Why dangerous:* A judge opens the submission link, clicks "Live Read", and the request hangs for 75 seconds because Render container is spinning up, exceeding the judge's patience threshold.
   - *Probability:* High | *Severity:* Critical
   - *Mitigation:* Enforce a strict 6-second client-side timeout that automatically drops to the instant static replay JSON with a prominent banner.
5. **Failure Mode 5 (Execution - Cognitive Overload from 14 Files):**
   - *Why dangerous:* The solo developer spends excessive time cross-referencing and maintaining 14 markdown files instead of writing and debugging working code.
   - *Probability:* Medium | *Severity:* Medium
   - *Mitigation:* Group files into 3 active execution clusters (Core Specs, Content/Copy, QA/Risks) and only reference active cluster files during prompt generation.
6. **Failure Mode 6 (Project-Specific - Rubric Neglect Penalty):**
   - *Why dangerous:* Leaving Assumption A7 unresolved results in shipping an entry heavily skewed toward technical engine depth in a hackathon evaluated primarily on business impact.
   - *Probability:* Medium | *Severity:* High
   - *Mitigation:* Fill `strategy.md:22` on Day 1 by reviewing the CodeQuest submission guidelines before commencing UI build.
7. **Failure Mode 7 (Project-Specific - Submission Form Deadline Illusion):**
   - *Why dangerous:* The developer relies on the 6 PM target, encounters video upload and form submission errors at 5:45 PM, and panics under server congestion.
   - *Probability:* Low | *Severity:* High
   - *Mitigation:* Submit an initial draft URL and README to the portal on Saturday night, updating the entry on Sunday with the final video.

---

## 5. Missing Elements Matrix

| Gap | Type | Priority | Impact on Evaluation |
|---|---|---|---|
| Single-engine consolidation (dropping Python port) | Technical | Must Have | Eliminates cross-language parity risks |
| Pre-selected default Vision-LLM model & test key | Technical | Must Have | Removes Day 4 API integration blockers |
| Document hierarchy & Single-Source-of-Truth rule | Governance | Should Have | Prevents cross-file prompt contradictions |
| Active cron keep-alive deployment spec for Render | Operational | Should Have | Prevents 60-second judge cold-start delays |
| Automated submission pre-flight verification script | Operational | Nice to Have | Guarantees all submission checklist items pass |

---

## 6. Strengths & Durability Analysis

1. **Unsparing Intellectual Honesty (`plan.md:48-57`):**
   - *Why it matters:* Explicitly repudiates fantasy numbers, dead schedules, and unbuilt buzzwords, establishing complete credibility.
   - *Prime beneficiary:* Evaluators and developers.
   - *Durability:* Exceptionally durable; grounds the entire project in verifiable reality.
2. **Explicit Assumption & Contingency Framework (`plan.md:35-46`):**
   - *Why it matters:* Every assumption (A1–A7) is accompanied by an explicit contingency ("If wrong"), eliminating decision paralysis when facts change.
   - *Prime beneficiary:* Solo developer operating under time pressure.
   - *Durability:* High; model of agile risk management.
3. **Pervasive 14-File Corpus Taxonomy (`plan.md:10-28`):**
   - *Why it matters:* Provides an exhaustive, structured index mapping every project concern to a dedicated document.
   - *Prime beneficiary:* AI agents and engineering reviewers.
   - *Durability:* Highly durable; prevents sprawl.
4. **6-Hour Submission Safety Buffer (`plan.md:5`):**
   - *Why it matters:* Targets 6:00 PM IST on Sunday against an 11:59 PM IST deadline, buffering against video rendering and portal outage risks.
   - *Prime beneficiary:* Project delivery and risk management.
   - *Durability:* High; marks the difference between amateur and seasoned competition teams.
5. **Radical Scope Pruning Discipline (`plan.md:55`):**
   - *Why it matters:* Cuts Supabase Auth, vector databases, and enterprise plumbing to focus 100% of energy on a polished 2-minute judge experience.
   - *Prime beneficiary:* User value-to-complexity ratio ($\frac{\text{Value}}{\text{Complexity}}$).
   - *Durability:* High; exemplifies the North Star evaluation metric.

---

## 7. Comparative Benchmark

| Benchmark | Standing | Evidence from Plan Text |
|---|---|---|
| **Typical student project** | **Above** | Student projects conceal flaws and overclaim; `plan.md` explicitly lists and corrects deck errors and dead sprints (`plan.md:48-57`). |
| **Competitive internship portfolio** | **Above** | Features a sophisticated 14-document architecture, explicit assumption contingencies, and strict submission buffers (`plan.md:10-28, 35-46`). |
| **Strong indie hacker product** | **At** | Demonstrates intense execution pragmatism and ruthlessness regarding non-essential features (`plan.md:55`). |
| **Seed-stage startup MVP** | **At** | Matches the operational discipline and architectural taxonomy of a professional early-stage technical plan. |
| **Professional SaaS product** | **Below** | Lacks formal enterprise change management, SLAs, and multi-quarter strategic roadmaps. |

---

## 8. Strategic Roadmap

### Immediate (0–30 Days / Hackathon Execution)
- Eliminate Python Engine: Amend Assumption A5 to mandate a single TypeScript calculation engine, eliminating duplicate maintenance.
- Lock Primary Vision Model: Select and verify a single default LLM provider (e.g. Gemini 1.5 Flash) with pre-tested credentials.
- Automate Keep-Alive: Configure a scheduled ping to keep the Render backend active during active evaluation windows.

### Short-Term (1–3 Months / Post-Hackathon Systemization)
- Unify Corpus: Merge the 14 planning markdown files into a centralized developer documentation portal (e.g. Docusaurus or Mintlify).
- Document Versioning: Implement automated Git hooks to track semantic versions across architecture records.
- Production Security: Design authentication and role-based access control architecture for multi-user hospital deployments.

### Medium-Term (3–12 Months / Commercial Scale)
- Multi-Model Orchestration: Evolve from LiteLLM proxy to a resilient multi-provider router with automated cost and latency failover.
- Enterprise Knowledge Base: Build a verified regulatory repository indexing IRDAI master circulars and Ombudsman case law.
- ISO / SOC2 Compliance: Formalize software development lifecycle policies for regulated enterprise health-tech integration.

---

## 9. Final Verdict

**Overall Score:** 7.5 / 10  
**Evaluation Confidence:** High  

| Dimension | Rating |
|---|---|
| Engineering Grade | B+ (Excellent orchestration; penalized for dual TS/Python engine) |
| Product Grade | A (Uncompromising honesty, ruthless pruning, and clear taxonomy) |
| Execution Risk | Low (6-hour submission buffer and explicit assumption fallbacks) |
| Technical Risk | Low (Local-first deterministic core) |
| Business Risk | High (All commercial modeling deferred to win hackathon) |
| Portfolio Impact | Top 1% (As an orchestration index and demonstration of radical candor) |

### Direct Answers

1. **Is this project genuinely impressive at its current stage?**  
   Yes. It is exceptionally rare for an early-stage hackathon plan to openly repudiate its own previous pitch deck errors, dead sprints, and buzzword exaggerations with such radical intellectual honesty.

2. **Is it over-engineered, correctly engineered, or under-engineered?**  
   It is mostly correctly engineered, but suffers from one distinct point of over-engineering: maintaining a dual rules engine in both TypeScript and Python (`plan.md:43`), which introduces unnecessary synchronization risk.

3. **What is the single strongest decision made?**  
   The ruthless decision to explicitly cut Supabase Auth, pgvector/RAG, and full Hindi UI (`plan.md:55`), keeping the codebase lean and hyper-focused on the 2-minute judge visit.

4. **What is the single most dangerous mistake?**  
   Planning to maintain two separate language implementations of the deterministic rules engine (TypeScript and Python) passing the same golden fixtures during a compressed 5-day sprint.

5. **What should the creator stop doing immediately?**  
   Stop maintaining the Python engine port (`apps/api/engine_py.py`); standardize 100% of calculation logic on the TypeScript package.

6. **What is the single highest-leverage next action?**  
   Commit to a specific Vision-LLM model in `.env` and verify API key limits on Wednesday night before entering the experience lane build.

7. **What would it concretely take to make this world-class?**  
   Drop the redundant Python engine, establish an automated submission pre-flight testing script, and transition the 14-document corpus into an interactive developer documentation knowledge graph.
