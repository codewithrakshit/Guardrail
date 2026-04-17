# GuardRail AI VS Code Extension - Development Guide

## Prerequisites

- Node.js 18+ and npm
- VS Code 1.80+
- GuardRail AI backend running

## Setup

### 1. Install Dependencies

```bash
cd extensions/vscode
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

Or watch for changes:

```bash
npm run watch
```

### 3. Run Extension in Development

1. Open the `extensions/vscode` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. A new VS Code window will open with the extension loaded
4. Open a JavaScript/Python/etc file
5. Press `Ctrl+Shift+G` to test scanning

## Project Structure

```
extensions/vscode/
├── src/
│   ├── extension.ts       # Main extension entry point
│   ├── scanner.ts         # API communication
│   ├── diagnostics.ts     # Problem reporting
│   ├── codeActions.ts     # Quick fix provider
│   └── statusBar.ts       # Status bar integration
├── out/                   # Compiled JavaScript (generated)
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── README.md              # User documentation
```

## Testing

### Manual Testing

1. Start the GuardRail AI backend:
```bash
cd ../../api
npm start
```

2. Launch Extension Development Host (F5)

3. Test scenarios:
   - Create a file with hardcoded API key
   - Press `Ctrl+Shift+G` to scan
   - Verify diagnostics appear
   - Test quick fix action
   - Test auto-scan on save

### Test Files

Create test files in the Extension Development Host:

**test-hardcoded-secret.js**
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```

**test-sql-injection.js**
```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**test-xss.js**
```javascript
document.innerHTML = userInput;
```

## Debugging

### Debug Extension Code

1. Set breakpoints in `src/*.ts` files
2. Press `F5` to start debugging
3. Trigger the extension functionality
4. Debugger will pause at breakpoints

### Debug Backend Communication

Add console.log statements in `scanner.ts`:

```typescript
console.log('Sending scan request:', { code, language, filename });
console.log('Received response:', response.data);
```

View logs in Debug Console (Ctrl+Shift+Y)

### Common Issues

**Issue**: Extension not activating

**Solution**: Check `activationEvents` in package.json

**Issue**: API connection refused

**Solution**: Verify backend is running on correct port

**Issue**: TypeScript errors

**Solution**: Run `npm run compile` to see detailed errors

## Building for Production

### 1. Install VSCE

```bash
npm install -g @vscode/vsce
```

### 2. Package Extension

```bash
npm run package
```

This creates `guardrail-ai-1.0.0.vsix`

### 3. Test VSIX

```bash
code --install-extension guardrail-ai-1.0.0.vsix
```

### 4. Publish to Marketplace

```bash
# Create publisher account at https://marketplace.visualstudio.com
vsce login <publisher-name>

# Publish
npm run publish
```

## Configuration

### Extension Settings

Defined in `package.json` under `contributes.configuration`:

```json
{
  "guardrailai.apiUrl": {
    "type": "string",
    "default": "http://localhost:3001",
    "description": "GuardRail AI API URL"
  }
}
```

Access in code:

```typescript
const config = vscode.workspace.getConfiguration('guardrailai');
const apiUrl = config.get<string>('apiUrl');
```

### Commands

Defined in `package.json` under `contributes.commands`:

```json
{
  "command": "guardrailai.scanFile",
  "title": "GuardRail AI: Scan Current File"
}
```

Register in `extension.ts`:

```typescript
const scanCommand = vscode.commands.registerCommand('guardrailai.scanFile', async () => {
  await scanCurrentFile();
});
```

## API Integration

### Scan Flow

```typescript
// 1. Submit scan
const response = await axios.post('/api/scan', {
  code: fileContent,
  language: 'javascript',
  filename: 'test.js'
});

// 2. Get session ID
const { sessionId } = response.data;

// 3. Poll for results
const result = await axios.get(`/api/result/${sessionId}`);

// 4. Display diagnostics
diagnosticsManager.setDiagnostics(uri, result.vulnerabilities);
```

### Error Handling

```typescript
try {
  const result = await scanner.scanCode(code, language, filename);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    vscode.window.showErrorMessage('Backend not running');
  } else {
    vscode.window.showErrorMessage(`Scan failed: ${error.message}`);
  }
}
```

## Performance Optimization

### 1. Debouncing

Don't scan on every keystroke:

```typescript
let scanTimeout: NodeJS.Timeout;

vscode.workspace.onDidChangeTextDocument((event) => {
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => {
    scanDocument(event.document);
  }, 2000); // Wait 2 seconds after last edit
});
```

### 2. Caching

Cache scan results for unchanged files:

```typescript
const cache = new Map<string, ScanResult>();

async function scanWithCache(uri: vscode.Uri, content: string) {
  const hash = hashContent(content);
  if (cache.has(hash)) {
    return cache.get(hash);
  }
  
  const result = await scanner.scanCode(content, language, filename);
  cache.set(hash, result);
  return result;
}
```

### 3. Background Processing

Use web workers for heavy processing:

```typescript
const worker = new Worker('./scanner-worker.js');
worker.postMessage({ code, language });
worker.onmessage = (event) => {
  displayResults(event.data);
};
```

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow VS Code extension guidelines
- Add JSDoc comments for public APIs
- Use async/await for promises

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit PR

### Commit Messages

Follow conventional commits:

```
feat: add workspace scanning
fix: resolve timeout issue
docs: update README
test: add scanner tests
```

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)

## Support

- GitHub Issues: Report bugs and request features
- Discord: Join our developer community
- Email: dev@guardrailai.com
