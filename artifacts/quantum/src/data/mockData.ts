// Legacy type definitions — kept for backward compatibility
// New code should use types from @/lib/supabase instead

export const mockUser = {
  id: 1,
  displayName: "Alex Kim",
  username: "alexkim",
  email: "alex@quantum.app",
  avatar: "",
  joinDate: "Mayıs 2026",
  following: 0,
  followers: 0,
};

export type Comment = {
  id: number;
  author: { displayName: string; username: string; avatar: string };
  content: string;
  timestamp: string;
};

export type Post = {
  id: number;
  author: { displayName: string; username: string; avatar: string };
  timestamp: string;
  title?: string;
  content: string;
  image?: string;
  stats: { likes: number; comments: number; reposts: number; views: string };
  liked: boolean;
  reposted: boolean;
  comments: Comment[];
};
