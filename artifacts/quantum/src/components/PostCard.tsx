import { useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Eye, Send, Trash2 } from "lucide-react";

type PostProfile = { display_name: string; username: string; avatar_url: string };
type CommentWithProfile = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: PostProfile;
};

export type PostCardData = {
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
  profiles: PostProfile;
  liked: boolean;
  reposted: boolean;
  comments: CommentWithProfile[];
};

interface PostCardProps {
  post: PostCardData;
  currentUserId?: string;
  currentUsername?: string;
  onLike?: (id: string) => void;
  onRepost?: (id: string) => void;
  onComment?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
}

function AvatarFallback({ src, name, size = "md" }: { src: string; name: string; size?: "sm" | "md" }) {
  const initials = name?.trim().charAt(0).toUpperCase() || "?";
  const cls = size === "sm"
    ? "w-7 h-7 rounded-full shrink-0 text-xs"
    : "w-10 h-10 rounded-full shrink-0 ring-2 ring-border text-sm";
  if (src) return <img src={src} alt={name} className={`${cls} object-cover`} />;
  return (
    <div className={`${cls} bg-primary/20 flex items-center justify-center select-none`}>
      <span className="text-primary font-bold leading-none">{initials}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "şimdi";
  if (diffMin < 60) return `${diffMin}dk`;
  if (diffHr < 24) return `${diffHr}sa`;
  if (diffDay < 7) return `${diffDay}g`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function PostCard({
  post,
  currentUserId,
  currentUsername,
  onLike,
  onRepost,
  onComment,
  onDelete,
  onDeleteComment,
}: PostCardProps) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const repostControls = useAnimation();

  const isOwnPost = currentUserId && post.user_id === currentUserId;

  const handleComment = () => {
    if (commentText.trim()) {
      onComment?.(post.id, commentText.trim());
      setCommentText("");
    }
  };

  const handleRepostClick = async () => {
    onRepost?.(post.id);
    await repostControls.start({
      rotate: [0, -15, 360],
      scale: [1, 1.25, 1],
      transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.3, 1] },
    });
    repostControls.set({ rotate: 0, scale: 1 });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-border/60 transition-colors duration-200"
      data-testid={`card-post-${post.id}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AvatarFallback src={post.profiles?.avatar_url ?? ""} name={post.profiles?.display_name ?? ""} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm leading-tight">{post.profiles?.display_name}</span>
              <span className="text-muted-foreground text-xs">@{post.profiles?.username}</span>
              <span className="text-muted-foreground text-xs ml-auto">{formatDate(post.created_at)}</span>
              {isOwnPost && (
                <div className="relative">
                  <motion.button
                    data-testid={`button-delete-post-${post.id}`}
                    onClick={() => setShowDeleteConfirm((v) => !v)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                  <AnimatePresence>
                    {showDeleteConfirm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-xl p-3 min-w-[160px]"
                      >
                        <p className="text-xs text-foreground font-medium mb-2">Gönderiyi sil?</p>
                        <div className="flex gap-2">
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onDelete?.(post.id); setShowDeleteConfirm(false); }} className="flex-1 px-2 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors">Sil</motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-2 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/70 transition-colors">Vazgeç</motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {post.title && (
              <h3 className="font-semibold text-base text-foreground mt-2 leading-snug">{post.title}</h3>
            )}
            <p className="text-foreground/85 text-sm mt-1.5 leading-relaxed">{post.content}</p>
          </div>
        </div>

        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img src={post.image_url} alt="" className="w-full object-cover max-h-72" loading="lazy" />
          </div>
        )}

        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
          <button
            data-testid={`button-comment-${post.id}`}
            onClick={() => setCommentOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${commentOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/8"}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count}</span>
          </button>

          <button
            data-testid={`button-repost-${post.id}`}
            onClick={handleRepostClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${post.reposted ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/8"}`}
          >
            <motion.div animate={repostControls} style={{ display: "flex" }}>
              <Repeat2 className="w-4 h-4" />
            </motion.div>
            <motion.span key={post.reposts_count} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {post.reposts_count}
            </motion.span>
          </button>

          <button
            data-testid={`button-like-${post.id}`}
            onClick={() => onLike?.(post.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${post.liked ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/8"}`}
          >
            <motion.div animate={post.liked ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.25, ease: "backOut" }}>
              <Heart className={`w-4 h-4 ${post.liked ? "fill-rose-500" : ""}`} />
            </motion.div>
            <motion.span key={post.likes_count} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {post.likes_count}
            </motion.span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground ml-auto">
            <Eye className="w-4 h-4" />
            <span>{post.views_count}</span>
          </div>
        </div>

        <AnimatePresence>
          {commentOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                <AnimatePresence initial={false}>
                  {post.comments.map((c) => {
                    const isOwnComment = currentUserId && c.user_id === currentUserId;
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-2 items-start group"
                      >
                        <AvatarFallback src={c.profiles?.avatar_url ?? ""} name={c.profiles?.display_name ?? ""} size="sm" />
                        <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-xs text-foreground">{c.profiles?.display_name}</span>
                            <span className="text-muted-foreground text-[11px]">{formatDate(c.created_at)}</span>
                            {isOwnComment && (
                              <motion.button
                                data-testid={`button-delete-comment-${c.id}`}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => onDeleteComment?.(post.id, c.id)}
                                className="ml-auto p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            )}
                          </div>
                          <p className="text-foreground/80 text-xs mt-0.5">{c.content}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <div className="flex gap-2">
                  <input
                    data-testid={`input-comment-${post.id}`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Yorumunuzu yazın..."
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition"
                  />
                  <motion.button
                    data-testid={`button-submit-comment-${post.id}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComment}
                    className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
