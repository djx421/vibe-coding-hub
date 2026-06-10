'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { Project, Category } from '@/lib/types';
import NavBar from '@/components/nav-bar';

type Tab = 'total' | 'weekly' | 'monthly';

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>('total');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<number | null>(null);
  const supabase = createClient();

  const sortField = { total: 'vote_count', weekly: 'weekly_votes', monthly: 'monthly_votes' };

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => data && setCategories(data));
  }, []);

  useEffect(() => {
    let q = supabase.from('projects').select('*, profile:nickname, profile:avatar_url').eq('status', 'approved');
    if (catId) q = q.eq('category_id', catId);
    q = q.order(sortField[tab], { ascending: false }).order('created_at', { ascending: false }).limit(50);
    q.then(({ data }) => data && setProjects(data as Project[]));
  }, [tab, catId]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'total', label: '总榜' },
    { key: 'weekly', label: '周榜' },
    { key: 'monthly', label: '月榜' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100">
        <div className="flex max-w-lg mx-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 text-center py-3 text-sm ${tab === t.key ? 'text-green-600 font-medium border-b-2 border-green-500' : 'text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-white border-b border-gray-100">
        <div className="flex gap-2 px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => setCatId(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs ${!catId ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>全部</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCatId(c.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs ${catId === c.id ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto mt-4">
        {projects.map((p, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
          return (
            <Link key={p.id} href={`/detail/${p.id}`}
              className={`flex items-center gap-3 bg-white rounded-xl p-4 mb-2 shadow-sm ${i < 3 ? 'bg-gradient-to-r from-yellow-50 to-white' : ''}`}>
              <div className="w-8 text-center shrink-0">
                {medal ? <span className="text-xl">{medal}</span> : <span className="text-sm font-bold text-gray-400">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">❤️ {p.vote_count}</p>
              </div>
            </Link>
          );
        })}
        {projects.length === 0 && <p className="text-center text-gray-400 text-sm mt-20">暂无排行数据</p>}
      </div>
      <NavBar />
    </div>
  );
}
