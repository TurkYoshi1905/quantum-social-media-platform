import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PostComposerProps {
  onPost: (post: { title: string; content: string; image?: string }) => void;
}

function AvatarFallback({ src, name }: { src: string; name: string }) {
  const initials = name?.trim().charAt(0).toUpperCase() || "?";
  if (src) return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-border" />;
  return (
    <div className="w-10 h-10 rounded-full shrink-0 ring-2 ring-border bg-primary/20 flex items-center justify-center select-none">
      <span className="text-primary font-bold text-sm leading-none">{initials}</span>
    </div>
  );
}

export function PostComposer({ onPost }: PostComposerProps) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!content.trim() && !title.trim()) return;
    onPost({ title: title.trim(), content: content.trim(), image: imagePreview || undefined });
    setTitle("");
    setContent("");
    setImagePreview(null);
    setFocused(false);
  };

  return (
    <motion.div
      className={`bg-card border rounded-2xl p-4 sm:p-5 transition-all duration-200 ${focused ? "border-primary/40 shadow-lg shadow-primary/5" : "border-card-border"}`}
      layout
    >
      <div className="flex gap-3">
        <AvatarFallback src={currentUser?.avatar_url ?? ""} name={currentUser?.display_name ?? ""} />
        <div className="flex-1 space-y-2">
          <AnimatePresence>
            {(focused || title) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
              >
                <input
                  data-testid="input-post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Başlık (isteğe bağlı)"
                  className="w-full bg-transparent text-foreground font-semibold text-sm placeholder:text-muted-foreground/60 outline-none border-b border-border/40 pb-2 mb-1"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <textarea
            data-testid="textarea-post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Neler oluyor?"
            rows={focused ? 3 : 1}
            className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground/70 outline-none resize-none leading-relaxed transition-all duration-200"
          />
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-xl overflow-hidden mt-2"
              >
                <img src={imagePreview} alt="preview" className="w-full max-h-56 object-cover" />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 pt-2 border-t border-border/40"
              >
                <button
                  data-testid="button-attach-image"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/8 text-xs font-medium transition-all duration-150"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Resim</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <div className="flex-1" />
                <button
                  data-testid="button-cancel-post"
                  onClick={() => { setFocused(false); setTitle(""); setContent(""); setImagePreview(null); }}
                  className="px-3 py-1.5 rounded-xl text-muted-foreground hover:bg-muted text-xs font-medium transition-all duration-150"
                >
                  Vazgeç
                </button>
                <button
                  data-testid="button-publish-post"
                  onClick={handlePublish}
                  disabled={!content.trim() && !title.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:opacity-90 transition-all duration-150"
                >
                  <Send className="w-3.5 h-3.5" />
                  Yayınla
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
