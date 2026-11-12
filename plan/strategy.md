# ClaimLens — Hackathon Strategy

> *How to win a 2-minute judge visit.*

---

## 2.1 What judges experience — the 2-minute path

| Time | Scene | Feeling the judge should have |
| :--- | :--- | :--- |
| 0–5 s | **Wow 1: The Receipt Reveal** | "I understand this instantly." |
| 5–25 s | Scene 2: The gap (stats + Raju) | "This is a real, big problem." |
| 25–70 s | **Wow 2: The Ripple** (they drag the slider) | "It's actually working." |
| 70–95 s | **Wow 3: Every Rupee Has a Receipt** | "It's trustworthy and auditable." |
| 95–120 s | Scenes 5–8 (tech, why us, impact, act) | "Feasible, differentiated, finished." |

**Core principle:** the landing page is the pitch. Every scene serves a rubric criterion and a feeling. Nothing is decorative.

---

## 2.2 Rubric mapping

> [!IMPORTANT]
> **Action item (V-2):** fill the Weight column from the official CodeQuest rules page, then re-weight which scenes get the most polish time.

| Criterion | Weight | Scene that wins it |
| :--- | :--- | :--- |
| Innovation / uniqueness | *fill in* | Wow 3, Scene 6 |
| Technical depth | *fill in* | Wow 2, Scene 5 |
| Problem relevance / impact | *fill in* | Wow 1, Scenes 2, 7 |
| Feasibility / execution | *fill in* | Working engine, tests, README |
| Presentation / UX | *fill in* | Entire page, video |

---

## 2.3 Submission package checklist

| Item | Status | Notes |
| :--- | :--- | :--- |
| Live URL (Vercel), opens cold with no login | ☐ | Must work at 390 px on a cold phone |
| ≤2 min video (tour + one live read) | ☐ | Script in content.md §10.5 |
| Repo with README and `v1.0` tag | ☐ | Measured numbers only — see qa.md |
| Updated deck | ☐ | Changes listed in content.md §10.6 |
| 3 screenshots (hero, ripple, clause drawer) | ☐ | Used as OG image source |
| OG image rendered from the engine's ₹41,500 receipt | ☐ | Auto-generated from `forecast()` |

---

## 2.4 Lane structure (solo + AI agents)

Three parallel AI-agent lanes map to three concerns:

| Lane | Owns | AI prompt set |
| :--- | :--- | :--- |
| **Engine** | `packages/engine`, `fixtures/`, `apps/api/engine_py.py` | P1, P8 (partial) |
| **Experience** | `apps/web` — all scenes, UI primitives, tour | P2, P3, P4, P5, P6, P7, P9, P10, P11 |
| **Pipeline** | `apps/api` — FastAPI, LangGraph, SSE, replay | P8, P9 |

Lanes can run in parallel until Scene 3 (Wow 2) which depends on the Engine lane completing P1.

