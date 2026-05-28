import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Eye, Send } from "lucide-react";
import type { Post, Comment } from "@/data/mockData";

interface PostCardProps {
  post: Post;
  onLike?: (id: number) => void;
  onRepost?: (id: number) => void;
  onComment?: (id: number, text: string) => void;
}

export function PostCard({ post, onLike, onRepost, onComment }: PostCardProps) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (commentText.trim()) {
      onComment?.(post.id, commentText.trim());
      setCommentText("");
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-card border border-card-border rounded-2xl overflow-hidden hover:border-border/60 transition-colors duration-200"
      data-testid={`card-post-${post.id}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.displayName}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm leading-tight">
                {post.author.displayName}
              </span>
              <span className="text-muted-foreground text-xs">@{post.author.username}</span>
              <span className="text-muted-foreground text-xs ml-auto">{post.timestamp}</span>
            </div>

            {post.title && (
              <h3 className="font-semibold text-base text-foreground mt-2 leading-snug">
                {post.title}
              </h3>
            )}

            <p className="text-foreground/85 text-sm mt-1.5 leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        {post.image && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img
              src={post.image}
              alt=""
              className="w-full object-cover max-h-72"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
          <button
            data-testid={`button-comment-${post.id}`}
            onClick={() => setCommentOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              commentOpen
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/8"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.stats.comments}</span>
          </button>

          <button
            data-testid={`button-repost-${post.id}`}
            onClick={() => onRepost?.(post.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              post.reposted
                ? "text-emerald-500 bg-emerald-500/10"
                : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/8"
            }`}
          >
            <Repeat2 className="w-4 h-4" />
            <span>{post.stats.reposts}</span>
          </button>

          <button
            data-testid={`button-like-${post.id}`}
            onClick={() => onLike?.(post.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
              post.liked
                ? "text-rose-500 bg-rose-500/10"
                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/8"
            }`}
          >
            <motion.div
              animate={post.liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.25, ease: "backOut" }}
            >
              <Heart className={`w-4 h-4 ${post.liked ? "fill-rose-500" : ""}`} />
            </motion.div>
            <span>{post.stats.likes}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground ml-auto">
            <Eye className="w-4 h-4" />
            <span>{post.stats.views}</span>
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
                {post.comments.map((c: Comment) => (
                  <div key={c.id} className="flex gap-2">
                    <img src={c.author.avatar} alt={c.author.displayName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-xs text-foreground">{c.author.displayName}</span>
                        <span className="text-muted-foreground text-[11px]">{c.timestamp}</span>
                      </div>
                      <p className="text-foreground/80 text-xs mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    data-testid={`input-comment-${post.id}`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Yorumunuzu yazın..."
                    className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition"
                  />
                  <button
                    data-testid={`button-submit-comment-${post.id}`}
                    onClick={handleComment}
                    className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
