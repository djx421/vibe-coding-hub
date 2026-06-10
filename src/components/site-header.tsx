'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: '首页' },
  { href: '/category', label: '分类' },
  { href: '/ranking', label: '排行榜' },
  { href: '/profile', label: '我的' },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-800">
          <span className="text-2xl">🏆</span>
          <span>Vibe Coding 成果榜</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-green-50 text-green-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
