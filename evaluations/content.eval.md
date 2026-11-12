# Due Diligence Evaluation: `plan/content.md`

- **Evaluated Target:** `plan/content.md`
- **Total Lines:** 226 lines
- **Byte Size:** 8,226 bytes
- **Evaluation Framework:** `evaluation-agent` (`C:\Users\farhan\.gemini\config\skills\evaluation-agent\SKILL.md`)
- **Integrity Mode:** Demo Integrity Mode (strictly verified against plan text without outside assumptions)

---

## 1. Context Declaration

- **Project Stage:** Prototype / Hackathon MVP (Comprehensive Content & Narrative System).
- **Team Context:** Solo or Small Team delivering public-facing copy, video script, synthetic PDF document, legal appeal draft, and README documentation for hackathon submission.
- **Information Available:**
  - Section 10.1: Master Copy Deck detailing exact headlines, stats, why cards, Raju persona narrative, scene titles, CTAs, footers, and impact numbers (`content.md:7-40`).
  - Section 10.2: Synthetic Policy Specification (`public/policy-demo.pdf`) defining a 2-page document layout, schedule box, numbered clauses SP-2.1 through SP-5.1, Annexure A non-payable items, and mandatory 72pt diagonal red watermark `SAMPLE · SYNTHETIC` (`content.md:43-61`).
  - Section 10.3: Appeal Letter Draft for Finisher B addressing the Grievance Redressal Officer at "Demo Assure" regarding a ₹9,750 pharmacy over-deduction with formal legal citations to clause SP-3.3 and Insurance Ombudsman escalation notice (`content.md:64-105`).
  - Section 10.4: README Skeleton with Mermaid architecture diagram, "What's real vs illustrative" disclosure matrix, measured results section, and run-locally instructions (`content.md:108-198`).
  - Section 10.5: 2-Minute Timed Video Script with second-by-second shot list and voiceover text (`content.md:202-213`).
  - Section 10.6: Deck Updates Checklist specifying required edits to slides 1, 2, 5, 6, 7, and last slide (`content.md:216-226`).
- **Information Missing:**
  - Devanagari Hindi text for the appeal letter and explainer (despite `prd.md:22` and `prompts.md:300` requiring an EN/HI toggle, no Hindi copy is provided in `content.md`).
  - Alternative 2-minute video script allocation if only Finisher A or only Finisher B is shipped on Saturday (the current script assumes both exist).
  - Shortened mobile copy variants for 390px viewports where dense desktop strings will cause awkward text wraps.
  - Verified IRDAI circular citations in the appeal letter (only synthetic clause SP-3.3 is cited; regulatory citations remain pending from QA task V-3).
  *Impact on Evaluation:* Limits confidence in bilingual readiness and multi-device UX copy rendering; creates risk of narrative mismatch during video production if a finisher is cut.
- **Evaluation Lens:** At the hackathon stage, content must balance emotional resonance (the human tragedy of unexpected hospital deductions) with absolute factual honesty (no fake claims, clear synthetic watermarking, and legal disclaimers). Contradictions between public copy and technical capabilities must be zero.

---

## 2. Category Scoring & Evidence

### 2.1 Problem, User & Market Fit
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** High (███○)
- **Direct Plan Evidence:**
  - `content.md:11`: `"Hero line: You were insured. You still owe ₹41,500."`
  - `content.md:14-16`: `"57 crore lives covered by health insurance in FY24 | ₹26,038 cr of claims disallowed or repudiated in FY24 | 71% of claimed value was actually paid out"`
  - `content.md:22`: `"Meet Raju (example). His mother needs hip surgery; a room upgrade leaves her ₹41,500 short."`
- **Strengths Observed:** Exceptional emotional and narrative framing. The opening hook directly cuts to the emotional gut-punch of post-surgery deductions. Real macro statistics from the IRDAI Annual Report ground the problem in reality, while the Raju persona humanizes the data.
- **Weaknesses & Vulnerabilities:** The macro stats cite "as reported by PTI and Business Standard" (`content.md:17`), but the direct IRDAI table page numbers are unverified in the text (QA task V-1 remains pending).
- **+2 Points Action Plan:**
  1. Add exact IRDAI Annual Report 2023-24 page and table numbers (e.g., "Page 114, Table 3.4") to the footnote copy in Section 10.1.
  2. Include an explicit consumer survey quote or grievance stat in Scene 2 (e.g., "43% of complaints relate to claim deductions without clear explanation").

