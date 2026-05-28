-- ============================================================
-- Quantum Social Media Platform — Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  username text not null unique,
  avatar_url text default '',
  bio text default '',
  created_at timestamptz default now(),
  following_count integer default 0,
  followers_count integer default 0
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- POSTS TABLE
-- ============================================================
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  title text default '',
  image_url text default '',
  likes_count integer default 0,
  reposts_count integer default 0,
  views_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can insert their own comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ============================================================
-- LIKES TABLE
-- ============================================================
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Users can like posts"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on public.likes for delete using (auth.uid() = user_id);

-- ============================================================
-- REPOSTS TABLE
-- ============================================================
create table if not exists public.reposts (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table public.reposts enable row level security;

create policy "Reposts are viewable by everyone"
  on public.reposts for select using (true);

create policy "Users can repost"
  on public.reposts for insert with check (auth.uid() = user_id);

create policy "Users can remove reposts"
  on public.reposts for delete using (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
create table if not exists public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'repost', 'comment', 'follow')),
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can see their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Notifications can be inserted by authenticated users"
  on public.notifications for insert with check (auth.uid() = actor_id);

create policy "Users can mark their own notifications as read"
  on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- REALTIME PUBLICATIONS
-- ============================================================
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.reposts;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- TRIGGERS: Auto-update counts
-- ============================================================

-- likes_count on posts
create or replace function public.handle_like_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  -- notification
  insert into public.notifications (user_id, actor_id, type, post_id)
  select p.user_id, NEW.user_id, 'like', NEW.post_id
  from public.posts p where p.id = NEW.post_id and p.user_id != NEW.user_id;
  return NEW;
end;
$$;

create or replace function public.handle_like_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set likes_count = greatest(0, likes_count - 1) where id = OLD.post_id;
  return OLD;
end;
$$;

create trigger on_like_insert after insert on public.likes
  for each row execute procedure public.handle_like_insert();

create trigger on_like_delete after delete on public.likes
  for each row execute procedure public.handle_like_delete();

-- reposts_count on posts
create or replace function public.handle_repost_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set reposts_count = reposts_count + 1 where id = NEW.post_id;
  insert into public.notifications (user_id, actor_id, type, post_id)
  select p.user_id, NEW.user_id, 'repost', NEW.post_id
  from public.posts p where p.id = NEW.post_id and p.user_id != NEW.user_id;
  return NEW;
end;
$$;

create or replace function public.handle_repost_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set reposts_count = greatest(0, reposts_count - 1) where id = OLD.post_id;
  return OLD;
end;
$$;

create trigger on_repost_insert after insert on public.reposts
  for each row execute procedure public.handle_repost_insert();

create trigger on_repost_delete after delete on public.reposts
  for each row execute procedure public.handle_repost_delete();

-- comments_count on posts
create or replace function public.handle_comment_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
  insert into public.notifications (user_id, actor_id, type, post_id)
  select p.user_id, NEW.user_id, 'comment', NEW.post_id
  from public.posts p where p.id = NEW.post_id and p.user_id != NEW.user_id;
  return NEW;
end;
$$;

create or replace function public.handle_comment_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comments_count = greatest(0, comments_count - 1) where id = OLD.post_id;
  return OLD;
end;
$$;

create trigger on_comment_insert after insert on public.comments
  for each row execute procedure public.handle_comment_insert();

create trigger on_comment_delete after delete on public.comments
  for each row execute procedure public.handle_comment_delete();

-- followers/following counts
create or replace function public.handle_follow_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
  update public.profiles set followers_count = followers_count + 1 where id = NEW.following_id;
  insert into public.notifications (user_id, actor_id, type)
  values (NEW.following_id, NEW.follower_id, 'follow');
  return NEW;
end;
$$;

create or replace function public.handle_follow_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set following_count = greatest(0, following_count - 1) where id = OLD.follower_id;
  update public.profiles set followers_count = greatest(0, followers_count - 1) where id = OLD.following_id;
  return OLD;
end;
$$;

create trigger on_follow_insert after insert on public.follows
  for each row execute procedure public.handle_follow_insert();

create trigger on_follow_delete after delete on public.follows
  for each row execute procedure public.handle_follow_delete();

-- Auto-create profile on auth user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, username, avatar_url)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    coalesce(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  return NEW;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
