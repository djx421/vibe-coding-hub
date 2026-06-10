'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const next = params.get('next') ?? '/profile';

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        window.location.href = error ? '/auth' : next;
      });
    } else {
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
