# GuardRail AI Extension - Verification Checklist

## Pre-Installation Verification

### Backend Requirements
- [ ] Node.js 18+ installed
- [ ] AWS credentials configured in `api/.env`
- [ ] Backend dependencies installed (`npm install` in `api/`)
- [ ] Backend running on port 3001
- [ ] Backend health check passes: `curl http://localhost:3001/health`

### Extension Requirements
- [ ] Kiro/Cursor/Windsurf/VS Code installed
- [ ] Extension compiled (`npm run compile` in `extensions/vscode/`)
- [ ] Extension packaged (`npm run package` in `extensions/vscode/`)
- [ ] `.vsix` file created successfully

## Installation Verification

### Extension Installation
- [ ] Extension installed via VSIX file
- [ ] IDE restarted after installation
- [ ] Extension appears in Extensions list
- [ ] Extension version is 1.0.0
- [ ] No installation errors in IDE console

### Extension Activation
- [ ] Extension activates on supported file types (`.js`, `.ts`, `.py`, etc.)
- [ ] Welcome message appears on first activation
- [ ] Status bar shows "🛡️ GuardRail AI"
- [ ] Commands appear in Command Palette

## Functionality Verification

### 1. Manual Scan (Ctrl+Shift+G / Cmd+Shift+G)

**Test File: `test-hardcoded-secret.js`**
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```

- [ ] Press `Ctrl+Shift+G` (or `Cmd+Shift+G`)
- [ ] Status bar shows "🔍 Scanning..."
- [ ] Scan completes within 10 seconds
- [ ] Status bar shows "⚠️ 1 issue"
- [ ] Notification appears: "GuardRail AI found 1 security issue(s)"

### 2. Inline Diagnostics

- [ ] Red squiggly line appears under `'sk-1234567890abcdef'`
- [ ] Hover shows tooltip with vulnerability details
- [ ] Tooltip includes: severity emoji (🔴), message, description
- [ ] Problems panel (`Ctrl+Shift+M`) shows the issue
- [ ] Problem source is "GuardRail AI"
- [ ] Problem includes CWE code (e.g., CWE-798)

### 3. Quick Fix Actions

- [ ] Click on red squiggly line
- [ ] Lightbulb 💡 icon appears
- [ ] Click lightbulb shows menu with options:
  - [ ] "🛡️ Apply GuardRail AI Fix"
  - [ ] "🔍 Scan with GuardRail AI"
  - [ ] "🚫 Ignore this issue"

### 4. Apply Fix

- [ ] Click "Apply GuardRail AI Fix"
- [ ] Diff preview appears (if supported)
- [ ] Confirmation dialog appears
- [ ] Click "Apply"
- [ ] Code is replaced with secure version
- [ ] File is saved automatically
- [ ] Red squiggly line disappears
- [ ] Status bar shows "✅ Secure"

### 5. Auto-Scan on Save

**Settings Check:**
- [ ] Open settings (`Ctrl+,` or `Cmd+,`)
- [ ] Search "GuardRail AI"
- [ ] `guardrailai.autoScanOnSave` is `true`

**Test:**
- [ ] Create new file with vulnerable code
- [ ] Save file (`Ctrl+S` or `Cmd+S`)
- [ ] Scan triggers automatically
- [ ] Results appear without manual scan

### 6. Status Bar Integration

- [ ] Status bar item visible on right side
- [ ] Shows "🛡️ GuardRail AI" when idle
- [ ] Shows "🔍 Scanning..." during scan
- [ ] Shows "⚠️ X issues" when vulnerabilities found
- [ ] Shows "✅ Secure" when no issues
- [ ] Shows "❌ Scan Failed" on error
- [ ] Clicking status bar opens appropriate view

### 7. Workspace Scanning

- [ ] Open Command Palette (`Ctrl+Shift+P`)
- [ ] Type "GuardRail AI: Scan Workspace"
- [ ] Progress notification appears
- [ ] All supported files are scanned
- [ ] Summary notification shows results
- [ ] All issues appear in Problems panel

### 8. Multiple File Types

Test with different languages:

**JavaScript (.js)**
- [ ] Detects hardcoded secrets
- [ ] Detects SQL injection
- [ ] Generates correct fixes

**TypeScript (.ts)**
- [ ] File is recognized
- [ ] Scan works correctly
- [ ] Fixes maintain TypeScript syntax

**Python (.py)**
- [ ] File is recognized
- [ ] Scan works correctly
- [ ] Fixes use Python syntax

### 9. Error Handling

**Backend Not Running:**
- [ ] Stop backend
- [ ] Try to scan
- [ ] Error message: "GuardRail AI backend is not running"
- [ ] Error includes helpful instructions

**Invalid Code:**
- [ ] Scan file with syntax errors
- [ ] Extension handles gracefully
- [ ] No extension crash

**Network Timeout:**
- [ ] Set short timeout in settings
- [ ] Scan large file
- [ ] Timeout error appears
- [ ] Extension remains functional

### 10. Configuration

**Settings Verification:**
- [ ] `guardrailai.apiUrl` - Default: `http://localhost:3001`
- [ ] `guardrailai.autoScanOnSave` - Default: `true`
- [ ] `guardrailai.showInlineErrors` - Default: `true`
- [ ] `guardrailai.enableStatusBar` - Default: `true`
- [ ] `guardrailai.timeout` - Default: `30000`
- [ ] `guardrailai.supportedLanguages` - Includes all 7 languages

