import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Camera, LogOut, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { AvatarModal } from "@/components/AvatarModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { PostCardData } from "@/components/PostCard";

type Tab = "Gönderiler" | "Yeniden Gönderiler" | "Yanıtlar" | "Medya" | "Beğeniler";
const TABS: Tab[] = ["Gönderiler", "Yeniden Gönderiler", "Yanıtlar", "Medya", "Beğeniler"];

function AvatarDisplay({ src, displayName, className, onClick }: { src: string; displayName: string; className?: string; onClick?: () => void }) {
  const initials = displayName?.trim().charAt(0).toUpperCase() || "?";
  if (src) return <img src={src} alt="profile" data-testid="img-profile-avatar" className={className} onClick={onClick} />;
  return (
    <div data-testid="img-profile-avatar" onClick={onClick} className={`${className} bg-primary/20 flex items-center justify-center select-none`}>
      <span className="text-primary font-bold text-3xl leading-none">{initials}</span>
    </div>
  );
}

function EmptyTab({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
      <p className="text-sm">{text}</p>
    </motion.div>
  );
}


export default function ProfilePage() {
  const { currentUser, logout, updateAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Gönderiler");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tabPosts, setTabPosts] = useState<PostCardData[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const fetchTabData = useCallback(async (tab: Tab) => {
    if (!currentUser) return;
    setTabLoading(true);
    setTabPosts([]);

    try {
      if (tab === "Gönderiler") {
        const { data } = await supabase
          .from("posts")
          .select(`*, profiles:user_id ( display_name, username, avatar_url )`)
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (data) {
          const postIds = data.map((p) => p.id);
          const [{ data: likedData }, { data: repostedData }, { data: commentsData }] = await Promise.all([
            supabase.from("likes").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
            supabase.from("reposts").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
            supabase.from("comments").select(`*, profiles:user_id ( display_name, username, avatar_url )`).in("post_id", postIds),
          ]);
          const likedSet = new Set((likedData ?? []).map((l) => l.post_id));
          const repostedSet = new Set((repostedData ?? []).map((r) => r.post_id));
          const commentsByPost: Record<string, unknown[]> = {};
          for (const c of commentsData ?? []) {
            if (!commentsByPost[(c as { post_id: string }).post_id]) commentsByPost[(c as { post_id: string }).post_id] = [];
            commentsByPost[(c as { post_id: string }).post_id].push(c);
          }
          setTabPosts(data.map((p) => ({
            ...(p as unknown as PostCardData),
            profiles: p.profiles as { display_name: string; username: string; avatar_url: string },
            liked: likedSet.has(p.id),
            reposted: repostedSet.has(p.id),
            comments: (commentsByPost[p.id] ?? []) as PostCardData["comments"],
          })));
        }
      } else if (tab === "Yeniden Gönderiler") {
        const { data: repostIds } = await supabase.from("reposts").select("post_id").eq("user_id", currentUser.id);
        if (repostIds && repostIds.length > 0) {
          const ids = repostIds.map((r) => r.post_id);
          const { data } = await supabase.from("posts").select(`*, profiles:user_id ( display_name, username, avatar_url )`).in("id", ids);
          if (data) {
            setTabPosts(data.map((p) => ({
              ...(p as unknown as PostCardData),
              profiles: p.profiles as { display_name: string; username: string; avatar_url: string },
              liked: false, reposted: true, comments: [],
            })));
          }
        }
      } else if (tab === "Beğeniler") {
        const { data: likeIds } = await supabase.from("likes").select("post_id").eq("user_id", currentUser.id);
        if (likeIds && likeIds.length > 0) {
          const ids = likeIds.map((l) => l.post_id);
          const { data } = await supabase.from("posts").select(`*, profiles:user_id ( display_name, username, avatar_url )`).in("id", ids);
          if (data) {
            setTabPosts(data.map((p) => ({
              ...(p as unknown as PostCardData),
              profiles: p.profiles as { display_name: string; username: string; avatar_url: string },
              liked: true, reposted: false, comments: [],
            })));
          }
        }
      }
    } finally {
      setTabLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, fetchTabData]);

  const handleSaveAvatar = async (dataUrl: string) => {
    await updateAvatar(dataUrl);
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    const post = tabPosts.find((p) => p.id === postId);
    if (!post) return;
    setTabPosts((prev) => prev.map((p) => p.id === postId ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p));
    if (post.liked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUser.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUser.id });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!currentUser) return;
    await supabase.from("posts").delete().eq("id", postId).eq("user_id", currentUser.id);
    setTabPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const joinDate = currentUser?.created_at
    ? new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(currentUser.created_at))
    : "";

  const emptyMessages: Record<Tab, string> = {
    Gönderiler: "Henüz gönderi yok. Ana sayfadan ilk gönderini paylaş!",
    "Yeniden Gönderiler": "Henüz yeniden gönderi yok.",
    Yanıtlar: "Henüz yanıt yok.",
    Medya: "Henüz medya paylaşımı yok.",
    Beğeniler: "Henüz beğenilen gönderi yok.",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto w-full">
          {/* Banner */}
          <div className="h-36 sm:h-52 bg-gradient-to-br from-primary/30 via-primary/15 to-background relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>

          <div className="px-4 sm:px-6 relative">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
              <div className="relative group shrink-0">
                <AvatarDisplay
                  src={currentUser?.avatar_url ?? ""}
                  displayName={currentUser?.display_name ?? ""}
                  className="w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-background"
                />
                <button
                  data-testid="button-upload-avatar"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              <button
                data-testid="button-logout-profile"
                onClick={logout}
                className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-card-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all duration-150 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>

            <div className="mb-5">
              <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight" data-testid="text-display-name">
                {currentUser?.display_name}
              </h1>
              <p className="text-muted-foreground text-sm" data-testid="text-username">@{currentUser?.username}</p>
              {currentUser?.bio && <p className="text-foreground/80 text-sm mt-2">{currentUser.bio}</p>}
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-xs">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span data-testid="text-join-date">{joinDate}&apos;dan beri Quantum&apos;da</span>
              </div>
              <div className="flex items-center gap-5 mt-3">
                <button data-testid="stat-following" className="flex items-center gap-1.5 hover:text-primary transition-colors group">
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{currentUser?.following_count ?? 0}</span>
                  <span className="text-muted-foreground text-xs">Takip Edilen</span>
                </button>
                <button data-testid="stat-followers" className="flex items-center gap-1.5 hover:text-primary transition-colors group">
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{currentUser?.followers_count ?? 0}</span>
                  <span className="text-muted-foreground text-xs">Takipçi</span>
                </button>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="relative border-b border-border mb-5 -mx-4 sm:-mx-6 px-4 sm:px-6">
              <div className="flex overflow-x-auto scrollbar-hide gap-0 -mb-px">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    data-testid={`tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`relative shrink-0 px-3 py-3 text-xs font-medium transition-colors duration-150 whitespace-nowrap ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="pb-8"
              >
                {tabLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (activeTab === "Yanıtlar" || activeTab === "Medya") ? (
                  <EmptyTab text={emptyMessages[activeTab]} />
                ) : tabPosts.length === 0 ? (
                  <EmptyTab text={emptyMessages[activeTab]} />
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {tabPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUserId={currentUser?.id}
                          currentUsername={currentUser?.username}
                          onLike={handleLike}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAvatarModal && (
          <AvatarModal onClose={() => setShowAvatarModal(false)} onSave={handleSaveAvatar} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
