# GuardRail AI - Public SaaS Platform

**Autonomous Security Remediation as a Service**

Transform insecure code into production-ready secure implementations in seconds using AI-powered analysis and AWS infrastructure.

---

## 🚀 Features

### Core Capabilities
- **Real-Time Vulnerability Detection** - Amazon Bedrock Nova Lite AI analysis
- **Autonomous Remediation** - Automatic secure code generation
- **AWS Secret Management** - Hardcoded credentials extracted to Secrets Manager
- **Multi-Language Support** - JavaScript, TypeScript, Python, Java, Go, Ruby, PHP
- **Side-by-Side Diff** - Visual comparison of vulnerable vs secure code
- **CWE Compliance** - Industry-standard vulnerability categorization
- **Session Isolation** - Multi-user support with 24h TTL
- **Production-Grade** - Enterprise security and scalability

### Security Policies Enforced
✅ Zero hardcoded secrets  
✅ No SQL injection patterns  
✅ HTTPS for sensitive data  
✅ Safe deserialization only  
✅ Least-privilege configurations  
✅ CWE-compliant detection  

---

## 📋 Architecture

```
Frontend (Next.js)
    ↓ HTTPS
Backend API (Express)
    ↓
┌────────────┬──────────────┬──────────┬────────┬──────────┐
│  Bedrock   │   Secrets    │ DynamoDB │   S3   │CloudWatch│
│  Nova Lite │   Manager    │          │        │   Logs   │
└────────────┴──────────────┴──────────┴────────┴──────────┘
```

### Technology Stack
- **Frontend**: Next.js 14, React 18, TailwindCSS, TypeScript
- **Backend**: Node.js, Express, AWS SDK v3
- **AI**: Amazon Bedrock Nova Lite
- **Storage**: DynamoDB, S3 (encrypted)
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch Logs
- **Deployment**: Lambda/EC2/ECS + Vercel/CloudFront

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- AWS Account
- AWS CLI configured

### 1. Clone Repository
```bash
git clone https://github.com/your-org/guardrail-ai
cd guardrail-ai
```

### 2. Setup AWS Infrastructure
```bash
# Create DynamoDB tables
aws dynamodb create-table \
  --table-name GuardRailSessions \
  --attribute-definitions AttributeName=session_id,AttributeType=S \
  --key-schema AttributeName=session_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name GuardRailEvents \
  --attribute-definitions AttributeName=event_id,AttributeType=S \
  --key-schema AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Create S3 bucket
aws s3 mb s3://guardrail-sessions
aws s3api put-bucket-encryption \
  --bucket guardrail-sessions \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'

# Create CloudWatch log group
aws logs create-log-group --log-group-name /guardrail-ai/public

# Enable Bedrock access (AWS Console)
# Navigate to: Bedrock > Model access > Enable amazon.nova-lite-v1:0
```

### 3. Configure Backend
```bash
cd api
npm install
cp .env.example .env

# Edit .env with your AWS credentials
nano .env
```

### 4. Configure Frontend
```bash
cd ../web
npm install
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

### 5. Run Locally
```bash
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend
cd web
npm run dev
```

Visit: http://localhost:3000

---

## 🌐 API Endpoints

### POST /api/scan
Submit code for security analysis
```json
{
  "code": "const API_KEY = 'sk_test_123';",
  "language": "javascript",
  "filename": "app.js"
}
```

### GET /api/result/:sessionId
Retrieve scan results and patch

### GET /api/result/:sessionId/download
Download secure code file

### GET /api/logs/stats
Platform statistics and metrics

### GET /api/demo
List demo examples

### DELETE /api/session/:sessionId
Cleanup session resources

---

## 📊 Dashboard Features

### Landing Page
- Hero section with value proposition
- Feature highlights
- How it works flow
- Security policies
- Call-to-action

### Scan Page
- Code paste or file upload
- Language selection
- Real-time validation
- Progress indicators

### Results Page
- Vulnerability summary
- Severity scoring
- CWE categorization
- Side-by-side diff
- Secure code download
- AWS secret details

### Dashboard
- Total scans metric
- Vulnerabilities found
- Secrets created
- Average scan time
- Severity breakdown
- Vulnerability types chart

### Demo Page
- Preloaded examples
- Interactive code preview
- One-click demo execution

---

## 🔒 Security Features

### Input Validation
- File size limits (1MB)
- Binary content detection
- Code sanitization
- SQL injection prevention

### Rate Limiting
- 50 requests/hour per IP
- Configurable limits
- Abuse protection

### Session Isolation
- Unique session IDs
- Encrypted S3 storage
- 24-hour TTL
- Automatic cleanup

### AWS Security
- IAM role-based access
- Secrets Manager integration
- S3 server-side encryption
- CloudWatch audit logging
- HTTPS only

---

## 💰 Cost Estimation

### AWS Free Tier Eligible
- Lambda: 1M requests/month
- DynamoDB: 25GB + 25 RCU/WCU
- S3: 5GB storage
- CloudWatch: 10 metrics

### Beyond Free Tier (1000 scans/month)
- Bedrock Nova Lite: ~$2
- Lambda: ~$1
- DynamoDB: ~$1
- S3: ~$0.50
- **Total: ~$5-10/month**

---

## 📈 Performance Targets

- Detection: < 2 seconds
- Patch Generation: < 4 seconds
- Total Pipeline: < 6 seconds
- API Response: < 10 seconds

---

## 🧪 Testing

### Unit Tests
```bash
cd api
npm test
```

### Integration Tests
```bash
# Test full pipeline
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const PASSWORD = \"secret123\";",
    "language": "javascript"
  }'
```

### Demo Examples
- Hardcoded API key
- SQL injection
- Database password
- Insecure HTTP

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options

**Vercel (Frontend)**
```bash
cd web
vercel --prod
```

**AWS Lambda (Backend)**
```bash
cd api
npm run deploy:lambda
```

**Docker Compose (Local)**
```bash
docker-compose up
```

---

## 📝 Environment Variables

### Backend
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
AWS_REGION=us-east-1
BEDROCK_MAX_TOKENS=2000
DYNAMODB_TABLE=GuardRailSessions
EVENTS_TABLE=GuardRailEvents
S3_BUCKET=guardrail-sessions
LOG_GROUP=/guardrail-ai/public
RATE_LIMIT=50
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## 🛠️ Development

### Project Structure
```
guardrail-ai/
├── api/                    # Backend Express API
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── middleware/        # Validation, rate limiting
│   └── server.js          # Entry point
├── web/                   # Frontend Next.js
│   ├── app/              # Pages and routes
│   │   ├── page.tsx      # Landing page
│   │   ├── scan/         # Scan interface
│   │   ├── results/      # Results display
│   │   ├── dashboard/    # Analytics
│   │   └── demo/         # Interactive demo
│   └── package.json
├── docs/                  # Documentation
├── tests/                 # Test suites
└── docker-compose.yml     # Local development
```

### Adding New Vulnerability Types

1. Update `bedrock-client.js` prompt
2. Add to `remediation-engine.js` strategy
3. Update CWE mapping in `security-orchestrator.js`
4. Add demo example in `routes/demo.js`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

- Amazon Bedrock Nova Lite for AI analysis
- AWS for infrastructure services
- Next.js and React teams
- Open source community

---

## 📞 Support

- Documentation: [docs/](./docs/)
- Issues: GitHub Issues
- Email: support@guardrail-ai.com

---

**Built with ❤️ for secure coding**
