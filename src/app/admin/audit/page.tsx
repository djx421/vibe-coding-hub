'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import NavBar from '@/components/nav-bar';
import { showToast } from '@/components/toaster';

export default function AuditPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return; }
      supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
        if (!data || data.role !== 'admin') { showToast('无权访问', 'error'); router.push('/profile'); return; }
        setProfile(data);
      });
      loadList();
    });
  }, []);

  async function loadList() {
    const { data } = await supabase.from('projects').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (data) setProjects(data as Project[]);
  }

  async function onApprove(id: number) {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id);
    showToast('已通过');
    loadList();
  }

  async function onReject(id: number) {
    const reason = prompt('拒绝原因（可选）');
    await supabase.from('projects').update({ status: 'rejected', reason: reason || '' }).eq('id', id);
    showToast('已拒绝');
    loadList();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="font-bold">审核管理</h1>
        <p className="text-xs text-gray-400 mt-0.5">待审核项目 ({projects.length})</p>
      </div>

      <div className="px-4 max-w-lg mx-auto mt-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <h3 className="font-medium text-sm">{p.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {p.tags.map((t) => <span key={t} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{t}</span>)}
            </div>
            <p className="text-xs text-gray-300 mt-2">{new Date(p.created_at).toLocaleDateString()}</p>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => onApprove(p.id)} className="px-6 py-1.5 bg-green-500 text-white rounded-full text-xs hover:bg-green-600">通过</button>
              <button onClick={() => onReject(p.id)} className="px-6 py-1.5 border border-red-300 text-red-500 rounded-full text-xs hover:bg-red-50">拒绝</button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-center text-gray-400 text-sm mt-20">暂无待审核项目</p>}
      </div>
      <NavBar />
    </div>
  );
}
