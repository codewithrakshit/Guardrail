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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsPanel = exports.LogsTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class LogsTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.logs = [];
        this.sessionId = null;
        this.pollingInterval = null;
        const config = vscode.workspace.getConfiguration('guardrailai');
        this.apiUrl = config.get('apiUrl', 'http://localhost:3001');
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    async loadLogs(sessionId) {
        this.sessionId = sessionId;
        await this.fetchLogs();
    }
    async fetchLogs() {
        if (!this.sessionId)
            return;
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/api/logs/${this.sessionId}`, { timeout: 10000 });
            this.logs = response.data.logs || [];
            this.refresh();
        }
        catch (error) {
            console.error('[GuardRail Logs] Failed to load logs:', error.message);
        }
    }
    startPolling() {
        this.stopPolling();
        this.pollingInterval = setInterval(() => {
            this.fetchLogs();
        }, 2000);
    }
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    clear() {
        this.logs = [];
        this.sessionId = null;
        this.stopPolling();
        this.refresh();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.sessionId || this.logs.length === 0) {
            return Promise.resolve([]);
        }
        if (!element) {
            // Root level - show logs (filtered)
            return Promise.resolve(this.logs
                .filter(log => this.shouldShowLog(log))
                .map(log => new LogItem(this.formatLogMessage(log), log.timestamp, this.getIconForEventType(log.event_type), vscode.TreeItemCollapsibleState.None)));
        }
        return Promise.resolve([]);
    }
    formatLogMessage(log) {
        const time = new Date(log.timestamp).toLocaleTimeString();
        return `[${time}] ${log.message}`;
    }
    getIconForEventType(eventType) {
        const iconMap = {
            'scan_started': '🔍',
            'scan_progress': '⏳',
            'scan_complete': '✅',
            'fix_requested': '🔧',
            'fix_generated': '✨',
            'error': '❌'
        };
        return iconMap[eventType] || '📝';
    }
    shouldShowLog(log) {
        // Filter out S3 storage logs
        const hideMessages = [
            'Storing code in S3',
            'Storing patch in S3',
            'Retrieving original code from S3'
        ];
        return !hideMessages.includes(log.message);
    }
}
exports.LogsTreeDataProvider = LogsTreeDataProvider;
class LogItem extends vscode.TreeItem {
    constructor(label, timestamp, icon, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.timestamp = timestamp;
        this.icon = icon;
        this.collapsibleState = collapsibleState;
        this.tooltip = `${timestamp}\n${label}`;
        this.iconPath = new vscode.ThemeIcon(this.getThemeIcon(icon));
    }
    getThemeIcon(emoji) {
        const iconMap = {
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
class LogsPanel {
    constructor(context) {
        this.treeDataProvider = new LogsTreeDataProvider();
        this.treeView = vscode.window.createTreeView('guardrailLogs', {
            treeDataProvider: this.treeDataProvider
        });
        context.subscriptions.push(this.treeView);
    }
    async showLogs(sessionId, startPolling = false) {
        await this.treeDataProvider.loadLogs(sessionId);
        const items = await this.treeDataProvider.getChildren();
        if (items.length > 0) {
            this.treeView.reveal(items[0], { select: true, focus: true });
        }
        if (startPolling) {
            this.treeDataProvider.startPolling();
        }
    }
    stopPolling() {
        this.treeDataProvider.stopPolling();
    }
    clear() {
        this.treeDataProvider.clear();
    }
    refresh() {
        this.treeDataProvider.refresh();
    }
}
exports.LogsPanel = LogsPanel;
//# sourceMappingURL=logsPanel.js.map