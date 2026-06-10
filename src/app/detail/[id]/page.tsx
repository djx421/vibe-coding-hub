'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import SiteHeader from '@/components/site-header';
import { showToast } from '@/components/toaster';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [cmtText, setCmtText] = useState('');
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    loadProject();
    loadComments();
  }, [id]);

  async function loadProject() {
    const { data } = await supabase.from('projects').select('*, profile:profiles!user_id(nickname, avatar_url)').eq('id', id).single();
    if (data) {
      setProject(data);
      await supabase.from('projects').update({ view_count: (data as any).view_count + 1 }).eq('id', id);
      if (session) {
        const { data: v } = await supabase.from('votes').select('id').eq('user_id', session.user.id).eq('project_id', id).maybeSingle();
        setHasVoted(!!v);
      }
    }
  }

  useEffect(() => {
    if (session && project) {
      supabase.from('votes').select('id').eq('user_id', session.user.id).eq('project_id', id).maybeSingle()
        .then(({ data }) => setHasVoted(!!data));
    }
  }, [session, project?.id]);

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profile:profiles!user_id(nickname, avatar_url)')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setComments(data as any);
  }

  async function onVote() {
    if (!session) { router.push('/auth'); return; }
    if (!project) return;
    if (hasVoted) {
      await supabase.from('votes').delete().eq('user_id', session.user.id).eq('project_id', id);
      await supabase.from('projects').update({ vote_count: project.vote_count - 1 }).eq('id', id);
      setProject({ ...project, vote_count: project.vote_count - 1 });
      setHasVoted(false);
    } else {
      await supabase.from('votes').insert({ user_id: session.user.id, project_id: id });
      await supabase.from('projects').update({ vote_count: project.vote_count + 1 }).eq('id', id);
      setProject({ ...project, vote_count: project.vote_count + 1 });
      setHasVoted(true);
    }
  }

  async function onComment() {
    if (!cmtText.trim()) return;
    if (!session) { router.push('/auth'); return; }
    await supabase.from('comments').insert({ user_id: session.user.id, project_id: id, content: cmtText.trim() });
    await supabase.from('projects').update({ comment_count: (project.comment_count || 0) + 1 }).eq('id', id);
    setCmtText('');
    loadComments();
    setProject({ ...project, comment_count: (project.comment_count || 0) + 1 });
    showToast('评论成功');
  }

  async function onDelete() {
    if (!confirm('确认删除？删除后不可恢复。')) return;
    if (!session) return;
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', session.user.id);
    if (!error) { showToast('已删除'); router.push('/profile'); }
    else showToast('删除失败', 'error');
  }

  if (!project) return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>
    </div>
  );

  const isOwner = session && project.user_id === session.user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 面包屑 */}
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-green-500">首页</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{project.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主内容 */}
          <div className="lg:col-span-2 space-y-4">
            {project.cover_image && (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img src={project.cover_image} alt="" className="w-full h-64 md:h-80 object-cover" />
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((t: string) => (
                    <span key={t} className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* 链接 */}
            {(project.github_url || project.demo_url) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-medium text-gray-700 mb-3">相关链接</h2>
                <div className="space-y-2">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:underline truncate">
                      <span className="shrink-0">🔗</span>
                      {project.github_url}
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:underline truncate">
                      <span className="shrink-0">🌐</span>
                      {project.demo_url}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 评论 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-medium text-gray-700 mb-4">评论 ({project.comment_count})</h2>
              {session ? (
                <div className="flex gap-2 mb-6">
                  <input value={cmtText} onChange={(e) => setCmtText(e.target.value)} placeholder="写下你的评论..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                  <button onClick={onComment} disabled={!cmtText.trim()}
                    className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">发送</button>
                </div>
              ) : (
                <div className="text-center py-3 bg-gray-50 rounded-lg mb-6">
                  <button onClick={() => router.push('/auth')} className="text-sm text-green-600 hover:underline">登录后可以评论</button>
                </div>
              )}
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="pb-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-600">{(c as any).profile?.nickname || '匿名'}</span>
                      <span className="text-xs text-gray-400">{formatTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无评论</p>}
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: '点赞', value: project.vote_count, color: 'text-red-500' },
                  { label: '浏览', value: project.view_count, color: 'text-blue-500' },
                  { label: '评论', value: project.comment_count, color: 'text-green-500' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                {project.profile?.nickname && <p>发布者: {project.profile.nickname}</p>}
                <p className="mt-0.5">{new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <button onClick={onVote}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  hasVoted
                    ? 'bg-green-50 text-green-600 border border-green-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}>
                {hasVoted ? '❤️ 已点赞' : '🤍 点赞'}
              </button>
              {isOwner && (
                <button onClick={onDelete}
                  className="w-full mt-2 py-2.5 rounded-lg text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  🗑️ 删除项目
                </button>
              )}
            </div>

            <Link href="/" className="block text-center text-sm text-green-600 hover:underline">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
