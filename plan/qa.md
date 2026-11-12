# ClaimLens — QA and Definition of Done

> *Nothing ships until these pass. No exceptions.*

---

## 11.1 Verification tasks (pre-ship)

| ID | Task | Owner |
| :--- | :--- | :--- |
| **V-1** | Re-check 57 crore / ₹26,038 cr / 71% against the IRDAI Annual Report 2023-24. Add exact page number and table reference as a footnote link on the page. | Pre-ship |
| **V-2** | Confirm the official CodeQuest rubric and submission format. Fill the Weight column in strategy.md §2.2. Re-weight polish time accordingly. | Day 1 |
| **V-3** | Confirm which IRDAI regulatory references (if any) go into `regulatoryRefs` for the Appeal Drafter prompt. Use only references you have read and verified. | Finisher B |
| **V-4** | Confirm the vision model provider, cost per call, and rate limits. Set `VISION_MODEL` in `.env`. Document in README. | Before Finisher A |

---

## 11.2 Release checklist

### Engine and correctness
- [ ] Raju gate test green (`insurerPays === 108500`, `youPay === 41500`)
- [ ] All five golden tiers green
- [ ] Invariant property test green (FR-7)
- [ ] Monotonic property test green (FR-8)
- [ ] Clause guard green — every deduction has a valid `clauseId` (FR-12)
- [ ] Python parity test green (`test_engine_parity.py`)

### Performance
- [ ] Page loads cold in <2 s on throttled 4G (Chrome DevTools preset); **no spinner**
- [ ] Slider ≥55 fps on a mid-range phone (measured with DevTools frame rate)
- [ ] No cumulative layout shift in the hero
- [ ] Lighthouse desktop ≥90 (measured, not estimated)
- [ ] Lighthouse mobile ≥80 (measured)
- [ ] `metrics.json` contains no `"TBD"` values

### Responsive
- [ ] 390 px: everything works, nothing truncated, honesty strip visible
- [ ] 768 px: tablet layout correct
- [ ] 1280 px: laptop layout correct
- [ ] 1920 px: no over-stretched elements

### Accessibility
- [ ] Keyboard-only run-through passes (tab through all interactive elements)
- [ ] Slider `aria-valuetext` reads correctly on screen reader
- [ ] ClauseDrawer focus trap works; Esc closes and returns focus
- [ ] `prefers-reduced-motion`: scenes static, sandbox still interactive, no vibration
- [ ] WCAG AA contrast on all text (ink on paper ≥ 4.5:1)

### Resilience
- [ ] Kill the API → replay appears with `"Replayed from a recorded run"` label
- [ ] `<noscript>` receipt fallback renders with ₹41,500 result

### Honesty and content
- [ ] No `"TBD"`, `lorem`, or unmeasured numbers on any visible page
- [ ] Honesty strip visible on every viewport
- [ ] All stat footnotes include source links (V-1 complete)
- [ ] ₹100 crore tagged `(illustrative)` everywhere it appears
- [ ] Competitor table footnote present

### Meta and submission
- [ ] OG image renders correctly as a link preview
- [ ] Favicon: rupee-in-lens SVG
- [ ] Tab title and `<meta>` description set
- [ ] `README.md` numbers match `metrics.json` exactly
- [ ] ≤2 min video recorded and uploaded
- [ ] 3 screenshots captured (hero, ripple, clause drawer)
- [ ] `v1.0` tag created on `main`
- [ ] **Submitted by 6 PM IST on 15 Nov 2026** (5+ h buffer)

---

## 11.3 Definition of done (per prompt/feature)

A feature is **done** when:
1. TypeScript compiles without errors (`tsc --noEmit`)
2. ESLint passes with no errors
3. Relevant tests pass (Vitest / pytest)
4. Works at 390 px with no jank
5. Keyboard operable
6. No hardcoded numbers that should come from the engine or `metrics.json`
7. No lorem ipsum or placeholder copy

