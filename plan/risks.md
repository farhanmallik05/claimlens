# ClaimLens — Risk Register

> *Known risks, likelihood, impact, and mitigations. Review at the start of each day.*

---

| Risk | Likelihood | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Hero scroll-scrub janks on phones** | Medium | High | No `pin` on touch devices; one-shot timeline instead of scrub; animate `transform`/`opacity` only; test on a real device every day |
| **Render free tier cold start** | High | Medium | UptimeRobot or GitHub Actions cron hits `/healthz` every 10 min; replay fallback is the real safety net — the demo never breaks |
| **LLM extraction wrong or hallucinated** | Medium | Medium | Show `matched/total` count honestly; replay shows correct output; extraction accuracy reported as a measured number, never estimated |
| **Scope creep (adding Finishers when core isn't solid)** | High | High | Strict gates per day (schedule.md §8.1); feature freeze at Sat 10 PM; fallback ladder (schedule.md §8.2) — Finishers drop before core |
| **Misquoting real policy or IRDAI text** | Low | High | Synthetic clauses with synthetic IDs (SP-3.1 etc.); `SAMPLE · SYNTHETIC` watermark on the PDF; never use real insurer names or clause numbers |
| **PII leakage to LLM** | Low | High | Uploads disabled until redaction gate passes (ADR-9); public demo uses synthetic samples only; redact locally before any LLM call |
| **Unverified statistics on the page** | Medium | Medium | V-1 task (qa.md) must pass before ship; footnotes with source links; stats are labelled with their source inline |
| **Solo burnout before submission** | Medium | High | Daily gate ritual (write 3 lines, then sleep); protect sleep before Sat feature freeze; fallback ladder prevents over-engineering |
| **LLM API rate limit during demo** | Low | Medium | Circuit breaker switches to replay instantly; label shown; demo continues without interruption |
| **Vercel build fails at submission time** | Low | High | CI runs on every PR; deploy preview per PR; test cold URL on a phone every evening |
| **Font flash / FOUT** | Medium | Low | `next/font` with `display: swap`; fonts preloaded; Geist Mono for all numbers prevents width jitter |
| **Competitor table misrepresents rivals** | Low | High | Footnote on the table: *"Our assessment of expected typical offerings; capabilities vary by provider."*; no specific competitor names cited |

