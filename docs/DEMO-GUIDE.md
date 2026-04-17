# GuardRail AI - Demo Guide

## Quick Demo Scenario

This guide walks through a complete GuardRail AI remediation cycle.

## Setup

1. Ensure AWS credentials are configured:
```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

2. Deploy infrastructure:
```bash
npm install
npm run deploy
```

3. Activate the GuardRail hook in Kiro IDE

## Demo Scenario: Hardcoded Database Password

### Step 1: Create Vulnerable Code

Open `demo/vulnerable-example.js` - it contains multiple vulnerabilities.

### Step 2: Trigger Detection

Save the file. GuardRail AI will:
1. Detect hardcoded credentials
2. Analyze severity (CRITICAL)
3. Generate remediation strategy

### Step 3: Review Findings

You'll see:
```
🔒 SECURITY RISK DETECTED

File: demo/vulnerable-example.js
Risk: hardcoded_secret
Severity: CRITICAL

Found: Database password in plaintext
Lines: 7

Remediation: Extract to AWS Secrets Manager
```

### Step 4: View Proposed Fix

```diff
- password: 'SuperSecret123!',
+ password: await getSecret('guardrail/demo/db_password'),
```

### Step 5: Accept Remediation

GuardRail AI will:
1. Create secret in AWS Secrets Manager
2. Replace code with secure retrieval
3. Add necessary imports
4. Log the event

### Step 6: Verify

Check AWS Secrets Manager:
```bash
aws secretsmanager list-secrets --query 'SecretList[?contains(Name, `guardrail`)]'
```

Check DynamoDB logs:
```bash
aws dynamodb scan --table-name guardrail-events
```

## Additional Test Cases

### SQL Injection
```javascript
// Before
const query = "SELECT * FROM users WHERE id = '" + userId + "'";

// After
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [userId]);
```

### Hardcoded API Key
```javascript
// Before
const STRIPE_KEY = 'sk_live_1234567890';

// After
const STRIPE_KEY = await secretsManager.getSecretValue({
  SecretId: 'guardrail/project/stripe_key'
});
```

## Performance Validation

Run the test suite:
```bash
npm test
```

Expected output:
```
✅ Test 1 - Hardcoded API Key: PASSED (1.8s)
✅ Test 2 - SQL Injection: PASSED (1.5s)
✅ Test 3 - Exposed JWT Secret: PASSED (2.1s)

📊 All tests passed
⏱️  Average latency: 1.8s
```

## Monitoring

View real-time detections:
```bash
aws logs tail /guardrail-ai/detections --follow
```

Query event history:
```bash
aws dynamodb query \
  --table-name guardrail-events \
  --key-condition-expression "riskType = :type" \
  --expression-attribute-values '{":type":{"S":"hardcoded_secret"}}'
```

## Success Criteria

✅ Vulnerability detected in <2 seconds
✅ Secret created in AWS Secrets Manager
✅ Code automatically refactored
✅ Diff preview shown
✅ Event logged to DynamoDB
✅ Developer workflow uninterrupted
