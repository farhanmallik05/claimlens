# ClaimLens — Architecture Decision Records (ADRs)

> *Why we made the choices we made. Read before proposing changes to the architecture.*

---

| ADR | Decision | Rationale |
| :--- | :--- | :--- |
| **ADR-1** | The landing page **is** the product demo | Judges spend ~2 minutes. The page must be both the pitch and the proof. A separate "demo tab" loses judges. |
| **ADR-2** | Engine runs in the **browser** (TypeScript) | Instant, offline-capable, works if the API is cold or down. <1 ms per forecast. No round-trip required for Wow 2. |
| **ADR-3** | **Python port** of the engine + shared `golden.json` fixtures | Keeps the "LangGraph Rules Engine agent" claim accurate — the pipeline's rules node is real Python code, not a Node.js subprocess or a stub. The shared fixture set proves both implementations agree. |
| **ADR-4** | **Integer rupees** throughout; `Math.floor` for payable | Eliminates all floating-point drift. Conservative rounding (floor) is correct for the user — they never see more than the policy allows. |
| **ADR-5** | **Replay fallback** labelled honestly | Render free tier cold starts can take ~60 s. The page must never break in front of a judge. Replay provides the same 5-agent sequence with recorded timestamps. The honest label (`"Replayed from a recorded run"`) is non-negotiable. |
| **ADR-6** | **Synthetic clauses** with synthetic IDs (`SP-3.1`, etc.) | Eliminates any risk of misquoting a real IRDAI circular or insurer policy. Legal safety. The `SAMPLE · SYNTHETIC` watermark on the PDF document reinforces this. |
| **ADR-7** | **Cut Supabase Auth and pgvector** for the demo | No judge-visible value in a 2-minute cold visit. Adding auth flow would slow down the demo path. pgvector/RAG adds latency and complexity for no visible payoff. Both are roadmap items. |
| **ADR-8** | **GSAP + Lenis + Motion** for animation | GSAP ScrollTrigger is the industry standard for scroll-scrub storytelling at this fidelity. Lenis provides smooth scroll normalization across browsers. Motion handles spring physics for touch interactions. Combined they give precise control at acceptable bundle size (~48 KB gzipped). |
| **ADR-9** | **Uploads disabled** unless PII redaction gate passes by Saturday 2 PM | Never send unredacted patient data to a third-party LLM. The public demo uses only synthetic samples. Upload capability can be added post-hackathon once redaction is production-tested. |

---

## Reviewing an ADR

Before changing any of these decisions:
1. State which ADR you are revisiting.
2. Explain what has changed (new constraint, new evidence, time pressure).
3. Assess the impact on the remaining ADRs.
4. Document the revised decision here.

