import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 给普通页面使用（createBrowserClient 对 SSR 兼容）
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 给回调页面使用（localStorage 持久化，整页跳转后仍可用）
// 用函数延迟初始化，避免 SSR 阶段 fetch 未定义
let _callbackClient: ReturnType<typeof createSupabaseClient> | null = null;
export function getCallbackClient() {
  if (!_callbackClient) {
    _callbackClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _callbackClient;
}
