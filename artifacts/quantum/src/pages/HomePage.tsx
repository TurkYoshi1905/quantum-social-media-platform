import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/supabase";
import { Sparkles, Loader2 } from "lucide-react";

type PostWithProfile = Post & {
  profiles: { display_name: string; username: string; avatar_url: string };
  liked: boolean;
  reposted: boolean;
  comments: CommentWithProfile[];
};

type CommentWithProfile = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string; username: string; avatar_url: string };
};

export default function HomePage() {
  const { currentUser, session } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id ( display_name, username, avatar_url )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return;

    // Fetch user likes and reposts
    const postIds = data.map((p) => p.id);
    const [{ data: likedData }, { data: repostedData }, { data: commentsData }] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
      supabase.from("reposts").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
      supabase.from("comments").select(`*, profiles:user_id ( display_name, username, avatar_url )`).in("post_id", postIds).order("created_at"),
    ]);

    const likedSet = new Set((likedData ?? []).map((l) => l.post_id));
    const repostedSet = new Set((repostedData ?? []).map((r) => r.post_id));
    const commentsByPost: Record<string, CommentWithProfile[]> = {};
    for (const c of commentsData ?? []) {
      if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
      commentsByPost[c.post_id].push(c as CommentWithProfile);
    }

    setPosts(
      data.map((p) => ({
        ...(p as Post),
        profiles: p.profiles as { display_name: string; username: string; avatar_url: string },
        liked: likedSet.has(p.id),
        reposted: repostedSet.has(p.id),
        comments: commentsByPost[p.id] ?? [],
      }))
    );
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime: new posts
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" }, (payload) => {
        setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser, fetchPosts]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) => prev.map((p) => p.id === postId
      ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
      : p
    ));

    if (post.liked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUser.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUser.id });
    }
  };

  const handleRepost = async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setPosts((prev) => prev.map((p) => p.id === postId
      ? { ...p, reposted: !p.reposted, reposts_count: p.reposted ? p.reposts_count - 1 : p.reposts_count + 1 }
      : p
    ));

    if (post.reposted) {
      await supabase.from("reposts").delete().eq("post_id", postId).eq("user_id", currentUser.id);
    } else {
      await supabase.from("reposts").insert({ post_id: postId, user_id: currentUser.id });
    }
  };

  const handleComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: currentUser.id, content: text })
      .select(`*, profiles:user_id ( display_name, username, avatar_url )`)
      .single();
    if (data) {
      setPosts((prev) => prev.map((p) => p.id === postId
        ? { ...p, comments_count: p.comments_count + 1, comments: [...p.comments, data as CommentWithProfile] }
        : p
      ));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!currentUser) return;
    await supabase.from("comments").delete().eq("id", commentId).eq("user_id", currentUser.id);
    setPosts((prev) => prev.map((p) => p.id === postId
      ? { ...p, comments_count: Math.max(0, p.comments_count - 1), comments: p.comments.filter((c) => c.id !== commentId) }
      : p
    ));
  };

  const handleDelete = async (postId: string) => {
    if (!currentUser) return;
    await supabase.from("posts").delete().eq("id", postId).eq("user_id", currentUser.id);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleNewPost = async (data: { title: string; content: string; image?: string }) => {
    if (!currentUser || !session) return;
    await supabase.from("posts").insert({
      user_id: currentUser.id,
      content: data.content,
      title: data.title || "",
      image_url: data.image || "",
    });
    fetchPosts();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          <div className="flex items-center justify-between md:hidden mb-2">
            <span className="font-display font-black text-2xl text-primary" data-testid="logo-mobile">Quantum</span>
          </div>

          <PostComposer onPost={handleNewPost} />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id}
                    currentUsername={currentUser?.username}
                    onLike={handleLike}
                    onRepost={handleRepost}
                    onComment={handleComment}
                    onDelete={handleDelete}
                    onDeleteComment={handleDeleteComment}
                  />
                ))}
              </AnimatePresence>

              {posts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground mb-1">Feed henüz boş</h2>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    İlk gönderiyi sen paylaş. Yukarıdaki alana yaz ve Quantum'u başlat.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
