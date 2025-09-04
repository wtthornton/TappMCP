# Smart MCP — Vision

## Why this project exists
Strategy people, vibe coders, and non-technical founders often build insecure, untested, and unmaintainable software because they lack software development experience. Smart MCP aims to deliver **production-ready software** for **non-technical users**: plan → design → implement → test → secure → deploy, ensuring proper SDLC while preventing costly mistakes. This tool is designed for **users who need to build software but lack software engineering expertise**.

## North‑star outcomes
- **Production-ready software** from business requirements without software engineering expertise.
- **Quality assurance:** catch security vulnerabilities, bugs, and performance issues before production.
- **SDLC guidance:** proper software development lifecycle for users who don't know the process.
- **Cost prevention:** avoid $50K-$1M+ in damages from security breaches, production bugs, and technical debt.
- **Learning system:** role guides, rules, and lessons learned improve over time.
- **Measurable quality:** a scorecard (A–F) ensures production-ready code, with Security and Coverage emphasized.

## What Smart MCP is
A **Model Context Protocol** server designed for **strategy people, vibe coders, and non-technical founders** who need to build software but lack software engineering expertise. It exposes tools that model the software lifecycle roles:
- **AI-Augmented Developer** → produces **production-ready code** with proper architecture and best practices.
- **Product Strategist** → produces PRODUCT_JSON (user stories, acceptance criteria, business impact).
- **AI Operations Engineer** → produces OPS_JSON (deployment readiness, security compliance, performance metrics).
- **UX/Product Designer** → produces DESIGN_JSON (user experience, accessibility compliance, design patterns).
- **AI Quality Assurance Engineer** → produces QA_JSON (test coverage, quality metrics, security validation).

These roles are **policies**, not people—each is a tool with a contract and measurable outputs, optimized for **non-technical user productivity**.

## Target Audience: Strategy People, Vibe Coders, Non-Technical Founders
Smart MCP is specifically designed for **strategy people, vibe coders, and non-technical founders** who need to build software but lack traditional software development experience. This focus allows us to:

- **Provide role-based guidance** for users who don't know SDLC
- **Ensure quality and security** for users who skip important steps
- **Automate the process** for users who want results without complexity
- **Enable rapid prototyping** with AI-assisted development workflows
- **Deliver working software** without requiring software engineering expertise

**Primary Users:**
- **Strategy People**: Business strategists, product managers, consultants who need to build software
- **Vibe Coders**: Self-taught developers, bootcamp graduates who code by intuition
- **Non-Technical Founders**: Entrepreneurs, startup founders who need to build MVPs

**Not designed for:** Experienced software engineers, enterprise teams, or users who already have strong software development practices.

## Design principles
1. **Strict contracts.** JSON Schemas wrap every tool I/O. Non‑conformant outputs are rejected.
2. **Determinism > heuristics.** Frozen installs (`npm ci` / frozen Python), seeded tests, and version‑pinned tools.
3. **Defense‑in‑depth.** Secrets, SCA, and SAST run at pre‑commit; CI re‑verifies.
4. **Small change budgets.** Cap lines/hunks/paths; split large patches.
5. **Evidence over opinion.** Scorecards, coverage, and rule violations are artifacts, not vibes.
6. **Living docs.** `.md` rule packs and lessons autoupdate; global vs project scoping.

## Scope & non‑goals
**In scope:** single‑repo automation (TS+Python), pre‑commit enforcement, GitHub Actions CI, basic Docker parity, **strategy people, vibe coders, and non-technical founder workflows**.  
**Out of scope:** multi‑repo orchestration, enterprise features, team collaboration tools, CodeQL platform scans, PII redaction systems, mutation testing, **enterprise compliance and governance**, experienced software engineer workflows.

## Success metrics
- **Security:** no verified secrets; 0 new critical/high SCA findings on PRs.
- **Coverage:** ≥85% line & branch on **changed files** (both languages).
- **Complexity:** ESLint complexity ≤10; Radon MI ≥70; duplication ≤5%.
- **Efficiency:** median one‑turn success; ≤400 changed lines/turn; ≤120 per file.
- **Stability:** flake‑free unit tests with fixed seeds and fake timers.
- **User adoption:** 80%+ of strategy people, vibe coders, and non-technical founders use the tool.
- **Cost prevention:** $50K-$1M+ in prevented damages per project.
- **Quality improvement:** B+ average code quality vs D- without guidance.

## Governance & gatekeeping
- **Branch protection:** signed commits and required checks on main branches.
- **PR gates:** fail on Security < C or Coverage < 85% (changed files). High‑risk directories require PR path.
- **Lessons learned:** small/safe lessons auto‑approved; larger ones require human review.

## Delivery roadmap
**Phase 1:** Core MCP tools, pre‑commit policy, minimal CI, scorecard bot, role-based guidance for non-technical users.  
**Phase 2:** Smart orchestration, knowledge pack mixers, lesson auto‑triage, diff‑based coverage gates.  
**Phase 3:** Context broker (Context7) with version‑aware snippets; parity container jobs; ML-powered intelligence.  
**Future enhancements:** Additional integrations and features based on strategy people, vibe coders, and non-technical founder needs and community feedback.

## Risks & mitigations
- **Model drift / schema breakage** → schema‑locked outputs and unit tests on tool handlers.
- **Slow pre‑commit** → run on **staged files**; heavy scans move to CI; allow `--no-verify` only for emergency branches.
- **False positives (security)** → verify secrets where possible; document allowlists with expiry.
