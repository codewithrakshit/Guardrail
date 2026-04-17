# GuardRail AI - IDE Extension Integration Guide

## Overview

GuardRail AI can be integrated into any IDE as an extension/plugin. The extension communicates with your existing backend API to provide real-time security scanning and automated remediation directly in the developer's workflow.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         IDE                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │         GuardRail AI Extension                      │    │
│  │  - File watcher                                     │    │
│  │  - Command palette integration                      │    │
│  │  - Status bar indicator                             │    │
│  │  - Inline diagnostics                               │    │
│  │  - Quick fix actions                                │    │
│  └────────────────┬───────────────────────────────────┘    │
└───────────────────┼────────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              GuardRail AI Backend API                        │
│  POST /api/scan                                              │
│  GET  /api/result/{sessionId}                                │
│  GET  /api/logs                                              │
└─────────────────────────────────────────────────────────────┘
```

## Supported IDEs

### 1. **VS Code** (Easiest to implement)
- Language: TypeScript/JavaScript
- Extension API: Well-documented
- Marketplace: VS Code Marketplace

### 2. **JetBrains IDEs** (IntelliJ, PyCharm, WebStorm, etc.)
- Language: Kotlin/Java
- Plugin SDK: IntelliJ Platform SDK
- Marketplace: JetBrains Marketplace

### 3. **Sublime Text**
- Language: Python
- Package Control

### 4. **Vim/Neovim**
- Language: Lua/VimScript
- Plugin managers: vim-plug, packer.nvim

### 5. **Emacs**
- Language: Emacs Lisp
- Package: MELPA

## Core Features

### 1. **Manual Scan**
- Command: "GuardRail AI: Scan Current File"
- Keyboard shortcut: `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac)
- Right-click context menu option

### 2. **Auto-Scan on Save**
- Configurable setting
- Scans file automatically when saved
- Shows results in problems panel

### 3. **Inline Diagnostics**
- Red squiggly lines under vulnerable code
- Hover to see vulnerability details
- Severity indicators (Critical, High, Medium, Low)

### 4. **Quick Fix Actions**
- "Apply GuardRail AI Fix" code action
- One-click to apply the generated patch
- Shows diff preview before applying

### 5. **Status Bar Integration**
- Shows scan status (Scanning, Issues Found, Secure)
- Click to view detailed results
- Badge with issue count

### 6. **Results Panel**
- Dedicated panel showing all vulnerabilities
- Click to navigate to issue location
- View patch diff side-by-side

## Extension Configuration

