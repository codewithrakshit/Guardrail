# GuardRail AI - VS Code Extension

Autonomous security remediation powered by AI. Detect vulnerabilities and apply fixes automatically, right in your editor.

## Features

### 🔍 **One-Click Security Scanning**
- Press `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac) to scan your current file
- Automatic scanning on file save (configurable)
- Scan entire workspace with one command

### 🛡️ **Real-Time Vulnerability Detection**
- Detects 50+ vulnerability types including:
  - Hardcoded secrets and API keys
  - SQL injection
  - Cross-site scripting (XSS)
  - Path traversal
  - Insecure cryptography
  - And many more...

### ⚡ **Instant AI-Powered Fixes**
- AI generates production-ready patches
- One-click to apply fixes
- Automatic AWS Secrets Manager integration
- Preview changes before applying

### 📊 **Inline Diagnostics**
- Red squiggly lines under vulnerable code
- Hover to see detailed vulnerability information
- Severity indicators (Critical, High, Medium, Low)
- CWE references for each vulnerability

### 🎯 **Quick Fix Actions**
- Click the lightbulb 💡 icon
- Select "Apply GuardRail AI Fix"
- Code is automatically secured

### 📈 **Status Bar Integration**
- Real-time scan status
- Issue count badge
- Click to view detailed results

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "GuardRail AI"
4. Click Install

### From VSIX File
1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions
4. Click "..." menu → "Install from VSIX"
5. Select the downloaded file

## Setup

### 1. Start GuardRail AI Backend

```bash
# Clone the repository
git clone https://github.com/yourusername/guardrail-ai
cd guardrail-ai

# Install dependencies
npm install
cd api && npm install

# Configure AWS credentials
cp api/.env.example api/.env
# Edit api/.env with your AWS credentials

# Start the backend
npm run dev
```

The API will run on `http://localhost:3001`

### 2. Configure Extension

Open VS Code settings (`Ctrl+,`) and search for "GuardRail AI":

- **API URL**: `http://localhost:3001` (default)
- **Auto Scan on Save**: Enable/disable automatic scanning
- **Show Inline Errors**: Show/hide inline diagnostics
- **Timeout**: API request timeout in milliseconds

## Usage

### Scan Current File

**Method 1: Keyboard Shortcut**
- Press `Ctrl+Shift+G` (Windows/Linux)
- Press `Cmd+Shift+G` (Mac)

**Method 2: Command Palette**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
2. Type "GuardRail AI: Scan Current File"
3. Press Enter

**Method 3: Context Menu**
1. Right-click in the editor
2. Select "GuardRail AI: Scan Current File"

**Method 4: Editor Title Bar**
- Click the shield icon in the editor title bar

### Scan Workspace

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "GuardRail AI: Scan Workspace"
3. Wait for all files to be scanned
4. View results in Problems panel

### Apply Fixes

**Method 1: Quick Fix**
1. Click on the red squiggly line
2. Click the lightbulb 💡 icon
3. Select "Apply GuardRail AI Fix"
4. Review the diff preview
5. Click "Apply" to accept changes

**Method 2: From Notification**
1. After scan completes, click "Apply Fixes" in the notification
2. Review changes
3. Confirm to apply

### View Results

- **Problems Panel**: Press `Ctrl+Shift+M` to view all issues
- **Status Bar**: Click the status bar item to view issues
- **Hover**: Hover over red squiggly lines for details

## Supported Languages

- JavaScript (`.js`)
- TypeScript (`.ts`)
- Python (`.py`)
- Java (`.java`)
- Go (`.go`)
- Ruby (`.rb`)
- PHP (`.php`)

## Configuration

### Settings

```json
{
  "guardrailai.apiUrl": "http://localhost:3001",
  "guardrailai.autoScanOnSave": true,
  "guardrailai.showInlineErrors": true,
  "guardrailai.enableStatusBar": true,
  "guardrailai.timeout": 30000,
  "guardrailai.supportedLanguages": [
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "ruby",
    "php"
  ]
}
```

### Keyboard Shortcuts

| Command | Windows/Linux | Mac |
|---------|--------------|-----|
| Scan Current File | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| Open Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| View Problems | `Ctrl+Shift+M` | `Cmd+Shift+M` |

## Examples

### Example 1: Hardcoded API Key

**Before:**
```javascript
const apiKey = 'sk-1234567890abcdef';
fetch('https://api.example.com', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

**After GuardRail AI Fix:**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getApiKey() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'guardrail/prod/api-key'
  }).promise();
  return JSON.parse(secret.SecretString).apiKey;
}

const apiKey = await getApiKey();
fetch('https://api.example.com', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### Example 2: SQL Injection

**Before:**
```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**After GuardRail AI Fix:**
```javascript
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

## Troubleshooting

### Backend Not Running

**Error**: "GuardRail AI backend is not running"

**Solution**:
1. Make sure the backend API is running on `http://localhost:3001`
2. Check the API URL in settings
3. Verify AWS credentials are configured

### Scan Timeout

**Error**: "Scan timed out"

**Solution**:
1. Increase timeout in settings (default: 30000ms)
2. Try scanning a smaller file
3. Check backend logs for errors

### No Issues Found

If you expect issues but none are found:
1. Verify the file language is supported
2. Check that the code actually has vulnerabilities
3. Review backend logs for errors

## Privacy & Security

- Your code is sent to the GuardRail AI backend for analysis
- Code is encrypted in transit (HTTPS in production)
- Temporary files are deleted after 24 hours
- No code is stored permanently
- You can run your own backend for complete privacy

## Support

- **Documentation**: https://docs.guardrailai.com
- **GitHub Issues**: https://github.com/yourusername/guardrail-ai/issues
- **Discord**: Join our community
- **Email**: support@guardrailai.com

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](LICENSE) for details

## Changelog

### 1.0.0 (2024-01-01)
- Initial release
- One-click security scanning
- AI-powered fix generation
- Inline diagnostics
- Status bar integration
- Workspace scanning
- Multi-language support

---

**Made with ❤️ by the GuardRail AI team**
