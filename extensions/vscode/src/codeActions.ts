import * as vscode from 'vscode';
import { GuardRailScanner } from './scanner';
import { DiagnosticsManager } from './diagnostics';

export class CodeActionProvider implements vscode.CodeActionProvider {
    private scanner: GuardRailScanner;
    private diagnosticsManager: DiagnosticsManager;
    private cachedFixes: Map<string, string> = new Map();

    constructor(scanner: GuardRailScanner, diagnosticsManager: DiagnosticsManager) {
        this.scanner = scanner;
        this.diagnosticsManager = diagnosticsManager;
    }

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CodeAction[]> {
        const codeActions: vscode.CodeAction[] = [];

        // Check if there are GuardRail AI diagnostics in this range
        const guardrailDiagnostics = context.diagnostics.filter(
            diag => diag.source === 'GuardRail AI'
        );

        if (guardrailDiagnostics.length === 0) {
            return codeActions;
        }

        // Add "Apply GuardRail AI Fix" action - marked as preferred for quick access
        const fixAction = new vscode.CodeAction(
            '🛡️ Apply GuardRail AI Security Fix',
            vscode.CodeActionKind.QuickFix
        );
        fixAction.command = {
            command: 'guardrailai.applyFix',
            title: 'Apply GuardRail AI Security Fix',
            arguments: [document]
        };
        fixAction.diagnostics = guardrailDiagnostics;
        fixAction.isPreferred = true; // Makes this the default quick fix
        codeActions.push(fixAction);

        // Add "Scan with GuardRail AI" action
        const scanAction = new vscode.CodeAction(
            '🔍 Scan with GuardRail AI',
            vscode.CodeActionKind.QuickFix
        );
        scanAction.command = {
            command: 'guardrailai.scanFile',
            title: 'Scan with GuardRail AI'
        };
        codeActions.push(scanAction);

        // Add "Ignore this issue" action
        const ignoreAction = new vscode.CodeAction(
            '🚫 Ignore this issue',
            vscode.CodeActionKind.QuickFix
        );
        ignoreAction.command = {
            command: 'guardrailai.ignoreIssue',
            title: 'Ignore this issue',
            arguments: [document, range]
        };
        codeActions.push(ignoreAction);

        return codeActions;
    }
}
