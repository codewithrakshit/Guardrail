# GuardRail AI - Complete File Structure

## 📁 Project Organization

```
guardrail-ai/
│
├── 📄 Documentation (8 files)
│   ├── README.md                    # Original IDE tool docs
│   ├── README-SAAS.md              # Complete SaaS platform docs
│   ├── DEPLOYMENT.md               # Production deployment guide
│   ├── PLATFORM-OVERVIEW.md        # Architecture & data flow
│   ├── PROJECT-SUMMARY.md          # Transformation summary
│   ├── QUICK-START.md              # 5-minute setup guide
│   ├── TEST-RESULTS.md             # Testing validation
│   └── FILE-STRUCTURE.md           # This file
│
├── 🔧 Configuration (4 files)
│   ├── package.json                # Root dependencies
│   ├── package-lock.json           # Dependency lock
│   ├── docker-compose.yml          # Local development
│   └── .gitignore                  # Git exclusions
│
├── 🌐 Backend API (api/) - 72KB
│   │
│   ├── 📦 Core Files
│   │   ├── server.js               # Express server entry point
│   │   ├── package.json            # Backend dependencies
│   │   ├── Dockerfile              # Container configuration
│   │   ├── .env.example            # Environment template
│   │   └── .env                    # Local configuration (gitignored)
│   │
│   ├── 🔌 Services (services/) - 8 modules
│   │   ├── security-orchestrator.js    # Pipeline coordinator
│   │   ├── bedrock-client.js           # AI analysis wrapper
│   │   ├── patch-generator.js          # Secure code generation
│   │   ├── secret-lifecycle-manager.js # AWS Secrets Manager
│   │   ├── session-manager.js          # Multi-user isolation
│   │   ├── s3-storage.js               # Encrypted file storage
│   │   ├── event-logger.js             # DynamoDB + CloudWatch
│   │   └── remediation-engine.js       # Strategy determination
│   │
│   ├── 🛣️  Routes (routes/) - 5 endpoints
│   │   ├── scan.js                 # Code submission & upload
│   │   ├── result.js               # Results retrieval & download
│   │   ├── logs.js                 # Analytics & statistics
│   │   ├── demo.js                 # Preloaded examples
│   │   └── session.js              # Cleanup operations
│   │
│   └── 🛡️  Middleware (middleware/)
│       └── validation.js           # Input sanitization & Joi schemas
│
├── 💻 Frontend Web (web/) - 80KB
│   │
│   ├── 📦 Core Files
│   │   ├── package.json            # Frontend dependencies
│   │   ├── next.config.js          # Next.js configuration
│   │   ├── tsconfig.json           # TypeScript configuration
│   │   ├── tailwind.config.ts      # TailwindCSS configuration
│   │   ├── postcss.config.js       # PostCSS configuration
│   │   ├── Dockerfile              # Container configuration
│   │   ├── .env.example            # Environment template
│   │   └── .env.local              # Local configuration (gitignored)
│   │
│   └── 📱 Application (app/)
│       ├── layout.tsx              # Root layout
│       ├── globals.css             # Global styles
│       ├── page.tsx                # Landing page (/)
│       │
│       ├── scan/
│       │   └── page.tsx            # Scan interface (/scan)
│       │
│       ├── results/
│       │   └── [sessionId]/
│       │       └── page.tsx        # Results display (/results/:id)
│       │
│       ├── dashboard/
│       │   └── page.tsx            # Analytics dashboard (/dashboard)
│       │
│       └── demo/
│           └── page.tsx            # Interactive demo (/demo)
│
├── 📚 Documentation (docs/) - 12KB
│   ├── ARCHITECTURE.md             # System design
│   └── DEMO-GUIDE.md               # Demo walkthrough
│
├── 🧪 Tests (tests/) - 32KB
│   ├── unit-tests.js               # 10 unit tests
│   ├── integration-test.js         # Full pipeline test
│   ├── run-tests.js                # Test suite runner
│   └── demo-simulation.js          # Visual demo
│
├── 🎯 Demo Examples (demo/)
│   └── vulnerable-example.js       # 4 vulnerability scenarios
│
├── ⚙️  Configuration (config/)
│   └── aws-config.json             # AWS service configuration
│
├── 🔨 Scripts (scripts/)
│   └── deploy-infra.js             # AWS infrastructure setup
│
├── 🪝 IDE Integration (.kiro/)
│   └── hooks/
│       └── guardrail-security-check.json  # File save hook
│
└── 📦 Original IDE Tool (src/)
    ├── index.js                    # Main entry point
    └── modules/                    # Original modules
        ├── security-analyzer.js
        ├── remediation-engine.js
        ├── secret-manager.js
        ├── code-refactor.js
        └── event-logger.js
```

---

## 📊 File Statistics

### By Category
```
Documentation:     8 files   (~50 KB)
Backend API:      20 files   (~72 KB)
Frontend Web:     15 files   (~80 KB)
Tests:             4 files   (~32 KB)
Configuration:     6 files   (~10 KB)
Original Tool:     6 files   (~30 KB)
─────────────────────────────────────
Total:            59 files  (~274 KB)
```

### By Type
```
TypeScript/TSX:   10 files  (Frontend pages & config)
JavaScript:       30 files  (Backend services & routes)
JSON:              8 files  (Package configs & settings)
Markdown:          8 files  (Documentation)
CSS:               1 file   (Global styles)
Dockerfile:        2 files  (Container configs)
YAML:              1 file   (Docker Compose)
```

