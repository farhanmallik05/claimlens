# ClaimLens — Schedule and Gates

> *5 days. What gets built, when, and what gets cut if time runs short.*

---

## 8.1 5-day plan (11–15 Nov 2026)

| Day | Build targets | Gate (must pass before sleeping) |
| :--- | :--- | :--- |
| **Wed 11 (tonight)** | Scaffold monorepo · design tokens · deploy empty page to Vercel · engine + fixtures + **Raju test** · golden tier table as tests | Raju test green; live URL accessible |
| **Thu 12** | **Wow 2 (Ripple) first**, then Wow 1 (Receipt Reveal) timeline | Slider ≥55 fps on a mid-range phone; hero scrubs both directions |
| **Fri 13** | **Wow 3 (Clause Drawer)** · Scenes 2, 5, 6, 7, 8 with real copy · 90-second tour | Full page scrolls end to end, zero placeholders, honesty strip visible |
| **Sat 14** | Finisher A (live read + replay fallback) **or** Finisher B (appeal composer) · Polish: motion, mobile, a11y, Lighthouse | **Feature freeze at 10 PM** · Lighthouse ≥80 mobile measured |
| **Sun 15** | README with measured numbers · ≤2 min video · screenshots · `v1.0` tag · submit | **Submitted by 6 PM IST** (5+ h buffer before midnight deadline) |

### Daily ritual
- **Start:** re-read the day's gate.
- **End:** deploy, open the live URL on a phone, walk the 2-minute path, write 3 lines of "what broke / what's next."

---

## 8.2 Fallback ladder

*If time runs short, drop from the **bottom** of this list first. Never cut items above the line.*

```
Priority  Feature
────────  ────────────────────────────────────────────────────────────
  ↑       [NEVER CUT] Engine + Raju test
  ↑       [NEVER CUT] Wow 2: The Ripple (working slider)
  ↑       [NEVER CUT] Wow 3: Clause drawer
  ↑       [NEVER CUT] Honesty labels (footer, "Illustrative", Live/Replay)
  │
  │       Scene 6/7 animations → static on-scroll reveal
  │       Hero scroll-scrub → time-based one-shot animation (no pin)
  │       Finisher B: appeal composer → static letter with linked citations
  ↓       Finisher A: live read (SSE) → replay-only (ReplaySource always)
          Live read on arbitrary uploads → cut entirely (stays cut)
```

> [!WARNING]
> If Finisher A replay-only is chosen, the replay JSON **must** be pre-recorded from a real run before feature freeze.

---

## 8.3 What's cut from the original deck plan

| Item | Status | Reason |
| :--- | :--- | :--- |
| Supabase Auth and pgvector | Cut (roadmap) | No judge-visible value in a 2-minute demo (ADR-7) |
| Dependabot and CodeQL | Cut | No time window to review PRs; not judge-visible |
| Full Playwright suite | Reduced to **1 smoke test** | Smoke: page loads, slider flips ₹41,500 → ₹4,000 |
| Full Hindi UI | Kept for **explainer + appeal letter only** | Full bilingual UI is a roadmap item |
| Mobile app, voice, TPA links | Cut (roadmap) | Named explicitly in "Scope guard: later" |
| 5 policies × 10 bills golden set | Reduced to **1 policy + 3 rate variants + 3 sample bills** | 1 policy + 5 tier table covers all engine behaviour |
| `±10%` forecast error metric | Removed | Contradicts "deterministic" — replaced by field-level extraction accuracy if Finisher A ships |

