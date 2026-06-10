'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project, Category } from '@/lib/types';
import SiteHeader from '@/components/site-header';

type Tab = 'total' | 'weekly' | 'monthly';

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>('total');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const sortField = { total: 'vote_count', weekly: 'weekly_votes', monthly: 'monthly_votes' };
  const tabs: { key: Tab; label: string }[] = [
    { key: 'total', label: '🏆 总榜' },
    { key: 'weekly', label: '📅 周榜' },
    { key: 'monthly', label: '📆 月榜' },
  ];

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => data && setCategories(data));
  }, []);

  useEffect(() => { loadRankings(); }, [tab, catId]);

  async function loadRankings() {
    setLoading(true);
    let q = supabase.from('projects').select('*, profile:profiles!user_id(nickname, avatar_url)').eq('status', 'approved');
    if (catId) q = q.eq('category_id', catId);
    q = q.order(sortField[tab], { ascending: false }).order('created_at', { ascending: false }).limit(50);
    const { data } = await q;
    if (data) setProjects(data as any);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">排行榜</h1>

        {/* Tab */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-4 inline-flex">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setCatId(null)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              !catId ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>全部</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCatId(c.id)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                catId === c.id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{c.icon} {c.name}</button>
          ))}
        </div>

        {/* 排行列表 */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无排行数据</div>
        ) : (
          <div className="space-y-2">
            {projects.map((p, i) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
              return (
                <Link key={p.id} href={`/detail/${p.id}`}
                  className={`flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 ${
                    i < 3 ? 'bg-gradient-to-r from-yellow-50 via-white to-white' : ''
                  }`}>
                  <div className="w-10 text-center shrink-0">
                    {medal ? <span className="text-2xl">{medal}</span> : (
                      <span className={`text-lg font-bold ${
                        i < 10 ? 'text-gray-700' : 'text-gray-400'
                      }`}>{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>❤️ {p.vote_count}</span>
                      <span>👁️ {p.view_count}</span>
                      {(p as any).profile?.nickname && (
                        <span>by {(p as any).profile.nickname}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-green-600">{p[sortField[tab] as keyof Project] || 0}</div>
                    <div className="text-xs text-gray-400">热度</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
