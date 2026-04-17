# GuardRail AI - Deployment Guide

## Architecture Overview

```
┌─────────────────┐
│   Next.js Web   │ (Frontend - Vercel/S3+CloudFront)
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Express API    │ (Backend - Lambda/EC2/ECS)
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Bedrock │ │Secrets │ │DynamoDB│ │   S3   │ │CloudW. │
│ Nova   │ │Manager │ │        │ │        │ │ Logs   │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

## Prerequisites

- AWS Account with appropriate permissions
- Node.js 18+ installed
- AWS CLI configured
- Domain name (optional)

## Step 1: AWS Infrastructure Setup

### 1.1 Create DynamoDB Tables

```bash
# Sessions table
aws dynamodb create-table \
  --table-name GuardRailSessions \
  --attribute-definitions AttributeName=session_id,AttributeType=S \
  --key-schema AttributeName=session_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Events table
aws dynamodb create-table \
  --table-name GuardRailEvents \
  --attribute-definitions AttributeName=event_id,AttributeType=S \
  --key-schema AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 1.2 Create S3 Bucket

```bash
aws s3 mb s3://guardrail-sessions --region us-east-1

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket guardrail-sessions \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set lifecycle policy for 24h TTL
aws s3api put-bucket-lifecycle-configuration \
  --bucket guardrail-sessions \
  --lifecycle-configuration file://s3-lifecycle.json
```

### 1.3 Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /guardrail-ai/public \
  --region us-east-1
```

### 1.4 Enable Bedrock Access

```bash
# Request access to Amazon Bedrock Nova Lite in AWS Console
# Navigate to: AWS Console > Bedrock > Model access
# Enable: amazon.nova-lite-v1:0
```

## Step 2: Backend Deployment

### Option A: AWS Lambda + API Gateway (Recommended for Free Tier)

```bash
cd api

# Install dependencies
npm install

# Package for Lambda
zip -r function.zip . -x "*.git*" "node_modules/aws-sdk/*"

# Create Lambda function
aws lambda create-function \
  --function-name guardrail-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler server.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    NODE_ENV=production,
    AWS_REGION=us-east-1,
    DYNAMODB_TABLE=GuardRailSessions,
    EVENTS_TABLE=GuardRailEvents,
    S3_BUCKET=guardrail-sessions,
    LOG_GROUP=/guardrail-ai/public,
    RATE_LIMIT=50
  }"

# Create API Gateway
aws apigatewayv2 create-api \
  --name guardrail-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:guardrail-api
```

### Option B: EC2 with PM2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone your-repo
cd api
npm install

# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name guardrail-api
pm2 save
pm2 startup
```

### Option C: ECS with Docker

```bash
cd api

# Build Docker image
docker build -t guardrail-api .

# Push to ECR
aws ecr create-repository --repository-name guardrail-api
docker tag guardrail-api:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/guardrail-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/guardrail-api:latest

# Create ECS task definition and service
aws ecs create-cluster --cluster-name guardrail-cluster
# ... (full ECS setup)
```

## Step 3: Frontend Deployment

### Option A: Vercel (Easiest)

```bash
cd web

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-api-gateway-url
```

### Option B: S3 + CloudFront

```bash
cd web

# Build
npm run build

# Create S3 bucket for static hosting
aws s3 mb s3://guardrail-web
aws s3 website s3://guardrail-web --index-document index.html

# Upload build
aws s3 sync out/ s3://guardrail-web --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name guardrail-web.s3.amazonaws.com \
  --default-root-object index.html
```

## Step 4: IAM Permissions

Create IAM role with these policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/amazon.nova-lite-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:DeleteSecret",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:guardrail/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/GuardRailSessions",
        "arn:aws:dynamodb:*:*:table/GuardRailEvents"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::guardrail-sessions/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/guardrail-ai/*"
    }
  ]
}
```

## Step 5: Environment Configuration

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.com
AWS_REGION=us-east-1
BEDROCK_MAX_TOKENS=2000
DYNAMODB_TABLE=GuardRailSessions
EVENTS_TABLE=GuardRailEvents
S3_BUCKET=guardrail-sessions
LOG_GROUP=/guardrail-ai/public
RATE_LIMIT=50
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## Step 6: Testing

```bash
# Test API health
curl https://your-api-url.com/health

# Test scan endpoint
curl -X POST https://your-api-url.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const API_KEY = \"sk_test_123\";",
    "language": "javascript",
    "filename": "test.js"
  }'
```

## Step 7: Monitoring

### CloudWatch Dashboards

Create dashboard to monitor:
- API request count
- Bedrock invocation latency
- Error rates
- DynamoDB read/write capacity
- S3 storage usage

### Alarms

Set up alarms for:
- High error rate (>5%)
- Slow response time (>10s)
- High Bedrock token usage
- DynamoDB throttling

## Cost Optimization

### Free Tier Eligible:
- Lambda: 1M requests/month
- DynamoDB: 25GB storage + 25 RCU/WCU
- S3: 5GB storage
- CloudWatch: 10 custom metrics

### Estimated Monthly Cost (Beyond Free Tier):
- Bedrock Nova Lite: ~$0.0008 per 1K tokens
- Lambda: $0.20 per 1M requests
- DynamoDB: $0.25 per GB
- S3: $0.023 per GB
- **Total for 1000 scans/month: ~$5-10**

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set rate limiting
- [ ] Enable CloudWatch logging
- [ ] Use IAM roles (not access keys)
- [ ] Enable S3 encryption
- [ ] Set DynamoDB point-in-time recovery
- [ ] Configure WAF rules (optional)
- [ ] Enable CloudTrail auditing

## Troubleshooting

### Issue: Bedrock access denied
**Solution**: Enable model access in Bedrock console

### Issue: DynamoDB throttling
**Solution**: Switch to on-demand billing or increase provisioned capacity

### Issue: CORS errors
**Solution**: Update CORS configuration in API server.js

### Issue: Lambda timeout
**Solution**: Increase timeout to 30s and memory to 512MB

## Maintenance

### Daily:
- Monitor CloudWatch logs for errors
- Check DynamoDB capacity usage

### Weekly:
- Review security scan statistics
- Analyze cost usage

### Monthly:
- Clean up expired sessions
- Rotate secrets if needed
- Update dependencies

## Scaling

For high traffic (>10K scans/day):
1. Use API Gateway caching
2. Add Redis for session management
3. Implement queue system (SQS) for async processing
4. Use Aurora Serverless instead of DynamoDB
5. Add CloudFront CDN for frontend
6. Enable auto-scaling for Lambda/ECS
