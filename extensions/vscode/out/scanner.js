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
exports.GuardRailScanner = void 0;
const axios_1 = __importDefault(require("axios"));
const vscode = __importStar(require("vscode"));
class GuardRailScanner {
    constructor() {
        this.apiUrl = this.getApiUrl();
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            timeout: this.getTimeout(),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    getApiUrl() {
        const config = vscode.workspace.getConfiguration('guardrailai');
        return config.get('apiUrl', 'http://localhost:3001');
    }
    getTimeout() {
        const config = vscode.workspace.getConfiguration('guardrailai');
        return config.get('timeout', 30000);
    }
    async scanCode(code, language, filename) {
        try {
            // Submit scan request
            const scanResponse = await this.client.post('/api/scan', {
                code,
                language,
                filename
            });
            const { sessionId } = scanResponse.data;
            // Poll for results
            return await this.pollForResults(sessionId);
        }
        catch (error) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.data.error || error.message}`);
            }
            else if (error.request) {
                throw new Error('No response from GuardRail AI backend. Is the server running?');
            }
            else {
                throw error;
            }
        }
    }
    async pollForResults(sessionId, maxAttempts = 30) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await this.client.get(`/api/result/${sessionId}`);
                const result = response.data;
                if (result.status === 'completed' || result.status === 'error') {
                    return result;
                }
                // Wait 1 second before next poll
                await this.sleep(1000);
            }
            catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw new Error('Scan timed out. Please try again.');
                }
                await this.sleep(1000);
            }
        }
        throw new Error('Scan timed out after 30 seconds');
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getSessionLogs(sessionId) {
        try {
            const response = await this.client.get(`/api/logs?sessionId=${sessionId}`);
            return response.data.logs || [];
        }
        catch (error) {
            console.error('Failed to fetch logs:', error);
            return [];
        }
    }
    async testConnection() {
        try {
            await this.client.get('/health');
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.GuardRailScanner = GuardRailScanner;
//# sourceMappingURL=scanner.js.map