```json
{
  "guardrailai.apiUrl": "http://localhost:3001",
  "guardrailai.autoScanOnSave": true,
  "guardrailai.showInlineErrors": true,
  "guardrailai.enableStatusBar": true,
  "guardrailai.apiKey": "",
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

## API Integration Flow

### 1. Scan Request
```typescript
// Extension sends code to API
const response = await fetch(`${apiUrl}/api/scan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: fileContent,
    language: fileLanguage,
    filename: fileName
  })
});

const { sessionId } = await response.json();
```

### 2. Poll for Results
```typescript
// Poll until scan completes
const result = await fetch(`${apiUrl}/api/result/${sessionId}`);
const data = await result.json();

if (data.status === 'completed') {
  // Show results in IDE
  displayVulnerabilities(data.vulnerabilities);
  offerQuickFixes(data.patchedCode);
}
```

### 3. Apply Fix
```typescript
// User clicks "Apply Fix"
const edit = new vscode.WorkspaceEdit();
const fullRange = new vscode.Range(
  document.positionAt(0),
  document.positionAt(document.getText().length)
);
edit.replace(document.uri, fullRange, data.patchedCode);
await vscode.workspace.applyEdit(edit);
```

## User Experience Flow

### Scenario 1: Manual Scan
1. Developer opens a file with hardcoded API key
2. Presses `Ctrl+Shift+G` or runs "GuardRail AI: Scan"
3. Status bar shows "🔍 Scanning..."
4. After 3 seconds, red squiggly appears under the API key
5. Hover shows: "Critical: Hardcoded Secret Detected"
6. Click lightbulb 💡 → "Apply GuardRail AI Fix"
7. Diff preview shows the fix
8. Click "Apply" → Code updated, secret moved to AWS Secrets Manager

### Scenario 2: Auto-Scan on Save
1. Developer writes code with SQL injection vulnerability
2. Saves file (`Ctrl+S`)
3. Extension automatically scans in background
4. Problems panel shows: "High: SQL Injection Vulnerability"
5. Click on problem → jumps to vulnerable line
6. Apply quick fix → parameterized query generated

### Scenario 3: Workspace Scan
1. Developer runs "GuardRail AI: Scan Workspace"
2. Extension scans all supported files
3. Results panel shows summary: "12 files scanned, 5 issues found"
4. Click on each issue to navigate and fix

## Security Considerations

### 1. **API Key Management**
- Store API key securely in IDE's secret storage
- Never commit API key to version control
- Support environment variables

### 2. **Code Privacy**
- Warn users that code is sent to backend
- Option to run local backend
- Support self-hosted deployments

### 3. **Network Security**
- Always use HTTPS in production
- Validate SSL certificates
- Timeout for long-running requests

## Performance Optimization

### 1. **Debouncing**
- Don't scan on every keystroke
- Wait 2-3 seconds after last edit before scanning

### 2. **Caching**
- Cache scan results for unchanged files
- Invalidate cache on file modification

### 3. **Background Processing**
- Run scans in background thread
- Don't block IDE UI

### 4. **File Size Limits**
- Skip files larger than 1MB
- Show warning for large files

## Error Handling

```typescript
try {
  const result = await scanFile(code);
  displayResults(result);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    showError('GuardRail AI backend is not running. Please start the API server.');
  } else if (error.code === 'TIMEOUT') {
    showError('Scan timed out. Try scanning a smaller file.');
  } else {
    showError(`Scan failed: ${error.message}`);
  }
}
```

## Testing Strategy

### 1. **Unit Tests**
- Test API communication
- Test result parsing
- Test code replacement logic

### 2. **Integration Tests**
- Test with real backend API
- Test different file types
- Test error scenarios

### 3. **Manual Testing**
- Test in different IDEs
- Test with various code samples
- Test performance with large files

## Distribution

### VS Code
```bash
# Package extension
vsce package

# Publish to marketplace
vsce publish
```

### JetBrains
- Upload to JetBrains Marketplace
- Follow plugin verification process

### Manual Installation
- Provide `.vsix` file for VS Code
- Provide `.jar` file for JetBrains
- GitHub Releases for distribution

## Roadmap

### Phase 1: Core Features (Week 1-2)
- ✅ Manual scan command
- ✅ Display results in problems panel
- ✅ Basic quick fix action

### Phase 2: Enhanced UX (Week 3-4)
- ✅ Auto-scan on save
- ✅ Inline diagnostics
- ✅ Status bar integration
- ✅ Diff preview

### Phase 3: Advanced Features (Week 5-6)
- ✅ Workspace scanning
- ✅ Custom rules configuration
- ✅ Ignore patterns
- ✅ Results history

### Phase 4: Multi-IDE Support (Week 7-8)
- ✅ JetBrains plugin
- ✅ Sublime Text package
- ✅ Vim plugin

## Example: VS Code Extension

See `extensions/vscode/` directory for complete implementation.

Key files:
- `extension.ts` - Main extension entry point
- `scanner.ts` - API communication
- `diagnostics.ts` - Problem reporting
- `codeActions.ts` - Quick fix provider
- `statusBar.ts` - Status bar integration

## Example: JetBrains Plugin

See `extensions/jetbrains/` directory for complete implementation.

Key files:
- `GuardRailAIPlugin.kt` - Plugin entry point
- `ScanAction.kt` - Scan action
- `Annotator.kt` - Inline error highlighting
- `QuickFix.kt` - Quick fix intention

## Support & Documentation

- **Documentation**: https://docs.guardrailai.com/extensions
- **GitHub**: https://github.com/yourusername/guardrail-ai-extensions
- **Issues**: Report bugs and feature requests
- **Discord**: Join our community for support

## Contributing

We welcome contributions! See `CONTRIBUTING.md` for guidelines.

Areas we need help:
- Additional IDE support (Atom, Eclipse, etc.)
- Improved error messages
- Performance optimizations
- Documentation improvements

## License

MIT License - See LICENSE file for details
