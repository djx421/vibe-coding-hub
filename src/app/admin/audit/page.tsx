'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import SiteHeader from '@/components/site-header';
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
    });
    loadList();
  }, []);

  async function loadList() {
    const { data } = await supabase.from('projects').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (data) setProjects(data as Project[]);
  }

  async function onApprove(id: number) {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id);
    showToast('已通过');
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function onReject(id: number) {
    const reason = window.prompt('拒绝原因（可选）');
    await supabase.from('projects').update({ status: 'rejected', reason: reason || '' }).eq('id', id);
    showToast('已拒绝');
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold">审核管理</h1>
          <p className="text-sm text-gray-400 mt-1">待审核项目 ({projects.length})</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-400">暂无待审核项目</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tags.map((t) => <span key={t} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{t}</span>)}
                      </div>
                    )}
                    <p className="text-xs text-gray-300 mt-2">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => onApprove(p.id)}
                      className="px-5 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">通过</button>
                    <button onClick={() => onReject(p.id)}
                      className="px-5 py-1.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors">拒绝</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
