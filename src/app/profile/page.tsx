'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import SiteHeader from '@/components/site-header';
import ProjectCard from '@/components/project-card';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        supabase.from('profiles').select('*').eq('id', s.user.id).single().then(({ data }) => setProfile(data));
        supabase.from('projects').select('*').eq('user_id', s.user.id).order('created_at', { ascending: false }).then(({ data }) => data && setProjects(data as Project[]));
      }
    });
  }, []);

  async function onLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setProjects([]);
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-xl font-bold mb-2">Vibe Coding 成果榜</h2>
          <p className="text-gray-500 mb-6">登录后可以发布和点赞项目</p>
          <button onClick={() => router.push('/auth')}
            className="px-8 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">去登录</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 用户信息 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : '👤'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">{profile?.nickname || session.user.email}</h2>
              {profile?.role === 'admin' && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium">管理员</span>}
            </div>
            <p className="text-sm text-gray-400">{session.user.email}</p>
          </div>
          <button onClick={onLogout}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:text-gray-700 hover:border-gray-300 transition-colors">退出登录</button>
        </div>

        {/* 快捷操作 */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => router.push('/publish')}
            className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-sm font-medium text-gray-700">发布项目</div>
          </button>
          {profile?.role === 'admin' && (
            <button onClick={() => router.push('/admin/audit')}
              className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm font-medium text-gray-700">审核管理</div>
            </button>
          )}
        </div>

        {/* 我的项目 */}
        <div>
          <h2 className="text-lg font-bold mb-4">我的项目 ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 mb-3">还没有发布过项目</p>
              <button onClick={() => router.push('/publish')}
                className="text-sm text-green-500 hover:underline">去发布第一个项目 →</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => <ProjectCard key={p.id} project={p} showStatus />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
