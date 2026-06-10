export type UserRole = 'user' | 'admin';
export type ProjectStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category_id: number;
  tags: string[];
  github_url: string;
  demo_url: string;
  cover_image: string;
  vote_count: number;
  weekly_votes: number;
  monthly_votes: number;
  view_count: number;
  comment_count: number;
  status: ProjectStatus;
  reason?: string;
  created_at: string;
  [key: string]: any;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
}

export interface Comment {
  id: number;
  user_id: string;
  project_id: number;
  content: string;
  created_at: string;
  [key: string]: any;
}

export interface RankingItem {
  project: Project;
  profile: Pick<Profile, 'nickname' | 'avatar_url'>;
  rank: number;
  score: number;
}
