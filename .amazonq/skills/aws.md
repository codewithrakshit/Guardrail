# Skill: aws

You are working on GuardRail AI's AWS integrations.

Context:
- All AWS SDK usage is v3 (@aws-sdk/client-*)
- Services in use: Bedrock Runtime, Secrets Manager, DynamoDB, S3, CloudWatch Logs
- Config: config/aws-config.json, credentials via api/.env
- Region: process.env.AWS_REGION

Rules:
- Initialize AWS clients once per service file, not per request
- Tag all provisioned resources: { Project: 'guardrail-ai', Session: sessionId }
- Secrets get 24h TTL — always set RecoveryWindowInDays or ForceDeleteWithoutRecovery
- DynamoDB writes go through event-logger.js
- S3 uploads go through s3-storage.js
- Never log or expose AWS credentials anywhere
