'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    if (mode === 'signup') {
      setIsSignUp(true);
    }
  }, []);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace('/dashboard');
      }
    }

    checkSession();
  }, [router, supabase]);

  const handleAuth = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage(
          'Account created. Check your email if confirmation is required, then log in.'
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.replace('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060911] px-4 text-slate-100">
      <div className="w-full max-w-md space-y-6 bg-[#0f1626]/40 border border-slate-800/50 p-8 rounded-2xl backdrop-blur-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-200">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>

          <p className="text-xs text-slate-400">
            {isSignUp
              ? 'Sign up to start generating AI images'
              : 'Log in to access your personal dashboard'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#060911] border border-slate-800 text-sm rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#060911] border border-slate-800 text-sm rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {message && (
          <p className="text-center text-xs font-medium text-cyan-400 mt-2">
            {message}
          </p>
        )}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition underline underline-offset-4"
          >
            {isSignUp
              ? 'Already have an account? Log In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}