**Settings Changes:**
- [ ] Change API URL - Extension uses new URL
- [ ] Disable auto-scan - No scan on save
- [ ] Disable inline errors - No red squiggly lines
- [ ] Disable status bar - Status bar item hidden

## Performance Verification

### Scan Performance
- [ ] Small file (<100 lines): Completes in <5 seconds
- [ ] Medium file (100-500 lines): Completes in <10 seconds
- [ ] Large file (500-1000 lines): Completes in <30 seconds

### Resource Usage
- [ ] Extension doesn't slow down IDE
- [ ] No memory leaks after multiple scans
- [ ] CPU usage returns to normal after scan

## Integration Verification

### Problems Panel
- [ ] Issues appear in Problems panel
- [ ] Click issue navigates to code
- [ ] Issue details are complete
- [ ] Multiple issues are listed correctly

### Command Palette
- [ ] "GuardRail AI: Scan Current File" appears
- [ ] "GuardRail AI: Scan Workspace" appears
- [ ] "GuardRail AI: Clear Results" appears
- [ ] "GuardRail AI: Open Dashboard" appears
- [ ] All commands execute correctly

### Context Menu
- [ ] Right-click in editor shows "GuardRail AI: Scan Current File"
- [ ] Command works from context menu
- [ ] Only appears for supported file types

### Keyboard Shortcuts
- [ ] `Ctrl+Shift+G` (or `Cmd+Shift+G`) triggers scan
- [ ] Shortcut works in all supported files
- [ ] No conflicts with other extensions

## Automated Test Suite

Run the automated test suite:

```bash
cd extensions/vscode
node test-extension.js
```

- [ ] All tests pass
- [ ] No errors in test output
- [ ] Success rate is 100%

## Production Readiness

### Code Quality
- [ ] No TypeScript compilation errors
- [ ] No console errors in IDE
- [ ] No unhandled promise rejections
- [ ] Proper error handling throughout

### User Experience
- [ ] Clear, helpful error messages
- [ ] Intuitive UI/UX
- [ ] Fast response times
- [ ] No blocking operations

### Documentation
- [ ] README.md is complete
- [ ] DEVELOPMENT.md is accurate
- [ ] All examples work
- [ ] Installation instructions are clear

### Security
- [ ] No sensitive data in logs
- [ ] API communication is secure
- [ ] No credentials in code
- [ ] Proper input validation

## Final Verification

### End-to-End Test
1. [ ] Install extension from scratch
2. [ ] Configure settings
3. [ ] Scan vulnerable code
4. [ ] Apply fix
5. [ ] Verify code is secure
6. [ ] Scan workspace
7. [ ] Review all results
8. [ ] Uninstall and reinstall
9. [ ] Everything still works

### Sign-Off
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] No known bugs
- [ ] Ready for production use

---

**Verified By:** _______________  
**Date:** _______________  
**Version:** 1.0.0  
**Status:** ⬜ PASS / ⬜ FAIL

## Troubleshooting

### Issue: "guardrailai.applyfix not found"
**Cause:** Commands not registered in subscriptions array  
**Solution:**
```bash
cd extensions/vscode
npm run compile
npx @vscode/vsce package --out guardrail-ai-1.0.0.vsix
./reinstall-kiro.sh
# Reload IDE (Cmd+R)
```

### Issue: No red squiggly lines appear
**Possible causes:**
1. Backend not returning vulnerability data
   - Run: `./test-full-flow.sh` to verify backend
2. Diagnostics not being created
   - Check Output panel → GuardRail AI
3. File not being scanned
   - Manually trigger: Cmd+Shift+G

### Issue: Lightbulb doesn't show
**Possible causes:**
1. No diagnostics on that line
2. Code actions provider not registered
3. Commands not in subscriptions array
4. Click directly on the red squiggly line

### Issue: Backend connection failed
```bash
# Start backend
cd api
npm start

# Verify it's running
curl http://localhost:3001/health
```

### Issue: Fixes not applying
**Check:**
1. File is not read-only
2. File is saved before applying fix
3. Backend returned patchedCode in response
4. Check console for errors

## Quick Test Script

Run this to test the full flow:
```bash
cd extensions/vscode
./test-full-flow.sh
```

## Notes

_Add any additional notes or observations here:_

---

**If all items are checked, the extension is ready for production! 🎉**
