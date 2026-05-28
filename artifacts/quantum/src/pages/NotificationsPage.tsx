import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, Repeat2, MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/lib/supabase";

type NotificationWithActor = Notification & {
  actor: { display_name: string; username: string; avatar_url: string };
};

const typeConfig = {
  like: { icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", label: "gönderini beğendi" },
  repost: { icon: Repeat2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "gönderini yeniden paylaştı" },
  comment: { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10", label: "gönderine yorum yaptı" },
  follow: { icon: UserPlus, color: "text-purple-400", bg: "bg-purple-500/10", label: "seni takip etmeye başladı" },
};

function AvatarFallback({ src, name }: { src: string; name: string }) {
  const initials = name?.trim().charAt(0).toUpperCase() || "?";
  if (src) return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-10 h-10 rounded-full shrink-0 bg-primary/20 flex items-center justify-center">
      <span className="text-primary font-bold text-sm">{initials}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "şimdi";
  if (diffMin < 60) return `${diffMin}dk önce`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} saat önce`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_id ( display_name, username, avatar_url )
      `)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data as NotificationWithActor[]);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    if (!currentUser || unreadCount === 0) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", currentUser.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  // Realtime notifications
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${currentUser.id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="font-display font-black text-2xl text-primary">Quantum</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground hidden md:block">Bildirimler</h1>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Bildirim yok</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Biri sizi takip ettiğinde, gönderinizi beğendiğinde veya yorum yaptığında burada görünecek.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {notifications.map((notif, i) => {
                  const cfg = typeConfig[notif.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors duration-150 ${
                        notif.read
                          ? "bg-card border-card-border"
                          : "bg-primary/4 border-primary/20"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <AvatarFallback
                          src={notif.actor?.avatar_url ?? ""}
                          name={notif.actor?.display_name ?? ""}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${cfg.bg} flex items-center justify-center border-2 border-background`}>
                          <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{notif.actor?.display_name}</span>
                          {" "}
                          <span className="text-muted-foreground">{cfg.label}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(notif.created_at)}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
