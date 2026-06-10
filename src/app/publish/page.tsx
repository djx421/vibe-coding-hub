'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import SiteHeader from '@/components/site-header';
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
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) { router.push('/auth?next=/publish'); return; }
      setSession(s);
    });
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => data && setCategories(data));
    if (editId) loadProject();
  }, [editId]);

  async function loadProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', editId).single();
    if (data) {
      setTitle(data.title); setDesc(data.description); setCategoryId(data.category_id);
      setTags((data.tags || []).join(', ')); setGithub(data.github_url || '');
      setDemo(data.demo_url || ''); setCover(data.cover_image || '');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !categoryId) { showToast('请填写必填字段', 'error'); return; }
    if (!session) { router.push('/auth'); return; }
    setSubmitting(true);

    const tagList = tags.split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(), description: desc.trim(), category_id: categoryId,
      tags: tagList, github_url: github, demo_url: demo, cover_image: cover,
    };

    if (editId) {
      const { error } = await supabase.from('projects').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId);
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
    const { error } = await supabase.from('projects').delete().eq('id', editId);
    if (!error) { showToast('已删除'); router.push('/profile'); }
    else showToast('删除失败', 'error');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">{editId ? '编辑项目' : '发布项目'}</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
            <input placeholder="给你的项目起个名字" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目描述 *</label>
            <textarea placeholder="介绍一下你的项目..." value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    categoryId === c.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>{c.icon} {c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <input placeholder="用逗号分隔，如：AI, 工具, 游戏" value={tags} onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图片 URL</label>
            <input placeholder="https://..." value={cover} onChange={(e) => setCover(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            {cover && <img src={cover} alt="" className="mt-2 w-32 h-32 object-cover rounded-lg border" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub 链接</label>
            <input placeholder="https://github.com/xxx/xxx" value={github} onChange={(e) => setGithub(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">在线演示链接</label>
            <input placeholder="https://..." value={demo} onChange={(e) => setDemo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">
            {submitting ? '提交中...' : editId ? '更新项目' : '发布项目'}
          </button>

          {editId && (
            <button type="button" onClick={onDelete}
              className="w-full py-2.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors">
              删除此项目
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
