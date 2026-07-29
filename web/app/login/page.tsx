'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogIn, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) { router.push('/dashboard'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className= min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden flex items-center justify-center>
      <div className=absolute inset-0 bg-black/60 />
      <div className=absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse />
      <div className=absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse style={{ animationDelay: '2s' }} />

      <div className=relative z-10 w-full max-w-md px-6>
        <div className=text-center mb-10>
          <div className=inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/50 mb-6>
            <Shield className=w-8 h-8 strokeWidth={2.5} />
          </div>
          <h1 className=text-3xl font-bold mb-2>Welcome Back</h1>
          <p className=text-gray-400>Sign in to GuardRail AI</p>
        </div>

        <div className=relative group>
          <div className=absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition />
          <form onSubmit={handleSubmit} className=relative bg-slate-900/80 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 space-y-6>
            {error && (
              <div className=flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/50 rounded-xl>
                <AlertCircle className=w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 />
                <span className=text-red-300 text-sm>{error}</span>
              </div>
            )}

            <div>
              <label className=block text-sm font-semibold mb-2 text-gray-300>Email</label>
              <input
                type=email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=admin@guardrail.ai
                required
                className=w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition text-white placeholder-gray-600
              />
            </div>

            <div>
              <label className=block text-sm font-semibold mb-2 text-gray-300>Password</label>
              <div className=relative>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=Enter your password
                  required
                  className=w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition text-white placeholder-gray-600
                />
                <button type=button onClick={() => setShowPassword(!showPassword)} className=absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition>
                  {showPassword ? <EyeOff className=w-5 h-5 /> : <Eye className=w-5 h-5 />}
                </button>
              </div>
            </div>

            <button type=submit disabled={loading} className=w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/50 hover:shadow-indigo-600/70 transition disabled:cursor-not-allowed>
              {loading ? (
                <><Loader2 className=w-5 h-5 animate-spin /> Signing In...</>
              ) : (
                <><LogIn className=w-5 h-5 /> Sign In</>
              )}
            </button>

            <div className=text-center text-sm text-gray-500 pt-4 border-t border-white/5>
              <p>Default: <span className=text-gray-300 font-mono>admin@guardrail.ai / admin123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
