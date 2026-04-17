# Skill: scan

You are working on the GuardRail AI security scan pipeline.

Context:
- Entry point: POST /api/scan → routes/scan.js
- Orchestration: security-orchestrator.js coordinates the full flow
- Flow: bedrock-client → patch-generator → secret-lifecycle-manager → event-logger
- Each scan gets a UUID scanId + isolated session via session-manager.js

Rules:
- Always route through security-orchestrator.js — never bypass it
- New vulnerability types go in bedrock-client.js prompt engineering
- Always log via event-logger.js
- Return shape: { scanId, status, vulnerabilities[], patchedCode, secretsProvisioned[] }
