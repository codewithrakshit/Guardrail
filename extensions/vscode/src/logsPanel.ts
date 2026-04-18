import * as vscode from 'vscode';
import axios from 'axios';

interface LogEntry {
    timestamp: string;
    event_type: string;
    message: string;
    severity?: string;
}

export class LogsTreeDataProvider implements vscode.TreeDataProvider<LogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<LogItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private logs: LogEntry[] = [];
    private sessionId: string | null = null;
    private apiUrl: string;
    private pollingInterval: NodeJS.Timeout | null = null;

    constructor() {
        const config = vscode.workspace.getConfiguration('guardrailai');
        this.apiUrl = config.get<string>('apiUrl', 'http://localhost:3001');
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async loadLogs(sessionId: string): Promise<void> {
        this.sessionId = sessionId;
        await this.fetchLogs();
    }

    private async fetchLogs(): Promise<void> {
        if (!this.sessionId) return;
        
        try {
            const response = await axios.get(`${this.apiUrl}/api/logs/${this.sessionId}`, { timeout: 10000 });
            this.logs = response.data.logs || [];
            this.refresh();
        } catch (error: any) {
            console.error('[GuardRail Logs] Failed to load logs:', error.message);
        }
    }

    startPolling(): void {
        this.stopPolling();
        this.pollingInterval = setInterval(() => {
            this.fetchLogs();
        }, 2000);
    }

    stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    clear(): void {
        this.logs = [];
        this.sessionId = null;
        this.stopPolling();
        this.refresh();
    }

    getTreeItem(element: LogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: LogItem): Thenable<LogItem[]> {
        if (!this.sessionId || this.logs.length === 0) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show logs (filtered)
            return Promise.resolve(
                this.logs
                    .filter(log => this.shouldShowLog(log))
                    .map(log => new LogItem(
                        this.formatLogMessage(log),
                        log.timestamp,
                        this.getIconForEventType(log.event_type),
                        vscode.TreeItemCollapsibleState.None
                    ))
            );
        }

        return Promise.resolve([]);
    }

    private formatLogMessage(log: LogEntry): string {
        const time = new Date(log.timestamp).toLocaleTimeString();
        return `[${time}] ${log.message}`;
    }

    private getIconForEventType(eventType: string): string {
        const iconMap: Record<string, string> = {
            'scan_started': '🔍',
            'scan_progress': '⏳',
            'scan_complete': '✅',
            'fix_requested': '🔧',
            'fix_generated': '✨',
            'error': '❌'
        };
        return iconMap[eventType] || '📝';
    }

    private shouldShowLog(log: LogEntry): boolean {
        // Filter out S3 storage logs
        const hideMessages = [
            'Storing code in S3',
            'Storing patch in S3',
            'Retrieving original code from S3'
        ];
        return !hideMessages.includes(log.message);
    }
}

class LogItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly timestamp: string,
        public readonly icon: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${timestamp}\n${label}`;
        this.iconPath = new vscode.ThemeIcon(this.getThemeIcon(icon));
    }

    private getThemeIcon(emoji: string): string {
        const iconMap: Record<string, string> = {
            '🔍': 'search',
            '⏳': 'loading~spin',
            '✅': 'check',
            '🔧': 'tools',
            '✨': 'star-full',
            '❌': 'error',
            '📝': 'note'
        };
        return iconMap[emoji] || 'circle-outline';
    }
}

export class LogsPanel {
    private treeDataProvider: LogsTreeDataProvider;
    private treeView: vscode.TreeView<LogItem>;

    constructor(context: vscode.ExtensionContext) {
        this.treeDataProvider = new LogsTreeDataProvider();
        this.treeView = vscode.window.createTreeView('guardrailLogs', {
            treeDataProvider: this.treeDataProvider
        });

        context.subscriptions.push(this.treeView);
    }

    async showLogs(sessionId: string, startPolling: boolean = false): Promise<void> {
        await this.treeDataProvider.loadLogs(sessionId);
        const items = await this.treeDataProvider.getChildren();
        if (items.length > 0) {
            this.treeView.reveal(items[0], { select: true, focus: true });
        }
        
        if (startPolling) {
            this.treeDataProvider.startPolling();
        }
    }

    stopPolling(): void {
        this.treeDataProvider.stopPolling();
    }

    clear(): void {
        this.treeDataProvider.clear();
    }

    refresh(): void {
        this.treeDataProvider.refresh();
    }
}
