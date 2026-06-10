import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/toaster';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vibe Coding 成果榜',
  description: 'Vibe Coding（AI辅助编程）成果展示与排行平台 — 提交你的AI编程项目，参与社区排行与互动',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