---

### 2.2 Product Strategy & Scope
- **Score:** 6/10
- **Confidence:** High
- **Stage Weight:** High (████)
- **Direct Plan Evidence:**
  - `content.md:32`: `"CTA 1 | Run your own bill"`
  - `content.md:188`: `"Limits and honesty: Uploads are disabled; the demo uses pre-defined sample documents."`
  - `content.md:144-153`: Table distinguishing real vs illustrative components (`forecast()` engine is real; sample documents are synthetic; ₹100 crore impact is illustrative).
- **Strengths Observed:** The "What's real vs illustrative" disclosure table in Section 10.4 is a gold standard for hackathon integrity, preventing deceptive claims about AI capabilities or live integrations.
- **Weaknesses & Vulnerabilities:** Glaring internal contradiction between CTA 1 (`content.md:32`: `"Run your own bill"`) and system constraints (`content.md:188` & `schedule.md:39`: uploads are permanently disabled). Promoting a feature that is hard-disabled damages user trust.
- **+2 Points Action Plan:**
  1. Replace CTA 1 copy `"Run your own bill"` with `"Test with Raju's Bill"` or `"Explore Interactive Sample"`.
  2. Add an informational tooltip to the CTA explaining: "Arbitrary uploads disabled for privacy; interact with synthetic fixtures."

---

### 2.3 System Architecture & Technical Design
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** Medium (██○○)
- **Direct Plan Evidence:**
  - `content.md:39`: `"Agent zone labels | LLMs read · Rules decide · Clauses prove"`
  - `content.md:129-136`: Mermaid flowchart showing data flow: Policy PDF & Hospital Bill → LLM Parsers → Deterministic Rules Engine → Forecast + Clause Citations → Appeal Letter LLM.
- **Complexity Verdict:** **Correctly engineered** (Content cleanly illustrates system architecture).
- **Strengths Observed:** The three-part architectural slogan ("LLMs read. Rules decide. Clauses prove.") concisely articulates the system's hybrid AI/deterministic architecture to judges without technical jargon.
- **Weaknesses & Vulnerabilities:** The Mermaid diagram in README skeleton (`content.md:129-136`) displays the full 5-agent pipeline including Appeal Letter LLM (`content.md:135`), which contradicts the README's own caveat that Finisher A or B may be omitted or replay-only (`content.md:149, 161`).
- **+2 Points Action Plan:**
  1. Add conditional branch notation in the Mermaid diagram indicating that the Appeal Letter and Live Parsers utilize static fallback fixtures if API mode is offline.
  2. Include an explicit caption under the Mermaid diagram detailing latency guarantees (<1ms for Rules Engine vs 15s for LLM pipeline).

---

### 2.4 Engineering Execution
- **Score:** 7/10
- **Confidence:** Medium
- **Stage Weight:** Medium (██○○)
- **Direct Plan Evidence:**
  - `content.md:158-163`: README section reserving slots for measured metrics from `metrics.json` (golden fixtures matched to the rupee, Lighthouse scores, live-read median latency, extraction accuracy).
  - `content.md:168-174`: Explicit local run instructions (`pnpm dev` for web at :3000, `uvicorn app.main:app` for API at :8000).
- **Strengths Observed:** The README skeleton is structured around verifiable engineering proof rather than speculative promises, linking directly to `trd.md`, `adrs.md`, and automated test logs.
- **Weaknesses & Vulnerabilities:** The README contains unfulfilled placeholders (`[Insert hero GIF]`, `[Fill from metrics.json]`, `[2-minute video →](#)`). If the team runs out of time on Sunday, these placeholders risk being published verbatim.
- **+2 Points Action Plan:**
  1. Pre-populate the README template with verified fallback numbers derived from Day 1 Vitest engine runs rather than blank brackets.
  2. Add a CI lint rule that scans `README.md` for square bracket placeholders (`[...]` or `XXX`) and fails the build if found.

---

### 2.5 AI Engineering
- **Score:** 7/10
- **Confidence:** Medium
- **Stage Weight:** Low/Prototype (█○○○)
- **Direct Plan Evidence:**
  - `content.md:27`: `"Scene 5 title | LLMs read, rules decide, clauses prove"`
  - `content.md:149`: `"Live-read pipeline (LangGraph) | [✅ Real / ⚠️ Replay-only — fill in]"`
  - `content.md:210`: `"1:20–1:40: AI reads the documents. A deterministic engine does the math. Verified against ground truth."`
