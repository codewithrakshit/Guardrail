# GuardRail AI — CI/CD Security Pipeline

Complete guide for automated security scanning in your development workflow.

---

## 🎯 Overview

GuardRail AI provides **three layers** of automated security scanning:

1. **Pre-Commit Hook** — Scans files before they're committed locally
2. **GitHub Actions CI** — Scans PRs and pushes automatically
3. **IDE Extension** — Real-time scanning while coding

---

## 🔧 Setup

### 1. Pre-Commit Hook (Local)

Scans staged files before every commit.

```bash
# Install the hook
./setup-hooks.sh

# Test it
echo 'const key = "sk-secret123";' > test.js
git add test.js
git commit -m "test"
# ❌ COMMIT BLOCKED — Security issues found
```

**Features:**
- ✅ Blocks commits with critical/high vulnerabilities
- ✅ Allows medium/low severity (with warning)
- ✅ Scans only staged files (fast)
- ✅ Bypass with `--no-verify` if needed

**Configuration:**
```bash
# Use different API URL
export GUARDRAIL_API_URL=http://your-server:3001
git commit -m "message"
```

---

### 2. GitHub Actions CI (Remote)

Automatically scans PRs and pushes to main/master.

**Already configured in:** `.github/workflows/guardrail.yml`

**Triggers:**
- ✅ Pull requests (opened, updated, reopened)
- ✅ Pushes to main/master branches

**What it does:**
1. Detects changed files in PR/commit
2. Scans each file with GuardRail AI API
3. Posts comment on PR if issues found
4. **Blocks merge** if critical/high vulnerabilities detected
5. Shows ✅/❌ status check

**Example PR Comment:**
```
🚨 GuardRail AI — Security Issues Found

2 critical and 1 high severity issues were detected.

Please review the scan results and apply the suggested patches before merging.

> Powered by GuardRail AI — Autonomous Security Remediation
```

**Configuration:**

Set GitHub secret for custom API URL:
```bash
# In GitHub repo: Settings → Secrets → Actions
GUARDRAIL_API_URL = http://98.93.184.65:3001
```

Or it defaults to: `http://98.93.184.65:3001`

---

### 3. IDE Extension (Real-Time)

Scans files as you code with `Ctrl+Shift+G`.

```bash
cd extensions/vscode
./install-kiro.sh
```

See [LOGS-PANEL-GUIDE.md](extensions/vscode/LOGS-PANEL-GUIDE.md) for details.

---

## 📋 Workflow Examples

### Example 1: Developer Commits Vulnerable Code

```bash
# Developer writes code with hardcoded secret
echo 'const apiKey = "sk-1234567890";' > app.js

# Tries to commit
git add app.js
git commit -m "Add API integration"

# Output:
🛡️  GuardRail AI — Scanning staged files...
  Scanning app.js...
    ❌ CRITICAL: hardcoded_secret

❌ COMMIT BLOCKED — Security issues found:
  - app.js (CRITICAL: hardcoded_secret)

Fix the issues or run: git commit --no-verify (not recommended)
```

**Developer fixes it:**
```bash
# Scan in IDE (Ctrl+Shift+G)
# Click "Apply Fixes"
# Code is automatically patched with AWS Secrets Manager

git add app.js
git commit -m "Add API integration (secured)"
# ✅ All files passed security scan
```

---

### Example 2: Pull Request with Vulnerabilities

1. Developer creates PR with vulnerable code
2. GitHub Actions runs automatically
3. GuardRail AI scans all changed files
4. PR status check shows ❌ Failed
5. Bot comments with details
6. **Merge is blocked** until fixed

**PR Status:**
```
❌ GuardRail AI Security Scan — Failed
   2 critical, 1 high severity issues found
```

---

### Example 3: Clean Code Passes All Checks

```bash
# Developer writes secure code
git add secure-file.js
git commit -m "Add feature"

# Output:
🛡️  GuardRail AI — Scanning staged files...
  Scanning secure-file.js...
    ✅ Clean

✅ All files passed security scan

# Push to GitHub
git push origin feature-branch

# GitHub Actions runs
✅ GuardRail AI Security Scan — Passed
   No vulnerabilities found
```

---

## 🚫 Excluded Files

The following are automatically excluded from scans:

- `test-*.js` — Test files
- `demo/` — Demo code
- `tests/` — Test directories
- `.next/` — Build artifacts
- `node_modules/` — Dependencies

**Configure in:**
- Pre-commit: `.githooks/pre-commit` (line 11)
- CI: `.github/workflows/guardrail.yml` (line 30)

---

## 🔒 Security Policies

### Severity Levels

| Severity | Pre-Commit | CI/CD | Action |
|----------|-----------|-------|--------|
| **Critical** | ❌ Block | ❌ Block | Must fix |
| **High** | ❌ Block | ❌ Block | Must fix |
| **Medium** | ⚠️ Warn | ✅ Allow | Review recommended |
| **Low** | ⚠️ Warn | ✅ Allow | Optional |

### Bypass Options

**Pre-commit:**
```bash
git commit --no-verify -m "message"
```

**CI/CD:**
- Cannot be bypassed (by design)
- Admin can force merge (not recommended)

---

## 🛠️ Troubleshooting

### Pre-Commit Hook Not Running

```bash
# Check hook is installed
ls -la .githooks/pre-commit

# Reinstall
./setup-hooks.sh

# Verify git config
git config core.hooksPath
# Should output: .githooks
```

### CI Failing to Connect to API

```bash
# Check GitHub secret is set
# Settings → Secrets → Actions → GUARDRAIL_API_URL

# Or update default in .github/workflows/guardrail.yml
GUARDRAIL_API_URL: ${{ secrets.GUARDRAIL_API_URL || 'http://98.93.184.65:3001' }}
```

### Scan Timeout

```bash
# Increase timeout in pre-commit hook
--max-time 30  # Change to 60

# Increase timeout in CI
--max-time 60  # Change to 120
```

---

## 📊 Monitoring

### View CI Logs

```bash
# GitHub repo → Actions tab → Select workflow run
# Click on "Security Scan" job
# View detailed logs
```

### View API Logs

```bash
# SSH into EC2
ssh -i ~/.ssh/guardrail-key.pem ec2-user@98.93.184.65

# View PM2 logs
pm2 logs guardrail-api

# View CloudWatch logs
aws logs tail /guardrail-ai/public --follow
```

---

## 🚀 Advanced Configuration

### Custom Scan Rules

Edit `.github/workflows/guardrail.yml`:

```yaml
# Scan only specific file types
grep -E '\.(js|ts)$'  # Only JS/TS

# Scan all files (no exclusions)
grep -E '\.(js|ts|py|java|go|rb|php)$'

# Change severity threshold
[ "$SEVERITY" = "critical" ] && CRITICAL=$((CRITICAL+1))
# Add: [ "$SEVERITY" = "medium" ] && CRITICAL=$((CRITICAL+1))
```

### Multiple API Endpoints

```bash
# Development
export GUARDRAIL_API_URL=http://localhost:3001

# Staging
export GUARDRAIL_API_URL=http://staging.guardrailai.com

# Production
export GUARDRAIL_API_URL=http://98.93.184.65:3001
```

---

## 📚 Related Documentation

- [Extension Guide](extensions/vscode/LOGS-PANEL-GUIDE.md)
- [API Documentation](PLATFORM-OVERVIEW.md)
- [Deployment Guide](DEPLOYMENT.md)

---

**Made with ❤️ for secure coding**
