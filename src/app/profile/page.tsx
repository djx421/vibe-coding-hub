'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import NavBar from '@/components/nav-bar';
import ProjectCard from '@/components/project-card';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
        supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).then(({ data }) => data && setProjects(data as Project[]));
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
      <div className="min-h-screen bg-gray-50 pb-20 flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-lg font-bold mb-1">Vibe Coding 成果榜</h2>
        <p className="text-sm text-gray-500 mb-6">登录后可以发布和点赞项目</p>
        <button onClick={() => router.push('/auth')} className="px-10 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">去登录</button>
        <NavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>}
        </div>
        <div className="flex-1">
          <p className="font-medium">{profile?.nickname || session.user.email}</p>
          {profile?.role === 'admin' && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">管理员</span>}
        </div>
        <button onClick={onLogout} className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-full hover:text-gray-600">退出</button>
      </div>

      <div className="flex gap-3 bg-white px-4 py-3 mt-2">
        <button onClick={() => router.push('/publish')} className="flex-1 text-center py-2">
          <p className="text-xl mb-0.5">📝</p>
          <p className="text-xs text-gray-500">发布项目</p>
        </button>
        {profile?.role === 'admin' && (
          <button onClick={() => router.push('/admin/audit')} className="flex-1 text-center py-2">
            <p className="text-xl mb-0.5">✅</p>
            <p className="text-xs text-gray-500">审核管理</p>
          </button>
        )}
      </div>

      <div className="px-4 max-w-lg mx-auto mt-4">
        <h2 className="text-sm font-medium mb-3">我的项目 ({projects.length})</h2>
        {projects.map((p) => <ProjectCard key={p.id} project={p} showStatus />)}
        {projects.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">还没有发布过项目</p>}
      </div>
      <NavBar />
    </div>
  );
}
