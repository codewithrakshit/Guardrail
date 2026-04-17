# GuardRail AI

Autonomous security remediation platform powered by AI. Detect vulnerabilities, generate production-ready patches, and provision AWS secrets automatically — available as a web platform and IDE extension.

## 🚀 What is GuardRail AI?

GuardRail AI is an AI-powered security platform that:
- **Detects** 50+ vulnerability types in real-time
- **Generates** production-ready security patches automatically
- **Provisions** AWS secrets with proper IAM policies
- **Integrates** directly into your IDE or web workflow

## 🎯 Two Ways to Use

### 1. **Web Platform** (Current Implementation)
- Submit code via web interface
- View results in dashboard
- Download patched code
- Perfect for: Code reviews, security audits, batch scanning

### 2. **IDE Extension** (New! 🎉)
- One-click scanning with `Ctrl+Shift+G`
- Inline diagnostics (red squiggly lines)
- Quick fix actions (lightbulb 💡)
- Auto-scan on save
- Perfect for: Real-time development, shift-left security

**✅ Works on all VS Code-based IDEs:**
- Kiro, Cursor, Windsurf (Anity Gravity), VS Code, VS Codium

**👉 See [UNIVERSAL-IDE-COMPATIBILITY.md](UNIVERSAL-IDE-COMPATIBILITY.md) for details**

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer                                │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Web Interface   │         │  IDE Extension   │             │
│  │  (Next.js 14)    │         │  (VS Code, etc)  │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Layer                             │
│  POST /api/scan  •  GET /api/result/{id}  •  GET /api/logs     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI & Security Layer                           │
│  Amazon Bedrock Nova Lite → Security Analysis → Patch Generator │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Infrastructure                            │
│  Secrets Manager  •  DynamoDB  •  S3  •  CloudWatch             │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Components

### Backend Services
- **Security Orchestrator**: Coordinates the entire remediation workflow
- **Bedrock Client**: AI-powered vulnerability detection
- **Patch Generator**: Creates production-ready fixes
- **Secret Lifecycle Manager**: AWS Secrets Manager integration with 24h TTL
- **Session Manager**: Isolated per-session resources
- **Event Logger**: Complete audit trail (DynamoDB + CloudWatch)

### Frontend
- **Web Platform**: Next.js 14 with TypeScript
- **IDE Extension**: VS Code extension (template for other IDEs)

## 📦 Quick Start

### Web Platform

```bash
# 1. Clone repository
git clone https://github.com/yourusername/guardrail-ai
cd guardrail-ai

# 2. Install dependencies
npm install
cd api && npm install
cd ../web && npm install

# 3. Configure AWS credentials
cp api/.env.example api/.env
# Edit api/.env with your AWS credentials

# 4. Start backend
cd api
npm start  # Runs on http://localhost:3001

# 5. Start frontend (in new terminal)
cd web
npm run dev  # Runs on http://localhost:3000
```

### IDE Extension (VS Code, Kiro, Cursor, Windsurf)

```bash
# 1. Install extension
cd extensions/vscode
./install-kiro.sh  # For Kiro
# or
./install.sh       # For VS Code/Cursor/Windsurf

# 2. Start backend (if not already running)
cd ../../api
npm start

# 3. Open your IDE and press Ctrl+Shift+G to scan!
```

**Full IDE extension guide**: [UNIVERSAL-IDE-COMPATIBILITY.md](UNIVERSAL-IDE-COMPATIBILITY.md)

## 🎯 Features

### Security Detection
- ✅ Hardcoded secrets & API keys
- ✅ SQL injection
- ✅ Cross-site scripting (XSS)
- ✅ Path traversal
- ✅ Insecure cryptography
- ✅ Command injection
- ✅ 50+ vulnerability types

### Automated Remediation
- ✅ Production-ready patches
- ✅ AWS Secrets Manager provisioning
- ✅ Least-privilege IAM policies
- ✅ Environment isolation
- ✅ 24-hour TTL cleanup

### Multi-Language Support
- JavaScript / TypeScript
- Python
- Java
- Go
- Ruby
- PHP

## 🔒 Security Policies

- Zero hardcoded secrets
- No SQL injection patterns
- Secure credential storage only
- Least-privilege access enforcement
- Session isolation per scan
- Automatic resource cleanup

## 📚 Documentation

- **[EXTENSION-SUMMARY.md](EXTENSION-SUMMARY.md)** - IDE extension overview
- **[IDE-EXTENSION-GUIDE.md](IDE-EXTENSION-GUIDE.md)** - Complete IDE integration guide
- **[PLATFORM-OVERVIEW.md](PLATFORM-OVERVIEW.md)** - Platform architecture
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[QUICK-START.md](QUICK-START.md)** - Getting started guide

## 🎬 Demo

### Web Platform
```bash
npm run demo
```

### IDE Extension
1. Open VS Code
2. Create a file with vulnerable code:
```javascript
const apiKey = 'sk-1234567890abcdef';
```
3. Press `Ctrl+Shift+G`
4. See red squiggly line appear
5. Click lightbulb 💡 → "Apply GuardRail AI Fix"
6. Code is automatically secured! ✅

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:demo
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
```bash
npm run deploy
```

## 🤝 Contributing

We welcome contributions! Areas we need help:
- Additional IDE support (JetBrains, Sublime, Vim, Emacs)
- More vulnerability detection patterns
- Performance optimizations
- Documentation improvements

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Amazon Bedrock Nova Lite for AI-powered analysis
- AWS for cloud infrastructure
- VS Code Extension API
- Open source security community

---

**Made with ❤️ for secure coding**
