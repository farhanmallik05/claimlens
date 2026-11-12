# Due Diligence Evaluation: `plan/qa.md`

- **Evaluated Target:** `plan/qa.md`
- **Total Lines:** 82 lines
- **Byte Size:** 3,453 bytes
- **Evaluation Framework:** `evaluation-agent` (`C:\Users\farhan\.gemini\config\skills\evaluation-agent\SKILL.md`)
- **Integrity Mode:** Demo Integrity Mode (strictly verified against plan text without outside assumptions)

---

## 1. Context Declaration

- **Project Stage:** Prototype / Hackathon MVP (Quality Assurance & Release Verification Suite).
- **Team Context:** Solo or Small Team executing a high-stakes 5-day build with strict zero-defect pre-ship gates.
- **Information Available:**
  - Section 11.1: Verification Tasks Table detailing 4 critical pre-ship manual validation items (V-1 through V-4) with assigned owners and execution phases (`qa.md:7-15`).
  - Section 11.2: 7-Category Release Checklist encompassing 36 explicit verification items across Engine Correctness, Performance, Responsive Design, Accessibility, Resilience, Honesty & Content, and Meta/Submission (`qa.md:18-69`).
  - Section 11.3: Definition of Done (DoD) establishing a 7-point quality gate required per feature/prompt before marking tasks complete (`qa.md:72-82`).
- **Information Missing:**
  - Automated CI mapping for checklist items (e.g., axe-core a11y runner, Lighthouse CI action, automated 4G network throttling test).
  - Explicit rollback and recovery protocol if a release checklist item fails during Sunday afternoon verification.
  - Test data fixtures for edge-case responsive breakpoints (e.g., foldables at 280px or ultra-wide at 2560px).
  - Automated credential leak prevention and dependency vulnerability scanning gates in Section 11.3 DoD.
  *Impact on Evaluation:* Cites a high volume of manual inspection requirements, reducing confidence in execution velocity and increasing the risk of human oversight during late-night pre-ship testing.
- **Evaluation Lens:** At the hackathon MVP stage, QA must act as a ruthless filter protecting core functionality (the Raju baseline math, interactive slider, and honesty labels) while automating regression prevention so the developer does not waste hours on manual verification passes.

---

## 2. Category Scoring & Evidence

### 2.1 Problem, User & Market Fit
- **Score:** 7/10
- **Confidence:** High
- **Stage Weight:** High (███○)
- **Direct Plan Evidence:**
  - `qa.md:11`: `"V-1 | Re-check 57 crore / ₹26,038 cr / 71% against the IRDAI Annual Report 2023-24. Add exact page number and table reference as a footnote link on the page."`
  - `qa.md:57`: `"- [ ] ₹100 crore tagged (illustrative) everywhere it appears"`
- **Strengths Observed:** Elevates factual verification of consumer statistics to a mandatory pre-ship task (V-1), ensuring the product does not misrepresent market scale or consumer harm to evaluators.
- **Weaknesses & Vulnerabilities:** The QA plan does not define any user acceptance testing (UAT) protocol or usability verification sessions with real users or uninitiated testers prior to release.
- **+2 Points Action Plan:**
  1. Add a mandatory 1-hour pre-ship UAT protocol in Section 11.1 where an external reviewer completes the 2-minute judge path and answers 3 comprehension questions.
  2. Define an explicit pass criteria: "Tester understands why ₹41,500 was deducted within 45 seconds of interaction."

---

### 2.2 Product Strategy & Scope
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** High (████)
- **Direct Plan Evidence:**
  - `qa.md:12`: `"V-2 | Confirm the official CodeQuest rubric and submission format. Fill the Weight column in strategy.md §2.2. Re-weight polish time accordingly."`
  - `qa.md:54`: `"- [ ] No 'TBD', lorem, or unmeasured numbers on any visible page"`
  - `qa.md:80-81`: `"DoD: No hardcoded numbers that should come from the engine or metrics.json · No lorem ipsum or placeholder copy"`
