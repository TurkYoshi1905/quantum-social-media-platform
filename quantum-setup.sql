-- ============================================================
-- Quantum Social Media Platform — Tam Kurulum SQL
-- Supabase SQL Editor'da bu dosyayı çalıştırın.
-- ============================================================

-- UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- supabase_migrations şemasını oluştur (log hatalarını önler)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version  text NOT NULL PRIMARY KEY,
  statements text[],
  name     text
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    text NOT NULL,
  username        text NOT NULL UNIQUE,
  avatar_url      text DEFAULT '',
  bio             text DEFAULT '',
  created_at      timestamptz DEFAULT now(),
  following_count integer DEFAULT 0,
  followers_count integer DEFAULT 0
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"  ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content        text NOT NULL,
  title          text DEFAULT '',
  image_url      text DEFAULT '',
  likes_count    integer DEFAULT 0,
  reposts_count  integer DEFAULT 0,
  views_count    integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone"   ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Posts are viewable by everyone"   ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone"      ON public.comments;
DROP POLICY IF EXISTS "Users can insert their own comments"    ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments"    ON public.comments;

CREATE POLICY "Comments are viewable by everyone"   ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can like posts"           ON public.likes;
DROP POLICY IF EXISTS "Users can unlike posts"         ON public.likes;

CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts"           ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"         ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- REPOSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reposts (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reposts are viewable by everyone" ON public.reposts;
DROP POLICY IF EXISTS "Users can repost"                 ON public.reposts;
DROP POLICY IF EXISTS "Users can remove reposts"         ON public.reposts;

CREATE POLICY "Reposts are viewable by everyone" ON public.reposts FOR SELECT USING (true);
CREATE POLICY "Users can repost"                 ON public.reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reposts"         ON public.reposts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others"          ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow"               ON public.follows;

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others"          ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow"               ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('like', 'repost', 'comment', 'follow')),
  post_id    uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own notifications"              ON public.notifications;
DROP POLICY IF EXISTS "Notifications can be inserted by authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "Users can mark their own notifications as read"     ON public.notifications;

CREATE POLICY "Users can see their own notifications"               ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications can be inserted by authenticated users" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "Users can mark their own notifications as read"      ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME (idempotent — zaten ekli olsa hata vermez)
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['posts','comments','likes','reposts','follows','notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- TRIGGERS: Sayaç güncellemeleri ve bildirimler
-- ============================================================

-- likes_count
CREATE OR REPLACE FUNCTION public.handle_like_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'like', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_like_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS on_like_insert ON public.likes;
DROP TRIGGER IF EXISTS on_like_delete ON public.likes;
CREATE TRIGGER on_like_insert AFTER INSERT ON public.likes FOR EACH ROW EXECUTE PROCEDURE public.handle_like_insert();
CREATE TRIGGER on_like_delete AFTER DELETE ON public.likes FOR EACH ROW EXECUTE PROCEDURE public.handle_like_delete();

-- reposts_count
CREATE OR REPLACE FUNCTION public.handle_repost_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET reposts_count = reposts_count + 1 WHERE id = NEW.post_id;
  INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'repost', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_repost_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET reposts_count = GREATEST(0, reposts_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS on_repost_insert ON public.reposts;
DROP TRIGGER IF EXISTS on_repost_delete ON public.reposts;
CREATE TRIGGER on_repost_insert AFTER INSERT ON public.reposts FOR EACH ROW EXECUTE PROCEDURE public.handle_repost_insert();
CREATE TRIGGER on_repost_delete AFTER DELETE ON public.reposts FOR EACH ROW EXECUTE PROCEDURE public.handle_repost_delete();

-- comments_count
CREATE OR REPLACE FUNCTION public.handle_comment_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  INSERT INTO public.notifications (user_id, actor_id, type, post_id)
    SELECT p.user_id, NEW.user_id, 'comment', NEW.post_id
    FROM public.posts p WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_comment_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS on_comment_insert ON public.comments;
DROP TRIGGER IF EXISTS on_comment_delete ON public.comments;
CREATE TRIGGER on_comment_insert AFTER INSERT ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.handle_comment_insert();
CREATE TRIGGER on_comment_delete AFTER DELETE ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.handle_comment_delete();

-- followers/following counts
CREATE OR REPLACE FUNCTION public.handle_follow_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  INSERT INTO public.notifications (user_id, actor_id, type)
    VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_follow_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS on_follow_insert ON public.follows;
DROP TRIGGER IF EXISTS on_follow_delete ON public.follows;
CREATE TRIGGER on_follow_insert AFTER INSERT ON public.follows FOR EACH ROW EXECUTE PROCEDURE public.handle_follow_insert();
CREATE TRIGGER on_follow_delete AFTER DELETE ON public.follows FOR EACH ROW EXECUTE PROCEDURE public.handle_follow_delete();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username',     split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url',   '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- RPC: Kullanıcı adından e-posta bul (giriş için)
-- SECURITY DEFINER ile auth.users tablosuna güvenli erişim
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email   text;
BEGIN
  SELECT id INTO v_user_id FROM public.profiles WHERE username = p_username LIMIT 1;
  IF v_user_id IS NULL THEN RETURN NULL; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id LIMIT 1;
  RETURN v_email;
END; $$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
