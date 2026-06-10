'use client';
import Link from 'next/link';
import { formatCount } from '@/lib/utils';

interface Props {
  project: {
    id: number;
    title: string;
    description: string;
    cover_image?: string;
    tags: string[];
    vote_count: number;
    view_count: number;
    status?: string;
  };
  showStatus?: boolean;
}

export default function ProjectCard({ project, showStatus }: Props) {
  const statusMap: Record<string, { label: string; color: string }> = {
    approved: { label: '已通过', color: 'text-green-600 bg-green-50' },
    pending: { label: '审核中', color: 'text-yellow-600 bg-yellow-50' },
    rejected: { label: '已拒绝', color: 'text-red-600 bg-red-50' },
  };

  return (
    <Link href={`/detail/${project.id}`} className="block bg-white rounded-xl overflow-hidden shadow-sm mb-4">
      {project.cover_image && (
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img src={project.cover_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base truncate">{project.title}</h3>
          {showStatus && project.status && (
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${statusMap[project.status]?.color}`}>
              {statusMap[project.status]?.label}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tags.map((t) => <span key={t} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{t}</span>)}
          </div>
        )}
        <div className="flex gap-4 mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span>❤️ {formatCount(project.vote_count)}</span>
          <span>👁️ {formatCount(project.view_count)}</span>
        </div>
      </div>
    </Link>
  );
}
