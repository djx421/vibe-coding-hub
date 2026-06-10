'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project, Comment } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import NavBar from '@/components/nav-bar';
import { showToast } from '@/components/toaster';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<(Comment & { _nickname?: string })[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [cmtText, setCmtText] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadProject();
    loadComments();
  }, [id]);

  async function loadProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single();
    if (data) {
      setProject(data as Project);
      // 增加浏览量
      await supabase.from('projects').update({ view_count: (data as any).view_count + 1 }).eq('id', id);
      // 检查点赞状态
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: v } = await supabase.from('votes').select('id').eq('user_id', session.user.id).eq('project_id', id).maybeSingle();
        setHasVoted(!!v);
      }
    }
  }

  async function loadComments() {
    const { data } = await supabase.from('comments').select('*, profile:nickname, profile:avatar_url').eq('project_id', id).order('created_at', { ascending: false }).limit(20);
    if (data) setComments(data as any);
  }

  async function onVote() {
    const { data: { session } } = await supabase.auth.getSession();
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth'); return; }
    await supabase.from('comments').insert({ user_id: session.user.id, project_id: id, content: cmtText.trim() });
    await supabase.from('projects').update({ comment_count: (project?.comment_count || 0) + 1 }).eq('id', id);
    setCmtText('');
    loadComments();
    if (project) setProject({ ...project, comment_count: (project.comment_count || 0) + 1 });
    showToast('评论成功');
  }

  async function onDelete() {
    if (!confirm('确认删除？删除后不可恢复。')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', session.user.id);
    if (!error) { showToast('已删除'); router.push('/profile'); }
    else showToast('删除失败', 'error');
  }

  if (!project) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {project.cover_image && <img src={project.cover_image} alt="" className="w-full h-56 object-cover bg-gray-100" />}

      <div className="bg-white p-4">
        <h1 className="text-lg font-bold">{project.title}</h1>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tags.map((t) => <Link key={t} href={`/?keyword=${t}`} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{t}</Link>)}
          </div>
        )}
      </div>

      <div className="bg-white flex mt-2">
        {['vote_count', 'view_count', 'comment_count'].map((f) => (
          <div key={f} className="flex-1 text-center py-3">
            <p className="text-lg font-bold">{(project as any)[f] || 0}</p>
            <p className="text-xs text-gray-400">{f === 'vote_count' ? '点赞' : f === 'view_count' ? '浏览' : '评论'}</p>
          </div>
        ))}
      </div>

      <div className="bg-white mt-2 p-4">
        <h2 className="text-sm font-medium mb-2">项目介绍</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
      </div>

      {(project.github_url || project.demo_url) && (
        <div className="bg-white mt-2 p-4">
          <h2 className="text-sm font-medium mb-2">相关链接</h2>
          {project.github_url && <p className="text-sm text-green-600 truncate mb-1">🔗 GitHub: {project.github_url}</p>}
          {project.demo_url && <p className="text-sm text-green-600 truncate">🌐 演示: {project.demo_url}</p>}
        </div>
      )}

      <div className="bg-white mt-2 p-4 flex justify-center gap-3">
        <button onClick={onVote} className={`px-8 py-2 rounded-full text-sm border ${hasVoted ? 'bg-green-50 text-green-600 border-green-400' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
          {hasVoted ? '❤️ 已赞' : '🤍 点赞'}
        </button>
      </div>

      <div className="bg-white mt-2 p-4">
        <h2 className="text-sm font-medium mb-3">评论 ({project.comment_count})</h2>
        <div className="flex gap-2 mb-4">
          <input value={cmtText} onChange={(e) => setCmtText(e.target.value)} placeholder="写下你的评论..." maxLength={500}
            className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-300" />
          <button onClick={onComment} disabled={!cmtText.trim()}
            className="px-5 py-2 bg-green-500 text-white rounded-full text-sm disabled:opacity-50">发送</button>
        </div>
        {comments.map((c) => (
          <div key={c.id} className="py-3 border-b border-gray-50 last:border-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-600 font-medium">{(c as any).profile?.nickname || '匿名'}</span>
              <span className="text-gray-400">{formatTime(c.created_at)}</span>
            </div>
            <p className="text-sm">{c.content}</p>
          </div>
        ))}
      </div>

      <NavBar />
    </div>
  );
}
