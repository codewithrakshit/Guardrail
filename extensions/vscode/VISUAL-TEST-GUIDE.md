# 👀 Visual Test Guide

This guide shows you exactly what to look for when testing the extension.

## Step 1: Install & Reload

```bash
cd extensions/vscode
./reinstall-kiro.sh
```

Then press `Cmd+R` in Kiro IDE to reload.

## Step 2: Open test.js

Open the `test.js` file in the root directory. You should see:

```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```

## Step 3: Scan the File

Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux)

### What You Should See:

**Status Bar (bottom right):**
```
Before scan:  🛡️ GuardRail AI
During scan:  🔍 Scanning...
After scan:   ⚠️ 1 issue
```

**Notification (top right):**
```
⚠️ GuardRail AI found 1 security issue(s)
[View Issues] [Apply Fixes]
```

## Step 4: Look for Red Squiggly Line

### What You Should See:

```javascript
const apiKey = 'sk-1234567890abcdef';
              ^^^^^^^^^^^^^^^^^^^^^^^^
              Red squiggly line here!
console.log(apiKey);
```

The red line should appear under the hardcoded API key string.

## Step 5: Hover Over the Issue

Move your mouse over the red squiggly line.

### What You Should See:

```
┌─────────────────────────────────────────────┐
│ 🔴 CRITICAL: hardcoded secret               │
│                                             │
│ Hardcoded credentials detected. This       │
│ should be stored in AWS Secrets Manager.   │
│                                             │
│ Source: GuardRail AI                        │
│ Code: CWE-798                               │
└─────────────────────────────────────────────┘
```

## Step 6: Open Problems Panel

Press `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)

### What You Should See:

```
PROBLEMS (1)
├─ test.js
   └─ 🔴 CRITICAL: hardcoded secret [Ln 1, Col 0] GuardRail AI (CWE-798)
```

## Step 7: Click on the Red Line

Click directly on the red squiggly line in the editor.

### What You Should See:

A lightbulb icon 💡 appears in the left margin:

```javascript
💡 const apiKey = 'sk-1234567890abcdef';
   console.log(apiKey);
```

## Step 8: Click the Lightbulb

Click the 💡 lightbulb icon.

### What You Should See:

A menu appears with 3 options:

```
┌─────────────────────────────────────────┐
│ 🛡️ Apply GuardRail AI Fix              │  ← Click this!
│ 🔍 Scan with GuardRail AI               │
│ 🚫 Ignore this issue                    │
└─────────────────────────────────────────┘
```

## Step 9: Apply the Fix

Click "🛡️ Apply GuardRail AI Fix"

### What You Should See:

**Confirmation Dialog:**
```
┌─────────────────────────────────────────┐
│ Apply GuardRail AI fixes?               │
│                                         │
│ [Apply] [Cancel]                        │
└─────────────────────────────────────────┘
```

Click **[Apply]**

## Step 10: Verify the Fix

### What You Should See:

**Before:**
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```

**After:**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getApiKey() {
  const data = await secretsManager.getSecretValue({ 
    SecretId: 'guardrail-secret-xxxxx' 
  }).promise();
  return JSON.parse(data.SecretString).apiKey;
}

// Usage
getApiKey().then(apiKey => {
  console.log(apiKey);
});
```

**Status Bar:**
```
✅ Secure
```

**Problems Panel:**
```
PROBLEMS (0)
No problems have been detected in the workspace.
```

**Red Squiggly Line:**
```
GONE! ✅
```

## Success Indicators

✅ **Extension is working if you see:**
- Red squiggly line after scan
- Hover tooltip with vulnerability details
- Issue in Problems panel
- Lightbulb icon when clicking on line
- Quick fix menu with 3 options
- Code replaced after applying fix
- Red line disappears after fix

❌ **Something is wrong if:**
- No red squiggly line after scan
- No lightbulb icon appears
- "Command not found" error
- No changes after clicking "Apply"

## Troubleshooting Visual Cues

### No Red Line?
**Check:**
1. Status bar - Does it show "⚠️ 1 issue"?
2. Problems panel - Does it show the issue?
3. Backend - Is it running? `curl http://localhost:3001/health`

### No Lightbulb?
**Try:**
1. Click **directly** on the red line (not near it)
2. Right-click → "Quick Fix"
3. Check if code actions are enabled in settings

### Fix Doesn't Apply?
**Check:**
1. File is not read-only
2. Backend returned patchedCode
3. Console for errors (Help → Toggle Developer Tools)

## Quick Test Checklist

- [ ] Red squiggly line appears ✅
- [ ] Hover shows vulnerability details ✅
- [ ] Problems panel shows issue ✅
- [ ] Lightbulb appears when clicking ✅
- [ ] Menu shows 3 options ✅
- [ ] "Apply Fix" option present ✅
- [ ] Clicking it applies the fix ✅
- [ ] Code is replaced ✅
- [ ] Red line disappears ✅
- [ ] Status bar shows "✅ Secure" ✅

## All Good? 🎉

If you see all the visual indicators above, your extension is working perfectly!

## Need More Help?

- Full checklist: `VERIFICATION-CHECKLIST.md`
- Installation guide: `INSTALLATION-COMPLETE.md`
- Quick fix guide: `QUICK-FIX-GUIDE.md`
- Backend test: `./test-full-flow.sh`
