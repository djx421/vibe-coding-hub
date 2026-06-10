import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/toaster';

export const metadata: Metadata = {
  title: 'Vibe Coding 成果榜',
  description: 'Vibe Coding（AI辅助编程）成果展示与排行平台',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