- **AI Role Verdict:** **Genuine advantage** (Content clearly reinforces that AI is an extraction assistant, not a financial decision-maker).
- **Strengths Observed:** The content actively educates users and judges on the boundaries of AI, emphasizing that LLMs read text while pure deterministic rules perform arithmetic.
- **Weaknesses & Vulnerabilities:** Does not explain to the user what model is used, what prompt protections prevent hallucination, or why visual PII redaction is applied.
- **+2 Points Action Plan:**
  1. Add a 1-sentence microcopy explainer in Scene 5: "Zero patient data is shared: client-side PII black-out runs before LLM extraction."
  2. Document the exact vision model version in the README Architecture section.

---

### 2.6 Security, Privacy & Trust
- **Score:** 9/10
- **Confidence:** High
- **Stage Weight:** Medium (██○○)
- **Direct Plan Evidence:**
  - `content.md:36-37`: `"Footer line 1: Cites sources, not legal advice. | Footer line 2: Illustrative · synthetic documents."`
  - `content.md:60`: `"Mandatory diagonal watermark (both pages): SAMPLE · SYNTHETIC in 72pt, 30% opacity, red."`
  - `content.md:98`: `"Prepared with ClaimLens. Informational, not legal advice."`
  - `content.md:186-189`: `"Limits and honesty: All demo documents are synthetic. No real patient data is stored or processed. This tool cites sources; it does not provide legal advice."`
- **Strengths Observed:** Benchmark-grade legal, ethical, and privacy risk containment. The 72pt red diagonal watermark on the sample PDF, persistent footer disclaimers, and appeal letter disclosures eliminate any legal liability of practicing unauthorized law or misquoting real insurers.
- **Weaknesses & Vulnerabilities:** The appeal letter draft states `"If this cannot be resolved at your level, we understand the next step is the Insurance Ombudsman"` (`content.md:90-91`), but fails to include statutory 30-day insurer turnaround requirements under IRDAI regulations.
- **+2 Points Action Plan:**
  1. Amend line 90 of the appeal letter to cite IRDAI Protection of Policyholders' Interests regulations: "As per IRDAI guidelines, please provide your decision within 30 days, failing which this matter will be escalated to the Insurance Ombudsman."
  2. Add an explicit privacy policy link placeholder in the footer copy.

---

### 2.7 Infrastructure & Operational Readiness
- **Score:** 7/10
- **Confidence:** High
- **Stage Weight:** Low/Prototype (█○○○)
- **Direct Plan Evidence:**
  - `content.md:115`: `"[Live demo →](https://claimlens.vercel.app)"`
  - `content.md:168-174`: Clear setup instructions for both frontend Next.js and backend FastAPI environments.
- **Strengths Observed:** Declares the canonical production URL early (`claimlens.vercel.app`) and provides standard, clean local development scripts.
- **Weaknesses & Vulnerabilities:** The README run-locally section omits required environment variables (e.g., `VISION_MODEL`, `ALLOWED_ORIGIN`, `LITELLM_API_KEY`).
- **+2 Points Action Plan:**
  1. Add an `.env.example` code block in Section 10.4 listing all required runtime environment variables.
  2. Include a one-line curl command to verify local backend health (`curl http://localhost:8000/healthz`).

---

### 2.8 Design & User Experience
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** High (███○)
- **Direct Plan Evidence:**
  - `content.md:24`: `"Scene 3 onboarding hint | Your turn: drag the room rate."`
  - `content.md:26`: `"Scene 4 sub | Tap a deduction. See the clause and the arithmetic."`
  - `content.md:47-58`: Precise layout for Page 1 and Page 2 of `policy-demo.pdf` (formal serif font, schedule box top-right, Annexure A bulleted list).
- **Strengths Observed:** Microcopy is concise, instructive, and actionable. Onboarding hints guide user interactions without clutter. The synthetic PDF specification matches the exact typographical hierarchy of traditional Indian insurance policy schedules.
- **Weaknesses & Vulnerabilities:** Lacks responsive microcopy specifications for narrow mobile screens (390px), where lengthy table titles like `"Our assessment of expected typical offerings; capabilities vary by provider"` will wrap across 4+ lines.
- **+2 Points Action Plan:**
  1. Provide responsive copy alternatives in Section 10.1 (e.g., Mobile footnote: "Typical market offerings; provider terms vary").
  2. Define max character limits per viewport for all scene titles.

