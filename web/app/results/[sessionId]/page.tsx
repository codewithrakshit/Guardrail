'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, AlertTriangle, CheckCircle, Download, Clock, Code } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Vulnerability {
  type: string;
  severity: string;
  explanation: string;
  affectedLines: number[];
  cwe: string;
  confidence: number;
}

interface ScanResult {
  sessionId: string;
  status: string;
  vulnerabilities: Vulnerability[];
  severity: string;
  scanDuration: number;
  timestamp: string;
}

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [result, setResult] = useState<ScanResult | null>(null);
  const [patch, setPatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const [scanRes, patchRes] = await Promise.all([
        axios.get(`${API_URL}/api/result/${sessionId}`),
        axios.get(`${API_URL}/api/result/${sessionId}`).catch(() => null)
      ]);

      setResult(scanRes.data);
      if (patchRes?.data?.patch) {
        setPatch(patchRes.data.patch);
      }
      setLoading(false);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load results');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/result/${sessionId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'secure-code.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      alert('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">{error || 'Results not found'}</p>
        </div>
      </div>
    );
  }

  const isVulnerable = result.status === 'vulnerable';

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="text-xl font-bold">← GuardRail AI</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Status Header */}
        <div className={`border rounded-xl p-8 mb-8 ${
          isVulnerable 
            ? 'bg-red-900/10 border-red-800' 
            : 'bg-green-900/10 border-green-800'
        }`}>
          <div className="flex items-start gap-4">
            {isVulnerable ? (
              <AlertTriangle className="w-12 h-12 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {isVulnerable ? 'Vulnerabilities Detected' : 'Code is Secure'}
              </h1>
              <p className="text-gray-400">
                {isVulnerable 
                  ? `Found ${result.vulnerabilities.length} security issue(s) - Severity: ${result.severity.toUpperCase()}`
                  : 'No security vulnerabilities detected in your code'
                }
              </p>
              <div className="flex gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {result.scanDuration}ms
                </span>
                <span>Session: {sessionId.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerabilities */}
        {isVulnerable && result.vulnerabilities.map((vuln, idx) => (
          <div key={idx} className="border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{formatVulnType(vuln.type)}</h2>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-800">
                    {vuln.cwe}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-900">
                    {vuln.confidence}% Confidence
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{vuln.explanation}</p>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Affected Lines:</p>
              <p className="font-mono text-blue-400">{vuln.affectedLines.join(', ')}</p>
            </div>
          </div>
        ))}

        {/* Patch Section */}
        {patch && (
          <div className="border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Secure Patch Generated</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Security Benefit:</p>
                <p className="text-gray-300">{patch.securityBenefit}</p>
              </div>

              {patch.secretRef && (
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-400 mb-2">AWS Secret Created:</p>
                  <p className="font-mono text-sm text-gray-300 break-all">{patch.secretRef.name}</p>
                  <p className="text-xs text-gray-400 mt-2">Expires: {new Date(patch.secretRef.expiresAt).toLocaleString()}</p>
                </div>
              )}

              <button
                onClick={handleDownload}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-5 h-5" />
                Download Secure Code
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <a
            href="/scan"
            className="flex-1 px-6 py-3 border border-gray-700 hover:border-gray-600 rounded-lg font-semibold text-center transition"
          >
            Scan Another File
          </a>
          <a
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-center transition"
          >
            View Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}

function formatVulnType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-900 text-red-200',
    high: 'bg-orange-900 text-orange-200',
    medium: 'bg-yellow-900 text-yellow-200',
    low: 'bg-blue-900 text-blue-200'
  };
  return colors[severity] || 'bg-gray-800';
}