- **Strengths Observed:** Exceptional defense against placeholder leakage. Enforces strict build and release gates banning "TBD" and placeholder copy. Proactively includes rubric calibration (V-2) to realign development effort with official judging criteria.
- **Weaknesses & Vulnerabilities:** V-2 is marked as a "Day 1" task (`qa.md:12`), but the plan does not define what features to cut if the official rubric places zero weight on pipeline agents or visual motion.
- **+2 Points Action Plan:**
  1. Document a formal Rubric Triage Matrix in V-2 that maps specific fallback cuts to potential rubric weight distributions.
  2. Add an explicit check in DoD verifying that no user-visible component violates the Scope Non-Goals list in `prd.md:20-22`.

---

### 2.3 System Architecture & Technical Design
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** Medium (██○○)
- **Direct Plan Evidence:**
  - `qa.md:21-26`: Six engine correctness checks, including property-based invariant testing (FR-7), monotonicity (FR-8), clause integrity guards (FR-12), and Python parity.
  - `qa.md:50`: `"- [ ] Kill the API → replay appears with 'Replayed from a recorded run' label"`
- **Complexity Verdict:** **Correctly engineered** (Stage-appropriate automated unit math + pragmatic manual resilience checks).
- **Strengths Observed:** Verifies architectural resilience by mandating an API kill-switch test (`qa.md:50`), ensuring the frontend degrades gracefully to static replay without unhandled exceptions.
- **Weaknesses & Vulnerabilities:** The API kill test (`qa.md:50`) is specified as a manual checkbox rather than an automated end-to-end integration test (e.g., using Playwright network request interception).
- **+2 Points Action Plan:**
  1. Add an automated Playwright route abort test (`page.route('**/v1/**', route => route.abort())`) to CI that automatically validates fallback to `ReplaySource`.
  2. Implement an automated contract validator between `fixtures/golden.json` and `engine_py.py` run on every commit.

---

### 2.4 Engineering Execution
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** Medium (██○○)
- **Direct Plan Evidence:**
  - `qa.md:21`: `"- [ ] Raju gate test green (insurerPays === 108500, youPay === 41500)"`
  - `qa.md:29-33`: Performance checklist requiring cold load <2s on throttled 4G, slider ≥55 fps, Lighthouse desktop ≥90, mobile ≥80.
  - `qa.md:75-77`: DoD requiring `tsc --noEmit`, ESLint zero errors, and passing Vitest/pytest per feature.
- **Strengths Observed:** Outstanding engineering rigor. Every feature requires passing typechecking, linting, and automated tests. Performance standards are concrete, measured in DevTools presets rather than vague estimations.
- **Weaknesses & Vulnerabilities:** Lacks automated regression testing for UI visual states (Clause Drawer animations, SVG connector alignment), relying heavily on manual DevTools inspections.
- **+2 Points Action Plan:**
  1. Add Lighthouse CI (`@lhci/cli`) to `.github/workflows/ci.yml` to automatically enforce the mobile ≥80 and desktop ≥90 thresholds on PR builds.
  2. Implement automated bundle size tracking in CI with a strict 200KB initial JS budget.

---

### 2.5 AI Engineering
- **Score:** 6/10
- **Confidence:** Medium
- **Stage Weight:** Low/Prototype (█○○○)
- **Direct Plan Evidence:**
  - `qa.md:13`: `"V-3 | Confirm which IRDAI regulatory references (if any) go into regulatoryRefs for the Appeal Drafter prompt. Use only references you have read and verified."`
  - `qa.md:14`: `"V-4 | Confirm the vision model provider, cost per call, and rate limits. Set VISION_MODEL in .env. Document in README."`
  - `qa.md:50`: Resilience check verifying automated fallback when API is disabled.
