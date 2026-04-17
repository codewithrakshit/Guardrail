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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
class StatusBarManager {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'guardrailai.scanFile';
        this.reset();
        this.statusBarItem.show();
    }
    reset() {
        this.statusBarItem.text = '$(shield) GuardRail AI';
        this.statusBarItem.tooltip = 'Click to scan current file';
        this.statusBarItem.backgroundColor = undefined;
    }
    setScanning() {
        this.statusBarItem.text = '$(sync~spin) Scanning...';
        this.statusBarItem.tooltip = 'GuardRail AI is scanning your code';
        this.statusBarItem.backgroundColor = undefined;
    }
    setIssuesFound(count) {
        this.statusBarItem.text = `$(alert) ${count} issue${count !== 1 ? 's' : ''}`;
        this.statusBarItem.tooltip = `GuardRail AI found ${count} security issue${count !== 1 ? 's' : ''}. Click to view.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        this.statusBarItem.command = 'workbench.actions.view.problems';
    }
    setSecure() {
        this.statusBarItem.text = '$(shield-check) Secure';
        this.statusBarItem.tooltip = 'No security issues found';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.command = 'guardrailai.scanFile';
    }
    setError() {
        this.statusBarItem.text = '$(shield-x) Scan Failed';
        this.statusBarItem.tooltip = 'GuardRail AI scan failed. Click to retry.';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.command = 'guardrailai.scanFile';
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBar.js.map