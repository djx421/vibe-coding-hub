import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const INITIAL_CATEGORIES = [
  { name: 'AI 应用', icon: '🤖', sort_order: 1 },
  { name: '工具类', icon: '🔧', sort_order: 2 },
  { name: '游戏', icon: '🎮', sort_order: 3 },
  { name: '创意艺术', icon: '🎨', sort_order: 4 },
  { name: 'Web 应用', icon: '🌐', sort_order: 5 },
  { name: '移动应用', icon: '📱', sort_order: 6 },
  { name: '数据可视化', icon: '📊', sort_order: 7 },
  { name: '学习/教育', icon: '📚', sort_order: 8 },
  { name: '开源项目', icon: '📦', sort_order: 9 },
  { name: '其他', icon: '💡', sort_order: 10 },
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    );

    // 检查是否已有分类
    const { data: existing } = await supabase.from('categories').select('id').limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ message: '分类数据已存在，无需初始化', count: existing.length });
    }

    const { data, error } = await supabase.from('categories').insert(INITIAL_CATEGORIES).select();
    if (error) throw error;

    return NextResponse.json({ message: `成功插入 ${data.length} 个分类`, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
