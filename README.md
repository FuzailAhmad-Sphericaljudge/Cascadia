# Cascadia

Cascadia is a safety-governed cyber decision platform for critical infrastructure.

## Included foundations

- Strict TypeScript npm workspace and shared Zod contracts.
- Tenant-aware API foundation with JWT authentication and role-based authorization.
- Durable agent initialization, append-only post storage, and a read-only feed.
- Audit trail, data-classification, retention, and human-approval policy primitives.
- Tests for contracts, timestamps, authorization, duplicate initialization, and feed no-op behavior.
- PostgreSQL migrations and production persistence adapter.
- Organization onboarding, asset/dependency inventory, CSV/CMDB/CycloneDX imports, and SIEM/EDR event ingestion.
- Vulnerability context, critical-service modeling, explainable attack paths, blast-radius analysis, and evidence-linked MITRE ATT&CK mappings.
- Policy-governed response simulation, residual-risk comparison, rollback requirements, and multi-operator approvals with execution permanently disabled at this phase.
- Live signed integration webhooks, encrypted connector secrets, replay protection, immutable delivery evidence, and STIX 2.1 threat-indicator ingestion.
- Operator-controlled TAXII collection synchronization with safe outbound networking, pagination, checkpoints, bounded retries, and durable attempt evidence.
- Explainable organization-specific ML baselines, idempotent anomaly evaluation, model cards, and human-reviewed findings over real stored telemetry.
- Durable incident operations with SLA targets, controlled lifecycle transitions, evidence timelines, analyst tasks, and human-confirmed signal correlation.
- Cinematic Three.js landing experience and responsive analyst console connected to real assets, telemetry, ML findings, attack paths, incidents, responses, and integrations.
- Production OpenID Connect SSO with PKCE, enforced MFA claims, administrator-controlled enrollment, opaque HttpOnly sessions, CSRF protection, durable revocation, and an identity access console.
- Production operations with readiness/liveness probes, protected Prometheus metrics, redacted structured logs, security headers, patched rate limiting, graceful shutdown, containers, CI, backup tooling, and a live System Health console.

## Run locally

1. Copy `.env.example` to `.env` and set strong credentials.
2. Run `npm.cmd install`.
3. Start PostgreSQL with `docker compose up -d postgres`.
4. Run `npm.cmd run migrate -w @cascadia/api`.
5. Run `npm.cmd run verify`.
6. Run `npm.cmd run dev` to start the API and frontend together.
7. Configure OIDC using `docs/phase-9-identity-access.md`, or in development run `npm.cmd run dev:token`, then open `http://127.0.0.1:5173`.

The API deliberately does not execute response actions. Live integration content is treated as untrusted evidence, and every response recommendation remains human-controlled.

## Free-tier demo deployment

For a hackathon or short-lived demonstration, use the Render Blueprint in `render.yaml`. See [the free-tier deployment guide](docs/free-tier-development.md) for limits and the required future production upgrades.

For the complete remaining build and production sequence, see [the final delivery roadmap](docs/final-delivery-roadmap.md).
