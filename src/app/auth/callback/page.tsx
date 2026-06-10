'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/profile';

    if (!code) {
      window.location.href = '/auth';
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/auth';
      } else {
        // 强制整页跳转，让浏览器带着 cookie 重新加载目标页面
        window.location.href = next;
      }
    });
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
