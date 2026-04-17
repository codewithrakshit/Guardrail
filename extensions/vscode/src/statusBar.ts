import * as vscode from 'vscode';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'guardrailai.scanFile';
        this.reset();
        this.statusBarItem.show();
    }

    reset(): void {
        this.statusBarItem.text = '$(shield) GuardRail AI';
        this.statusBarItem.tooltip = 'Click to scan current file';
        this.statusBarItem.backgroundColor = undefined;
    }

    setScanning(): void {
        this.statusBarItem.text = '$(sync~spin) Scanning...';
        this.statusBarItem.tooltip = 'GuardRail AI is scanning your code';
        this.statusBarItem.backgroundColor = undefined;
    }

    setIssuesFound(count: number): void {
        this.statusBarItem.text = `$(alert) ${count} issue${count !== 1 ? 's' : ''}`;
        this.statusBarItem.tooltip = `GuardRail AI found ${count} security issue${count !== 1 ? 's' : ''}. Click to view.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        this.statusBarItem.command = 'workbench.actions.view.problems';
    }

    setSecure(): void {
        this.statusBarItem.text = '$(shield-check) Secure';
        this.statusBarItem.tooltip = 'No security issues found';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.command = 'guardrailai.scanFile';
    }

    setError(): void {
        this.statusBarItem.text = '$(shield-x) Scan Failed';
        this.statusBarItem.tooltip = 'GuardRail AI scan failed. Click to retry.';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.command = 'guardrailai.scanFile';
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
