# Notes

## Decisions Made
- Pivoting to SOAR framing — "Developer-first SOAR for the SDLC"
- Not competing with SOC tools — competing with Snyk/SonarQube but with auto-remediation
- GitHub webhook is the single most important feature to ship next
- CLI is underrated for demo impact — `npx guardrail scan ./src` is very visual

## Risks & Concerns
- "Developer-first SOAR" risks being called "just a SAST tool" by judges who know SOAR
  - Mitigation: must have 2-3 visible response actions (PR block + email + Slack)
- GitHub webhook needs a public URL to receive events — need ngrok for local demo or deploy API first
- Rakshit and me are arguing over features — get them resolved and start working
- Debug logs in secret-lifecycle-manager.js are leaking secret values/sizes — fix before any demo

## Build Order (agreed)
1. Fix security leaks (debug logs, prompt injection on filename)
2. GitHub webhook + PR status check
3. Notifier service (SES email + Slack)
4. GitHub Actions workflow file
5. CLI tool
6. UI polish

## Open Questions
- Do we deploy the API publicly before the hackathon or demo with ngrok?
- GitHub Action (reusable) — is there time to package it properly?
- Slack notification — do we have a workspace to demo this in?

## UI Notes
- Improve the UI to be sleek and functional, shouldn't feel laggy and slow
- Improve the README — it is very bloated and messy

## Ingest Paths Decided
| Path | Ship? |
|------|-------|
| Web UI paste | ✅ done |
| File upload | ✅ done |
| VS Code extension | ✅ done |
| GitHub webhook | 🔲 next |
| GitHub Actions CI | 🔲 next |
| CLI | 🔲 after webhook |
| GitLab | stretch |
