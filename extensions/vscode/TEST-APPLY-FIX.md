# Testing the Apply Fix Feature

## What Was Fixed

### 1. Apply Fix Functionality
- ✅ Fixed the diff preview mechanism
- ✅ Now uses `vscode.diff` command for side-by-side comparison
- ✅ Properly creates temporary document for preview
- ✅ Better error handling and user feedback
- ✅ Closes diff view after applying fixes

### 2. Icon/Image Added
- ✅ Created SVG icon with shield and AI circuit design
- ✅ Updated package.json to reference icon
- ✅ Added multiple methods to generate PNG version
- ✅ Icon will appear in VS Code marketplace and UI

### 3. Enhanced UI
- ✅ Better command titles with descriptive names
- ✅ Added icons to all commands
- ✅ Improved code action text
- ✅ Made "Apply Fix" the preferred quick fix action

## How to Test Apply Fix

### Step 1: Start the Backend
```bash
cd "GuardRail MVP/api"
npm start
```

### Step 2: Install/Reload Extension
```bash
cd "GuardRail MVP/extensions/vscode"
npm run compile
code --install-extension guardrail-ai-1.0.0.vsix --force
```

Or in VS Code:
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Reload Window"
- Press Enter

### Step 3: Test with Vulnerable Code

Create a test file `test-vulnerable.js`:

```javascript
// Test file with security issues
const apiKey = "sk_live_1234567890abcdef";
const password = "admin123";

function getUserData(userId) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return db.query(query);
}

fetch("http://api.example.com/data")
    .then(res => res.json());
```

### Step 4: Scan the File
1. Open `test-vulnerable.js` in VS Code
2. Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux)
3. Wait for scan to complete

### Step 5: Apply Fix (Method 1 - Quick Fix)
1. Click on any red squiggly line (diagnostic)
2. Click the lightbulb 💡 icon that appears
3. Select "🛡️ Apply GuardRail AI Security Fix"
4. Review the diff view showing original vs fixed code
5. Click "Apply Fixes" to accept changes

### Step 6: Apply Fix (Method 2 - Command Palette)
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "GuardRail AI: Apply Security Fix"
3. Press Enter
4. Review diff and apply

### Step 7: Apply Fix (Method 3 - Notification)
1. After scanning, click "Apply Fixes" in the notification
2. Review diff and apply

## Expected Behavior

### Before Fix Applied:
- Red squiggly lines under security issues
- Problems panel shows vulnerabilities
- Status bar shows issue count

### During Fix Application:
- Diff view opens showing:
  - LEFT: Original code with issues
  - RIGHT: Fixed code with security improvements
- Modal dialog asks: "🛡️ Apply GuardRail AI security fixes?"
- Two buttons: "Apply Fixes" and "Cancel"

### After Fix Applied:
- ✅ Success message: "Security fixes applied successfully!"
- Red squiggly lines disappear
- Problems panel clears
- File is automatically saved
- Diff view closes

## Common Issues and Solutions

### Issue: "No fixes available"
**Solution:** The backend didn't generate a patch. Check:
- Backend is running (`npm start` in api folder)
- Backend logs show patch generation
- API response includes `patchedCode` field

### Issue: Diff view doesn't open
**Solution:** 
- Check VS Code version (needs 1.80.0+)
- Try reloading window
- Check extension output logs

### Issue: Changes not applied
**Solution:**
- Ensure file is not read-only
- Check file permissions
- Try saving file manually first

## Verifying the Icon

### Check Icon in Extensions View:
1. Open Extensions view (`Cmd+Shift+X`)
2. Search for "GuardRail AI"
3. Icon should appear next to extension name

### Generate PNG Icon:
```bash
cd "GuardRail MVP/extensions/vscode"
./create-simple-icon.sh
```

Or follow instructions in `ICON-SETUP.md`

## Success Criteria

✅ Apply Fix opens diff view correctly
✅ Original and fixed code shown side-by-side
✅ User can review changes before applying
✅ Fixes apply successfully when confirmed
✅ Diagnostics clear after fix
✅ File saves automatically
✅ Icon appears in VS Code UI
✅ All commands have proper icons
✅ Quick fix is marked as preferred

## Next Steps

1. Generate PNG icon using one of the methods in `ICON-SETUP.md`
2. Test with various vulnerability types
3. Verify diff view works on large files
4. Test canceling the fix application
5. Package and distribute: `npm run package`
