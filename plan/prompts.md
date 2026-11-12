# ClaimLens — Prompt Pack

> *Copy-paste prompts for Antigravity / Claude Code / any AI agent IDE. Run P0 first, then P1 and P2 in parallel, then sequence as shown.*

---

## AGENTS.md / GEMINI.md (save at repo root)

```
PROJECT: ClaimLens — a landing page that IS a hackathon pitch and a working demo.
It forecasts an Indian health-insurance payout before discharge, cites the clause behind every deducted
rupee, and drafts appeals.

RULES:
- Next.js App Router + TypeScript + Tailwind.
- GSAP ScrollTrigger + Lenis for scroll. Motion for springs.
- All money math lives in packages/engine (pure TS, integer rupees). Never compute money in components.
- Design: paper #F5F0E6, ink #14110F, red #C8372D (ONLY for lost money), green #1F6B4A (ONLY for payable).
- Fonts: Instrument Serif (display), Geist (UI), Geist Mono (numbers).
- tabular-nums on all rupee values. Intl.NumberFormat('en-IN').
- Motion: one easing cubic-bezier(.22,1,.36,1); animate transform/opacity only; honor prefers-reduced-motion.
- Honesty: label all sample data "Illustrative · synthetic documents"; footer "Cites sources, not legal advice."

AUTHORITATIVE SPEC: docs/plan/ folder (plan.md → index; design.md → scenes; trd.md → contracts).
If a prompt conflicts with the spec, the spec wins. Ask before adding dependencies.

DEFINITION OF DONE per task: typecheck + lint + tests pass; works at 390px; keyboard operable.
```

---

## P0 — Scaffold (run first)

```
Read docs/plan/trd.md §6.2 (repo layout), §6.9 (perf budget), §6.10 (CI).

Create a pnpm monorepo:
- apps/web: Next.js App Router, TypeScript, Tailwind
- packages/engine: TypeScript, Vitest, fast-check
- apps/api: FastAPI skeleton with /healthz only
- fixtures/ directory (empty JSON stubs)
- .github/workflows/ci.yml with three jobs: engine (vitest), web (typecheck+lint+build), api (pytest healthz)

Load fonts with next/font: Instrument Serif, Geist, Geist Mono.
Add the CSS tokens from docs/plan/design.md §5.2 to globals.css.
Render a placeholder hero div using the tokens (paper background, ink headline: "ClaimLens").
Deploy-ready for Vercel. Do not add dependencies beyond those listed in AGENTS.md.
```

---

## P1 — Engine (Lane: Engine)

```
Implement packages/engine per docs/plan/trd.md §6.3 (types), §6.4 (engine spec), §6.5 (fixtures).

Files to create:
- types.ts: Policy, Bill, BillLine, Deduction, LineResult, Forecast, RuleId, CategoryId
- forecast.ts: forecast(policy, bill) — exact order of operations in §6.4
- advice.ts: maxRoomRateWithoutCut(), avoidableShortfall()
- fixtures/policy.raju.json, fixtures/bill.raju.json, fixtures/golden.json (five golden tiers)
- fixtures/settlement.raju.json (Finisher B — wrong settlement)

Rules:
- Integer rupees only; payable uses Math.floor (conservative).
- Every Deduction must have { lineId, ruleId, clauseId, formula: { template, vars, result } }.

Required tests (Vitest):
1. GATE: Raju → insurerPays === 108500 AND youPay === 41500 exactly.
2. All five golden tiers from design.md §5.4 table.
3. Invariant: billed − insurerPays === Σdeductions.amount (fast-check, 1000 runs).
4. Monotonic: youPay non-decreasing as room rate increases (fast-check).
5. Co-pay beforeCap and afterCap both orderings.
6. SI clamp: with sumInsured 10000 and billed 50000.
7. Non-payable + proportionate on the same line.
8. roomRent mode "none" → no cuts at any room rate.
9. CLAUSE GUARD (FR-12): every deduction.clauseId exists in policy.clauses; throw if any missing.

Do not touch apps/web. Do not add network calls.
```

