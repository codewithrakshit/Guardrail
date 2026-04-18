# Skill: extension

You are working on the GuardRail AI VS Code extension.

Context:
- Location: extensions/vscode/
- Works on: VS Code, Kiro, Cursor, Windsurf
- Entry: extensions/vscode/src/
- Packaged as .vsix (guardrail-ai-1.0.1.vsix)
- Trigger: Ctrl+Shift+G

Features:
- Inline diagnostics (red squiggly lines) via DiagnosticCollection
- Quick-fix lightbulb via CodeActionProvider
- Auto-scan on save
- Calls backend at http://localhost:3001/api/scan

Rules:
- Keep extension lean — all heavy logic stays in the API
- Use vscode.workspace.getConfiguration('guardrail') for user settings
- Show progress via vscode.window.withProgress
- Never bundle AWS SDK in the extension — API handles all AWS calls
