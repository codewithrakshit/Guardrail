# GuardRail AI - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- AWS Account
- AWS CLI configured

---

## Step 1: AWS Setup (2 minutes)

```bash
# Create DynamoDB tables
aws dynamodb create-table \
  --table-name GuardRailSessions \
  --attribute-definitions AttributeName=session_id,AttributeType=S \
  --key-schema AttributeName=session_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

aws dynamodb create-table \
  --table-name GuardRailEvents \
  --attribute-definitions AttributeName=event_id,AttributeType=S \
  --key-schema AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create S3 bucket
aws s3 mb s3://guardrail-sessions-$(date +%s) --region us-east-1

# Create CloudWatch log group
aws logs create-log-group --log-group-name /guardrail-ai/public --region us-east-1

# Enable Bedrock (AWS Console)
# Go to: Bedrock > Model access > Enable amazon.nova-lite-v1:0
```

---

## Step 2: Backend Setup (1 minute)

```bash
cd api

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env with your AWS credentials
nano .env

# Start server
npm run dev
```

Backend running at: http://localhost:3001

---

## Step 3: Frontend Setup (1 minute)

```bash
cd web

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend running at: http://localhost:3000

---

## Step 4: Test It! (1 minute)

### Option A: Use the Web Interface
1. Open http://localhost:3000
2. Click "Try Demo"
3. Select "Hardcoded API Key"
4. Click "Run Demo Scan"
5. View results!

### Option B: Use the API
```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const API_KEY = \"sk_live_1234567890\";",
    "language": "javascript",
    "filename": "test.js"
  }'
```

---

## 🎉 You're Done!

GuardRail AI is now running locally. Try:

- **Scan Page**: http://localhost:3000/scan
- **Dashboard**: http://localhost:3000/dashboard
- **Demo**: http://localhost:3000/demo
- **API Health**: http://localhost:3001/health

---

## 🐳 Alternative: Docker Compose

```bash
# One command to rule them all
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## 🚢 Deploy to Production

### Vercel (Frontend)
```bash
cd web
vercel --prod
```

### AWS Lambda (Backend)
```bash
cd api
zip -r function.zip .
aws lambda create-function \
  --function-name guardrail-api \
  --runtime nodejs18.x \
  --role YOUR_LAMBDA_ROLE_ARN \
  --handler server.handler \
  --zip-file fileb://function.zip
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 📚 Next Steps

- Read [README-SAAS.md](./README-SAAS.md) for full documentation
- Check [PLATFORM-OVERVIEW.md](./PLATFORM-OVERVIEW.md) for architecture
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Explore [docs/](./docs/) for additional guides

---

## 🆘 Troubleshooting

### Backend won't start
- Check AWS credentials in `.env`
- Verify DynamoDB tables exist
- Ensure Bedrock access is enabled

### Frontend can't connect to API
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Disable CORS temporarily for testing

### Bedrock errors
- Enable model access in AWS Console
- Check IAM permissions
- Verify region is us-east-1

---

## 💡 Tips

- Use demo examples to test without writing code
- Check CloudWatch logs for debugging
- Monitor DynamoDB for session data
- Review S3 bucket for stored files

---

**Happy Securing! 🔒**
