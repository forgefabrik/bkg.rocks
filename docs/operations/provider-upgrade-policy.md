# Provider Upgrade Policy

This document defines the versioning strategy, upgrade procedures, and rollback protocols for all external components integrated into the BKG platform.

---

## Components Covered

| Component | Type | Criticality |
|-----------|------|-------------|
| AlmostNode | Sandbox runtime | High |
| OpenRouter | AI model gateway | Medium |
| Kilo Code | Agent runtime | High |

---

## Versioning Strategy

### Semantic Versioning

All external components use a `MAJOR.MINOR.PATCH` semver scheme or equivalent.

| Change Type | Version Bump | Review Required |
|-------------|--------------|-----------------|
| Breaking API change | MAJOR | Mandatory architecture review + full test suite |
| New feature, backward compatible | MINOR | Integration test pass + staging validation |
| Bug fix, security patch | PATCH | Security review if applicable; changelog verification |

### Pinning Policy

| Component | Pinning Mechanism | Lock File |
|-----------|------------------|-----------|
| AlmostNode | Docker image tag + commit SHA | `docs/architecture/external-components.md` + infrastructure config |
| OpenRouter | API version + model catalog sync | `packages/ai/src/routing/routing-policy.ts` + database catalog |
| Kilo Code | npm / workspace lockfile | `pnpm-lock.yaml` + `.kilocode/rules/` |

- Floating tags (`latest`, `next`) are prohibited in production configurations.
- When a pin is updated, the previous version SHA must be recorded for reference in the upgrade policy document.

### Staged Rollout

1. **Staging:** Deploy the new version to the staging environment. Run the full integration test suite.
2. **Canary:** Route a small percentage of production traffic to the new version. Monitor error rates, latency, and resource usage.
3. **Production:** If canary succeeds, fully promote. If issues are detected, trigger rollback (see Rollback Procedures).

---

## Upgrade Procedures

### AlmostNode

**Pre-Upgrade Checklist**

- [ ] Review upstream changelog for breaking changes in the sandbox adapter API.
- [ ] Pull the new Docker image and verify the SHA matches the published release.
- [ ] Update `docs/architecture/external-components.md` with the new version and SHA.
- [ ] Confirm policy engine (`packages/sandbox/src/sandbox-policy.ts`) compatibility with the new runtime.
- [ ] Notify the team in the ops channel at least 24 hours before the maintenance window.

**Upgrade Steps**

1. Pull the new image: `docker pull nichochar/almostnode:<version>`
2. Update the Docker Compose / Terraform / Helm value to reference the new tag.
3. Restart sandbox worker pods in a rolling fashion:
   ```bash
   kubectl rollout restart deployment/sandbox-worker -n bkg
   ```
4. Verify sandbox health: run `packages/sandbox` integration tests against the upgraded environment.
5. Confirm policy violation alerts are not firing at elevated rates.
6. Announce completion in the ops channel.

**Post-Upgrade Validation**

- Create and restore a sandbox snapshot successfully.
- Execute a representative command in a fresh session.
- Confirm resource limits are enforced (memory, CPU, disk).

---

### OpenRouter

**Pre-Upgrade Checklist**

- [ ] Review OpenRouter changelog for model additions, removals, or pricing changes.
- [ ] Trigger a manual `model_catalog_sync` run and review new models.
- [ ] Verify routing policies (`packages/ai/src/routing/`) reference valid model identifiers.
- [ ] Confirm the API key has not been rotated or revoked.

**Upgrade Steps**

1. Trigger a catalog sync via the AI service admin endpoint or directly:
   ```bash
   curl -X POST https://api.bkg.internal/ai/catalog/sync \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```
2. Review the sync run in `model_catalog_sync_runs` for errors.
3. Update routing policies in the database or configuration store if model routing needs adjustment.
4. Monitor `model_health_checks` and `model_circuit_breakers` for the first 24 hours.

**Post-Upgrade Validation**

- Execute a low-cost completion request through the AI provider.
- Verify fallback chain integrity by simulating a primary model failure.
- Confirm `provider_usage_records` and `provider_cost_records` are being populated correctly.

**Special Consideration: Model Deprecations**

If OpenRouter deprecates a model that is part of the active routing policy:

