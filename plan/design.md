# ClaimLens — Design

> *"The receipt that fights back."* Paper, ink, a single warning red. Everything feels like a physical document: a bill, a policy, a stamp, a letter. The product is the lens that reads them.

---

## 5.1 Design concept

Paper and ink. No photos. No decoration. Every element is a document artifact — receipt, stamp, policy page, appeal letter — that the engine has read, annotated, or generated. Motion tells the story; stillness is the punctuation.

---

## 5.2 Design tokens

```css
:root {
  /* Surfaces */
  --paper:    #F5F0E6;    /* base background — warm off-white */
  --paper-2:  #EDE6D6;    /* card/document surface */

  /* Ink */
  --ink:      #14110F;    /* primary text — near-black */
  --ink-2:    #4A433C;    /* secondary text */

  /* Semantic color — use ONLY as specified */
  --red:      #C8372D;    /* lost money ONLY — deductions, shortfall */
  --red-soft: #F3D9D5;    /* red highlight backgrounds */
  --green:    #1F6B4A;    /* payable amounts ONLY */
  --green-soft:#D6E8DE;   /* green highlight backgrounds */

  /* Structure */
  --rule:     #D9D0BE;    /* dividers, borders */

  /* Motion */
  --ease: cubic-bezier(.22, 1, .36, 1);

  /* Typography */
  --font-display: 'Instrument Serif', 'Fraunces', serif;
  --font-ui:      'Geist', system-ui, sans-serif;
  --font-mono:    'Geist Mono', ui-monospace, monospace;
}
```

### Color rules (enforced)
- **Red** appears **only where money is lost**. Never decorative.
- **Green** appears **only for payable amounts**. Never decorative.
- Numbers use `font-variant-numeric: tabular-nums` everywhere.
- Rupee formatting: `Intl.NumberFormat('en-IN')` → `₹1,50,000`.

### Type scale
| Role | Size | Weight | Font |
| :--- | :--- | :--- | :--- |
| Display XL | 72 px | Regular | Instrument Serif |
| Display L | 64 px | Regular | Instrument Serif |
| Display M | 48 px | Regular | Instrument Serif |
| Heading | 32 px | Medium | Geist |
| Body | 17/26 px | Regular | Geist |
| Mono caption | 12 px caps, 0.08em tracking | Regular | Geist Mono |

### Grid
12-column, max 1200 px, 16 px mobile gutter, 8-pt spacing system.

### Texture
Subtle paper grain via SVG `feTurbulence` noise filter at 3% opacity. No photographs.

---

## 5.3 Motion principles

1. **One easing family** (`--ease`) throughout. Scroll-scrub tells the story; springs respond to touch.
2. **Animate `transform` and `opacity` only.** Never `width`, `height`, `top`, `left`.
3. **Nothing moves without a cause** — scroll position, touch, or a completed step.
4. **Stillness is a tool.** After the money rolls, **hold 400 ms** before the next beat.
5. **`prefers-reduced-motion`:** replace scrub animations with static end states; slider remains interactive.

---

## 5.4 Scene specifications

### Scene 1 — Wow 1: The Receipt Reveal *(pitch beat: hook)*

**Goal:** a judge understands ClaimLens in ≤5 s without reading anything.

**Layout:** paper bill centered (max 520 px wide), rendered entirely in HTML/CSS — it *is* the loading skeleton. Bill header: `"Raju's mother · Hip surgery · 5 days"`. Lines from `fixtures/bill.raju.json` + `forecast()`. Right margin reserved for clause chips.

**On load (≤5 s):** a scan bar sweeps the bill once (2.5 s). Lines beneath it flip from plain ink to annotated (green ticks, red marks).

**Scroll-scrub (~300 vh pinned on desktop):**

| Progress | Animation event |
| :--- | :--- |
| 0.00–0.08 | Bill settles; headline `"You were insured. You still owe ₹41,500."` fades in |
| 0.08–0.30 | Scan bar scrubs top → bottom; each line gets a green tick or red mark |
| 0.30–0.60 | Red deduction stamps in: scale 1.6 → 1, −3° rotation, 80 ms overshoot → `−₹15,000`, `−₹22,500`, `−₹4,000` |
| 0.60–0.80 | "Insurer pays" odometer rolls `₹1,50,000 → ₹1,08,500`; "You pay" rolls `0 → ₹41,500` (per-digit) |
| 0.80–0.88 | **Hold** (400 ms of stillness) |
| 0.88–1.00 | Clause chips peel off the bill into the right margin (sets up Wow 3); scroll cue appears |

