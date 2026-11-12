# ClaimLens — Master Plan Index

> **Event:** CodeQuest · National Tech Hackathon 2026 (Idea Submission)
> **Author:** Farhan Mallik · KCC Institute of Technology and Management
> **Written:** Wed 11 Nov 2026 · **Deadline:** Sun 15 Nov 2026, 11:59 PM IST (target: 6 PM)
> **One-line pitch:** *Your shortfall, forecast before discharge, with the clause behind every rupee.*

---

## How to use this folder

| File | Purpose | Read when |
| :--- | :--- | :--- |
| **`plan.md`** ← *you are here* | Index and working rules | First |
| [`idea.md`](idea.md) | Problem, solution, USP, honesty rules | Understanding *why* |
| [`strategy.md`](strategy.md) | Judge experience, rubric mapping, submission package | Planning *how to win* |
| [`prd.md`](prd.md) | Goals, user stories, functional & non-functional requirements | Understanding *what* |
| [`flows.md`](flows.md) | Judge flow, product flow, live-read flow, error paths | Designing interactions |
| [`design.md`](design.md) | Tokens, motion principles, all 8 scene specs, micro-detail checklist | Building the UI |
| [`trd.md`](trd.md) | Architecture, repo layout, data contracts, engine spec, fixtures, API, prompts, CI | Building the system |
| [`adrs.md`](adrs.md) | Architecture Decision Records (9 decisions) | Explaining *why we built it this way* |
| [`schedule.md`](schedule.md) | 5-day plan, gates, fallback ladder, what's cut | Day-to-day execution |
| [`prompts.md`](prompts.md) | 13 copy-paste prompts for AI agents (P0–P12) | Generating code with AI |
| [`content.md`](content.md) | Copy deck, synthetic policy, appeal letter, README skeleton, video script | Writing content |
| [`qa.md`](qa.md) | Verification tasks, release checklist | Shipping |
| [`risks.md`](risks.md) | Risk register with mitigations | Risk management |
| [`appendix.md`](appendix.md) | Verbatim facts from the original deck | Reference / audit |

---

## Working rules

**From the standing workflow:** spec-first → local-first dev → deterministic core → every claim on the page backed by something built or measured.

### Assumptions

| # | Assumption | If wrong |
| :--- | :--- | :--- |
| A1 | Only the deck exists today; no repo/UI/engine built | If the engine exists, skip Day 1 engine work and start Wow 2 tonight |
| A2 | Solo build with three parallel AI-agent lanes: **Engine, Experience, Pipeline** | If 3 humans, map lanes 1:1 to people |
| A3 | Judges open a link cold (laptop or phone) ~2 min, plus watch a ≤2 min video | If live screen-share, keep the tour (design.md §5.4) as the script |
| A4 | The demo needs no signup, no API keys, synthetic documents only | Keeps privacy/legal risk at zero |
| A5 | One deterministic TypeScript rules engine powers the page; a small Python port runs in the pipeline; both pass the same fixtures | See ADR-3 in adrs.md |
| A6 | Vision-LLM provider is undecided; chosen via env var through LiteLLM | Set `VISION_MODEL` in `.env` |
| A7 | Hackathon rubric is unknown | Fill strategy.md §2.2 from the rules page, then re-weight scenes |

### Corrections to the original deck (action items)

> [!IMPORTANT]
> These corrections must be applied before shipping.

- **Timeline is dead.** Sprints 1–2 (2–9 Nov) are in the past. Use schedule.md.
- **"±10% forecast error" contradicts "deterministic."** With correct inputs the math is exact. Error lives in *extraction* and *policy interpretation*. Publish measured numbers only.
- **Render free tier spins down** after idle; first request can take ~1 minute. Add a keep-alive ping and a recorded-replay fallback.
- **Claims must match what's built.** Supabase Auth, pgvector/RAG, Dependabot/CodeQL, full Hindi UI earn nothing in a 2-minute judge visit. Cut or shrink (see schedule.md §8.3).
- **Slide 2 statistics:** footnote each with a link and re-verify against the IRDAI Annual Report 2023-24 before shipping (task V-1 in qa.md).

---

## Core principle

> The landing page **is** the pitch. A judge scrolls ~2 minutes, feels the shortfall, moves it with their own hands, then watches the product prove itself.
