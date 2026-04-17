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
exports.DiagnosticsManager = void 0;
const vscode = __importStar(require("vscode"));
class DiagnosticsManager {
    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('guardrailai');
    }
    setDiagnostics(uri, vulnerabilities) {
        const diagnostics = vulnerabilities.map(vuln => {
            return this.createDiagnostic(vuln);
        });
        this.diagnosticCollection.set(uri, diagnostics);
    }
    createDiagnostic(vulnerability) {
        const line = (vulnerability.line || 1) - 1; // VS Code uses 0-based line numbers
        const column = (vulnerability.column || 0);
        const range = new vscode.Range(new vscode.Position(line, column), new vscode.Position(line, column + 100) // Highlight rest of line
        );
        const diagnostic = new vscode.Diagnostic(range, this.formatMessage(vulnerability), this.getSeverity(vulnerability.severity));
        diagnostic.source = 'GuardRail AI';
        diagnostic.code = vulnerability.cwe || vulnerability.type;
        // Add related information
        if (vulnerability.description) {
            diagnostic.relatedInformation = [
                new vscode.DiagnosticRelatedInformation(new vscode.Location(vscode.Uri.parse(''), range), vulnerability.description)
            ];
        }
        return diagnostic;
    }
    formatMessage(vulnerability) {
        const severityEmoji = this.getSeverityEmoji(vulnerability.severity);
        return `${severityEmoji} ${vulnerability.message}`;
    }
    getSeverity(severity) {
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
    getSeverityEmoji(severity) {
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
    clear(uri) {
        if (uri) {
            this.diagnosticCollection.delete(uri);
        }
        else {
            this.diagnosticCollection.clear();
        }
    }
    dispose() {
        this.diagnosticCollection.dispose();
    }
}
exports.DiagnosticsManager = DiagnosticsManager;
//# sourceMappingURL=diagnostics.js.map