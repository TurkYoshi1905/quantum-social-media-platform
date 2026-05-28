import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Search, Loader2, UserPlus, UserCheck } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { PostCardData } from "@/components/PostCard";
import type { Profile } from "@/lib/supabase";

type SearchTab = "Gönderiler" | "Kişiler";

function AvatarFallback({ src, name }: { src: string; name: string }) {
  const initials = name?.trim().charAt(0).toUpperCase() || "?";
  if (src) return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-10 h-10 rounded-full shrink-0 bg-primary/20 flex items-center justify-center">
      <span className="text-primary font-bold text-sm">{initials}</span>
    </div>
  );
}

export default function ExplorePage() {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("Gönderiler");
  const [loading, setLoading] = useState(false);
  const [postResults, setPostResults] = useState<PostCardData[]>([]);
  const [peopleResults, setPeopleResults] = useState<Profile[]>([]);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [trendingPosts, setTrendingPosts] = useState<PostCardData[]>([]);

  // Load trending posts on mount
  useEffect(() => {
    if (!currentUser) return;
    const fetchTrending = async () => {
      const { data } = await supabase
        .from("posts")
        .select(`*, profiles:user_id ( display_name, username, avatar_url )`)
        .order("likes_count", { ascending: false })
        .limit(20);
      if (data) {
        const postIds = data.map((p) => p.id);
        const [{ data: likedData }, { data: repostedData }] = await Promise.all([
          supabase.from("likes").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
          supabase.from("reposts").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
        ]);
        const likedSet = new Set((likedData ?? []).map((l) => l.post_id));
        const repostedSet = new Set((repostedData ?? []).map((r) => r.post_id));
        setTrendingPosts(data.map((p) => ({
          ...(p as unknown as PostCardData),
          profiles: p.profiles as { display_name: string; username: string; avatar_url: string },
          liked: likedSet.has(p.id),
          reposted: repostedSet.has(p.id),
          comments: [],
        })));
      }
    };
    fetchTrending();
  }, [currentUser]);

  // Load who I follow
  useEffect(() => {
    if (!currentUser) return;
    supabase.from("follows").select("following_id").eq("follower_id", currentUser.id).then(({ data }) => {
      if (data) setFollowingSet(new Set(data.map((f) => f.following_id)));
    });
  }, [currentUser]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || !currentUser) { setPostResults([]); setPeopleResults([]); return; }
    setLoading(true);
    const trimmed = q.trim();
    if (tab === "Gönderiler") {
      const { data } = await supabase
        .from("posts")
        .select(`*, profiles:user_id ( display_name, username, avatar_url )`)
        .ilike("content", `%${trimmed}%`)
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) {
        const postIds = data.map((p) => p.id);
        const [{ data: likedData }, { data: repostedData }] = await Promise.all([
          supabase.from("likes").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
          supabase.from("reposts").select("post_id").eq("user_id", currentUser.id).in("post_id", postIds),
        ]);
        const likedSet = new Set((likedData ?? []).map((l) => l.post_id));
        const repostedSet = new Set((repostedData ?? []).map((r) => r.post_id));
        setPostResults(data.map((p) => ({
          ...(p as unknown as PostCardData),
          profiles: p.profiles as { display_name: string; username: string; avatar_url: string },
          liked: likedSet.has(p.id), reposted: repostedSet.has(p.id), comments: [],
        })));
      }
    } else {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
        .neq("id", currentUser.id)
        .limit(20);
      if (data) setPeopleResults(data);
    }
    setLoading(false);
  }, [currentUser, tab]);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const toggleFollow = async (profileId: string) => {
    if (!currentUser) return;
    const isFollowing = followingSet.has(profileId);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", profileId);
      setFollowingSet((s) => { const n = new Set(s); n.delete(profileId); return n; });
    } else {
      await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: profileId });
      setFollowingSet((s) => new Set([...s, profileId]));
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    const post = (query ? postResults : trendingPosts).find((p) => p.id === postId);
    if (!post) return;
    const update = (prev: PostCardData[]) => prev.map((p) => p.id === postId
      ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p);
    if (query) setPostResults(update);
    else setTrendingPosts(update);
    if (post.liked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUser.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUser.id });
    }
  };

  const displayPosts = query ? postResults : trendingPosts;
  const hasSearch = query.trim().length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="font-display font-black text-2xl text-primary">Quantum</span>
          </div>

          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              data-testid="input-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Quantum'da ara..."
              className="w-full bg-card border border-card-border rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Tabs (only show when searching) */}
          <AnimatePresence>
            {hasSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-0 border-b border-border mb-5 overflow-hidden"
              >
                {(["Gönderiler", "Kişiler"] as SearchTab[]).map((t) => (
                  <button
                    key={t}
                    data-testid={`explore-tab-${t}`}
                    onClick={() => setTab(t)}
                    className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t}
                    {tab === t && (
                      <motion.div layoutId="explore-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence mode="wait">
            {hasSearch && tab === "Kişiler" ? (
              <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {peopleResults.length === 0 && !loading ? (
                  <div className="text-center py-16 text-muted-foreground text-sm">Kullanıcı bulunamadı.</div>
                ) : peopleResults.map((profile, i) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-4 bg-card border border-card-border rounded-2xl"
                  >
                    <AvatarFallback src={profile.avatar_url} name={profile.display_name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{profile.username}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{profile.followers_count} takipçi</p>
                    </div>
                    <motion.button
                      data-testid={`button-follow-${profile.id}`}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleFollow(profile.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        followingSet.has(profile.id)
                          ? "bg-muted text-muted-foreground border border-border hover:text-destructive hover:border-destructive/30"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      {followingSet.has(profile.id) ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {followingSet.has(profile.id) ? "Takip Ediliyor" : "Takip Et"}
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {!hasSearch && (
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Öne Çıkan Gönderiler</span>
                  </div>
                )}
                {displayPosts.length === 0 && !loading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Compass className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">{hasSearch ? "Sonuç bulunamadı" : "Keşfet"}</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      {hasSearch ? "Farklı anahtar kelimeler deneyin." : "Platform büyüdükçe burada ilginç içerikler görünecek."}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {displayPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUserId={currentUser?.id}
                          currentUsername={currentUser?.username}
                          onLike={handleLike}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
