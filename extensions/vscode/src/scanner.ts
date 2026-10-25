import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

export interface ScanResult {
    sessionId: string;
    status: 'pending' | 'safe' | 'vulnerable' | 'completed' | 'error';
    vulnerabilities?: Vulnerability[];
    vulnerabilitiesDetected?: number;
    patchedCode?: string;
    patch?: {
        available: boolean;
        patchId?: string;
        originalCode?: string;
        secureCode?: string;
        diff?: string;
        explanation?: string;
        securityBenefit?: string;
        confidence?: number;
        secretRef?: string;
    };
    error?: string;
}

export interface Vulnerability {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    line?: number;
    column?: number;
    message: string;
    description?: string;
    cwe?: string;
}

export class GuardRailScanner {
    private client: AxiosInstance;
    private apiUrl: string;

    constructor() {
        this.apiUrl = this.getApiUrl();
        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: this.getTimeout(),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    private getApiUrl(): string {
        const config = vscode.workspace.getConfiguration('guardrailai');
        return config.get<string>('apiUrl', 'http://localhost:3001');
    }

    private getTimeout(): number {
        const config = vscode.workspace.getConfiguration('guardrailai');
        return config.get<number>('timeout', 120000);
    }

    private getFixTimeout(): number {
        const config = vscode.workspace.getConfiguration('guardrailai');
        return config.get<number>('fixTimeout', 300000);
    }

    async scanCode(code: string, language: string, filename: string): Promise<ScanResult> {
        try {
            console.log('[GuardRail] Starting scan...');
            
            // Submit scan request
            const scanResponse = await this.client.post('/api/scan', {
                code,
                language,
                filename
            });

            console.log('[GuardRail] Scan response:', scanResponse.data);
            
            // The local API returns scan results immediately with status
            // "safe" or "vulnerable".
            if (Array.isArray(scanResponse.data.vulnerabilities)) {
                return {
                    sessionId: scanResponse.data.sessionId,
                    status: scanResponse.data.status,
                    vulnerabilities: this.mapVulnerabilities(scanResponse.data.vulnerabilities),
                    vulnerabilitiesDetected: scanResponse.data.vulnerabilities.length,
                    error: scanResponse.data.error
                };
            }

            const { sessionId } = scanResponse.data;

            // Poll for results (legacy mode)
            return await this.pollForResults(sessionId);
        } catch (error: any) {
            console.error('[GuardRail] Scan error:', error);
            if (this.isTimeoutError(error)) {
                throw new Error('The security scan timed out while waiting for local Ollama inference. Please try again or increase guardrailai.timeout.');
            } else if (error.response) {
                if (error.response.status === 429) {
                    const retryAfter = this.getRetryAfter(error.response.headers?.['retry-after']);
                    const retryMessage = retryAfter
                        ? ` Please try again in ${retryAfter}.`
                        : ' Please try again later.';
                    throw new Error(`GuardRail AI rate limit exceeded.${retryMessage}`);
                }
                throw new Error(`API Error: ${error.response.data.error || error.message}`);
            } else if (error.request) {
                throw new Error('No response from GuardRail AI backend. Is the server running?');
            } else {
                throw error;
            }
        }
    }

    private mapVulnerabilities(vulns: any[]): Vulnerability[] {
        return vulns.map(v => ({
            type: v.type,
            severity: v.severity,
            line: v.affectedLines?.[0] ?? v.affected_lines?.[0] ?? 1,
            column: 0,
            message: `${v.severity.toUpperCase()}: ${v.type.replace(/_/g, ' ')}`,
            description: v.explanation,
            cwe: v.cwe
        }));
    }

    private isTimeoutError(error: any): boolean {
        return error?.code === 'ECONNABORTED' ||
            error?.code === 'ETIMEDOUT' ||
            error?.message?.toLowerCase().includes('timeout');
    }

    private getRetryAfter(value: string | undefined): string | null {
        if (!value) {
            return null;
        }

        const seconds = Number(value);
        if (Number.isFinite(seconds) && seconds > 0) {
            return `${Math.ceil(seconds)} seconds`;
        }

        const retryAt = Date.parse(value);
        if (Number.isNaN(retryAt)) {
            return null;
        }

        const remainingSeconds = Math.ceil((retryAt - Date.now()) / 1000);
        return remainingSeconds > 0 ? `${remainingSeconds} seconds` : null;
    }

    private async pollForResults(sessionId: string, maxAttempts: number = 30): Promise<ScanResult> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await this.client.get(`/api/result/${sessionId}`);
                const result = response.data;

                if (result.status === 'completed' || result.status === 'error') {
                    return result;
                }

                // Wait 1 second before next poll
                await this.sleep(1000);
            } catch (error: any) {
                if (attempt === maxAttempts - 1) {
                    throw new Error('Scan timed out. Please try again.');
                }
                await this.sleep(1000);
            }
        }

        throw new Error('Scan timed out after 30 seconds');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getSessionLogs(sessionId: string): Promise<any[]> {
        try {
            const response = await this.client.get(`/api/logs?sessionId=${sessionId}`);
            return response.data.logs || [];
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return [];
        }
    }

    async generateFix(sessionId: string): Promise<any> {
        try {
            console.log('[GuardRail] Generating fix for session:', sessionId);
            
            const response = await this.client.post(`/api/fix/${sessionId}`, undefined, {
                timeout: this.getFixTimeout()
            });
            
            console.log('[GuardRail] Fix response:', response.data);
            
            // Return the response data directly - it already has the correct structure
            return response.data;
        } catch (error: any) {
            console.error('[GuardRail] Fix generation error:', error);
            if (this.isTimeoutError(error)) {
                throw new Error('Fix generation timed out while waiting for local Ollama patch generation. Please increase guardrailai.fixTimeout or OLLAMA_TIMEOUT_MS.');
            } else if (error.response) {
                throw new Error(`Fix generation failed: ${error.response.data.error || error.message}`);
            } else {
                throw error;
            }
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.client.get('/health');
            return true;
        } catch (error) {
            return false;
        }
    }
}