**Mobile/touch:** no pin; same timeline plays once when the section enters view (`ScrollTrigger once`).

**Build notes:**
- GSAP ScrollTrigger timeline `scrub: 0.6`
- Odometer: each digit is a column of 0–9; animate `translateY(-n * 1em)` with fixed `1ch` width boxes
- Stamps: a 1-frame screen-shake of 1 px (desktop only)

---

### Scene 2 — The gap (problem)

- Three odometer count-ups: `57 crore` · `₹26,038 cr` · `71%` — each with a footnote link to source.
- "Why it keeps happening" — three stacked numbered cards.
- Raju card on the right with a mini receipt preview.
- Copy: *"Insured, yet still left with the bill."*

---

### Scene 3 — Wow 2: The Ripple *(the working engine)*

**Goal:** prove the engine is real by letting the judge break it themselves.

**Layout (3 columns):**
- **Left — Policy card:** ₹5 lakh cover · room cap "1% of sum insured = ₹5,000/day" · proportionate clause on · co-pay 0%.
- **Center — Bill lines:** billed / payable / deducted columns, live-updating.
- **Right — Waterfall:** billed → payable → you pay, stepping down as cap is crossed.

**Slider:** native `<input type="range">` snapping to 5 tiers:

| Tier | Rate/day |
| :--- | :--- |
| General | ₹2,000 |
| Semi-private | ₹3,500 |
| Single AC | ₹5,000 (at cap) |
| Deluxe (Raju) | ₹8,000 |
| Suite | ₹12,000 |

**"Try your own cap"** numeric input also updates all lines (FR-13).

**Reaction on cap-crossing:**
- Staggered 40 ms red wash down dependent lines (room → surgeon → OT → nursing)
- Waterfall steps down
- `navigator.vibrate(12)` on supported devices
- Insight caption updates (computed from `advice.ts`, never hardcoded)

**Insight caption example** at ₹8,000: `"₹3,000/day over the cap → ₹37,500 more out of pocket than at the cap."`

**Action chip (FR-18):** `"Choose a room at or below ₹5,000/day to avoid ₹37,500."`

**Onboarding:** auto-drags once on first view (Deluxe → Single AC → Deluxe), then shows `"Your turn"`. Respects `prefers-reduced-motion` (no auto-drag, no wash animation).

**Build:** pure `forecast()` call per input event; `requestAnimationFrame`-batched DOM writes.

#### Golden tier table (source of truth for engine tests)

*Days = 5; cap = ₹5,000/day; professional = ₹60,000; pharmacy ₹30,000 (₹4,000 non-payable); diagnostics ₹20,000. Pharmacy and diagnostics are exempt from proportionate cut.*

| Room tier | Rate/day | Billed | Insurer pays | You pay | Room cut | Prof. cut | Non-payable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| General | ₹2,000 | ₹1,20,000 | ₹1,16,000 | ₹4,000 | 0 | 0 | ₹4,000 |
| Semi-private | ₹3,500 | ₹1,27,500 | ₹1,23,500 | ₹4,000 | 0 | 0 | ₹4,000 |
| Single AC | ₹5,000 | ₹1,35,000 | ₹1,31,000 | ₹4,000 | 0 | 0 | ₹4,000 |
| **Deluxe (Raju)** | **₹8,000** | **₹1,50,000** | **₹1,08,500** | **₹41,500** | **₹15,000** | **₹22,500** | **₹4,000** |
| Suite | ₹12,000 | ₹1,70,000 | ₹96,000 | ₹74,000 | ₹35,000 | ₹35,000 | ₹4,000 |

---

### Scene 4 — Wow 3: Every Rupee Has a Receipt *(USP)*

**Goal:** prove every deduction is auditable, not just calculated.

**Interaction:** tap any red deduction line (or let the scene auto-tour all three):
1. An SVG connector draws (stroke-dashoffset animation) from the deduction to a 2-page synthetic policy panel sliding in from the right.
2. The exact clause **highlights** (yellow marker sweep).
3. Beneath the clause, the arithmetic **unfolds step by step**:
   - `₹60,000 × (₹5,000 ÷ ₹8,000) = ₹37,500 payable → ₹22,500 deducted · Clause SP-3.2`
4. Clause ID shown at the base.

