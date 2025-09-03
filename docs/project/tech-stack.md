# Smart MCP — Tech Stack

## Languages & Runtimes
- **TypeScript (Node.js LTS)** — MCP server + tooling.
- **Python 3.12+** — when projects under test include Python.
- **Bash** — hooks and CI glue.

## Key Libraries
- **MCP SDK:** `@modelcontextprotocol/sdk` (tool/server contracts).
- **Validation:** `zod` for runtime schemas; JSON Schemas for tool I/O.
- **Linting/Formatting:** `eslint`, `eslint-config-prettier`, `prettier`, `ruff`.
- **Typing:** `tsc --strict`, `mypy --strict`.
- **Testing:** `vitest` (V8/Istanbul coverage), `pytest` + `pytest-cov`, `pytest-randomly`.
- **Security (pre-commit):** `gitleaks` (or `trufflehog`), `osv-scanner`, `pip-audit`, `semgrep` (OWASP + LLM rules).
- **Complexity & Duplication:** ESLint `complexity`, `radon` (MI/CC), `jscpd`.

## Package & Env Management
- **Node:** `npm ci` in CI; lockfile required.
- **Python:** prefer `uv` or `pip-tools` with frozen sync for reproducibility.
- **Docker parity:** `Dockerfile` builds server and runs basic tool smoke tests.

## Repository Structure (high level)
```
/src
  /core           # state, policy
  /tools          # MCP tool handlers (smart.*, mem.*, ll.*, metrics.*)
  /brokers        # Context7 and external knowledge brokers
  /memory         # knowledge packs & lessons adapters
  /sandbox        # runners/parsers for scanners and tests
/docs
  /roles          # ai-augmented-developer.md, product-strategist.md, ai-operations-engineer.md, ux-product-designer.md, ai-quality-assurance-engineer.md
  /rules          # arch_guidelines.md, coding_standards.md, test_strategy.md
  /knowledge      # project knowledge anchors
  /lessons        # global & project JSONL lessons
  /project        # vision.md, tech-stack.md
  /setup          # ai-role-setup.md
/schemas          # JSON Schemas for tool I/O
.github/workflows # verify.yml, scorecard.yml, scorecard-pr.yml
policy.json       # budgets, risk globs, enforcement toggles
mcp.config.json   # wire-up for Cursor/Claude
Dockerfile        # Linux runtime container
docker-compose.yml # Development and production containers
```

## Pre-commit Policy (tools expected locally)
- `pre-commit` framework (Python).
- Hooks: Prettier, ESLint, Ruff, mypy, tsc, Vitest (related), pytest (quick), Semgrep (light), OSV-Scanner, pip-audit, Gitleaks/TruffleHog, ESLint complexity, Radon MI, snapshot guard.

## CI/CD (GitHub Actions)
- **verify.yml** — build, typecheck, lint, unit tests (full).
- **scorecard-pr.yml** — metrics collect/score/report; sticky PR comment; security gate.
- Caches keyed on lockfiles; `npm ci` + frozen Python install; artifacts uploaded for audit.

## Observability & Logs
- Structured logs (JSON) for tool handlers (phase, taskId, risk, counts).
- Minimal PII in logs; redact secrets automatically.
- Keep logs short and link to artifacts (coverage, metrics, scans).

## Configuration & Policy
- **policy.json** drives budgets and risk globs (e.g., `**/auth/**`, `**/billing/**`, `**/migrations/**`).
- High‑risk writes go via PR path only.
- Thresholds: coverage ≥85% on changed files; complexity limits; snapshot guard.

## Local Dev Requirements
- Node.js LTS, Python 3.12+
- `pre-commit` installed (`pip install pre-commit`)
- Language toolchains available on PATH (eslint, prettier, ruff, mypy, tsc, vitest, pytest)
- **Docker** for Linux runtime environment
- **Bash** (available on Windows via WSL, Git Bash, or similar)

## Development Environment
- **Development OS**: Windows (with bash available)
- **Runtime OS**: Linux (Docker container)
- **Container Strategy**: Development and production containers for consistent Linux runtime

## Security Footprint
- Pre-commit scans run on **staged files** for speed.
- CI repeats heavier scans (full Semgrep, full tests) and enforces PR gates.
- Signed commits required on protected branches (repo setting).

## Future Options
- Artifact signing (Sigstore), provenance attestations.
- Language-specific SAST extensions.
- Advanced coverage diff tooling per path.
