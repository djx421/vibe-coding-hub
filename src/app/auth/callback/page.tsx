'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const next = params.get('next') ?? '/profile';

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        window.location.href = error ? '/auth' : next;
      });
    } else {
      // 可能 session 已在 URL hash 中
      supabase.auth.getSession().then(({ data: { session } }) => {
        window.location.href = session ? next : '/auth';
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⏳</div>
        <p className="text-gray-500">正在登录...</p>
      </div>
    </div>
  );
}
