-- DeenFlow Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  username TEXT DEFAULT '',
  avatar_url TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'uz', 'ru', 'tr')),
  color_preset TEXT DEFAULT 'madinah-green',
  font_preset TEXT DEFAULT 'amiri-classic',
  prayer_location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prayer logs
CREATE TABLE public.prayer_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  prayer TEXT NOT NULL CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'delayed', 'missed')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prayer_logs_user_date ON public.prayer_logs(user_id, date);
CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date);

-- Dhikr sessions
CREATE TABLE public.dhikr_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  dhikr_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL DEFAULT 33,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task categories
CREATE TABLE public.task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#059669',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category_id UUID REFERENCES public.task_categories(id) ON DELETE SET NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI messages
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No-porn streaks
CREATE TABLE public.no_porn_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_relapses INTEGER DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_check_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relapses
CREATE TABLE public.relapses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  streak_id UUID REFERENCES public.no_porn_streaks(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks (Quran)
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Daily check-ins
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prayer', 'task', 'achievement', 'daily')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhikr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_porn_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Prayer logs policies
CREATE POLICY "Users can view own prayer logs" ON public.prayer_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prayer logs" ON public.prayer_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prayer logs" ON public.prayer_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prayer logs" ON public.prayer_logs FOR DELETE USING (auth.uid() = user_id);

-- Dhikr sessions policies
CREATE POLICY "Users can view own dhikr sessions" ON public.dhikr_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dhikr sessions" ON public.dhikr_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dhikr sessions" ON public.dhikr_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dhikr sessions" ON public.dhikr_sessions FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Task categories policies
CREATE POLICY "Users can view own categories" ON public.task_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.task_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.task_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.task_categories FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can view own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can view own messages" ON public.ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON public.ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- No-porn streaks policies
CREATE POLICY "Users can view own streak" ON public.no_porn_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.no_porn_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.no_porn_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Relapses policies
CREATE POLICY "Users can view own relapses" ON public.relapses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own relapses" ON public.relapses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily checkins policies
CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.daily_checkins FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Seed default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement) VALUES
  ('First Prayer Logged', 'Log your first prayer', '🕌', 'prayer', 1),
  ('7 Day Prayer Streak', 'Pray 7 days in a row', '🔥', 'prayer', 7),
  ('30 Day Prayer Streak', 'Pray 30 days in a row', '⭐', 'prayer', 30),
  ('1000 Dhikr', 'Complete 1000 dhikr', '📿', 'dhikr', 1000),
  ('First Journal Entry', 'Write your first journal entry', '📝', 'journal', 1),
  ('Complete All Tasks', 'Complete 100 tasks', '✅', 'tasks', 100),
  ('30 Day Clean Streak', 'Stay clean for 30 days', '💎', 'streak', 30),
  ('90 Day Clean Streak', 'Stay clean for 90 days', '👑', 'streak', 90)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- MIGRATION: Run these if your database already exists
-- ============================================================
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS color_preset TEXT DEFAULT 'madinah-green';
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS font_preset TEXT DEFAULT 'amiri-classic';
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS prayer_location JSONB;
-- ALTER TABLE public.users ADD CONSTRAINT users_language_check CHECK (language IN ('en', 'uz', 'ru', 'tr'));
-- CREATE TABLE IF NOT EXISTS public.daily_checkins (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
--   checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(user_id, checkin_date)
-- );
-- ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own checkins" ON public.daily_checkins FOR DELETE USING (auth.uid() = user_id);
-- CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date);
