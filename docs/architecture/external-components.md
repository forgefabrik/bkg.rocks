# External Component Integrations

This document describes the external components integrated into the BKG platform: AlmostNode, OpenRouter, and Kilo Code. Each integration is documented with repository information, versions, installation, licensing, security considerations, limitations, and upgrade strategy.

---

## Table of Contents

1. [AlmostNode](#almostnode)
2. [OpenRouter](#openrouter)
3. [Kilo Code](#kilo-code)

---

## AlmostNode

AlmostNode provides a sandboxed browser and Node.js runtime for executing untrusted code with strict security boundaries. It is used by the `packages/sandbox` layer to run user code, install packages, and serve preview sessions.

### Repository

- **Homepage:** https://github.com/nichochar/almostnode (or equivalent upstream)
- **Primary use:** Runtime for sandbox sessions via `packages/sandbox/src/almostnode-adapter.ts`

### Versions and SHAs

| Environment | Version | Commit SHA | Pinned In |
|-------------|---------|------------|-----------|
| Development | `0.x` (tracking upstream) | tracked via lockfile | `pnpm-lock.yaml` / adapter config |
| Production   | Pinned per release | recorded in `docs/operations/provider-upgrade-policy.md` | infrastructure Terraform / Helm values |

Pin exact versions in `packages/sandbox/src/almostnode-adapter.ts` or a dedicated version manifest. Do not rely on floating tags in production.

### Installation Methods

- **Docker (preferred):** `docker pull nichochar/almostnode:<version>`
- **npm:** `npm install almostnode` (for local development/testing only)
- **Binary release:** Download from GitHub Releases for bare-metal environments.

#### Package Allowlist and Denylist

The sandbox restricts package installation through policies defined in `packages/sandbox/src/sandbox-policy.ts`. Only packages matching the allowlist can be installed during sessions; denylisted packages are rejected at install time.

### License

- Review upstream license (commonly MIT or Apache-2.0) and confirm compatibility with BKG distribution.
- Record the approved license in `docs/architecture/external-components.md` (this document) and verify during upgrade.

### Security Notes

- AlmostNode runs untrusted user code with network blocked by default.
- Private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `::1`) are blocked at the routing layer.
- File system access is confined to the session workspace; path traversal protection is enforced.
- Symlink escapes are detected and rejected.
- Secret redaction is applied to all logs and outputs before they leave the sandbox boundary.
- Resource bounds (CPU, memory, disk, timeout) are enforced per session.

### Known Limitations

- Browser coverage follows upstream headless Chrome/Chromium availability; legacy Edge is not supported.

- File system operations lack atomic rename semantics on network-backed volumes; use local tmpfs for transactional snapshots.
- Concurrency limit is bounded by available Node worker threads; large fleets require horizontal scaling of sandbox workers.
- Package installation is network-dependent; transient registry failures should be retried with backoff.

### Upgrade Strategy

- Pin to a specific version; track upstream changelog for breaking changes in the adapter API.
- Upgrade in staging first; run the full sandbox integration test suite (`packages/sandbox` integration tests) before promoting to production.
- Maintain rollback by redeploying the previous Docker image tag if the new version introduces regressions.

---

## OpenRouter

OpenRouter is an AI model gateway/provider used by the `packages/ai` layer. It normalizes access to multiple LLM providers behind a single API, handling capability normalization, routing policies, and fallback chains.

### Repository

- **Homepage:** https://openrouter.ai
- **Docs:** https://openrouter.ai/docs
- **Primary use:** `packages/ai/src/providers/openrouter-provider.ts`

### Versions and SHAs

| Environment | Version | Notes |
|-------------|---------|-------|
| API schema   | `v1` | OpenRouter uses OpenAI-compatible API; version pinned in provider client configuration |
| Client SDK   | Direct HTTP calls (no SDK dependency) | Keeps attack surface minimal |

OpenRouter does not require a pinned commit SHA for the API itself, but the model catalog version is tracked via `model_catalog_sync_runs` in the database. The routing policy and fallback chain configuration is version-controlled in `packages/ai/src/routing/`.

### Installation Methods

- **API key registration:** Obtain an API key from https://openrouter.ai/settings/keys
- **Environment variable:** `OPENROUTER_API_KEY` must be set on all AI service instances.
- **Network:** All outbound requests go to `https://openrouter.ai/api/v1/chat/completions` (or configured base URL).

No local installation is required; OpenRouter is accessed entirely over HTTPS.

### License

- OpenRouter service terms govern API usage. Review https://openrouter.ai/terms for commercial use, data retention, and model provider licenses.
- Model-specific licenses vary by provider (e.g., Meta Llama, Mistral, OpenAI). Check the model catalog entry before enabling a new model for production traffic.

### Security Notes

- The `OPENROUTER_API_KEY` is a bearer token; store it in the secrets manager and inject via environment variable.
- All AI requests pass through `packages/ai/src/safety/secret-redaction.ts` before transmission; embedded secrets are stripped from prompts.
- Data minimization rules in `packages/ai/src/safety/data-minimization.ts` reduce context size sent to external providers.
- Free-only filter enforces that only models with zero cost are routed when the free-only policy is active.
- Quarantine and circuit breaker patterns prevent repeated calls to failing or misbehaving models.

### Known Limitations

- OpenRouter is a third-party proxy; latency depends on both OpenRouter infrastructure and the upstream model provider.
- Rate limits are governed by OpenRouter and the underlying provider; the BKG circuit breaker (`packages/ai/src/routing/circuit-breaker.ts`) provides local protection.
- Free models have variable availability and may be deprioritized or removed without notice.
- Structured output support varies by model; the schema repair layer in `packages/ai/src/execution/structured-output.ts` handles minor deviations.

### Upgrade Strategy

- Model additions and removals are synced via `model_catalog_sync` runs; do not hardcode model identifiers in application code.
- Routing policies are evaluated via `model_selector.ts`; update policies through configuration, not code, where possible.
- Rollback is handled by reverting routing policy changes or switching to a fallback model in the routing chain.
- Monitor `model_health_checks` and `model_circuit_breakers` tables for degraded model availability after OpenRouter-side changes.

---

## Kilo Code

Kilo Code is the code intelligence and agent runtime platform (kilocode.ai). It provides the agent execution environment, skill system, and orchestration layer used throughout BKG.

### Repository

- **Homepage:** https://github.com/kilo-org/kilocode
- **Primary use:** Agent runtime (`AGENTS.md`), MCP tools, skills, and mode definitions in `.kilocode/`

### Versions and SHAs

| Component | Version | Pinned In |
|-----------|---------|-----------|
| CLI / runtime | Lockfile-pinned (e.g., `package.json`, `pnpm-lock.yaml`) | root manifest |
| Rules / skills | Git-tracked in `.kilocode/rules/` and `.kilo/` | repository |
| Models | Referenced in `packages/ai` catalog | database + config |

Track the Kilo Code runtime version via the root `package.json` and lockfile. For Mastra/skill versions, pin the git SHA or tag in `.kilocode/rules/` manifests.

### Installation Methods

- **npm / pnpm workspace:** `pnpm install` at the monorepo root installs local packages and hooks.
- **CLI:** Install via `npm install -g @kilo-org/cli` or use the workspace-local binary.
- **Agent configuration:** `.kilo/command/*.md`, `.kilo/agent/*.md`, and `kilo.json` registry commands, agents, skills, permissions, MCPs, and providers.

### License

- Kilo Code is proprietary software. The BKG project integrates it under the terms of the Kilo Code license agreement.
- Custom rules and skills authored for BKG (`.kilocode/rules/`) are project-internal assets; ensure they do not contain third-party code with incompatible licenses.

### Security Notes

- Kilo Code runtime executes within the BKG security perimeter; agent identities and permissions are governed by `kilo.json` and the permission system.
- MCP tools are server-side authorized; only registered tools with matching scopes are exposed to agents.
- Skill loading follows the `.kilocode/` conventions; do not load untrusted skill manifests from external sources.
- The `BKG rules` in `AGENTS.md` enforce scope restrictions, the no-MVP rule, and security requirements for all agents.
- Secret handling is delegated to the BKG secrets manager; Kilo Code runtime must not log or persist raw secret values.

### Known Limitations

- Agent concurrency is bounded by the runtime worker pool; large agent fleets require runtime scaling.
- Context window limits are model-dependent and enforced at the provider layer (`packages/ai`).
- Skill execution is synchronous within the agent loop; long-running skills block the agent session unless explicitly parallelized.
- MCP tool timeouts must be configured per tool to prevent agent deadlock.

### Upgrade Strategy

- Kilo Code runtime upgrades are performed via lockfile updates (`pnpm update @kilo-org/cli`) followed by integration testing.
- Rules and skills are backward-compatible within major versions; review breaking changes in Kilo Code release notes before updating `.kilocode/` manifests.
- Rollback is achieved by reverting the lockfile and `.kilocode/` directory to the previous git state and redeploying.
- BKG custom agents and modes (`architect`, `code`, `debug`, `test`, `security`, `release`, `sandbox-integration`) must be independently validated after a Kilo Code runtime upgrade.

---

## Cross-Cutting Concerns

### Secret Handling

All external components require credentials or API keys. Apply the following rules universally:

1. Store secrets in the centralized secrets manager (e.g., Vault, AWS Secrets Manager, env-level config).
2. Inject secrets via environment variables or mounted files; never commit them to the repository.
3. Apply secret redaction at every boundary where data crosses from BKG to an external component.
4. Rotate credentials on a regular cadence and immediately upon suspected exposure.

### Audit and Logging

- Log all external API calls with request IDs, timestamps, and component identifiers.
- Never log raw secret values, full API request bodies containing secrets, or Personally Identifiable Information (PII).
- Retain audit logs per the organization's data retention policy.

### Maintenance Windows

- Schedule external component upgrades during low-traffic maintenance windows.
- Announce planned upgrades to the team via the ops channel at least 24 hours in advance.
- Maintain a runbook in `docs/operations/provider-upgrade-policy.md` referencing each component's specific upgrade checklist.
