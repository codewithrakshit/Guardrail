import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

export interface ScanResult {
    sessionId: string;
    status: 'pending' | 'completed' | 'error';
    vulnerabilities?: Vulnerability[];
    vulnerabilitiesDetected?: number;
    patchedCode?: string;
    patch?: {
        available: boolean;
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
        return config.get<number>('timeout', 60000); // Increased to 60 seconds
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
            
            // Check if we got immediate results (scan-only mode)
            if (scanResponse.data.vulnerabilities) {
                return {
                    sessionId: scanResponse.data.sessionId,
                    status: 'completed',
                    vulnerabilities: this.mapVulnerabilities(scanResponse.data.vulnerabilities),
                    vulnerabilitiesDetected: scanResponse.data.vulnerabilities.length
                };
            }

            const { sessionId } = scanResponse.data;

            // Poll for results (legacy mode)
            return await this.pollForResults(sessionId);
        } catch (error: any) {
            console.error('[GuardRail] Scan error:', error);
            if (error.response) {
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
            line: v.affectedLines?.[0] || 1,
            column: 0,
            message: `${v.severity.toUpperCase()}: ${v.type.replace(/_/g, ' ')}`,
            description: v.explanation,
            cwe: v.cwe
        }));
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

    async testConnection(): Promise<boolean> {
        try {
            await this.client.get('/health');
            return true;
        } catch (error) {
            return false;
        }
    }
}
