# GuardRail AI

Developer-first SOAR platform. Detects vulnerabilities in code, generates production-ready patches, provisions AWS secrets, and orchestrates responses across GitHub, Slack, and CI/CD — automatically.

## What it does

- Detects 50+ vulnerability types (CWE mapped) using Groq AI (Llama 3.3 70B)
- Generates production-ready patches automatically
- Provisions AWS Secrets Manager entries with least-privilege IAM policies
- Posts PR status checks and inline comments on vulnerable lines
- Blocks CI/CD pipeline on critical/high findings
- Sends email (AWS SES) and Slack alerts based on severity

## Architecture

```
Ingest (IDE / GitHub Webhook / CLI / Web UI)
        │
        ▼
Detection Engine (Groq AI — vulnerability analysis, CWE mapping)
        │
        ▼
Remediation Engine (patch generation, AWS secret provisioning)
        │
        ▼
Orchestration (GitHub PR status, inline comments, email, Slack, CI/CD)
```

## Stack

- **API:** Node.js + Express, deployed on AWS EC2
- **AI:** Groq API (Llama 3.3 70B Versatile)
- **AWS:** Secrets Manager, DynamoDB, S3, CloudWatch, SES
- **Frontend:** Next.js 14 + TypeScript + Tailwind
- **IDE Extension:** VS Code (works on Cursor, Windsurf too)
- **CI/CD:** GitHub Actions

## Ingest channels

| Channel | Description |
|---------|-------------|
| VS Code extension | Scan with `Ctrl+Shift+G`, inline diagnostics, quick-fix |
| GitHub webhook | Auto-scan on PR open/update, post status checks |
| GitHub Actions | Block merge on critical/high findings |
| Web UI | Paste or upload code for instant analysis |
| CLI | `node cli/index.js scan <file>` |

## Quick Start

See `RUN-THIS.md` for setup instructions.

**API** runs on EC2. Frontend runs locally:

```bash
cd web
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `web/.env.local` to your EC2 instance URL.

**VS Code extension** — install from `extensions/vscode/guardrail-ai-1.0.1.vsix`:
```
Extensions → ... → Install from VSIX
```

## CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/guardrail.yml` triggers on every PR.

- Scans changed files against the GuardRail API
- Fails the workflow on critical/high findings
- Posts a PR comment with findings and patch links
- On merge to main, auto-deploys to EC2

Required GitHub secret: `GUARDRAIL_API_URL`

## Response actions by severity

| Severity | PR blocked | Email | Slack |
|----------|-----------|-------|-------|
| Critical | Yes | Yes | Yes |
| High | Yes | Yes | No |
| Medium | Comment only | No | No |
| Low | No | No | No |

## Vulnerability coverage

Hardcoded secrets, SQL injection, command injection, XSS, path traversal, SSRF, insecure cryptography, authentication bypass, authorization flaws, and 40+ more — all mapped to CWE IDs.

## Languages supported

JavaScript, TypeScript, Python, Java, Go, Ruby, PHP

## AWS services

- **Secrets Manager** — auto-provisions secrets, 24h TTL cleanup
- **DynamoDB** — audit trail of all scans and findings
- **S3** — session storage
- **CloudWatch** — structured logs, 30-day retention
- **SES** — email notifications

## License

MIT