- **AI Role Verdict:** **Useful enhancement** (Strictly evaluated for cost, rate limits, and fallback resilience).
- **Strengths Observed:** Requires explicit verification of vision model cost, provider rate limits, and regulatory citation accuracy before shipping.
- **Weaknesses & Vulnerabilities:** Section 11.2 lacks an automated hallucination or schema validation test for LLM extraction outputs. If the vision model returns malformed JSON or omits line items, there is no formal QA gate catching it.
- **+2 Points Action Plan:**
  1. Add a dedicated test in Section 11.2 asserting that 100% of LLM-extracted bill fields match JSON Schema boundaries without missing required keys.
  2. Include an automated extraction accuracy threshold benchmark (e.g., ≥95% field-level match against golden fixtures).

---

### 2.6 Security, Privacy & Trust
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** Medium (██○○)
- **Direct Plan Evidence:**
  - `qa.md:55`: `"- [ ] Honesty strip visible on every viewport"`
  - `qa.md:57`: `"- [ ] ₹100 crore tagged (illustrative) everywhere it appears"`
  - `qa.md:58`: `"- [ ] Competitor table footnote present"`
- **Strengths Observed:** The checklist systematically audits truth in advertising, ethical labeling, and honest disclaimers across all viewports.
- **Weaknesses & Vulnerabilities:** The DoD in Section 11.3 contains no automated security checklist item (e.g., checking for exposed `.env` secrets, verifying that arbitrary file uploads remain hard-disabled).
- **+2 Points Action Plan:**
  1. Add a mandatory security check to Section 11.3 DoD: "Grep codebase for potential API keys or secrets before merge."
  2. Add an explicit test in Section 11.2 verifying that calling the API with an arbitrary file upload returns HTTP 403 / 400 Bad Request.

---

### 2.7 Infrastructure & Operational Readiness
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** Low/Prototype (█○○○)
- **Direct Plan Evidence:**
  - `qa.md:67`: `"- [ ] v1.0 tag created on main"`
  - `qa.md:68`: `"- [ ] Submitted by 6 PM IST on 15 Nov 2026 (5+ h buffer)"`
  - `qa.md:51`: `"- [ ] <noscript> receipt fallback renders with ₹41,500 result"`
- **Strengths Observed:** Excellent operational buffer management (submitting 5+ hours ahead of deadline). Verifies progressive enhancement and resilience against disabled JavaScript via the `<noscript>` receipt check.
- **Weaknesses & Vulnerabilities:** Does not specify DNS propagation checks or SSL certificate verification for the custom production domain prior to submission.
- **+2 Points Action Plan:**
  1. Add an SSL and HTTP/2 verification check to Section 11.2 (`curl -Iv https://claimlens.vercel.app`).
  2. Implement an automated GitHub release action triggered by the `v1.0` tag that attaches build artifacts.

---

### 2.8 Design & User Experience
- **Score:** 9/10
- **Confidence:** High
- **Stage Weight:** High (███○)
- **Direct Plan Evidence:**
  - `qa.md:37-40`: Responsive checklist auditing 390px, 768px, 1280px, and 1920px viewports.
  - `qa.md:43-47`: Comprehensive accessibility verification: keyboard-only navigation, `aria-valuetext` screen reader support, focus trap with Esc close, `prefers-reduced-motion` static path, and WCAG AA contrast (≥4.5:1).
  - `qa.md:61-62`: Social preview validation (OG image renders, favicon rupee-in-lens SVG).
- **Strengths Observed:** Professional-grade design and accessibility standards. Evaluates real usability across four distinct responsive breakpoints, mandates keyboard operability, and explicitly checks modal focus trapping.
- **Weaknesses & Vulnerabilities:** All accessibility and responsive checks are manual. Without automated axe-core scans in CI, contrast regressions introduced during late-night styling passes may go unnoticed.
- **+2 Points Action Plan:**
  1. Integrate `@axe-core/playwright` into the automated test suite to fail CI if WCAG AA contrast or ARIA attributes fail.
  2. Add automated visual regression snapshots across 390px and 1280px viewports.

---

