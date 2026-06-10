-- ========================================
-- Vibe Coding Hub - Supabase 数据库初始化
-- 在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- 1. 分类表
CREATE TABLE categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 项目表
CREATE TABLE projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  github_url TEXT DEFAULT '',
  demo_url TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  vote_count INT DEFAULT 0,
  weekly_votes INT DEFAULT 0,
  monthly_votes INT DEFAULT 0,
  view_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 点赞表
CREATE TABLE votes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 4. 评论表
CREATE TABLE comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 用户资料表（关联 auth.users）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', '用户'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 索引
CREATE INDEX projects_status_idx ON projects(status);
CREATE INDEX projects_category_id_idx ON projects(category_id);
CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX projects_vote_count_idx ON projects(vote_count DESC);
CREATE INDEX projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX votes_project_id_idx ON votes(project_id);
CREATE INDEX comments_project_id_idx ON comments(project_id);

-- 初始分类数据
INSERT INTO categories (name, icon, sort_order) VALUES
  ('AI 应用', '🤖', 1),
  ('工具类', '🔧', 2),
  ('游戏', '🎮', 3),
  ('创意艺术', '🎨', 4),
  ('Web 应用', '🌐', 5),
  ('移动应用', '📱', 6),
  ('数据可视化', '📊', 7),
  ('学习/教育', '📚', 8),
  ('开源项目', '📦', 9),
  ('其他', '💡', 10);
