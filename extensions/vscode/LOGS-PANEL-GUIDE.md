# Extension Logs Panel - Installation & Usage

## What's New

The extension now includes a **real-time logs panel** that shows live progress during scans and fix generation.

## Features

✅ **Live Logs Panel** - See backend activity in real-time
✅ **Activity Bar Icon** - GuardRail AI shield icon in sidebar
✅ **Auto-Open on Scan** - Logs panel opens automatically when scanning
✅ **Timestamped Events** - All logs show exact timestamps
✅ **Event Icons** - Visual indicators for different log types:
   - 🔍 Scan started
   - ⏳ Scan in progress
   - ✅ Scan complete
   - 🔧 Fix requested
   - ✨ Fix generated
   - ❌ Errors

## Installation

### For Kiro IDE

```bash
cd extensions/vscode
./install-kiro.sh
```

### For VS Code / Cursor / Windsurf

```bash
cd extensions/vscode
code --install-extension guardrail-ai-1.0.1.vsix
```

## Usage

### 1. Scan a File

Press `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac)

**What happens:**
- Logs panel opens automatically in sidebar
- Shows "🔍 Scan started" with timestamp
- Shows "⏳ Analyzing code..." progress
- Shows "✅ Scan complete" with vulnerability count
- Red squiggly lines appear on vulnerable code

### 2. View Logs Anytime

Click the **GuardRail AI shield icon** in the Activity Bar (left sidebar)

Or run command: `GuardRail AI: View Logs`

### 3. Generate Fixes

Click "Apply Fixes" button after scan

**What happens:**
- Logs panel shows "🔧 Fix requested"
- Shows "⏳ Generating patches..."
- Shows "✨ Fix generated" when complete
- Diff view opens with before/after comparison

### 4. Refresh Logs

Click the **refresh icon** in logs panel toolbar

### 5. Clear Logs

Click the **clear icon** in logs panel toolbar

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Scan Current File | `Ctrl+Shift+G` | Scan active file |
| View Logs | - | Open logs panel |
| Refresh Logs | - | Reload logs from backend |
| Clear Logs | - | Clear logs panel |

## Logs Panel Location

The logs panel appears in the **Activity Bar** (left sidebar) with a shield icon.

Click the shield to expand/collapse the GuardRail AI sidebar.

## Backend Logs API

The extension fetches logs from:
- `GET /api/logs/:sessionId` - All logs for a session
- `GET /api/logs/:sessionId/errors` - Errors only

Logs are stored in:
- **DynamoDB** - Fast queries
- **CloudWatch** - Long-term searchable logs

## Troubleshooting

**Logs panel is empty:**
- Run a scan first (`Ctrl+Shift+G`)
- Check backend is running: `cd api && npm start`

**Logs not updating:**
- Click refresh icon in logs panel toolbar
- Check API URL in settings: `guardrailai.apiUrl`

**Backend not responding:**
- Verify backend is running on `http://localhost:3001`
- Check `/api/logs/:sessionId` endpoint is accessible

## Next Steps

After installation:
1. Open a file with vulnerable code (e.g., `test-simple-api-key.js`)
2. Press `Ctrl+Shift+G`
3. Watch the logs panel show real-time progress
4. Click "Apply Fixes" to see fix generation logs
5. Review the diff and apply the patch

---

**Made with ❤️ for secure coding**
