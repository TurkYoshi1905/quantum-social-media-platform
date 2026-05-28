import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtitryfpcciyudmbcihc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          username: string;
          avatar_url: string;
          bio: string;
          created_at: string;
          following_count: number;
          followers_count: number;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'following_count' | 'followers_count'>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          title: string;
          image_url: string;
          likes_count: number;
          reposts_count: number;
          views_count: number;
          comments_count: number;
          created_at: string;
        };
        Insert: Pick<Database['public']['Tables']['posts']['Row'], 'user_id' | 'content'> & Partial<Database['public']['Tables']['posts']['Row']>;
        Update: Partial<Database['public']['Tables']['posts']['Row']>;
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: Pick<Database['public']['Tables']['comments']['Row'], 'post_id' | 'user_id' | 'content'>;
        Update: Partial<Database['public']['Tables']['comments']['Row']>;
      };
      likes: {
        Row: { id: string; post_id: string; user_id: string; created_at: string };
        Insert: Pick<Database['public']['Tables']['likes']['Row'], 'post_id' | 'user_id'>;
        Update: Partial<Database['public']['Tables']['likes']['Row']>;
      };
      reposts: {
        Row: { id: string; post_id: string; user_id: string; created_at: string };
        Insert: Pick<Database['public']['Tables']['reposts']['Row'], 'post_id' | 'user_id'>;
        Update: Partial<Database['public']['Tables']['reposts']['Row']>;
      };
      follows: {
        Row: { id: string; follower_id: string; following_id: string; created_at: string };
        Insert: Pick<Database['public']['Tables']['follows']['Row'], 'follower_id' | 'following_id'>;
        Update: Partial<Database['public']['Tables']['follows']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string;
          type: 'like' | 'repost' | 'comment' | 'follow';
          post_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'read'>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