### 2.9 Business & Commercial Viability
- **Score:** 5/10
- **Confidence:** Medium
- **Stage Weight:** Low/Prototype (██○○)
- **Direct Plan Evidence:**
  - `qa.md:58`: `"- [ ] Competitor table footnote present"`
  - `qa.md:64`: `"- [ ] README.md numbers match metrics.json exactly"`
  - `qa.md:65`: `"- [ ] ≤2 min video recorded and uploaded"`
- **Strengths Observed:** Audits presentation materials (README, competitor footnotes, video) for empirical accuracy and adherence to competition constraints.
- **Weaknesses & Vulnerabilities:** The QA plan does not audit commercial or business slides, revenue logic, or market sizing figures beyond verifying the single footnote.
- **+2 Points Action Plan:**
  1. Add a "Business Viability & Pitch Deck" audit section to Section 11.2 verifying that unit economics and market pain points are clearly explained in the submitted deck.
  2. Check that the README contains an explicit TPA/hospital ROI justification.

---

### 2.10 Execution Feasibility
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** High (████)
- **Direct Plan Evidence:**
  - `qa.md:7-15`: 4 discrete verification tasks with assigned phases.
  - `qa.md:74-82`: Crisp 7-point Definition of Done easily evaluable within 60 seconds per task.
- **Strengths Observed:** Highly pragmatic and actionable. The DoD prevents premature task completion, while the checklist provides a clear roadmap for Sunday's final polish pass.
- **Weaknesses & Vulnerabilities:** 36 manual checkboxes on Sunday afternoon will take 2–3 hours to walk through thoroughly, competing with video editing and README writing during the 6:00 PM submission buffer.
- **+2 Points Action Plan:**
  1. Group the 36 checklist items into "Pre-Freeze (Saturday 10 PM)" and "Pre-Submit (Sunday 4 PM)" phases to avoid a verification bottleneck on Sunday.
  2. Automate at least 15 of the manual checks via a single `pnpm test:release` script.

---

## 3. Key Decision Audit

| Decision | Justified? | Risk Level | Better Alternative |
| :--- | :--- | :--- | :--- |
| **Strict 7-Point Definition of Done (`qa.md:74`)** | Yes | Low | None. Crucial mechanism for preventing technical debt during hackathons. |
| **Manual Release Checklist (`qa.md:18`)** | Partially | Medium | Automate a11y, performance, and API kill tests via Playwright scripts. |
| **`<noscript>` Fallback Verification (`qa.md:51`)** | Yes | Low | None. Rare and commendable defense of web accessibility standards. |
| **Pre-ship Verification Tasks V-1 to V-4 (`qa.md:7`)** | Yes | Low | None. Isolates external dependencies and rubric unknowns cleanly. |
| **6:00 PM Submission Gate (`qa.md:68`)** | Yes | Low | None. Provides vital operational defense against deadline disasters. |

---

## 4. Red Team Analysis: 7 Failure Modes

### Failure 1: Sunday Checklist Fatigue Leading to Pencil-Whipping (Execution Failure)
- **Why dangerous:** Staring at 36 manual checkboxes at 4:00 PM on Sunday after 4 nights of coding, the creator will simply check boxes without actually testing viewports on a physical phone.
- **Probability:** High
- **Severity:** High
- **Mitigation:** Automate 50% of the checklist into a single command (`pnpm run verify:all`) that runs in CI and prints a green pass report.

### Failure 2: Undetected Mobile Contrast Failure on Vercel Deploy (UX/A11y Failure)
- **Why dangerous:** Changing CSS tokens during Saturday's polish pass could reduce contrast on secondary receipt text below 4.5:1, failing accessibility evaluations by judges.
- **Probability:** Medium
- **Severity:** Medium
- **Mitigation:** Run an automated axe-core audit against the live Vercel URL on Saturday night.

### Failure 3: Manual API Kill Test Breaking Vercel Production Routing (Technical Failure)
- **Why dangerous:** Manually testing the API kill switch (`qa.md:50`) by shutting down the Render API container may leave the API in a stopped state when judges test the site on Sunday night.
- **Probability:** Medium
- **Severity:** Critical
- **Mitigation:** Test API resilience using client-side mock interception or an invalid API key header rather than terminating the live backend container.

