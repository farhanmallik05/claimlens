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

AUTHORITATIVE SPEC: plan/ folder (plan.md → index; design.md → scenes; trd.md → contracts; COUNTER_PLAN.md → hardened specs).
If a prompt conflicts with the spec, the spec wins. Ask before adding dependencies.

DEFINITION OF DONE per task: typecheck + lint + tests pass; works at 390px; keyboard operable.
