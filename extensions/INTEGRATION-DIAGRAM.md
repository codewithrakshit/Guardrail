# GuardRail AI - Complete Integration Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌───────────────┐ │
│  │   Web Browser        │    │   VS Code            │    │  JetBrains    │ │
│  │                      │    │                      │    │  IDEs         │ │
│  │  • Scan page         │    │  • Extension         │    │  • Plugin     │ │
│  │  • Results view      │    │  • Inline errors     │    │  • Annotator  │ │
│  │  • Dashboard         │    │  • Quick fixes       │    │  • Intentions │ │
│  │  • Demo              │    │  • Status bar        │    │  • Actions    │ │
│  └──────────┬───────────┘    └──────────┬───────────┘    └───────┬───────┘ │
│             │                           │                        │          │
└─────────────┼───────────────────────────┼────────────────────────┼──────────┘
              │                           │                        │
              │         HTTPS             │         HTTPS          │  HTTPS
              │                           │                        │
              └───────────────┬───────────┴────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Express.js API Server                              │ │
│  │                      (Node.js + TypeScript)                             │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                         │ │
│  │  POST /api/scan                                                         │ │
│  │  ├─ Accepts: code, language, filename                                  │ │
│  │  └─ Returns: sessionId                                                 │ │
│  │                                                                         │ │
│  │  GET /api/result/{sessionId}                                           │ │
│  │  ├─ Returns: status, vulnerabilities, patchedCode                      │ │
│  │  └─ Polls until completed                                              │ │
│  │                                                                         │ │
│  │  GET /api/logs                                                         │ │
│  │  └─ Returns: audit trail, session history                             │ │
│  │                                                                         │ │
│  │  POST /api/demo                                                        │ │
│  │  └─ Returns: pre-configured demo results                              │ │
│  │                                                                         │ │
│  └────────────────────────────┬───────────────────────────────────────────┘ │
│                                │                                             │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ORCHESTRATION LAYER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Security Orchestrator                              │  │
│  │                                                                       │  │
│  │  1. Session Creation                                                  │  │
│  │     └─ Generate unique session ID                                    │  │
│  │     └─ Initialize isolated namespace                                 │  │
│  │                                                                       │  │
│  │  2. Code Analysis                                                     │  │
│  │     └─ Send to Bedrock Client                                        │  │
│  │     └─ Parse AI response                                             │  │
│  │                                                                       │  │
│  │  3. Vulnerability Processing                                          │  │
│  │     └─ Classify severity                                             │  │
│  │     └─ Extract secrets                                               │  │
│  │                                                                       │  │
│  │  4. Remediation                                                       │  │
│  │     └─ Generate patches                                              │  │
│  │     └─ Provision secrets                                             │  │
│  │                                                                       │  │
│  │  5. Logging & Cleanup                                                 │  │
│  │     └─ Log events                                                    │  │
│  │     └─ Schedule TTL cleanup                                          │  │
│  │                                                                       │  │
│  └───────────┬──────────────────────────────────────────────────────────┘  │
│              │                                                               │
└──────────────┼───────────────────────────────────────────────────────────────┘
               │
               ├─────────────────┬─────────────────┬─────────────────┐
               │                 │                 │                 │
               ▼                 ▼                 ▼                 ▼
┌──────────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Bedrock Client      │ │ Patch        │ │ Secret       │ │ Event        │
│                      │ │ Generator    │ │ Lifecycle    │ │ Logger       │
│  • Nova Lite API     │ │              │ │ Manager      │ │              │
│  • Prompt templates  │ │ • AST parse  │ │              │ │ • DynamoDB   │
│  • Response parsing  │ │ • Code gen   │ │ • Create     │ │ • CloudWatch │
│  • Error handling    │ │ • Diff gen   │ │ • Rotate     │ │ • Metrics    │
│                      │ │              │ │ • Delete     │ │              │
└──────────┬───────────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                    │                │                │
           └────────────────────┴────────────────┴────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AWS INFRASTRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  Amazon Bedrock  │  │  Secrets Manager │  │    DynamoDB      │         │
│  │                  │  │                  │  │                  │         │
│  │  • Nova Lite     │  │  • Secret store  │  │  • Sessions      │         │
│  │  • AI analysis   │  │  • IAM policies  │  │  • Logs          │         │
│  │  • Structured    │  │  • Rotation      │  │  • Metrics       │         │
│  │    output        │  │  • 24h TTL       │  │  • Audit trail   │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │       S3         │  │   CloudWatch     │  │      IAM         │         │
│  │                  │  │                  │  │                  │         │
│  │  • Temp files    │  │  • Logs          │  │  • Roles         │         │
│  │  • Patches       │  │  • Metrics       │  │  • Policies      │         │
│  │  • Encrypted     │  │  • Alarms        │  │  • Permissions   │         │
│  │  • Auto-delete   │  │  • Dashboards    │  │  • Least priv    │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Hardcoded Secret Detection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Developer Action                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Developer writes code in VS Code:
┌─────────────────────────────────────────────────────────────┐
│ const apiKey = 'sk-1234567890abcdef';                       │
│ fetch('https://api.example.com', {                          │
│   headers: { 'Authorization': `Bearer ${apiKey}` }          │
│ });                                                          │
└─────────────────────────────────────────────────────────────┘

Developer presses Ctrl+Shift+G or saves file

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Extension → API                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

POST /api/scan
{
  "code": "const apiKey = 'sk-1234567890abcdef';...",
  "language": "javascript",
  "filename": "api-client.js"
}

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Security Orchestrator                                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. Create session: session_abc123
2. Store code in S3: s3://guardrail/sessions/abc123/original.js
3. Send to Bedrock for analysis

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Amazon Bedrock Analysis                                              │
└─────────────────────────────────────────────────────────────────────────────┘

