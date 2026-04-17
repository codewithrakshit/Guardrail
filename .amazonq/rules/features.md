# GuardRail AI — Features & Hackathon Roadmap

## ✅ Implemented Features

### Security Detection
- Hardcoded secrets & API keys
- SQL injection
- Cross-site scripting (XSS)
- Path traversal
- Insecure cryptography
- Command injection
- 50+ vulnerability types via Bedrock Nova Lite

### Automated Remediation
- Production-ready patch generation
- AWS Secrets Manager provisioning
- Least-privilege IAM policy generation
- 24-hour TTL secret cleanup
- Per-session resource isolation

### Platform
- Web UI (Next.js 14) — scan, results, dashboard, demo
- REST API (Express) — scan, result, logs, session, demo
- VS Code extension — inline diagnostics, quick-fix, auto-scan
- Docker support
- DynamoDB audit trail + CloudWatch logging

---

## 🚧 In Progress / Planned Improvements

> Update this section as features are built during the hackathon.

### High Priority
- [ ] Real-time scan progress (SSE or WebSocket)
- [ ] Multi-file / repo-level scanning
- [ ] Severity scoring with CVSS-style ratings
- [ ] One-click "Apply All Fixes" in web UI

### Medium Priority
- [ ] GitHub PR integration (scan on PR open)
- [ ] Scan history with diff comparison
- [ ] Export report as PDF/JSON
- [ ] Shareable scan result links

### Nice to Have
- [ ] JetBrains plugin
- [ ] CLI tool (`guardrail scan ./src`)
- [ ] Webhook support for CI/CD pipelines
- [ ] Team/org accounts

---

## 🏆 Hackathon Demo Flow

1. User pastes vulnerable code into web UI
2. GuardRail scans via Bedrock Nova Lite
3. Vulnerabilities shown with severity + explanation
4. Patched code shown in diff viewer
5. AWS secret auto-provisioned (if hardcoded creds found)
6. Audit log visible in dashboard

**Key wow moments:**
- Speed of detection (< 3s)
- Quality of AI-generated patches
- Automatic AWS secret provisioning
- IDE extension live demo (red squiggly → lightbulb → fixed)