---

## P2 — Design system and primitives (Lane: Experience)

```
Build apps/web/components/ui using tokens from docs/plan/design.md §5.2.

Components:
- Odometer: per-digit translateY animation, tabular-nums, fixed 1ch digit boxes, en-IN grouping.
  Props: value (number), duration (ms). Animate on value change.
- Stamp: scale 1.6→1, −3deg rotation, 80ms overshoot spring. Text slot. Reduced-motion: show end state.
- Slider: native <input type="range"> (CSS-styled, NOT a custom div), 44px min thumb, magnetic snap to
  provided tiers array, aria-valuetext callback prop.
- ReceiptLine: row with label, billed amount, payable amount, deducted amount. Deducted in --red if >0.
- HonestyStrip: footer bar with "Cites sources, not legal advice." and "Illustrative · synthetic documents."
- ProgressRule: top 1px rule, scene name in Geist Mono caps on the right, updates per scene.

Provide a /dev/ui page (not linked in production nav) showing all primitives with mock data.

All components: keyboard accessible, focus-visible rings (--ink, 2px --paper offset), WCAG AA contrast.
```

---

## P3 — Wow 2: The Ripple

```
Implement apps/web/components/scenes/Ripple.tsx per docs/plan/design.md §5.4 Scene 3.

Import forecast() and advice() from packages/engine — no network calls.

Layout (3 columns):
- Left: Policy card (Demo Assure · SafeCare Plus (Demo) · SI ₹5,00,000 · cap ₹5,000/day · proportionate on)
- Center: Bill lines table (billed / payable / deducted columns)
- Right: Waterfall (billed → payable → you pay)

Slider: 5 tiers (General 2000, Semi-private 3500, Single AC 5000, Deluxe 8000, Suite 12000).
"Try your own cap" numeric input also updates all lines (FR-13).

On cap-crossing:
- Staggered 40ms red wash (opacity flash) down dependent lines: room → professional lines
- Waterfall steps down with spring animation
- navigator.vibrate(12) if available
- Insight caption from advice.ts (never hardcoded)
- Action chip from advice.ts: "Choose ≤ ₹X/day to avoid ₹Y"

Onboarding: auto-drag once on first view (Deluxe → Single AC → Deluxe), then show "Your turn" label.
Respects prefers-reduced-motion: no auto-drag, no wash animation; slider still interactive.

Batch all DOM writes in requestAnimationFrame.

Acceptance: matches all five golden tiers to the rupee; ≥55fps on mid-range phone; passes typecheck and lint.
```

---

## P4 — Wow 1: The Receipt Reveal

```
Implement apps/web/components/scenes/Receipt.tsx per docs/plan/design.md §5.4 Scene 1.

Build the bill as pure HTML/CSS — it IS the loading skeleton. No images.
Data source: import fixtures/bill.raju.json and call forecast() to get deductions.
Bill header: "Raju's mother · Hip surgery · 5 days"

Animation sequence (use GSAP ScrollTrigger pin ~300vh, scrub: 0.6 on desktop):
- 0.00–0.08: Bill settles; headline "You were insured. You still owe ₹41,500." fades in
- 0.08–0.30: Scan bar sweeps top→bottom; lines flip from plain to annotated (green tick or red mark)
- 0.30–0.60: Three Stamps animate in: −₹15,000, −₹22,500, −₹4,000 (each with 1px screen-shake, desktop only)
- 0.60–0.80: Odometers roll: "Insurer pays" ₹1,50,000→₹1,08,500; "You pay" 0→₹41,500
- 0.80–0.88: Hold (stillness — no animation)
- 0.88–1.00: Clause chips peel to right margin; scroll cue appears

Mobile/touch: no pin; ScrollTrigger once — play timeline when section enters view.
Wire Lenis↔ScrollTrigger as in trd.md §6.9.
Reduced motion: render the end state statically.

Performance: hero must be visible (LCP element) in <2s on 4G; no spinner anywhere.
```