**Guarantee:** every `Deduction` object is data-bound to `{lineId, ruleId, clauseId, formula}`. CI fails if any clause is missing (FR-12). The claim "100% cited" is *enforced*, not just stated.

**Accessibility:** focus trap while drawer is open; `Esc` closes and returns focus to the trigger.

---

### Scene 5 — How it works (tech)

Horizontal rail of 5 agents with two visually separated zones:

```
[ LLM zone                           ] [ Rules zone ]
  Policy Parser → Bill Reader           Rules Engine   → Explainer → Appeal Drafter
```

Caption: *"LLMs read. Rules decide. Clauses prove."*

Embeds **Finisher A** button: `"Read the sample bill live"`.

---

### Scene 6 — Why us (innovation)

Comparison table that fills **row by row on scroll**:

| Capability | Aggregators | Insurer / TPA portals | Generic chatbots | ClaimLens |
| :--- | :---: | :---: | :---: | :---: |
| Understands your exact policy | Partial | Partial | Partial | **Yes** |
| Audits the bill line by line | No | Partial | Partial | **Yes** |
| Forecasts payout pre-discharge | No | Partial | No | **Yes** |
| Cites the clause per deduction | No | No | Partial | **Yes** |
| Drafts appeal and escalation | Partial | No | Partial | **Yes** |
| Independent of commissions | No | No | Yes | **Yes** |

Footnote (always visible): *"Our assessment of expected typical offerings; capabilities vary by provider."*

---

### Scene 7 — Impact (feasibility)

Three **measured** MVP targets (values from `metrics.json` — never TBD). Beneficiary cards: Families · Hospital desks · NGOs. Impact projection tagged **illustrative**: `"1 lakh families × ₹10,000 = ₹100 crore"`.

---

### Scene 8 — Act (close)

**Finisher B — appeal letter:** composes with a typewriter effect; superscript citations link to clauses (opens ClauseDrawer); EN/HI toggle; one-click PDF.

**CTAs:**
- Run your own bill (sandbox)
- Watch 2-min video
- View repo
- View deck

**Footer honesty strip:** `"Cites sources, not legal advice." · "Illustrative · synthetic documents."`

---

### 90-second tour (US-4)

Pill `"▶ 90-second tour"` (also key `J`). Auto-scrolls: Wow 1 → Wow 2 (triggers auto-drag) → Wow 3 (opens each clause), with captions at the bottom. **Any `wheel`, `touchstart`, or `keydown` input cancels it instantly** and returns control.

---

## 5.5 Micro-detail checklist

- [ ] Top progress rule with scene name in mono caps; tab title updates per scene
- [ ] Favicon: rupee inside a lens; `theme-color` = `--paper`
- [ ] Selection color = `--red-soft`; custom thin scrollbar
- [ ] Odometers never jitter (tabular numerals, fixed digit boxes)
- [ ] Stamps: 1-frame screen-shake of 1 px (desktop only)
- [ ] Slider thumb 44 px minimum tap target, magnetic snap to tiers, haptic on cap-cross
- [ ] `aria-valuetext` on slider: `"₹8,000 a day, ₹3,000 over cap"`
- [ ] Red used only for lost money; green only for payable amounts
- [ ] Print stylesheet: printing outputs the Raju receipt cleanly
- [ ] `<noscript>` receipt fallback with ₹41,500 result
- [ ] Keyboard shortcuts: `J` = tour, `?` = help overlay, `Esc` = close drawer
- [ ] OG image generated from the engine's actual `forecast()` output
- [ ] Focus-visible rings in `--ink` with 2 px `--paper` offset
- [ ] Footer honesty strip visible on every viewport width
- [ ] `prefers-reduced-motion`: scenes static, sandbox still interactive, no vibration

---

## 5.6 Responsive and accessibility

**Breakpoints:** test at 390 px (iPhone SE), 768 px (tablet), 1280 px (laptop), 1920 px (desktop).

**Touch:** Lenis **off** on touch devices. Pinned scenes become stacked sections (no `pin: true` on touch).

**Contrast:**
- `--ink` on `--paper`: ≈ 16:1 ✓
- `--red` on `--paper` for body text (≥18 px or bold): ≥ 4.5:1 (`#C8372D` qualifies)

**Slider:** native `<input type="range">` (CSS-styled), not a custom `<div>`. 44 px minimum interactive height.

**Screen reader:** all deduction amounts have `aria-label` including the clause ID.

