# ClaimLens — PRD (Product Requirements Document)

> *What the product must do, for whom, and how success is measured.*

---

## 3.1 Goals

| ID | Goal |
| :--- | :--- |
| **G1** | A judge understands the product in ≤5 s and can operate it within 30 s. |
| **G2** | The forecast engine is real, deterministic, tested, and visible. |
| **G3** | Every deduction is traceable to a clause and a formula. |
| **G4** | The page loads fast and works on a 390 px phone. |
| **G5** | The page tells the full pitch: problem, solution, USP, tech, innovation, feasibility, impact. |

---

## 3.2 Non-goals (this week)

Auth/accounts · Payments · Native mobile apps · Voice input · TPA/hospital ERP integration · Legal representation · Real user data storage · Full Hindi UI (kept only for explainer + appeal letter) · pgvector/RAG · Multiple real policies

---

## 3.3 Users and stories

| ID | Story | Priority |
| :--- | :--- | :--- |
| US-1 | As a judge, I see a bill get audited within 5 s of landing so I get the idea instantly | **P0** |
| US-2 | As a judge, I drag a room-rent slider and see every line recompute so I trust the product works | **P0** |
| US-3 | As a judge, I tap a deduction and see the exact clause and arithmetic so I trust the audit | **P0** |
| US-4 | As a judge, I press "90-second tour" and watch the key moments without effort | **P0** |
| US-5 | As a judge, I enter my own room cap and see the result | P1 |
| US-6 | As a judge, I run a live read of the sample documents and see agents work | P1 (Finisher A) |
| US-7 | As a judge, I see an appeal letter compose itself with linked citations | P1 (Finisher B) |
| US-8 | As Raju, I'm told what room to choose to avoid the shortfall | P1 |
| US-9 | As a judge on a phone, everything works and nothing janks | **P0** |
| US-10 | As a keyboard/screen-reader user, I can operate the slider and clause drawer | **P0** |

---

## 3.4 Functional requirements

| ID | Requirement | Acceptance criteria |
| :--- | :--- | :--- |
| FR-1 | `forecast(policy, bill)` pure function, integer rupees | Raju → `insurerPays 108500`, `youPay 41500` exactly |
| FR-2 | Room cap resolves from `pctSI` / `fixedPerDay` / `none` | `1% × ₹5,00,000 = ₹5,000` |
| FR-3 | Proportionate cut applies only to categories the policy lists | Pharmacy/diagnostics untouched in Raju sample |
| FR-4 | Non-payables removed before proportionate step | Test with both on one line |
| FR-5 | Co-pay order set by policy flag (`beforeCap` / `afterCap`) | Both orderings tested |
| FR-6 | Clamp to remaining sum insured | Test with small SI |
| FR-7 | **Invariant:** `billed − insurerPays == Σ deductions` | Property test via fast-check |
| FR-8 | **Monotonic:** `youPay` never decreases as room rate rises | Property test via fast-check |
| FR-9 | Room slider snaps to 5 illustrative tiers; recompute in same frame | 60 fps on mid-range phone |
| FR-10 | Insight caption computed by engine, never hardcoded | Snapshot test on 5 tiers |
| FR-11 | Clause drawer: SVG connector, highlighted clause, unfolding arithmetic, clause ID | Playwright smoke test |
| FR-12 | Every `Deduction` has `{lineId, ruleId, clauseId, formula}`; **build fails** if any are missing | CI test (clause guard) |
| FR-13 | "Try your own cap" numeric input updates all lines | Manual + unit test |
| FR-14 | 90-second tour pill + key `J`; any input cancels | Manual + smoke test |
| FR-15 | Live read via SSE with 5 agent states; replay fallback with honest label | Kill API → replay appears and is labelled |
| FR-16 | PII redaction bars visible before "model call" step | Visual check |
| FR-17 | Appeal letter composes with superscript citations linking to clauses; EN/HI toggle; one-click PDF | Finisher B |
| FR-18 | Pre-admission advice chip: `"Choose ≤ ₹X/day to avoid ₹Y"` computed by engine | Unit test against `advice.ts` |
| FR-19 | `prefers-reduced-motion`: scenes static, sandbox still interactive | Manual check |
| FR-20 | OG image + all meta tags set | Link preview check |

---

## 3.5 Non-functional requirements

| ID | Requirement | Target |
| :--- | :--- | :--- |
| NFR-1 | Hero visible | <2 s on 4G, **no spinner** |
| NFR-2 | Lighthouse | ≥90 desktop, ≥80 mobile (report as *measured*, never estimated) |
| NFR-3 | Engine runtime | <1 ms per forecast call |
| NFR-4 | Slider interaction | ≥55 fps on a mid-range phone |
| NFR-5 | Accessibility | WCAG AA contrast, keyboard-operable, `aria-valuetext` on slider |
| NFR-6 | Privacy | No real PII; demo documents synthetic; no analytics cookies |
| NFR-7 | Resilience | If API is down, the page still fully works (via replay) |
| NFR-8 | Initial JS bundle | ≤180 KB gzipped; below-fold scenes lazy-loaded |

---

## 3.6 Success metrics (reported in README, measured only)

> [!CAUTION]
> Never publish estimated or placeholder numbers. The build fails if `metrics.json` contains `"TBD"`.

- **Engine:** N/N golden fixtures match to the rupee; property tests pass.
- **Extraction** *(if Finisher A ships)*: field-level accuracy percentage on the golden extraction set.
- **Lighthouse:** desktop and mobile scores, LCP value.
- **Live-read latency:** median latency on sample documents (not a promise for arbitrary uploads).