### Failure 4: Lighthouse Mobile Score Dropping Below 80 on Late Video Embed (Performance Failure)
- **Why dangerous:** Adding a YouTube/Loom video iframe or heavy GIF to Scene 8 on Sunday will degrade mobile LCP and drop Lighthouse mobile score from 85 to 65, violating the gate at line 33.
- **Probability:** High
- **Severity:** High
- **Mitigation:** Use a lightweight static thumbnail facade with a click-to-load video overlay to maintain LCP <2.0s.

### Failure 5: Unverified IRDAI Table Reference Leading to Judge Discredit (Integrity Failure)
- **Why dangerous:** If task V-1 is skipped due to time pressure and the page cites "IRDAI Annual Report 2023-24" without exact page numbers, an insurance-domain judge may challenge the figures as unsubstantiated.
- **Probability:** Medium
- **Severity:** High
- **Mitigation:** Execute task V-1 on Day 1 alongside rubric verification rather than deferring it to "Pre-ship".

### Failure 6: Focus Trap Bug Freezing Mobile Safari Viewport (UX Failure)
- **Why dangerous:** An improperly implemented focus trap in ClauseDrawer (`qa.md:45`) can lock virtual keyboard focus on iOS Safari, rendering the page unscrollable after closing the modal.
- **Probability:** Medium
- **Severity:** Critical
- **Mitigation:** Test the ClauseDrawer modal on an actual iPhone in Safari before Saturday's 10:00 PM feature freeze.

### Failure 7: CodeQuest Submission Platform Congestion / Timeout (Operational Failure)
- **Why dangerous:** If the hackathon submission portal requires video file uploads rather than YouTube links, uploading a 200MB MP4 at 5:45 PM could fail due to server congestion.
- **Probability:** Medium
- **Severity:** Critical
- **Mitigation:** Upload the video to YouTube (Unlisted) and Loom by Sunday 3:00 PM; compress the raw MP4 to <30MB for direct file upload backups.

---

## 5. Missing Elements Matrix

| Gap Description | Functional Type | Priority |
| :--- | :--- | :--- |
| Automated release verification script (`pnpm run verify:all`) | Engineering | Must Have |
| Automated axe-core accessibility regression test in CI | Engineering / A11y | Must Have |
| Automated Playwright route-abort fallback test | Engineering / QA | Should Have |
| Lighthouse CI GitHub Action configuration | Operational | Should Have |
| Video embed facade specification to protect LCP | Performance | Should Have |
| External usability review protocol in Section 11.1 | Product | Nice to Have |
| Pre-commit security scan for secrets and dependencies | Security | Nice to Have |

---

## 6. Strengths & Durability Analysis

1. **Deterministic Engine Verification Gates (`qa.md:21-26`):** Requiring fast-check property invariants, golden fixture parity, and clause existence guards ensures mathematical infallibility. *Beneficiary:* Policyholders & Engineers. *Durability:* Exceptionally durable.
2. **Strict Definition of Done (`qa.md:72-82`):** Demanding clean compilation, zero lint errors, 390px mobile responsiveness, and no placeholder copy per feature prevents technical debt from accumulating. *Beneficiary:* Engineering Lead. *Durability:* High.
3. **Comprehensive Accessibility Protocol (`qa.md:42-47`):** Explicitly checks keyboard navigation, screen reader ARIA values, modal focus trapping, and reduced motion. *Beneficiary:* Evaluators & Users with Disabilities. *Durability:* High.
4. **Resilience & Graceful Degradation Checks (`qa.md:49-52`):** Audits API failure handling and `<noscript>` HTML rendering, guaranteeing that the demo never renders a blank white screen. *Beneficiary:* Judges & Operators. *Durability:* High.
5. **Truth in Advertising Audit (`qa.md:53-59`):** Ensures that all illustrative estimates are watermarked and statistical sources are verified before public exposure. *Beneficiary:* Project Integrity & Trust. *Durability:* High.

---

## 7. Comparative Benchmark

