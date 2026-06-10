'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project, Category, Profile } from '@/lib/types';
import SiteHeader from '@/components/site-header';
import { formatCount } from '@/lib/utils';

export default function HomePage() {
  const [projects, setProjects] = useState<(Project & { profile?: Profile })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<number | null>(null);
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) setCategories(data);
    });
  }, []);

  useEffect(() => { loadProjects(); }, [catId, sort]);

  async function loadProjects() {
    setLoading(true);
    let q = supabase
      .from('projects')
      .select('*, profile:profiles!user_id(nickname, avatar_url)')
      .eq('status', 'approved');
    if (catId) q = q.eq('category_id', catId);
    q = q.order(sort === 'latest' ? 'created_at' : 'vote_count', { ascending: false })
         .order('created_at', { ascending: false })
         .limit(30);
    const { data } = await q;
    if (data) setProjects(data as any);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* 分类导航 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <button onClick={() => setCatId(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm transition-colors ${
              !catId ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>全部</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCatId(c.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm transition-colors ${
                catId === c.id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {c.icon} {c.name}
            </button>
          ))}
          {categories.length === 0 && (
            <span className="text-sm text-gray-400">暂无分类 — 请先初始化分类数据</span>
          )}
        </div>
      </div>

      {/* 排序 + 发布 */}
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex gap-4">
          {(['latest', 'hot'] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)}
              className={`text-sm font-medium transition-colors ${
                sort === s ? 'text-green-600 border-b-2 border-green-500 pb-0.5' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {s === 'latest' ? '最新发布' : '最受欢迎'}
            </button>
          ))}
        </div>
        <Link href="/publish"
          className="px-5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm">
          + 发布项目
        </Link>
      </div>

      {/* 项目列表 */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 mb-4">暂无项目</p>
            <Link href="/publish" className="text-green-500 hover:underline text-sm">成为第一个发布者 →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.id} href={`/detail/${p.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                {p.cover_image && (
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    <img src={p.cover_image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[2.5rem]">{p.description}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-3">
                      <span>❤️ {formatCount(p.vote_count)}</span>
                      <span>👁️ {formatCount(p.view_count)}</span>
                      <span>💬 {p.comment_count}</span>
                    </div>
                    {(p as any).profile && (
                      <span className="truncate max-w-[120px]">{(p as any).profile?.nickname || ''}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-400">
        <p>Vibe Coding 成果榜 — AI辅助编程项目展示与社区排行</p>
      </footer>
    </div>
  );
}
