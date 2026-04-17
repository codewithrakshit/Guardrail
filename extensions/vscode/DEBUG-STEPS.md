# 🐛 Debug Steps - Command Not Found

## Current Status

✅ Commands declared in package.json
✅ Commands registered in extension.js  
✅ Commands added to subscriptions
✅ Extension package built (907KB)

## The Problem

The extension code is correct, but Kiro IDE might not be loading the new version.

## Solution: Force Clean Reinstall

```bash
cd extensions/vscode

# Use the force reinstall script
./force-reinstall.sh

# Then COMPLETELY RESTART Kiro IDE
# (Not just reload - fully quit and reopen)
```

## After Restart - Verify Commands Are Loaded

### Step 1: Check Command Palette
1. Open Command Palette (`Cmd+Shift+P`)
2. Type: `GuardRail AI`
3. You should see these 6 commands:
   - GuardRail AI: Scan Current File
   - GuardRail AI: Scan Workspace
   - GuardRail AI: Clear Results
   - GuardRail AI: Open Dashboard
   - **GuardRail AI: Apply Fix** ← Should be here!
   - **GuardRail AI: Ignore Issue** ← Should be here!

### Step 2: Check Extension is Loaded
1. Open Extensions panel
2. Search for "GuardRail AI"
3. Should show version 1.0.0
4. Should be enabled (not disabled)

### Step 3: Check Developer Console
1. Help → Toggle Developer Tools
2. Go to Console tab
3. Look for: `GuardRail AI extension is now active`
4. If you see errors, copy them

## Test Sequence

### 1. Scan test.js
```bash
# Open test.js
# Press Cmd+Shift+G
```

**Expected:**
- Status bar shows "🔍 Scanning..."
- Then shows "⚠️ 1 issue"
- Red squiggly line appears

### 2. Check Problems Panel
```bash
# Press Cmd+Shift+M
```

**Expected:**
- Shows 1 problem
- Source: "GuardRail AI"
- Message: "🔴 CRITICAL: hardcoded secret"

### 3. Try Lightbulb
```bash
# Click on the red squiggly line
# Look for lightbulb icon in left margin
```

**Expected:**
- Lightbulb 💡 appears
- Click it
- Menu shows 3 options

### 4. Check Menu Options
**Expected menu:**
- 🛡️ Apply GuardRail AI Fix
- 🔍 Scan with GuardRail AI
- 🚫 Ignore this issue

## If "Apply Fix" Still Not Found

### Option A: Try Manual Command
1. Open Command Palette (`Cmd+Shift+P`)
2. Type: `GuardRail AI: Apply Fix`
3. Press Enter
4. Does it work?

### Option B: Check Extension Logs
1. View → Output
2. Select "GuardRail AI" from dropdown
3. Look for errors

### Option C: Reinstall from Scratch
```bash
# Remove extension completely
kiro --uninstall-extension guardrail-ai

# Remove cache
rm -rf ~/.kiro/extensions/*guardrail*

# Quit Kiro completely
# Restart Kiro

# Install fresh
cd extensions/vscode
kiro --install-extension guardrail-ai-1.0.0.vsix

# Restart Kiro again
```

## Alternative: Use "Apply Fixes" Button

Instead of the lightbulb, try this:

1. Scan file (`Cmd+Shift+G`)
2. When notification appears: "GuardRail AI found 1 security issue(s)"
3. Click **"Apply Fixes"** button in the notification
4. Does this work?

## If Nothing Works

The command is definitely in the extension. If it's still not found, it means:

1. **Kiro isn't loading the new extension**
   - Solution: Complete restart (not just reload)
   
2. **Old extension is cached**
   - Solution: Clear cache and reinstall
   
3. **Extension isn't activating**
   - Check: Developer Console for activation errors

## Diagnostic Commands

```bash
# Check if extension is installed
kiro --list-extensions | grep guardrail

# Check extension file
ls -lh ~/.kiro/extensions/*/package.json | grep guardrail

# Verify our package
cd extensions/vscode
node verify-commands.js
```

## Last Resort: Manual Test

If the lightbulb doesn't work, test the command directly:

1. Open test.js
2. Scan it (`Cmd+Shift+G`)
3. Open Command Palette (`Cmd+Shift+P`)
4. Type: `GuardRail AI: Apply Fix`
5. Press Enter

If this works but lightbulb doesn't, the issue is with code actions provider, not the command itself.

## Report Back

If still not working, please provide:
1. Output of: `kiro --list-extensions | grep guardrail`
2. Screenshot of Command Palette showing "GuardRail AI" commands
3. Any errors from Developer Console
4. Does the "Apply Fixes" button in notification work?
