import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Compass, Bell, Mail, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function SidebarAvatar({ src, displayName }: { src: string; displayName: string }) {
  const initials = displayName?.trim().charAt(0).toUpperCase() || "?";
  if (src) return <img src={src} alt="avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-border shrink-0" />;
  return (
    <div className="w-9 h-9 rounded-full ring-2 ring-border shrink-0 bg-primary/20 flex items-center justify-center select-none">
      <span className="text-primary font-bold text-sm leading-none">{initials}</span>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", currentUser.id)
        .eq("read", false);
      setUnreadCount(count ?? 0);
    };
    fetch();

    const channel = supabase
      .channel("sidebar-notif")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${currentUser.id}`,
      }, () => {
        setUnreadCount((c) => c + 1);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${currentUser.id}`,
      }, () => { fetch(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  const navItems = [
    { icon: Home, label: "Ana Sayfa", href: "/home", badge: 0 },
    { icon: Compass, label: "Keşfet", href: "/explore", badge: 0 },
    { icon: Bell, label: "Bildirimler", href: "/notifications", badge: unreadCount },
    { icon: Mail, label: "Mesajlar", href: "/messages", badge: 0 },
    { icon: User, label: "Profil", href: "/profile", badge: 0 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 border-r border-sidebar-border bg-sidebar">
      <div className="flex flex-col h-full py-6 px-4">
        <Link href="/home">
          <span className="font-display font-black text-2xl tracking-tight text-primary px-2 mb-8 cursor-pointer block" data-testid="logo-sidebar">
            Quantum
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ icon: Icon, label, href, badge }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid={`nav-${href.replace("/", "")}`}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                    isActive ? "bg-primary/12 text-primary font-semibold" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{label}</span>
                  {badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] text-center"
                    >
                      {badge > 99 ? "99+" : badge}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1">
          <Link href="/profile">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sidebar-accent transition-colors duration-150 cursor-pointer">
              <SidebarAvatar src={currentUser?.avatar_url ?? ""} displayName={currentUser?.display_name ?? ""} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUser?.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{currentUser?.username}</p>
              </div>
            </div>
          </Link>

          <button
            data-testid="button-logout"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
