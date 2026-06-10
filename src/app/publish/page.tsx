'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import NavBar from '@/components/nav-bar';
import { showToast } from '@/components/toaster';

export default function PublishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState('');
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');
  const [cover, setCover] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => data && setCategories(data));
    if (editId) loadProject();
  }, [editId]);

  async function loadProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', editId).single();
    if (data) {
      setTitle(data.title);
      setDesc(data.description);
      setCategoryId(data.category_id);
      setTags((data.tags || []).join(', '));
      setGithub(data.github_url || '');
      setDemo(data.demo_url || '');
      setCover(data.cover_image || '');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !categoryId) { showToast('请填写必填字段', 'error'); return; }
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth'); return; }

    const tagList = tags.split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      description: desc.trim(),
      category_id: categoryId,
      tags: tagList,
      github_url: github,
      demo_url: demo,
      cover_image: cover,
    };

    if (editId) {
      const { error } = await supabase.from('projects').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId).eq('user_id', session.user.id);
      if (error) { showToast(error.message, 'error'); setSubmitting(false); return; }
      showToast('更新成功');
    } else {
      const { error } = await supabase.from('projects').insert({ ...payload, user_id: session.user.id });
      if (error) { showToast(error.message, 'error'); setSubmitting(false); return; }
      showToast('提交成功！等待审核...');
    }
    setTimeout(() => router.push('/profile'), 1500);
  }

  async function onDelete() {
    if (!confirm('确认删除？删除后无法恢复。')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('projects').delete().eq('id', editId).eq('user_id', session.user.id);
    if (!error) { showToast('已删除'); router.push('/profile'); }
    else showToast('删除失败', 'error');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-lg font-bold mb-4">{editId ? '编辑项目' : '发布项目'}</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input placeholder="项目名称 *" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          <textarea placeholder="项目描述 *" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} rows={4}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                className={`px-4 py-1.5 rounded-full text-sm border ${categoryId === c.id ? 'bg-green-50 text-green-600 border-green-400' : 'bg-white text-gray-600 border-gray-200'}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          <input placeholder="标签（用逗号分隔，如：AI, 工具, 游戏）" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />

          <input placeholder="封面图片 URL" value={cover} onChange={(e) => setCover(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          {cover && <img src={cover} alt="" className="w-32 h-32 object-cover rounded-lg" />}

          <input placeholder="GitHub 链接" value={github} onChange={(e) => setGithub(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          <input placeholder="在线演示链接" value={demo} onChange={(e) => setDemo(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50">
            {submitting ? '提交中...' : editId ? '更新项目' : '发布项目'}
          </button>
        </form>

        {editId && (
          <button onClick={onDelete} className="w-full mt-3 py-2.5 border border-red-300 text-red-500 rounded-lg text-sm hover:bg-red-50">
            删除此项目
          </button>
        )}
      </div>
      <NavBar />
    </div>
  );
}
