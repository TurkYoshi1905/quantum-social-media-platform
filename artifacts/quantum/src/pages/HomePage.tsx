import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { PostComposer } from "@/components/PostComposer";
import type { Post } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  const handleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, stats: { ...p.stats, likes: p.liked ? p.stats.likes - 1 : p.stats.likes + 1 } }
          : p
      )
    );
  };

  const handleRepost = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, reposted: !p.reposted, stats: { ...p.stats, reposts: p.reposted ? p.stats.reposts - 1 : p.stats.reposts + 1 } }
          : p
      )
    );
  };

  const handleComment = (id: number, text: string) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: Date.now(),
                  author: {
                    displayName: currentUser.displayName,
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                  },
                  content: text,
                  timestamp: "şimdi",
                },
              ],
              stats: { ...p.stats, comments: p.stats.comments + 1 },
            }
          : p
      )
    );
  };

  const handleNewPost = (data: { title: string; content: string; image?: string }) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now(),
      author: {
        displayName: currentUser.displayName,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      timestamp: "şimdi",
      title: data.title || undefined,
      content: data.content,
      image: data.image,
      stats: { likes: 0, comments: 0, reposts: 0, views: "1" },
      liked: false,
      reposted: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          <div className="flex items-center justify-between md:hidden mb-2">
            <span className="font-display font-black text-2xl text-primary" data-testid="logo-mobile">
              Quantum
            </span>
          </div>

          <PostComposer onPost={handleNewPost} />

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
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
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
