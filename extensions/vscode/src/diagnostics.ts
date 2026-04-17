import * as vscode from 'vscode';
import { Vulnerability } from './scanner';

export class DiagnosticsManager {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('guardrailai');
    }

    setDiagnostics(uri: vscode.Uri, vulnerabilities: Vulnerability[]): void {
        const diagnostics: vscode.Diagnostic[] = vulnerabilities.map(vuln => {
            return this.createDiagnostic(vuln);
        });

        this.diagnosticCollection.set(uri, diagnostics);
    }

    private createDiagnostic(vulnerability: Vulnerability): vscode.Diagnostic {
        const line = (vulnerability.line || 1) - 1; // VS Code uses 0-based line numbers
        const column = (vulnerability.column || 0);
        
        const range = new vscode.Range(
            new vscode.Position(line, column),
            new vscode.Position(line, column + 100) // Highlight rest of line
        );

        const diagnostic = new vscode.Diagnostic(
            range,
            this.formatMessage(vulnerability),
            this.getSeverity(vulnerability.severity)
        );

        diagnostic.source = 'GuardRail AI';
        diagnostic.code = vulnerability.cwe || vulnerability.type;
        
        // Add related information
        if (vulnerability.description) {
            diagnostic.relatedInformation = [
                new vscode.DiagnosticRelatedInformation(
                    new vscode.Location(vscode.Uri.parse(''), range),
                    vulnerability.description
                )
            ];
        }

        return diagnostic;
    }

    private formatMessage(vulnerability: Vulnerability): string {
        const severityEmoji = this.getSeverityEmoji(vulnerability.severity);
        return `${severityEmoji} ${vulnerability.message}`;
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toLowerCase()) {
            case 'critical':
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }

    private getSeverityEmoji(severity: string): string {
        switch (severity.toLowerCase()) {
            case 'critical':
                return '🔴';
            case 'high':
                return '🟠';
            case 'medium':
                return '🟡';
            case 'low':
                return '🔵';
            default:
                return '⚠️';
        }
    }

    clear(uri?: vscode.Uri): void {
        if (uri) {
            this.diagnosticCollection.delete(uri);
        } else {
            this.diagnosticCollection.clear();
        }
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
    }
}
