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
exports.CodeActionProvider = void 0;
const vscode = __importStar(require("vscode"));
class CodeActionProvider {
    constructor(scanner, diagnosticsManager) {
        this.cachedFixes = new Map();
        this.scanner = scanner;
        this.diagnosticsManager = diagnosticsManager;
    }
    async provideCodeActions(document, range, context, token) {
        const codeActions = [];
        // Check if there are GuardRail AI diagnostics in this range
        const guardrailDiagnostics = context.diagnostics.filter(diag => diag.source === 'GuardRail AI');
        if (guardrailDiagnostics.length === 0) {
            return codeActions;
        }
        // Add "Apply GuardRail AI Fix" action - marked as preferred for quick access
        const fixAction = new vscode.CodeAction('🛡️ Apply GuardRail AI Security Fix', vscode.CodeActionKind.QuickFix);
        fixAction.command = {
            command: 'guardrailai.applyFix',
            title: 'Apply GuardRail AI Security Fix',
            arguments: [document]
        };
        fixAction.diagnostics = guardrailDiagnostics;
        fixAction.isPreferred = true; // Makes this the default quick fix
        codeActions.push(fixAction);
        // Add "Scan with GuardRail AI" action
        const scanAction = new vscode.CodeAction('🔍 Scan with GuardRail AI', vscode.CodeActionKind.QuickFix);
        scanAction.command = {
            command: 'guardrailai.scanFile',
            title: 'Scan with GuardRail AI'
        };
        codeActions.push(scanAction);
        // Add "Ignore this issue" action
        const ignoreAction = new vscode.CodeAction('🚫 Ignore this issue', vscode.CodeActionKind.QuickFix);
        ignoreAction.command = {
            command: 'guardrailai.ignoreIssue',
            title: 'Ignore this issue',
            arguments: [document, range]
        };
        codeActions.push(ignoreAction);
        return codeActions;
    }
}
exports.CodeActionProvider = CodeActionProvider;
//# sourceMappingURL=codeActions.js.map