---

### 2.9 Business & Commercial Viability
- **Score:** 7/10
- **Confidence:** High
- **Stage Weight:** Low/Prototype (██○○)
- **Direct Plan Evidence:**
  - `content.md:38`: `"Impact figure | 1 lakh families × ₹10,000 = ₹100 crore (illustrative)"`
  - `content.md:193-197`: `"Roadmap: Native mobile app · Voice input · Direct TPA/hospital ERP integration · Full Hindi UI · pgvector/RAG for multi-policy search · Supabase Auth for personal policy storage"`
- **Strengths Observed:** Grounded commercial impact math. Instead of claiming billions in hypothetical ARR, the copy uses an illustrative ₹100 crore consumer savings formula. The roadmap clearly identifies enterprise expansion vectors (TPA and hospital ERP integrations).
- **Weaknesses & Vulnerabilities:** The copy does not articulate a business monetization model for ClaimLens itself (e.g., B2B hospital SaaS, employer health benefit, or consumer freemium).
- **+2 Points Action Plan:**
  1. Add a brief "Commercial Model" subsection in the README explaining the B2B SaaS opportunity: "Sold to hospitals to reduce pre-auth dispute delays and improve cash collection."
  2. Quantify the hospital administrative cost per disputed claim in Scene 2.

---

### 2.10 Execution Feasibility
- **Score:** 8/10
- **Confidence:** High
- **Stage Weight:** High (████)
- **Direct Plan Evidence:**
  - `content.md:202-213`: Second-by-second video script structured into 7 distinct visual segments fitting within a strict 2-minute limit.
  - `content.md:216-226`: Concise 6-item deck updates table targeting specific slide numbers.
- **Strengths Observed:** Exceptional feasibility in presentation planning. The video script is pre-scripted with visual cues and exact voiceover timings, drastically reducing recording friction on Sunday.
- **Weaknesses & Vulnerabilities:** The video script assumes both Finisher A (1:20–1:40) and Finisher B (1:40–1:55) are fully operational. If the team drops one finisher on Saturday, the creator must rewrite and re-time the script on Sunday during the final submission crunch.
- **+2 Points Action Plan:**
  1. Add an alternative "Finisher B Only" video script breakdown in Section 10.5 allocating 1:20–1:50 to the Appeal Composer and clause proof.
  2. Pre-record the 0:00–1:20 segment (Hero through Wow 3) on Friday night to de-risk Sunday production.

---

## 3. Key Decision Audit

| Decision | Justified? | Risk Level | Better Alternative |
| :--- | :--- | :--- | :--- |
| **72pt Red Watermark `SAMPLE · SYNTHETIC` (`content.md:60`)** | Yes | Low | None. Essential legal defense against insurer misrepresentation. |
| **CTA 1 "Run your own bill" (`content.md:32`)** | No | High | Change to "Try Interactive Sample" to align with disabled uploads. |
| **Transparent "What's Real vs Illustrative" Table (`content.md:144`)** | Yes | Low | None. Benchmark practice for AI hackathon honesty. |
| **Illustrative Tagging of ₹100 Crore Impact (`content.md:38`)** | Yes | Low | None. Prevents deceptive market sizing claims. |
| **2-Minute Video Pre-Scripting (`content.md:202`)** | Yes | Low | None. Guarantees tight presentation pacing. |
| **Omission of Devanagari Hindi Text (`content.md:64`)** | No | Medium | Include verified Devanagari translation of appeal letter in Section 10.3. |

---

## 4. Red Team Analysis: 7 Failure Modes

### Failure 1: The Misleading "Run Your Own Bill" CTA Trap (Product/Trust Failure)
- **Why dangerous:** A judge clicks CTA 1 `"Run your own bill"` expecting a file picker. Finding that uploads are disabled, the judge may conclude the demo is fake or deceptive.
- **Probability:** High
- **Severity:** Critical
- **Mitigation:** Update CTA 1 immediately to `"Explore Raju's Bill"` with a subtitle `"Uploads disabled in demo for privacy"`.

