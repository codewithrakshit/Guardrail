'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Code, Shield, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DemoExample {
  id: string;
  name: string;
  language: string;
  description: string;
  code?: string;
}

export default function DemoPage() {
  const router = useRouter();
  const [examples, setExamples] = useState<DemoExample[]>([]);
  const [selectedExample, setSelectedExample] = useState<DemoExample | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/demo`);
      setExamples(response.data.examples);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    }
  };

  const loadExample = async (exampleId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/demo/${exampleId}`);
      setSelectedExample(response.data);
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  };

  const runDemo = async () => {
    if (!selectedExample) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/scan`, {
        code: selectedExample.code,
        language: selectedExample.language,
        filename: `demo-${selectedExample.id}`
      });

      const { sessionId } = response.data;
      router.push(`/results/${sessionId}`);

    } catch (error) {
      console.error('Demo scan failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden animate-gradient-slow">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex-1" />
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <Shield className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">GuardRail AI</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-sm text-indigo-300 font-medium">Interactive Demo</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Try GuardRail AI
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select a vulnerable code example and watch GuardRail AI detect and remediate security issues in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Example Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Select Vulnerability Example</h2>
            <div className="space-y-4">
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => loadExample(example.id)}
                  className={`w-full text-left p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                    selectedExample?.id === example.id
                      ? 'bg-gradient-to-br from-indigo-600/30 to-blue-600/30 border-2 border-indigo-500/50 shadow-xl shadow-indigo-600/30'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{example.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{example.description}</p>
                  <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs font-medium text-indigo-300">
                    {example.language}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Preview */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Code Preview</h2>
            {selectedExample ? (
              <div className="rounded-2xl overflow-hidden border-2 border-white/10 backdrop-blur-sm bg-black/40">
                <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-indigo-400" />
                    <span className="font-medium">{selectedExample.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{selectedExample.language}</span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto font-mono leading-relaxed">
                  <code className="text-gray-300">{selectedExample.code}</code>
                </pre>
                <div className="p-6 border-t border-white/10 bg-white/5">
                  <button
                    onClick={runDemo}
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/50 hover:shadow-indigo-600/70 hover:scale-105 transition disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Running Security Scan...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Run Demo Scan
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-white/10 backdrop-blur-sm bg-white/5 p-16 text-center">
                <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Select an example to preview the code</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 p-8 rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4">What happens when you run a demo?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                <span className="font-bold">1</span>
              </div>
              <p>Code is analyzed by Amazon Bedrock Nova Lite AI for security vulnerabilities</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                <span className="font-bold">2</span>
              </div>
              <p>GuardRail AI generates a secure patch and provisions AWS secrets if needed</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                <span className="font-bold">3</span>
              </div>
              <p>You'll see detailed results with side-by-side diff and download options</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
