# GuardRail AI - System Architecture

## Overview

GuardRail AI is an autonomous secure-coding agent that enforces security practices in real-time within the Kiro IDE environment.

## Architecture Pipeline

```
┌─────────────┐
│  IDE Save   │
│   Event     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  File Diff      │
│  Extraction     │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│  Security Analysis  │
│  (Bedrock Nova)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Risk               │
│  Classification     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Remediation        │
│  Strategy           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  AWS Provisioning   │
│  (if required)      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Code Patch         │
│  Generation         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Diff Preview       │
│  & User Approval    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Apply Patch        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Event Logging      │
│  (DynamoDB/CW)      │
└─────────────────────┘
```

## Core Modules

### 1. Security Analyzer (`security-analyzer.js`)
- Integrates with Amazon Bedrock Nova Lite
- Analyzes code for vulnerabilities
- Returns structured risk assessment
- Target latency: <2 seconds

### 2. Remediation Engine (`remediation-engine.js`)
- Determines fix strategy
- Classifies remediation type
- Calculates confidence score
- Decides if AWS provisioning needed

### 3. Secret Manager (`secret-manager.js`)
- Creates secrets in AWS Secrets Manager
- Generates unique secret identifiers
- Applies least-privilege policies
- Provides retrieval code snippets

### 4. Code Refactor (`code-refactor.js`)
- Generates secure replacement code
- Maintains functional equivalence
- Preserves code style
- Target latency: <4 seconds

### 5. Event Logger (`event-logger.js`)
- Logs to DynamoDB for persistence
- Streams to CloudWatch for monitoring
- Tracks all security events
- Enables audit trail

## Security Policies

### Enforced Rules
1. Zero hardcoded secrets
2. No SQL injection patterns
3. HTTPS for sensitive data
4. Safe deserialization only
5. Least-privilege configurations

### Detection Patterns
- API keys, passwords, tokens
- Database credentials
- JWT secrets, OAuth credentials
- Unsafe query construction
- Insecure protocol usage

## AWS Integration

### Services Used
- **Bedrock**: AI-powered security analysis
- **Secrets Manager**: Secure credential storage
- **DynamoDB**: Event persistence
- **CloudWatch**: Monitoring and logging

### Cost Optimization
- Free tier eligible
- Pay-per-request DynamoDB
- Minimal Bedrock invocations
- Efficient log retention

## Performance Targets

- Detection: <2 seconds
- Remediation: <4 seconds
- Total pipeline: <6 seconds
- Non-blocking workflow

## Observability

### Metrics Tracked
- Detections per session
- Fixes applied vs rejected
- False positive rate
- Secret creation rate
- Average latency

### Logging
- All events to DynamoDB
- Real-time CloudWatch streams
- Error tracking
- Audit compliance