1. Update the routing policy to remove the deprecated model within 48 hours of announcement.
2. If a replacement model is available, add it to the fallback chain before removing the old one.
3. If no replacement exists, update the policy to route to alternative models and notify the team.

---

### Kilo Code

**Pre-Upgrade Checklist**

- [ ] Review Kilo Code release notes for breaking changes in runtime, agent modes, or MCP tool interfaces.
- [ ] Review breaking changes to `.kilocode/rules/` manifest format.
- [ ] Back up `.kilocode/`, `.kilo/`, `kilo.json`, and `AGENTS.md` to version control (ensure all changes are committed).
- [ ] Confirm all custom agents and modes (`architect`, `code`, `debug`, `test`, `security`, `release`, `sandbox-integration`) are documented and tested.

**Upgrade Steps**

1. Update the lockfile: `pnpm update @kilo-org/cli` or update the manifest to the target version.
2. Run the Kilo Code integration tests (referenced in the bead scope for Kilo Code integration).
3. Validate that all registered commands, agents, skills, and MCP tools load without errors.
4. Deploy the updated runtime to staging and execute a representative agent session for each mode.
5. Push the updated lockfile and `.kilocode/` changes to the main branch.

**Post-Upgrade Validation**

- Start a test agent session in each mode and confirm expected behavior.
- Verify MCP tool authorization is functioning correctly.
- Confirm BKG rules (no-MVP, scope restrictions, security requirements) are enforced in agent sessions.

---

## Rollback Procedures

### General Principles

- Rollback must be executable within 15 minutes of detecting a production issue.
- Maintain the previous version artifact (Docker image, lockfile state, configuration snapshot) for the duration of the upgrade window.
- Document the rollback in the post-incident review.

### Rollback by Component

#### AlmostNode

1. Update the Docker image tag back to the previous version in the deployment configuration.
2. Trigger a rolling restart of sandbox workers.
3. Validate sandbox health with the integration test suite.
4. If the previous image cannot be pulled, fall back to the last known good image cached in the container registry.

#### OpenRouter

1. Revert routing policy changes to the previous configuration snapshot.
2. If a model was added to the fallback chain, remove it.
3. Trigger a policy reload: `POST /ai/routing/reload` with admin authorization.
4. Monitor `model_circuit_breakers` to ensure traffic is routed to the previous set of models.

#### Kilo Code

1. Revert the lockfile to the previous commit: `git revert HEAD` (if the upgrade commit is the latest).
2. Rebuild and redeploy the runtime.
3. Verify `.kilocode/` and `.kilo/` directories are consistent with the reverted lockfile.
4. Run the Kilo Code integration tests to confirm rollback integrity.

---

## Incident Response

### Severity Levels

| Severity | Description | Response Time | Notification |
|----------|-------------|---------------|--------------|
| SEV-1 | Data breach, secret exposure, sandbox escape | 15 minutes | All-hands + incident commander |
| SEV-2 | Service degradation affecting production users | 30 minutes | On-call + team lead |
| SEV-3 | Staging failure, non-critical regression | 4 hours | Assigned engineer |

### Escalation Path

1. **Detect:** Automated monitoring or manual report identifies the issue.
2. **Assess:** On-call engineer confirms severity and component affected.
3. **Rollback or Mitigate:** Execute the rollback procedure. If rollback is not possible, apply the documented mitigation.
4. **Communicate:** Update the ops channel with status every 15 minutes until resolution.
5. **Post-Incident:** Within 48 hours, complete a post-incident review documenting root cause, resolution steps, and preventive measures.

---

## Records

All upgrades and rollbacks are recorded in the infrastructure change log with the following fields:

- **Date and time (UTC)**
- **Component and version moved to/from**
- **Commit SHA or Docker image digest**
- **Person who executed the change**
- **Validation results** (test suite pass/fail, monitoring metrics)
- **Outcome** (success, partial success, rollback)
- **Link to post-incident review** (if applicable)

---

## References

- `docs/architecture/external-components.md` — Integration details and version pins.
- `docs/security/external-component-threat-model.md` — Security model and threat mitigations.
- `packages/sandbox/src/almostnode-adapter.ts` — AlmostNode adapter entry point.
- `packages/ai/src/providers/openrouter-provider.ts` — OpenRouter integration entry point.
- `.kilocode/rules/` — Kilo Code rules and configuration.