AI analyzes code and returns:
{
  "vulnerabilities": [
    {
      "type": "hardcoded_secret",
      "severity": "critical",
      "line": 1,
      "value": "sk-1234567890abcdef",
      "message": "Hardcoded API key detected"
    }
  ]
}

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Secret Provisioning                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

1. Create secret in AWS Secrets Manager:
   SecretId: guardrail/prod/api-key-abc123
   Value: { "apiKey": "sk-1234567890abcdef" }
   
2. Set 24h TTL for auto-deletion

3. Create IAM policy for least-privilege access

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: Patch Generation                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Generate secure code:
┌─────────────────────────────────────────────────────────────┐
│ const AWS = require('aws-sdk');                             │
│ const secretsManager = new AWS.SecretsManager();            │
│                                                              │
│ async function getApiKey() {                                │
│   const secret = await secretsManager.getSecretValue({      │
│     SecretId: 'guardrail/prod/api-key-abc123'              │
│   }).promise();                                             │
│   return JSON.parse(secret.SecretString).apiKey;           │
│ }                                                            │
│                                                              │
│ const apiKey = await getApiKey();                           │
│ fetch('https://api.example.com', {                          │
│   headers: { 'Authorization': `Bearer ${apiKey}` }          │
│ });                                                          │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: Logging                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Log to DynamoDB:
{
  "sessionId": "abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "vulnerabilityType": "hardcoded_secret",
  "severity": "critical",
  "secretCreated": "guardrail/prod/api-key-abc123",
  "status": "completed"
}

Log to CloudWatch:
[INFO] Session abc123: Hardcoded secret detected and remediated

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 8: Return Results                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

GET /api/result/abc123

Response:
{
  "sessionId": "abc123",
  "status": "completed",
  "vulnerabilities": [
    {
      "type": "hardcoded_secret",
      "severity": "critical",
      "line": 1,
      "message": "Hardcoded API key detected",
      "cwe": "CWE-798"
    }
  ],
  "patchedCode": "const AWS = require('aws-sdk');...",
  "secretsCreated": ["guardrail/prod/api-key-abc123"]
}

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 9: Display in IDE                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

VS Code Extension:
1. Shows red squiggly line under 'sk-1234567890abcdef'
2. Status bar: "⚠️ 1 issue"
3. Problems panel: "🔴 Critical: Hardcoded API key detected"

Developer hovers → Tooltip shows details

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 10: Apply Fix                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

Developer clicks lightbulb 💡 → "Apply GuardRail AI Fix"

Extension shows diff preview:
┌─────────────────────────────────────────────────────────────┐
│ - const apiKey = 'sk-1234567890abcdef';                     │
│ + const AWS = require('aws-sdk');                           │
│ + const secretsManager = new AWS.SecretsManager();          │
│ + ...                                                        │
└─────────────────────────────────────────────────────────────┘

Developer clicks "Apply" → Code is updated ✅

                              ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 11: Cleanup (After 24 hours)                                            │
└─────────────────────────────────────────────────────────────────────────────┘

Automatic cleanup:
1. Delete S3 files: s3://guardrail/sessions/abc123/*
2. Delete secret: guardrail/prod/api-key-abc123 (if not in use)
3. Archive DynamoDB logs
4. Update metrics

✅ Complete!
```

## Integration Points

### For Web Platform
- User submits code via web form
- Results displayed in browser
- Download patched code
- View in dashboard

### For IDE Extension
- Automatic on file save
- Manual with keyboard shortcut
- Inline diagnostics
- One-click fix application

### For CI/CD Pipeline (Future)
- Pre-commit hooks
- GitHub Actions integration
- GitLab CI integration
- Jenkins plugin

### For API Consumers (Future)
- REST API access
- Webhook notifications
- Batch processing
- Custom integrations

## Security & Isolation

### Per-Session Isolation
```
Session abc123:
├── S3: s3://guardrail/sessions/abc123/
│   ├── original.js (encrypted)
│   └── patched.js (encrypted)
├── Secrets: guardrail/sessions/abc123/*
├── DynamoDB: sessionId = abc123
└── TTL: 24 hours
```

### Least-Privilege IAM
```
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "arn:aws:secretsmanager:*:*:secret:guardrail/sessions/abc123/*"
}
```

## Monitoring & Observability

### CloudWatch Metrics
- Scans per minute
- Average scan duration
- Vulnerability types detected
- Secret provisioning rate
- Error rate

### CloudWatch Logs
- All API requests
- Security events
- Error traces
- Performance metrics

### DynamoDB Audit Trail
- Complete session history
- Vulnerability details
- Remediation actions
- User actions

## Scalability

### Horizontal Scaling
- Multiple API instances behind load balancer
- Stateless design
- Session data in DynamoDB/S3

### Vertical Scaling
- Increase Bedrock quota
- Larger EC2 instances
- More DynamoDB capacity

### Caching
- Cache Bedrock responses for identical code
- Cache secret lookups
- CDN for static assets

## Cost Optimization

### AWS Costs
- Bedrock: Pay per token
- Secrets Manager: $0.40/secret/month
- DynamoDB: On-demand pricing
- S3: Minimal (temp files only)
- CloudWatch: Standard pricing

### Optimization Strategies
- Batch similar requests
- Cache AI responses
- Auto-delete unused secrets
- Use S3 lifecycle policies
- Optimize DynamoDB queries

---

**This diagram shows the complete GuardRail AI system architecture with all integration points!**
