# Smart MCP — Vision

## Why this project exists
Modern AI coding workflows often waste tokens and time by iterating blindly. Smart MCP aims to deliver **single‑turn success**: plan → design → patch → scan → unit‑test → auto‑review → (auto)commit, minimizing retries while raising security and quality bars.

## North‑star outcomes
- **One or two turns** to a correct, reviewable change.
- **Pre‑commit first:** catch secrets, vulns, style, types, complexity, and coverage locally—before CI.
- **Schema‑locked orchestration:** tools accept/return strict JSON; LLMs conform to structure.
- **Diffs, not blobs:** minimal, focused patches that are easy to review.
- **Living knowledge:** role guides, rules, and lessons learned improve over time.
- **Measurable quality:** a scorecard (A–F) gates merges, with Security and Coverage emphasized.

## What Smart MCP is
A **Model Context Protocol** server exposing tools that model the software lifecycle roles:
- **AI-Augmented Developer** → produces **unified diffs** under budget constraints with AI assistance.
- **Product Strategist** → produces PRODUCT_JSON (user stories, acceptance criteria, business impact).
- **AI Operations Engineer** → produces OPS_JSON (deployment readiness, security compliance, performance metrics).
- **UX/Product Designer** → produces DESIGN_JSON (user experience, accessibility compliance, design patterns).
- **AI Quality Assurance Engineer** → produces QA_JSON (test coverage, quality metrics, security validation).

These roles are **policies**, not people—each is a tool with a contract and measurable outputs.

## Design principles
1. **Strict contracts.** JSON Schemas wrap every tool I/O. Non‑conformant outputs are rejected.
2. **Determinism > heuristics.** Frozen installs (`npm ci` / frozen Python), seeded tests, and version‑pinned tools.
3. **Defense‑in‑depth.** Secrets, SCA, and SAST run at pre‑commit; CI re‑verifies.
4. **Small change budgets.** Cap lines/hunks/paths; split large patches.
5. **Evidence over opinion.** Scorecards, coverage, and rule violations are artifacts, not vibes.
6. **Living docs.** `.md` rule packs and lessons autoupdate; global vs project scoping.

## Scope & non‑goals
**In scope:** single‑repo automation (TS+Python), pre‑commit enforcement, GitHub Actions CI, basic Docker parity.  
**Out of scope (initially):** multi‑repo orchestration, CodeQL platform scans, PII redaction systems, mutation testing.

## Success metrics
- **Security:** no verified secrets; 0 new critical/high SCA findings on PRs.
- **Coverage:** ≥85% line & branch on **changed files** (both languages).
- **Complexity:** ESLint complexity ≤10; Radon MI ≥70; duplication ≤5%.
- **Efficiency:** median one‑turn success; ≤400 changed lines/turn; ≤120 per file.
- **Stability:** flake‑free unit tests with fixed seeds and fake timers.

## Governance & gatekeeping
- **Branch protection:** signed commits and required checks on main branches.
- **PR gates:** fail on Security < C or Coverage < 85% (changed files). High‑risk directories require PR path.
- **Lessons learned:** small/safe lessons auto‑approved; larger ones require human review.

## Delivery roadmap
**Phase 1:** Core MCP tools, pre‑commit policy, minimal CI, scorecard bot.  
**Phase 2:** Knowledge pack mixers, lesson auto‑triage, diff‑based coverage gates.  
**Phase 3:** Context broker (Context7) with version‑aware snippets; parity container jobs.  
**Phase 4:** Optional integrations (artifact signing, provenance, advanced analytics).

## Risks & mitigations
- **Model drift / schema breakage** → schema‑locked outputs and unit tests on tool handlers.
- **Slow pre‑commit** → run on **staged files**; heavy scans move to CI; allow `--no-verify` only for emergency branches.
- **False positives (security)** → verify secrets where possible; document allowlists with expiry.
