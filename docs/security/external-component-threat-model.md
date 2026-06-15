# External Component Threat Model

This document describes the security model, threat posture, and mitigations for external components integrated into the BKG platform. It covers the AlmostNode sandbox, OpenRouter AI gateway, and Kilo Code agent runtime.

---

## Sandbox Security Model (AlmostNode)

The AlmostNode sandbox isolates untrusted user code execution. The security model is based on defense-in-depth layers: process isolation, filesystem confinement, network restriction, and resource enforcement.

### Trust Boundaries

| Boundary | Direction | Enforcement |
|----------|-----------|-------------|
| Host OS → Sandbox | Inbound | Docker namespace isolation (PID, network, mount, user namespaces) |
| Sandbox → Host FS | Outbound | Read-only root filesystem; writable session workspace mounted with `noexec, nosuid, nodev` |
| Sandbox → Network | Outbound | Blocked by default; egress only through explicit proxy rules |
| BKG API → Sandbox | Bidirectional | Authenticated session tokens; commands validated by the sandbox policy engine |
| Sandbox → BKG API | Inbound | Session-scoped credentials; command results validated before persistence |

### Threat Scenarios and Mitigations

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| Path traversal (`../../etc/passwd`) | High | Medium | Canonical path resolution; reject paths outside session workspace; compare resolved paths against workspace root |
| Symlink escape (`ln -s /etc/evil /workspace/link`) | High | High | Deny symlink resolution to paths outside workspace; reject symlinks in uploaded archives |
| Command injection via package install (`npm install $(reboot)`) | Medium | High | Package allowlist/denylist enforced at install time; shell metacharacters rejected in package specifications; install commands executed with restricted shell |
| Output flooding (gigantic log output exhausting disk) | Medium | Medium | Output capture capped per session; file write size limits enforced; aggressive truncation beyond threshold |
| Timeout abuse (infinite loop consuming CPU) | High | Medium | Hard per-session CPU and wall-clock timeouts; process group kill on timeout |
| Memory exhaustion (allocate all RAM) | Medium | High | Per-session memory limit via cgroup; OOM kills terminated and reported as policy violations |
| Cross-tenant access (reading another user's session files) | Medium | Critical | Session ownership enforced at API layer; filesystem paths include tenant/session ID; zero shared filesystem state between tenants |
| Network data exfiltration | Medium | High | Block all outbound network by default; private IP ranges explicitly blocked; DNS rebinding prevented |
| Secret injection via environment variables | Low | Critical | Secrets injected by host are namespaced and redacted from output; sandbox cannot read host env by default |

### Path Traversal Protection

Implementation in `packages/sandbox/src/browser-node-sandbox.ts`:

1. All file paths are normalized using `path.resolve(sessionWorkspace, userPath)`.
2. The resolved path is checked to start with `sessionWorkspace` using `startsWith` on the normalized absolute paths.
3. Symlinks are either rejected or resolved through a chroot-like jail; symlinks pointing outside the workspace are materialized as errors.

### Symlink Escape Prevention

1. On file upload or archive extraction, symlinks are scanned.
2. Symlink targets are resolved and validated against the workspace root.
3. If the target escapes the workspace, the symlink is rejected and the upload fails with a policy violation event recorded in `sandbox_policy_violations`.

### Secret Redaction

All output captured from sandbox sessions (stdout, stderr, file contents returned to the API) passes through `packages/sandbox/src/sandbox-policy.ts` or an equivalent redaction filter. Regex patterns match common secret formats (API keys, tokens, passwords) and replace matches with `[REDACTED]`. Redaction is applied before output leaves the sandbox boundary.

### Package Allowlist and Denylist

- **Allowlist:** Packages explicitly approved for installation. Defaults to a curated set of safe packages.
- **Denylist:** Packages known to be dangerous (e.g., tools for network scanning, cryptomining, or privilege escalation).
- Policy is configurable per organization via `sandbox_policy` configuration tables.
- Denylist checks run before allowlist checks; a denylisted package is always rejected even if also on the allowlist.

### Resource Bounds

| Resource | Default Limit | Enforcement |
|----------|--------------|-------------|
| CPU time | 30s wall-clock | Process group kill |
| Memory | 512MB | cgroup limit; OOM kill |
| Disk (workspace) | 1GB | Quota check before write |
| Output capture | 10MB per session | Truncation with warning |
| Network | Blocked | iptables / nsenter rules |
| Concurrent processes | 50 | rlimit / cgroup pids_max |

---

## Network Policies

Network access is denied by default. The BKG platform enforces a positive-allowance model for external connectivity.

### Default Deny

- All outbound traffic from sandbox sessions is blocked at the network namespace level.
- Internal service-to-service communication uses internal service mesh or VPC peering; this traffic is not subject to sandbox restrictions.
- DNS queries from sandbox sessions are blocked to prevent DNS tunneling exfiltration.

### Allowed Destinations

External connectivity is permitted only through explicit, audited rules:

| Destination | Protocol | Purpose |
|-------------|----------|---------|
| `registry.npmjs.org:443` | TCP | Package installation in sandbox (optional; disabled by default in production) |
| `api.openrouter.ai:443` | TCP | AI provider API (routed through BKG API layer, not directly from sandbox) |
| `github.com:443` | TCP | Git clone operations in sandbox (optional; allowlisted per session type) |

Private IP ranges are always blocked regardless of allowlist entries:

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `127.0.0.0/8`
- `169.254.0.0/16`
- `::1/128`
- `fc00::/7` (IPv6 unique local)

### DNS Rebinding Prevention

DNS rebinding attacks are mitigated by:

1. Resolving external hostnames to IP addresses before applying allowlist rules.
2. Validating IP addresses against the private IP blocklist after resolution.
3. Enforcing a short TTL cache for resolved IPs to prevent cache poisoning.

### Egress Filtering

For environments running on cloud providers:

- Cloud security groups restrict egress to specific IP ranges and ports.
- Web Application Firewall (WAF) rules block known malicious patterns in outbound HTTP requests.
- Outbound TLS traffic is not decrypted; cert pinning is not enforced due to the dynamic nature of upstream providers.

---

## Secret Handling

BKG integrates with external services that require credentials. This section describes the lifecycle and handling of secrets across all integrations.

### Secret Storage

1. **Source of Truth:** All secrets are stored in the organization's centralized secrets manager.
   - Development: Local encrypted `.env` files or dev secrets manager.
   - Production: HashiCorp Vault, AWS Secrets Manager, or equivalent.

2. **Access Control:** Secrets are accessed via role-based service accounts with least-privilege permissions. Human access is logged and audited.

3. **Rotation:** Secrets are rotated on a scheduled basis (e.g., 90 days for API keys, annually for long-lived credentials). Rotation is automated where possible.

### Secret Injection

Secrets are injected into services via:

- **Environment variables:** Set by the orchestration layer (Kubernetes Secrets, Docker secrets, systemd EnvironmentFiles).
- **Mounted files:** Secrets mounted as read-only files with restricted permissions (mode `0400`).
- **Runtime fetch:** Services fetch secrets at startup from the secrets manager API using a short-lived bootstrap credential.

Direct embedding of secret values in source code, configuration files, or Docker images is prohibited.

### Secret Redaction

All external-facing output is redacted before transmission:

| Output Type | Redaction Point | Mechanism |
|-------------|----------------|-----------|
| AI prompts | `packages/ai/src/safety/secret-redaction.ts` | Regex pattern matching + deterministic replacement |
| Sandbox logs | Sandbox output capture | Pattern-based redaction before log persistence |
| Agent traces | Kilo Code runtime | Runtime-level redaction of env and context |
| HTTP APIs | API gateway / middleware | Request/response body scanning |

### Secret Exposure Response

If a secret is suspected of being exposed:

1. Rotate the secret immediately via the secrets manager.
2. Invalidate the previous secret value at the provider (e.g., revoke OpenRouter API key).
3. Audit access logs for the secret's usage window.
4. Conduct a root cause analysis and document the incident.
5. Update the relevant secret handling procedure if the exposure was due to a process gap.

### Audit Logging

All secret access and external API calls are logged with:

- Timestamp and request ID
- Service/component identifier (e.g., `openrouter-provider`, `almostnode-adapter`, `kilocode-runtime`)
- Action type (`read_secret`, `external_api_call`, `credential_rotation`)
- Outcome (`success`, `failure`, `redacted`)
- Source IP and service account

Logs are retained per the organization's data retention policy. Sensitive fields (secret values, request bodies containing secrets) are never written to logs.

---

## Additional References

- `docs/architecture/external-components.md` — Integration details for each external component.
- `docs/operations/provider-upgrade-policy.md` — Versioning strategy and rollback procedures.
- `packages/sandbox/src/sandbox-policy.ts` — Sandbox policy engine implementation.
- `packages/ai/src/safety/` — Safety and redaction modules for the AI layer.
