'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Code, AlertCircle, Loader2, Sparkles, FileCode } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ScanPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/scan`, {
        code,
        language,
        filename: filename || 'untitled'
      });

      const { sessionId } = response.data;
      router.push(`/results/${sessionId}`);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Scan failed. Please try again.');
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('File size exceeds 1MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result as string);
      setFilename(file.name);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'java': 'java',
        'go': 'go',
        'rb': 'ruby',
        'php': 'php'
      };
      if (ext && langMap[ext]) {
        setLanguage(langMap[ext]);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="inline-flex items-center gap-2 text-xl font-bold hover:opacity-80 transition">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ← GuardRail AI
            </span>
          </a>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Security Analysis</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Security Scan
          </h1>
          <p className="text-gray-400 text-lg">Submit your code for real-time vulnerability analysis</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition" />
            <div className="relative border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-12 text-center transition backdrop-blur-sm bg-white/5">
              <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition" />
              <label className="cursor-pointer">
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition">
                  Upload a file
                </span>
                <span className="text-gray-400"> or paste code below</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".js,.ts,.py,.java,.go,.rb,.php"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="text-sm text-gray-500 mt-3">Max 1MB • JS, TS, Python, Java, Go, Ruby, PHP</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition"
              >
                <option value="javascript" className="bg-slate-900">JavaScript</option>
                <option value="typescript" className="bg-slate-900">TypeScript</option>
                <option value="python" className="bg-slate-900">Python</option>
                <option value="java" className="bg-slate-900">Java</option>
                <option value="go" className="bg-slate-900">Go</option>
                <option value="ruby" className="bg-slate-900">Ruby</option>
                <option value="php" className="bg-slate-900">PHP</option>
              </select>
            </div>

            {/* Filename */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Filename (optional)</label>
              <div className="relative">
                <FileCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="example.js"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">Code</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition" />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={18}
                required
                className="relative w-full px-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 font-mono text-sm backdrop-blur-sm transition resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !code}
            className="group relative w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-[1.02] transform overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition" />
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Security...
              </>
            ) : (
              <>
                <Code className="w-6 h-6" />
                Analyze Code
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
