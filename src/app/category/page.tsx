'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Project, Category } from '@/lib/types';
import NavBar from '@/components/nav-bar';
import ProjectCard from '@/components/project-card';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) { setCategories(data); if (data.length > 0) setActiveId(data[0].id); }
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    supabase.from('projects').select('*').eq('category_id', activeId).eq('status', 'approved').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => data && setProjects(data as Project[]));
  }, [activeId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex">
      {/* 左侧分类 */}
      <div className="w-44 shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveId(c.id)}
            className={`w-full text-left px-4 py-3 text-sm ${activeId === c.id ? 'text-green-600 bg-green-50 font-medium border-l-2 border-green-500' : 'text-gray-600'}`}>
            <span className="text-lg mr-1.5">{c.icon}</span>{c.name}
          </button>
        ))}
      </div>

      {/* 右侧列表 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        {projects.length === 0 && <p className="text-center text-gray-400 text-sm mt-20">该分类暂无项目</p>}
      </div>
      <NavBar />
    </div>
  );
}