### Failure 2: Sunday Video Voiceover Squeeze due to Missing Finisher (Execution Failure)
- **Why dangerous:** If Finisher A is cut on Saturday, the voiceover at 1:20–1:40 (`"AI reads the documents..."`) has no corresponding screen recording, forcing a panicked rewrite of the script on Sunday afternoon.
- **Probability:** High
- **Severity:** High
- **Mitigation:** Provide an explicit branching video script in Section 10.5 for a "Finisher B only" submission.

### Failure 3: Missing Hindi Copy Breaking the Language Toggle (UX Failure)
- **Why dangerous:** `prompts.md:300` requires an EN/HI toggle for the appeal letter. Because `content.md` provides no Hindi text, the AI coding agent will either hallucinate a flawed translation or leave the toggle non-functional.
- **Probability:** High
- **Severity:** Medium
- **Mitigation:** Supply verified Hindi Devanagari translation strings for the appeal letter body directly in Section 10.3.

### Failure 4: README Placeholder Leak to Public Repo (Brand/Integrity Failure)
- **Why dangerous:** If the team submits with `[Insert hero GIF]` or `[Fill from metrics.json]` in `README.md`, judges reviewing the repo will instantly dock points for an incomplete project.
- **Probability:** Medium
- **Severity:** High
- **Mitigation:** Replace bracketed placeholders in Section 10.4 with verified static fallback copy and a static SVG architecture diagram.

### Failure 5: Legal Dispute Over Insurer Name Confusion (Legal Failure)
- **Why dangerous:** If sample copy references a real insurer name anywhere instead of `"Demo Assure"` or `"SafeCare Plus (Demo)"`, it violates IRDAI advertising regulations and hackathon safety rules.
- **Probability:** Low
- **Severity:** Critical
- **Mitigation:** CI regex script checking all content strings in `apps/web` and `fixtures/` ensuring only `Demo Assure` and `SP-*` identifiers appear.

### Failure 6: Mobile Title Overflow on 390px Viewports (UX Failure)
- **Why dangerous:** Desktop headlines like `"Our assessment of expected typical offerings; capabilities vary by provider"` (`content.md:29`) overflow 390px mobile screens, pushing content below the fold.
- **Probability:** Medium
- **Severity:** Medium
- **Mitigation:** Provide concise mobile copy overrides for all titles with length >40 characters.

### Failure 7: Uncited IRDAI Macro Statistics Challenged by Judges (Credibility Failure)
- **Why dangerous:** A judge may ask for the exact IRDAI table supporting the ₹26,038 crore disallowed stat (`content.md:15`). Without page citations, the team appears to rely on secondary news headlines.
- **Probability:** Medium
- **Severity:** Medium
- **Mitigation:** Add the exact IRDAI 2023-24 Annual Report page and table citation to Scene 2 footnote copy.

---

## 5. Missing Elements Matrix

| Gap Description | Functional Type | Priority |
| :--- | :--- | :--- |
| Devanagari Hindi translation text for appeal letter and explainer | Product / Content | Must Have |
| Honest replacement copy for CTA 1 ("Run your own bill") | Product / Trust | Must Have |
| Alternative 2-minute video script for single-finisher scenarios | Execution | Should Have |
| Environment variables template (`.env.example`) in README | Operational | Should Have |
| Exact IRDAI report page and table citations for macro statistics | Research / Content | Should Have |
| Responsive mobile copy variants for long headers (>40 chars) | UX / Design | Nice to Have |
| B2B hospital monetization narrative in README | Business | Nice to Have |

---

## 6. Strengths & Durability Analysis

1. **Uncompromising Ethical Disclosure (`content.md:142-153`):** The "What's real vs illustrative" matrix sets an extraordinary benchmark for hackathon transparency, earning deep credibility with technical evaluators. *Beneficiary:* Evaluators & Team. *Durability:* High.
2. **Visceral Emotional Hook (`content.md:11-12`):** The headline `"You were insured. You still owe ₹41,500."` instantly conveys the user problem without jargon or preamble. *Beneficiary:* End Users & Judges. *Durability:* High.
3. **Aggressive Legal De-risking (`content.md:60, 98, 186`):** The 72pt diagonal red watermark, synthetic clause IDs (`SP-*`), and persistent legal disclaimers insulate the project from regulatory risk. *Beneficiary:* Team & Legal Stakeholders. *Durability:* Exceptionally durable.
4. **Actionable Legal Appeal Drafting (`content.md:64-105`):** The appeal letter produces a genuine, structured grievance document with specific clause arithmetic citations and Ombudsman escalation paths. *Beneficiary:* Policyholders. *Durability:* High.
5. **Turnkey 2-Minute Video Architecture (`content.md:202-213`):** Pre-timing every segment of the video script ensures a concise, punchy presentation that fits strict hackathon judging limits. *Beneficiary:* Hackathon Judges & Presenter. *Durability:* High.