---

## P5 — Wow 3: Every Rupee Has a Receipt

```
Implement apps/web/components/scenes/Receipts.tsx and components/ui/ClauseDrawer.tsx
per docs/plan/design.md §5.4 Scene 4.

Interaction:
- Tapping a deduction line opens ClauseDrawer
- SVG connector draws (stroke-dashoffset) from the deduction to a 2-page policy panel sliding from the right
- Exact clause (from policy.clauses[clauseId]) highlights with a yellow marker sweep animation
- Arithmetic unfolds step by step from deduction.formula: template, vars, result, then clauseId
- Auto-tour mode: when section enters view, cycles through all 3 deductions automatically

ClauseDrawer accessibility:
- Focus trap while open
- Esc closes and returns focus to the trigger element
- aria-modal, aria-labelledby set correctly

Add a Vitest test: for every deduction in the Raju forecast, assert clauseId exists in policy.clauses.
```

---

## P6 — Static scenes and copy

```
Implement Scenes 2, 5, 6, 7, 8 per docs/plan/design.md §5.4 and copy from docs/plan/content.md §10.1.

Scene 2 (Gap): Three odometer count-ups (57 crore, ₹26,038 cr, 71%) with <a> footnote links.
  "Why it keeps happening" numbered cards. Raju card with mini receipt.

Scene 5 (How): 5-agent horizontal rail. Two zones: LLM zone vs Rules zone.
  Caption: "LLMs read. Rules decide. Clauses prove." Include Finisher A button placeholder.

Scene 6 (Why): Comparison table filling row-by-row on scroll. Footnote always visible.

Scene 7 (Impact): Three metric cards loaded from metrics.json.
  BUILD FAILS if metrics.json contains "TBD" for any displayed value.
  Impact: "1 lakh families × ₹10,000 = ₹100 crore" tagged "(illustrative)".

Scene 8 (Act): CTA buttons. HonestyStrip. Finisher B placeholder (typewriter appeal letter).

No lorem ipsum. No placeholder text. No hardcoded metric numbers (must come from metrics.json or engine).
```

---

## P7 — 90-second tour

```
Implement apps/web/lib/tour.ts and components/ui/TourPill.tsx per docs/plan/design.md §5.4 (tour section).

Pill: "▶ 90-second tour" button. Also activate on key J.
Show a "?" help overlay on key ? listing all keyboard shortcuts.

Tour sequence using lenis.scrollTo():
1. Scroll to Wow 1 (Receipt Reveal) — pause to show bill auditing
2. Scroll to Wow 2 (Ripple) — trigger the auto-drag sequence
3. Scroll to Wow 3 (Receipts) — open each clause drawer in sequence
Show a caption strip at the bottom of the viewport for each step.

Cancel immediately on: wheel, touchstart, keydown (except J to restart).
Return control smoothly (no jarring jump).
```

---

## P8 — Pipeline and live read (Lane: Pipeline, Finisher A)

```
Implement apps/api per docs/plan/trd.md §6.6 and §6.7.

FastAPI with:
- GET /healthz → 200 OK
- POST /v1/runs { sampleId: string } → { runId: string }
- GET /v1/runs/{id}/events → SSE stream of AgentEvent objects

LangGraph graph: policy_parser → bill_reader → rules_engine → explainer
- Load system prompts from app/prompts/*.md (copy from trd.md §6.7)
- Use LiteLLM with VISION_MODEL env var
- rules_engine node: pure Python (engine_py.py, no LLM) — Python port of forecast() from trd.md §6.4
- One repair retry on invalid JSON from LLM nodes
- 25s per-agent timeout
- Rate limits: 5/IP/hour, 30/day global
- CORS: allowlist = ALLOWED_ORIGIN env var
- No file persistence (delete temp files after run)
- Accept sampleId only; uploads disabled

Pydantic models mirror TypeScript types from trd.md §6.3.

Tests (pytest):
- test_engine_parity.py: load fixtures/golden.json, assert Python engine matches all five tiers exactly
- test_extraction.py: compare extraction output to fixtures, report field-level accuracy (skipped without LLM key)
```

