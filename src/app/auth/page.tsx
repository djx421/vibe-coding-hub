'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import NavBar from '@/components/nav-bar';
import { showToast } from '@/components/toaster';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const options = { email, password };
    const fn = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    const { error } = await fn(options as any);
    setLoading(false);
    if (error) { showToast(error.message, 'error'); return; }
    if (isSignUp) { showToast('注册成功！请查看邮箱确认链接', 'success'); return; }
    window.location.href = '/profile';
  }

  async function onGitHub() {
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${location.origin}/auth/callback` } });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏆</div>
            <h1 className="text-xl font-bold">Vibe Coding 成果榜</h1>
            <p className="text-sm text-gray-500 mt-1">登录后可以发布和点赞项目</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <input type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50">
              {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">或</span></div>
          </div>

          <button onClick={onGitHub}
            className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            使用 GitHub 登录
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignUp ? '已有账号？' : '没有账号？'}
            <button className="ml-1 text-green-600 underline" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? '去登录' : '去注册'}
            </button>
          </p>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
