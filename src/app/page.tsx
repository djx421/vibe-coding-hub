'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project, Category } from '@/lib/types';
import NavBar from '@/components/nav-bar';
import ProjectCard from '@/components/project-card';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<number | null>(null);
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const supabase = createClient();

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => data && setCategories(data));
    loadProjects();
  }, []);

  useEffect(() => { loadProjects(true); }, [catId, sort]);

  async function loadProjects(reset?: boolean) {
    let q = supabase.from('projects').select('*').eq('status', 'approved');
    if (catId) q = q.eq('category_id', catId);
    q = q.order(sort === 'latest' ? 'created_at' : 'vote_count', { ascending: false }).order('created_at', { ascending: false }).limit(20);
    const { data } = await q;
    if (data) setProjects(data as Project[]);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 分类导航 */}
      <div className="bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-2 px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => setCatId(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm ${!catId ? 'bg-green-50 text-green-600 font-medium' : 'bg-gray-100 text-gray-600'}`}>全部</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCatId(c.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm ${catId === c.id ? 'bg-green-50 text-green-600 font-medium' : 'bg-gray-100 text-gray-600'}`}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 排序 */}
      <div className="flex gap-4 px-4 py-3 max-w-lg mx-auto">
        <button onClick={() => setSort('latest')} className={`text-sm ${sort === 'latest' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>最新发布</button>
        <button onClick={() => setSort('hot')} className={`text-sm ${sort === 'hot' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>最受欢迎</button>
      </div>

      {/* 项目列表 */}
      <div className="px-4 max-w-lg mx-auto">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        {projects.length === 0 && <p className="text-center text-gray-400 text-sm mt-20">暂无项目</p>}
      </div>

      {/* 发布按钮 */}
      <Link href="/publish"
        className="fixed right-6 bottom-20 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium hover:bg-green-600 z-30">
        + 发布项目
      </Link>

      <NavBar />
    </div>
  );
}