---

## P9 — Replay and agent event source

```
Implement apps/web/lib/agent-source.ts per docs/plan/trd.md §6.6 (frontend abstraction section).

Define:
interface AgentEventSource {
  connect(sampleId: string): AsyncIterable<AgentEvent>;
  readonly label: 'Live' | 'Replayed from a recorded run';
}

LiveSource: SSE connection to NEXT_PUBLIC_API_URL/v1/runs/{id}/events
ReplaySource: reads public/replay/{sampleId}.json and re-emits events with recorded timing

Auto-fallback: if LiveSource doesn't respond within 6s or errors, switch to ReplaySource.
Show the label prominently — never hide or blur it.

Build Scene 5 "Read the sample bill live" UI:
- Five agent states light up in sequence
- PII redaction black bars appear visually before the first LLM step
- Forecast renders from extracted JSON with "Verified against ground truth: N/N lines matched"
- Label "Live" or "Replayed from a recorded run" always visible

Also create scripts/record-replay.ts: runs a live read and saves the SSE events to public/replay/{sampleId}.json.
```

---

## P10 — Appeal composer (Finisher B)

```
Implement the appeal composer in Scene 8 per docs/plan/design.md §5.4 Scene 8 and content.md §10.3.

Input data: compare forecast(policy.raju.json, bill.raju.json) vs fixtures/settlement.raju.json.
Detect: ₹9,750 over-deduction (pharmacy proportionate cut applied contrary to SP-3.3).

UI:
- Typewriter animation composing the letter from content.md §10.3
- Superscript citations [1], [2], etc. link to the relevant clause (opens ClauseDrawer)
- EN / HI language toggle (HI translation of the letter body)
- "Download PDF" button: use window.print() with the print stylesheet, or a small client-side PDF lib

Footer inside letter: "Prepared with ClaimLens. Informational, not legal advice."
Citations section: "Citations: [1] Policy clause SP-3.3, page 1."
```

---

## P11 — Polish, accessibility, performance

```
Walk through docs/plan/design.md §5.5 (micro-detail checklist) and §5.6 (responsive + a11y).
Walk through docs/plan/prd.md NFR-1 through NFR-8.
Walk through docs/plan/qa.md §11.2 release checklist.

Fix in order:
1. Top ProgressRule + tab title update per scene
2. Favicon: rupee inside a lens SVG; <meta name="theme-color" content="#F5F0E6">
3. Selection color in globals.css: ::selection { background: var(--red-soft) }
4. Print stylesheet: Raju receipt renders cleanly on paper
5. <noscript> receipt: static HTML showing ₹41,500 result
6. Reduced-motion paths in all animations
7. Focus rings: outline: 2px solid var(--ink); outline-offset: 2px; border-radius: 2px
8. 390px layout: Lenis off on touch, stacked scenes, no pin
9. OG image: pre-render from forecast() output at build time
10. Run Lighthouse (desktop + mobile), measure LCP. Code-split Scenes 5–8.
    Fix anything over budget. Write measured values to metrics.json.
11. Verify no TBD or lorem remains anywhere.
12. Confirm honesty strip is visible on all viewport widths.
```

---

## P12 — README, video script, submission

```
Write README.md per docs/plan/content.md §10.4.
- Use ONLY measured numbers from metrics.json and test output logs.
- Include mermaid architecture diagram.
- Explicit "What's real vs illustrative" section.
- Sections: What it is | Live demo | How it works | What's real vs illustrative |
  Measured results | Run locally | Architecture | Limits and honesty | Roadmap.

Write docs/plan/video-script.md from content.md §10.5 (the shot list).

Do not claim anything that is not built. If a Finisher was not completed, omit it from the README.
```

