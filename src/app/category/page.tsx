'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project, Category } from '@/lib/types';
import SiteHeader from '@/components/site-header';
import { formatCount } from '@/lib/utils';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(data);
        setActiveId(data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    supabase.from('projects').select('*').eq('category_id', activeId).eq('status', 'approved')
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => { if (data) setProjects(data as Project[]); setLoading(false); });
  }, [activeId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">分类浏览</h1>

        <div className="flex gap-4">
          {/* 左侧分类列表 */}
          <div className="w-48 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {categories.map((c) => (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    activeId === c.id ? 'bg-green-50 text-green-600 font-medium border-l-3 border-green-500' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="mr-2">{c.icon}</span>{c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧项目列表 */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-gray-400">加载中...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 text-gray-400">该分类暂无项目</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <Link key={p.id} href={`/detail/${p.id}`}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>❤️ {formatCount(p.vote_count)}</span>
                      <span>👁️ {formatCount(p.view_count)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
