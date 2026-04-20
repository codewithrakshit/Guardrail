# GuardRail AI — Quick Start

## API Server
Running on EC2. Set your instance IP in environment variables.

Health check:
```bash
curl http://<EC2_IP>:3001/health
```

---

## Web UI (Frontend)
Run locally:
```bash
cd web
npm install
npm run dev
```
Opens at `http://localhost:3000`

Set API URL in `web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://98.93.184.65:3001
```

---

## VS Code Extension
Install from `extensions/vscode/guardrail-ai-1.0.1.vsix`:
```
VS Code → Extensions → ... → Install from VSIX
```
Scan shortcut: `Ctrl+Shift+G`

---

## CLI
```bash
cd cli
npm install
node index.js scan <file>
```

---

## CI/CD Pipeline
GitHub Actions workflow at `.github/workflows/guardrail.yml`

Triggers on every PR — scans changed files, blocks merge on critical/high findings.

Required GitHub secret: `GUARDRAIL_API_URL=http://<EC2_IP>:3001`

---

## What's Running
- API: EC2 instance on port <EC2_IP>
- GitHub webhook: configured on repo
- Notifications: AWS SES + Slack
- Audit logs: DynamoDB + CloudWatch
