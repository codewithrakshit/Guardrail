'use client';

import { useEffect, useState } from 'react';
import { Shield, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Stats {
  totalScans: number;
  vulnerabilitiesFound: number;
  secretsCreated: number;
  averageScanTime: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilityTypes: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/logs/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-bold">GuardRail AI</a>
          <a 
            href="/scan"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            New Scan
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Platform Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <MetricCard
            icon={<Shield className="w-8 h-8 text-blue-500" />}
            label="Total Scans"
            value={stats?.totalScans || 0}
          />
          <MetricCard
            icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
            label="Vulnerabilities Found"
            value={stats?.vulnerabilitiesFound || 0}
          />
          <MetricCard
            icon={<TrendingUp className="w-8 h-8 text-green-500" />}
            label="Secrets Created"
            value={stats?.secretsCreated || 0}
          />
          <MetricCard
            icon={<Clock className="w-8 h-8 text-yellow-500" />}
            label="Avg Scan Time"
            value={`${stats?.averageScanTime || 0}ms`}
          />
        </div>

        {/* Severity Breakdown */}
        <div className="border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Severity Breakdown</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <SeverityBar label="Critical" count={stats?.severityBreakdown.critical || 0} color="bg-red-600" />
            <SeverityBar label="High" count={stats?.severityBreakdown.high || 0} color="bg-orange-600" />
            <SeverityBar label="Medium" count={stats?.severityBreakdown.medium || 0} color="bg-yellow-600" />
            <SeverityBar label="Low" count={stats?.severityBreakdown.low || 0} color="bg-blue-600" />
          </div>
        </div>

        {/* Vulnerability Types */}
        <div className="border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Most Common Vulnerabilities</h2>
          <div className="space-y-4">
            {stats && Object.entries(stats.vulnerabilityTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-300">{formatVulnType(type)}</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full font-semibold">{count}</span>
              </div>
            ))}
            {(!stats || Object.keys(stats.vulnerabilityTypes).length === 0) && (
              <p className="text-gray-500 text-center py-8">No vulnerability data yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="border border-gray-800 rounded-xl p-6">
      <div className="mb-4">{icon}</div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function SeverityBar({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-semibold">{count}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(count * 10, 100)}%` }}></div>
      </div>
    </div>
  );
}

function formatVulnType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