---

## 🎯 Key Files by Purpose

### Entry Points
- `api/server.js` - Backend API server
- `web/app/page.tsx` - Frontend landing page
- `docker-compose.yml` - Local development

### Core Logic
- `api/services/security-orchestrator.js` - Main pipeline
- `api/services/bedrock-client.js` - AI integration
- `api/services/patch-generator.js` - Code generation

### User Interface
- `web/app/scan/page.tsx` - Code submission
- `web/app/results/[sessionId]/page.tsx` - Results display
- `web/app/dashboard/page.tsx` - Analytics

### Configuration
- `api/.env.example` - Backend environment
- `web/.env.example` - Frontend environment
- `config/aws-config.json` - AWS settings

### Documentation
- `README-SAAS.md` - Main documentation
- `DEPLOYMENT.md` - Deployment guide
- `QUICK-START.md` - Setup guide

---

## 🔄 Data Flow Through Files

### 1. User Submits Code
```
web/app/scan/page.tsx
    ↓ HTTP POST
api/routes/scan.js
    ↓ Validate
api/middleware/validation.js
    ↓ Process
api/services/security-orchestrator.js
```

### 2. Security Analysis
```
api/services/security-orchestrator.js
    ↓ Store
api/services/s3-storage.js
    ↓ Analyze
api/services/bedrock-client.js
    ↓ Strategy
api/services/remediation-engine.js
```

### 3. Patch Generation
```
api/services/remediation-engine.js
    ↓ Create Secret
api/services/secret-lifecycle-manager.js
    ↓ Generate Patch
api/services/patch-generator.js
    ↓ Store
api/services/s3-storage.js
```

### 4. Results Display
```
api/routes/result.js
    ↓ Retrieve
api/services/session-manager.js
api/services/s3-storage.js
    ↓ Display
web/app/results/[sessionId]/page.tsx
```

---

## 🏗️ Architecture Mapping

### Frontend Layer
```
web/app/
├── page.tsx              → Landing & Marketing
├── scan/                 → User Input
├── results/              → Output Display
├── dashboard/            → Analytics
└── demo/                 → Examples
```

### API Layer
```
api/routes/
├── scan.js               → POST /api/scan
├── result.js             → GET /api/result/:id
├── logs.js               → GET /api/logs/stats
├── demo.js               → GET /api/demo
└── session.js            → DELETE /api/session/:id
```

### Service Layer
```
api/services/
├── security-orchestrator.js  → Coordinates pipeline
├── bedrock-client.js         → AI analysis
├── patch-generator.js        → Code generation
├── secret-lifecycle-manager.js → AWS Secrets
├── session-manager.js        → DynamoDB sessions
├── s3-storage.js             → File storage
├── event-logger.js           → Logging
└── remediation-engine.js     → Strategy
```

### AWS Integration
```
Bedrock Nova Lite     ← bedrock-client.js
Secrets Manager       ← secret-lifecycle-manager.js
DynamoDB             ← session-manager.js, event-logger.js
S3                   ← s3-storage.js
CloudWatch Logs      ← event-logger.js
```

---

## 📦 Dependencies

### Backend (api/package.json)
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "multer": "^1.4.5-lts.1",
  "uuid": "^9.0.1",
  "@aws-sdk/client-bedrock-runtime": "^3.0.0",
  "@aws-sdk/client-secrets-manager": "^3.0.0",
  "@aws-sdk/client-dynamodb": "^3.0.0",
  "@aws-sdk/client-s3": "^3.0.0",
  "@aws-sdk/client-cloudwatch-logs": "^3.0.0",
  "dotenv": "^16.3.1",
  "joi": "^17.11.0",
  "compression": "^1.7.4"
}
```

### Frontend (web/package.json)
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.300.0",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.3.0"
}
```

---

## 🚀 Deployment Files

### Docker
- `api/Dockerfile` - Backend container
- `web/Dockerfile` - Frontend container
- `docker-compose.yml` - Local orchestration

### AWS
- `scripts/deploy-infra.js` - Infrastructure setup
- `config/aws-config.json` - Service configuration
- `DEPLOYMENT.md` - Deployment instructions

---

## 📝 Documentation Files

### User-Facing
- `README-SAAS.md` - Platform overview
- `QUICK-START.md` - Getting started
- `docs/DEMO-GUIDE.md` - Demo walkthrough

### Developer-Facing
- `PLATFORM-OVERVIEW.md` - Architecture details
- `docs/ARCHITECTURE.md` - System design
- `FILE-STRUCTURE.md` - This file

### Operations
- `DEPLOYMENT.md` - Production deployment
- `TEST-RESULTS.md` - Testing validation
- `PROJECT-SUMMARY.md` - Transformation summary

---

## 🎯 Quick Navigation

### Want to understand the system?
→ Read `PLATFORM-OVERVIEW.md`

### Want to deploy it?
→ Follow `DEPLOYMENT.md`

### Want to get started quickly?
→ Use `QUICK-START.md`

### Want to see the code?
→ Start with `api/server.js` and `web/app/page.tsx`

### Want to test it?
→ Run `tests/unit-tests.js`

### Want to customize it?
→ Check `api/services/` and `web/app/`

---

**Complete, organized, production-ready. 🚀**