---

## 7. Comparative Benchmark

| Benchmark Cohort | Standing | Direct Evidence from Plan Data |
| :--- | :--- | :--- |
| **Typical Student Project** | **Far Above** | Student projects feature placeholder lorem text; this has a complete copy deck, video script, and synthetic PDF spec (`content.md:9, 43, 202`). |
| **Competitive Internship Portfolio** | **Above** | Demonstrates superior regulatory risk awareness with mandatory 72pt synthetic watermarking and disclaimer footers (`content.md:60, 98`). |
| **Strong Indie Hacker Product** | **Above** | Surpasses indie landing pages with its transparent "What's real vs illustrative" disclosure matrix (`content.md:144`). |
| **Seed-Stage Startup MVP** | **At** | Matches seed-stage product narrative and pitch video structure; lacks deeper B2B commercial unit economics (`content.md:193`). |
| **Professional SaaS Product** | **Below** | Lacks multi-language localization assets (Devanagari text missing) and enterprise customer case studies (`content.md:64`). |

---

## 8. Strategic Roadmap

### Immediate (0–30 Days: Hackathon Submission)
- Align CTA 1 copy with disabled uploads ("Test with Raju's Bill").
- Add Devanagari Hindi copy for the appeal letter.
- Populate README skeleton with real measured numbers from Day 1 engine tests.
- Record 2-minute video following the Section 10.5 shot list.

### Short-Term (1–3 Months: Content & Regulatory Hardening)
- Incorporate official IRDAI circular citations into the appeal letter template.
- Develop responsive copy tokens that automatically adapt headline length based on viewport breakpoint.
- Publish a comprehensive B2B case study demonstrating hospital TPA dispute reduction.

### Medium-Term (3–12 Months: Production Multi-Lingual Expansion)
- Expand full bilingual content across all 8 landing page scenes into 5 major Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi).
- Create an automated legal citation engine that references updated state-specific Insurance Ombudsman rulings.
- Publish consumer educational guides on navigating room-rent sub-limits and proportionate deductions.

---

## 9. Final Verdict & Direct Reality Answers

- **Overall Score:** 7.5 / 10
- **Evaluation Confidence:** High
- **North Star Metric ($\frac{\text{Value}}{\text{Complexity}}$):** High. The copy deck delivers maximum storytelling clarity and legal safety with zero technical complexity.

| Dimension | Rating |
| :--- | :--- |
| Engineering Grade | B+ |
| Product Grade | A- |
| Execution Risk | Medium |
| Technical Risk | Low |
| Business Risk | Low |
| Portfolio Impact | Top 5% (Product Narrative & Ethics) |

### Direct Answers

1. **Is this project genuinely impressive at its current stage?**  
   Yes. The copy deck is exceptionally articulate, emotionally compelling, and ethically grounded in genuine transparency.
2. **Is it over-engineered, correctly engineered, or under-engineered?**  
   Correctly engineered. It avoids complex marketing jargon and provides turnkey text for every asset.
3. **What is the single strongest decision made?**  
   Including the "What's real vs illustrative" table in the README and enforcing a 72pt diagonal red watermark on the synthetic policy document.
4. **What is the single most dangerous mistake?**  
   Promoting CTA 1 as `"Run your own bill"` when bill uploads are hard-disabled in the codebase.
5. **What should the creator stop doing immediately?**  
   Stop promising arbitrary bill uploads in public-facing CTAs.
6. **What is the single highest-leverage next action?**  
   Change CTA 1 to `"Explore Raju's Bill"` and supply the missing Devanagari Hindi text for the appeal letter.
7. **What would it concretely take to make this world-class?**  
   Include verified IRDAI Annual Report page citations and provide complete, professional Devanagari localization across the entire user journey.
