# GuardRail AI - Testing Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend (Terminal 1)
```bash
cd "/Users/rakshit/Desktop/Workspace/GuardRail AI/GuardRail MVP"
./start-backend.sh
```
**Keep this terminal open** — you'll see live request logs.

### Step 2: Start Frontend (Terminal 2) — OPTIONAL
```bash
cd "/Users/rakshit/Desktop/Workspace/GuardRail AI/GuardRail MVP"
./start-frontend.sh
```
**Keep this terminal open** — web UI will be at http://localhost:3000

### Step 3: Test the API (Terminal 3)
```bash
cd "/Users/rakshit/Desktop/Workspace/GuardRail AI/GuardRail MVP"
./test-api.sh
```

---

## 🧪 Testing the IDE Extension

### Extension is already installed in Kiro ✅

### Test Flow:

1. **Open Kiro IDE**

2. **Open the test file:**
   ```
   File → Open → test-vulnerable.js
   ```

3. **Scan the file:**
   - Press `Cmd+Shift+G` (or `Ctrl+Shift+G` on Windows/Linux)
   - OR: Right-click → "GuardRail AI: Scan Current File"
   - OR: Command Palette (Cmd+Shift+P) → "GuardRail AI: Scan Current File"

4. **What you should see:**
   - Status bar shows "🛡️ GuardRail AI: Scanning..."
   - After 3-5 seconds: Red squiggly lines appear on vulnerable lines
   - Problems panel shows the issues
   - Notification: "GuardRail AI found X security issue(s)"

5. **Apply the fix:**
   - Click on a red squiggly line
   - Click the lightbulb 💡 that appears
   - Select "GuardRail AI: Apply Security Fix"
   - A diff view opens showing original ↔ fixed code
   - Click "Apply Fixes"
   - File is automatically patched and saved

---

## 🎯 What Each Vulnerability Should Detect

| Line | Vulnerability | Severity | CWE |
|------|---------------|----------|-----|
| 4 | Hardcoded API key | CRITICAL | CWE-798 |
| 8 | SQL Injection | HIGH | CWE-89 |
| 13 | Insecure HTTP | MEDIUM | CWE-319 |
| 16 | Hardcoded password | CRITICAL | CWE-798 |

---

## 🔧 Troubleshooting

### Extension not working?
```bash
# Verify extension is installed
/Applications/Kiro.app/Contents/Resources/app/bin/code --list-extensions | grep guardrail

# Reinstall if needed
cd extensions/vscode
/Applications/Kiro.app/Contents/Resources/app/bin/code --install-extension guardrail-ai-1.0.1.vsix --force
```

### Backend not responding?
```bash
# Check if it's running
curl http://localhost:3001/health

# Check logs
tail -f /tmp/guardrail-api.log

# Restart
pkill -f "node server.js"
./start-backend.sh
```

### No red squiggly lines?
1. Check backend is running: `curl http://localhost:3001/health`
2. Check Kiro's Output panel: View → Output → Select "GuardRail AI"
3. Check Problems panel: View → Problems
4. Try manual scan: Cmd+Shift+P → "GuardRail AI: Scan Current File"

### Bedrock rate limit error?
The API now uses the cross-region inference profile `us.amazon.nova-lite-v1:0` which has higher limits. If you still hit limits, wait 5-10 minutes.

---

## 📊 Testing the Web UI (Optional)

1. Make sure frontend is running: http://localhost:3000
2. Go to http://localhost:3000/scan
3. Paste this code:
   ```javascript
   const apiKey = "sk-test123";
   console.log(apiKey);
   ```
4. Click "Scan Code"
5. View results with side-by-side diff
6. Download the patched code

---

## 🎬 Demo Script (For Presentation)

### 30-Second Demo:
1. Open `test-vulnerable.js` in Kiro
2. Press `Cmd+Shift+G`
3. Point to red squiggly line: "Critical vulnerability detected"
4. Click lightbulb → "Apply Fix"
5. Show the diff
6. Click "Apply Fixes"
7. "Fixed in one click, directly in the IDE"

### 2-Minute Demo:
1. Show the web UI at http://localhost:3000
2. Paste vulnerable code → Scan
3. Show the results dashboard
4. Show the side-by-side diff
5. Switch to Kiro IDE
6. Open `test-vulnerable.js`
7. Press `Cmd+Shift+G`
8. Show inline diagnostics
9. Apply fix with lightbulb
10. "This is SOAR for developers — detect and remediate before code ships"

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Health check returns `{"status":"healthy"}`
- [ ] Extension installed in Kiro
- [ ] Can scan `test-vulnerable.js` with `Cmd+Shift+G`
- [ ] Red squiggly lines appear
- [ ] Lightbulb shows "Apply Fix" option
- [ ] Diff view opens when clicking "Apply Fix"
- [ ] Code is patched after clicking "Apply Fixes"

---

## 🚨 Known Issues

1. **Bedrock rate limits**: If you hit the daily token limit, wait 5-10 minutes or switch to a different region in `.env`
2. **Extension commands not found**: Reload Kiro window (Cmd+R)
3. **Port already in use**: Kill existing processes with `lsof -ti:3001 | xargs kill -9`

---

## 📝 What We Built Today

### Security Fixes (DONE ✅)
- Removed debug logs that exposed secret metadata
- Sanitized filename input to prevent prompt injection
- Stripped stack traces from logs to prevent path leakage
- Added HTTP request logging with Morgan

### New Features (DONE ✅)
- GitHub webhook route with signature verification
- GitHub client for PR scanning and inline comments
- Notifier service (SES email + Slack alerts)
- GitHub Actions CI workflow
- CLI tool with colored output and `--fix` flag

### Ready for Tomorrow
- GitHub webhook integration
- Email/Slack notifications
- CI/CD pipeline integration
- CLI deployment

---

**Made with ❤️ for secure coding**
