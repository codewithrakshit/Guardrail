# Apply Fix Flow - How It Works

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER TRIGGERS FIX                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Quick Fix 💡 │  │ Command      │  │ Notification │     │
│  │ (Lightbulb)  │  │ Palette      │  │ Button       │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         └──────────────────┴──────────────────┘             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. EXTENSION PROCESSES REQUEST                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Get current document                                │  │
│  │ • Extract code content                                │  │
│  │ • Get filename and language                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SCAN CODE (if needed)                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Call scanner.scanCode()                             │  │
│  │ • Send to backend API                                 │  │
│  │ • Wait for AI analysis                                │  │
│  │ • Receive patchedCode                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. CREATE DIFF VIEW                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Create temporary document with patchedCode          │  │
│  │ • Use vscode.diff command                             │  │
│  │ • Show side-by-side comparison                        │  │
│  │   ┌─────────────────┬─────────────────┐              │  │
│  │   │   ORIGINAL      │     FIXED       │              │  │
│  │   │   (with bugs)   │   (secure)      │              │  │
│  │   └─────────────────┴─────────────────┘              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. USER REVIEWS CHANGES                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Modal Dialog:                                         │  │
│  │ ┌────────────────────────────────────────────────┐   │  │
│  │ │ 🛡️ Apply GuardRail AI security fixes?         │   │  │
│  │ │                                                │   │  │
│  │ │  [ Apply Fixes ]    [ Cancel ]                │   │  │
│  │ └────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
        ┌───────────┐       ┌───────────┐
        │  CANCEL   │       │   APPLY   │
        └─────┬─────┘       └─────┬─────┘
              │                   │
              ▼                   ▼
        ┌───────────┐       ┌─────────────────────────────────┐
        │ Close     │       │  6. APPLY FIXES                 │
        │ Diff View │       │  ┌──────────────────────────┐   │
        └───────────┘       │  │ • Create WorkspaceEdit   │   │
                            │  │ • Replace full document  │   │
                            │  │ • Apply edit             │   │
                            │  │ • Save file              │   │
                            │  │ • Clear diagnostics      │   │
                            │  │ • Close diff view        │   │
                            │  │ • Show success message   │   │
                            │  └──────────────────────────┘   │
                            └─────────────────────────────────┘
                                          │
                                          ▼
                            ┌─────────────────────────────────┐
                            │  7. COMPLETE ✅                 │
                            │  ┌──────────────────────────┐   │
                            │  │ ✅ Fixes applied!        │   │
                            │  │ • File saved             │   │
                            │  │ • Diagnostics cleared    │   │
                            │  │ • Code is now secure     │   │
                            │  └──────────────────────────┘   │
                            └─────────────────────────────────┘
```

## 🔍 Detailed Steps

### Step 1: User Triggers Fix
Three ways to trigger:
- **Quick Fix:** Click lightbulb 💡 on diagnostic
- **Command Palette:** `Cmd+Shift+P` → "Apply Security Fix"
- **Notification:** Click "Apply Fixes" button after scan

### Step 2: Extension Processes
```typescript
const editor = vscode.window.activeTextEditor;
const document = editor.document;
const code = document.getText();
const filename = document.fileName.split('/').pop();
```

### Step 3: Scan Code
```typescript
const result = await scanner.scanCode(code, languageId, filename);
const patchedCode = result.patchedCode;
```

### Step 4: Create Diff View
```typescript
// Create temporary document with fixed code
const tempDoc = await vscode.workspace.openTextDocument({
    content: patchedCode,
    language: document.languageId
});

// Show side-by-side diff
await vscode.commands.executeCommand(
    'vscode.diff',
    document.uri,        // Original (left)
    tempDoc.uri,         // Fixed (right)
    'Original ↔ Fixed'   // Title
);
```

### Step 5: User Reviews
```typescript
const choice = await vscode.window.showInformationMessage(
    '🛡️ Apply GuardRail AI security fixes?',
    { modal: true },
    'Apply Fixes',
    'Cancel'
);
```

### Step 6: Apply Fixes
```typescript
if (choice === 'Apply Fixes') {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, fullRange, patchedCode);
    await vscode.workspace.applyEdit(edit);
    await document.save();
    diagnosticsManager.clear(document.uri);
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}
```

### Step 7: Complete
- ✅ File updated with secure code
- ✅ File saved automatically
- ✅ Red squiggly lines removed
- ✅ Diff view closed
- ✅ Success message shown

## 🎯 Key Improvements in v1.0.1

### Before (Broken):
```typescript
// ❌ This didn't work
const patchedUri = originalUri.with({ 
    scheme: 'guardrailai', 
    path: originalUri.path + '.fixed' 
});
const patchedDocument = await vscode.workspace.openTextDocument(
    patchedUri.with({ scheme: 'untitled', path: ... })
);
```

### After (Working):
```typescript
// ✅ This works perfectly
const tempDoc = await vscode.workspace.openTextDocument({
    content: patchedCode,
    language: document.languageId
});

await vscode.commands.executeCommand(
    'vscode.diff',
    document.uri,
    tempDoc.uri,
    title
);
```

## 🛡️ Security Benefits

### Original Code (Vulnerable):
```javascript
const apiKey = "sk_live_1234567890abcdef";
const query = "SELECT * FROM users WHERE id = " + userId;
```

### After Apply Fix (Secure):
```javascript
const apiKey = process.env.API_KEY;
const query = "SELECT * FROM users WHERE id = ?";
// Use parameterized query with userId
```

## 📊 User Experience

### Visual Feedback:
1. **Scanning:** Status bar shows "Scanning..."
2. **Issues Found:** Red squiggly lines appear
3. **Quick Fix:** Lightbulb 💡 appears on hover
4. **Diff View:** Side-by-side comparison
5. **Confirmation:** Modal dialog
6. **Success:** Green checkmark message

### Time to Fix:
- **Before:** Manual code review and editing (5-10 minutes)
- **After:** Click, review, apply (30 seconds)

## 🎉 Result

A seamless, visual, and safe way to apply AI-generated security fixes with full transparency and user control!
