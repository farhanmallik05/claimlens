# ClaimLens — Idea

> *Why this product exists, what it does, and the rules that make it trustworthy.*

---

## 1.1 Problem

Indian policyholders and caregivers discover claim shortfalls **at discharge**, when the bill is due and cash is demanded. Three root causes:

1. **Dense wordings** hide room-rent caps, co-pay clauses, and sub-limits inside lengthy policy documents.
2. **Post-facto discovery:** shortfalls surface only at final settlement, after all services have been consumed.
3. **Friction-heavy appeals:** contesting a deduction means navigating insurer grievance cells, then the Insurance Ombudsman — a multi-month process for most families.

### Headline statistics (FY24)

> [!IMPORTANT]
> **Verify every figure against the IRDAI Annual Report 2023-24 before shipping (task V-1 in qa.md).** Add exact page/table links.

| Stat | Value | Source |
| :--- | :--- | :--- |
| Lives covered by health insurance in FY24 | **57 crore** | IRDAI Annual Report 2023-24, as reported by PTI and Business Standard |
| Claims disallowed or repudiated in FY24 | **₹26,038 cr** | Same source |
| Percentage of claimed value actually paid out | **71%** | Same source |

---

## 1.2 Solution

ClaimLens ingests a policy document and a hospital bill (estimate or final discharge summary), and:

1. **Parses the policy** into structured coverage rules (room-rent cap, proportionate clause, non-payables, co-pay).
2. **Audits the bill** line by line against those rules.
3. **Forecasts out-of-pocket expense** *before* discharge — giving families time to act.
4. **Cites the exact policy clause** behind every deducted rupee.
5. **Drafts an evidence-backed appeal** when an insurer's settlement deviates from the policy terms.

---

## 1.3 Differentiators

| Pillar | Meaning | How it's proven on the page |
| :--- | :--- | :--- |
| **Neuro-symbolic** | LLMs read documents; a deterministic engine does all money math | Wow 2 runs the real engine in-browser in <1 ms |
| **Provenance** | Every deduction → clause ID → formula | Wow 3 + build-failing CI test (FR-12 in prd.md) |
| **Appeal engine** | Cited letter with correct escalation tier | Finisher B in design.md Scene 8 |
| **Independence** | No commissions, no insurer conflict of interest | Comparison table (marked "our assessment") |

---

## 1.4 Persona

**Raju (example).** His mother needs hip surgery. A room upgrade from a ₹5,000-cap room to a ₹8,000 Deluxe room leaves her ₹41,500 short at discharge.

**Secondary users:** first-time and group-cover buyers; hospital billing desks; patient NGOs filing evidence-backed appeals.

---

## 1.5 Honesty rules (non-negotiable)

These rules are enforced in code, in copy, and in every demo.

- **Label all sample data** as `"Illustrative · synthetic documents"` — visible on every viewport.
- **Footer on every view:** `"Cites sources, not legal advice."`
- **No fabricated real clause numbers.** The synthetic policy uses clearly synthetic IDs (`SP-3.1`, `SP-3.2`, etc.) so there is zero risk of misquoting a real insurer.
- **₹100 crore impact estimate** is tagged `illustrative` everywhere it appears.
- **Live-read results** are labelled **Live** or **Replayed from a recorded run** — never unlabelled or blurred.
- **Competitor table footnote:** *"Our assessment of expected typical offerings; capabilities vary by provider."*
- **Statistics** (57 crore, ₹26,038 cr, 71%) are footnoted with their source; re-verified before publish (see qa.md V-1).