| Benchmark Cohort | Standing | Direct Evidence from Plan Data |
| :--- | :--- | :--- |
| **Typical Student Project** | **Far Above** | Student projects feature zero QA checklists; this specifies 36 verified release criteria and DoD (`qa.md:18, 72`). |
| **Competitive Internship Portfolio** | **Above** | Demonstrates superior maturity in accessibility (focus traps, ARIA), performance budgets, and fallback testing (`qa.md:29, 44, 50`). |
| **Strong Indie Hacker Product** | **Above** | Surpasses indie standards by enforcing strict property-based testing and `<noscript>` resilience (`qa.md:23, 51`). |
| **Seed-Stage Startup MVP** | **At** | Comparable to a mature startup release checklist; lacks automated CI integration for a11y and performance (`qa.md:32, 47`). |
| **Professional SaaS Product** | **Below** | Lacks automated synthetic monitoring, canary deployments, and distributed load testing (`qa.md:18-69`). |

---

## 8. Strategic Roadmap

### Immediate (0–30 Days: Hackathon Release Execution)
- Automate key checklist items (Vitest property tests, Playwright route aborts, ESLint) into a unified `pnpm run verify:all` script.
- Execute V-1 (IRDAI report verification) on Day 1 to lock in citation page numbers.
- Walk through the 36-item release checklist on Saturday night and Sunday afternoon.
- Enforce the 6:00 PM Sunday submission deadline.

### Short-Term (1–3 Months: Automated Quality Infrastructure)
- Integrate Lighthouse CI and `@axe-core/playwright` into the GitHub Actions workflow.
- Replace manual API kill tests with automated synthetic failure injection tests.
- Implement automated visual regression testing using Playwright screenshot comparisons across 4 viewports.

### Medium-Term (3–12 Months: Production QA Maturity)
- Deploy continuous production synthetic monitoring that runs test claims through the engine every 15 minutes.
- Build an automated regression test suite covering 50 real Indian health insurance policies and 200 real hospital bills.
- Implement automated security vulnerability scanning and pen-testing pipelines.

---

## 9. Final Verdict & Direct Reality Answers

- **Overall Score:** 8.0 / 10
- **Evaluation Confidence:** High
- **North Star Metric ($\frac{\text{Value}}{\text{Complexity}}$):** High. The QA suite maximizes delivered value by catching catastrophic regressions (financial calculation errors, mobile UI breaks, placeholder text) with minimal tooling overhead.

| Dimension | Rating |
| :--- | :--- |
| Engineering Grade | A- |
| Product Grade | A- |
| Execution Risk | Medium |
| Technical Risk | Low |
| Business Risk | Low |
| Portfolio Impact | Top 5% (Hackathon QA & Governance) |

### Direct Answers

1. **Is this project genuinely impressive at its current stage?**  
   Yes. It sets an unusually rigorous standard of engineering discipline and accessibility awareness for a 5-day hackathon project.
2. **Is it over-engineered, correctly engineered, or under-engineered?**  
   Correctly engineered. The checklist is comprehensive yet pragmatic, and the 7-point DoD keeps code quality high.
3. **What is the single strongest decision made?**  
   Requiring property-based invariant and monotonicity tests (FR-7 and FR-8) alongside clause existence guards as mandatory pre-ship gates.
4. **What is the single most dangerous mistake?**  
   Relying almost entirely on manual inspection for 36 release checklist items on Sunday afternoon, creating severe risk of checklist fatigue and human error.
5. **What should the creator stop doing immediately?**  
   Stop deferring task V-1 (IRDAI report page citation) to pre-ship; verify and freeze the citation on Day 1.
6. **What is the single highest-leverage next action?**  
   Package the core release checks into a single automated script (`pnpm run verify:all`) to reduce Sunday verification time from 2 hours to 2 minutes.
7. **What would it concretely take to make this world-class?**  
   Integrate Lighthouse CI, axe-core automated accessibility assertions, and Playwright visual regression diffing directly into the continuous integration pipeline.
