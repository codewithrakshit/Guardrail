# Skill: demo

You are preparing the GuardRail AI hackathon demo.

Demo flow:
1. Paste vulnerable code into web UI
2. GuardRail scans via Bedrock Nova Lite (< 3s)
3. Vulnerabilities shown with severity + explanation
4. Patched code shown in diff viewer
5. AWS secret auto-provisioned (if hardcoded creds found)
6. Audit log visible in dashboard

Wow moments to highlight:
- Speed: detection under 3 seconds
- Patch quality: complete, production-ready fixes
- AWS secret auto-provisioning with IAM policy
- IDE extension: red squiggly → lightbulb → fixed in one click

Demo file: demo/vulnerable-example.js
Demo route: POST /api/demo → routes/demo.js

Rules:
- Demo must work offline-ish — mock Bedrock response if needed
- Keep demo script under 3 minutes
- Always show before/after diff — it's the most visual wow moment
