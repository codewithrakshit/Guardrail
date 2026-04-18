"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const scanner_1 = require("./scanner");
const diagnostics_1 = require("./diagnostics");
const codeActions_1 = require("./codeActions");
const statusBar_1 = require("./statusBar");
let scanner;
let diagnosticsManager;
let statusBar;
function activate(context) {
    console.log('GuardRail AI extension is now active');
    // Initialize managers
    scanner = new scanner_1.GuardRailScanner();
    diagnosticsManager = new diagnostics_1.DiagnosticsManager();
    statusBar = new statusBar_1.StatusBarManager();
    // Register commands
    const scanFileCommand = vscode.commands.registerCommand('guardrailai.scanFile', async () => {
        await scanCurrentFile();
    });
    const scanWorkspaceCommand = vscode.commands.registerCommand('guardrailai.scanWorkspace', async () => {
        await scanWorkspace();
    });
    const clearResultsCommand = vscode.commands.registerCommand('guardrailai.clearResults', () => {
        diagnosticsManager.clear();
        statusBar.reset();
        vscode.window.showInformationMessage('GuardRail AI: Results cleared');
    });
    const openDashboardCommand = vscode.commands.registerCommand('guardrailai.openDashboard', () => {
        const config = vscode.workspace.getConfiguration('guardrailai');
        const apiUrl = config.get('apiUrl', 'https://localhost:3001');
        const secureUrl = apiUrl.replace('http://', 'https://');
        vscode.env.openExternal(vscode.Uri.parse(`${secureUrl.replace(':3001', ':3000')}/dashboard`));
    });
    const applyFixCommand = vscode.commands.registerCommand('guardrailai.applyFix', async (document) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        // Get the latest scan result for this document
        const code = document.getText();
        const filename = document.fileName.split('/').pop() || 'untitled';
        try {
            statusBar.setScanning();
            const result = await scanner.scanCode(code, document.languageId, filename);
            if (result.patchedCode) {
                await applyFixes(document, result.patchedCode);
            }
            else {
                vscode.window.showWarningMessage('No fix available for this file');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to apply fix: ${error.message}`);
        }
        finally {
            statusBar.reset();
        }
    });
    const ignoreIssueCommand = vscode.commands.registerCommand('guardrailai.ignoreIssue', async (document, range) => {
        // Clear diagnostics for this specific range
        diagnosticsManager.clear(document.uri);
        vscode.window.showInformationMessage('Issue ignored');
    });
    // Register code action provider
    const codeActionProvider = vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, new codeActions_1.CodeActionProvider(scanner, diagnosticsManager), { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] });
    // Auto-scan on save
    const onSaveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = vscode.workspace.getConfiguration('guardrailai');
        const autoScan = config.get('autoScanOnSave', true);
        if (autoScan && isSupportedLanguage(document.languageId)) {
            await scanDocument(document);
        }
    });
    // Add to subscriptions
    context.subscriptions.push(scanFileCommand, scanWorkspaceCommand, clearResultsCommand, openDashboardCommand, applyFixCommand, ignoreIssueCommand, codeActionProvider, onSaveListener, diagnosticsManager, statusBar);
    // Show welcome message
    vscode.window.showInformationMessage('GuardRail AI is ready! Press Ctrl+Shift+G (Cmd+Shift+G on Mac) to scan.', 'Scan Now', 'Settings').then(selection => {
        if (selection === 'Scan Now') {
            vscode.commands.executeCommand('guardrailai.scanFile');
        }
        else if (selection === 'Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'guardrailai');
        }
    });
}
async function scanCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }
    await scanDocument(editor.document);
}
async function scanDocument(document) {
    if (!isSupportedLanguage(document.languageId)) {
        vscode.window.showWarningMessage(`Language "${document.languageId}" is not supported by GuardRail AI`);
        return;
    }
    const code = document.getText();
    const filename = document.fileName.split('/').pop() || 'untitled';
    // Show progress with cancellation
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'GuardRail AI',
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ message: '🔍 Analyzing code for vulnerabilities...' });
            statusBar.setScanning();
            const result = await scanner.scanCode(code, document.languageId, filename);
            console.log('[GuardRail AI] Scan result:', JSON.stringify(result, null, 2));
            if (result.status === 'completed') {
                const vulnerabilityCount = result.vulnerabilities?.length || 0;
                console.log('[GuardRail AI] Vulnerabilities found:', vulnerabilityCount);
                console.log('[GuardRail AI] Vulnerabilities:', result.vulnerabilities);
                if (vulnerabilityCount > 0) {
                    progress.report({ message: `✅ Found ${vulnerabilityCount} security issue(s)` });
                    diagnosticsManager.setDiagnostics(document.uri, result.vulnerabilities || []);
                    statusBar.setIssuesFound(vulnerabilityCount);
                    // Store sessionId for later fix generation
                    document._guardrailSessionId = result.sessionId;
                    // Small delay to show the completion message
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    vscode.window.showWarningMessage(`🛡️ GuardRail AI found ${vulnerabilityCount} security issue(s)`, 'View Issues', 'Apply Fixes').then(selection => {
                        if (selection === 'View Issues') {
                            vscode.commands.executeCommand('workbench.actions.view.problems');
                        }
                        else if (selection === 'Apply Fixes') {
                            generateAndApplyFixes(document, result.sessionId);
                        }
                    });
                }
                else {
                    progress.report({ message: '✅ No security issues found!' });
                    diagnosticsManager.clear(document.uri);
                    statusBar.setSecure();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    vscode.window.showInformationMessage('✅ No security issues found!');
                }
            }
            else if (result.status === 'error') {
                throw new Error(result.error || 'Scan failed');
            }
        }
        catch (error) {
            statusBar.setError();
            console.error('[GuardRail AI] Error:', error);
            if (error.message?.includes('No response')) {
                vscode.window.showErrorMessage('❌ GuardRail AI backend is not running. Please start the server: cd api && npm start', 'Open Settings').then(selection => {
                    if (selection === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'guardrailai.apiUrl');
                    }
                });
            }
            else {
                vscode.window.showErrorMessage(`❌ GuardRail AI scan failed: ${error.message}`);
            }
        }
    });
}
async function scanWorkspace() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
    }
    const config = vscode.workspace.getConfiguration('guardrailai');
    const supportedLanguages = config.get('supportedLanguages', []);
    const pattern = `**/*.{${supportedLanguages.map(lang => getFileExtension(lang)).join(',')}}`;
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
    if (files.length === 0) {
        vscode.window.showInformationMessage('No supported files found in workspace');
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'GuardRail AI: Scanning workspace',
        cancellable: true
    }, async (progress, token) => {
        let scanned = 0;
        let totalIssues = 0;
        for (const file of files) {
            if (token.isCancellationRequested) {
                break;
            }
            const document = await vscode.workspace.openTextDocument(file);
            progress.report({
                increment: (100 / files.length),
                message: `${scanned + 1}/${files.length} files`
            });
            try {
                const result = await scanner.scanCode(document.getText(), document.languageId, file.path.split('/').pop() || 'untitled');
                if (result.vulnerabilities && result.vulnerabilities.length > 0) {
                    diagnosticsManager.setDiagnostics(file, result.vulnerabilities);
                    totalIssues += result.vulnerabilities.length;
                }
            }
            catch (error) {
                console.error(`Failed to scan ${file.path}:`, error);
            }
            scanned++;
        }
        vscode.window.showInformationMessage(`GuardRail AI: Scanned ${scanned} files, found ${totalIssues} issue(s)`, 'View Issues').then(selection => {
            if (selection === 'View Issues') {
                vscode.commands.executeCommand('workbench.actions.view.problems');
            }
        });
    });
}
async function generateAndApplyFixes(document, sessionId) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'GuardRail AI',
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ message: '🔧 Generating security patches...' });
            const fixResult = await scanner.generateFix(sessionId);
            if (fixResult.patch && fixResult.patch.secureCode) {
                progress.report({ message: '✅ Patches generated!' });
                await new Promise(resolve => setTimeout(resolve, 500));
                await applyFixes(document, fixResult.patch.secureCode);
            }
            else {
                vscode.window.showWarningMessage('No fixes available');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate fixes: ${error.message}`);
        }
    });
}
async function applyFixes(document, patchedCode) {
    if (!patchedCode) {
        vscode.window.showWarningMessage('No fixes available');
        return;
    }
    try {
        // Create a temporary document with the patched code for preview
        const tempDoc = await vscode.workspace.openTextDocument({
            content: patchedCode,
            language: document.languageId
        });
        // Show diff between original and patched
        await vscode.commands.executeCommand('vscode.diff', document.uri, tempDoc.uri, `GuardRail AI: ${document.fileName.split('/').pop()} (Original ↔ Fixed)`);
        // Ask user to confirm
        const choice = await vscode.window.showInformationMessage('🛡️ Apply GuardRail AI security fixes?', { modal: true }, 'Apply Fixes', 'Cancel');
        if (choice === 'Apply Fixes') {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
            edit.replace(document.uri, fullRange, patchedCode);
            const success = await vscode.workspace.applyEdit(edit);
            if (success) {
                await document.save();
                diagnosticsManager.clear(document.uri);
                vscode.window.showInformationMessage('✅ Security fixes applied successfully!');
                // Close the diff view
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            }
            else {
                vscode.window.showErrorMessage('Failed to apply fixes');
            }
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to apply fixes: ${error.message}`);
    }
}
function isSupportedLanguage(languageId) {
    const config = vscode.workspace.getConfiguration('guardrailai');
    const supportedLanguages = config.get('supportedLanguages', []);
    return supportedLanguages.includes(languageId);
}
function getFileExtension(language) {
    const extensionMap = {
        'javascript': 'js',
        'typescript': 'ts',
        'python': 'py',
        'java': 'java',
        'go': 'go',
        'ruby': 'rb',
        'php': 'php'
    };
    return extensionMap[language] || language;
}
function deactivate() {
    diagnosticsManager?.dispose();
    statusBar?.dispose();
}
//# sourceMappingURL=extension.js.map