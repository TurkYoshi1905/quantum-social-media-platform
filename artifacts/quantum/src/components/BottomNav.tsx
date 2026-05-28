import { Link, useLocation } from "wouter";
import { Home, Compass, Bell, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function BottomNav() {
  const [location] = useLocation();
  const { currentUser } = useAuth();
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
      .channel("bottomnav-notif")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUser.id}` }, () => {
        setUnreadCount((c) => c + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${currentUser.id}` }, () => { fetch(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  const navItems = [
    { icon: Home, href: "/home", badge: 0 },
    { icon: Compass, href: "/explore", badge: 0 },
    { icon: Bell, href: "/notifications", badge: unreadCount },
    { icon: Mail, href: "/messages", badge: 0 },
    { icon: User, href: "/profile", badge: 0 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ icon: Icon, href, badge }) => {
          const isActive = location === href || (href === "/home" && location === "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                data-testid={`bottom-nav-${href.replace("/", "")}`}
                className={`relative flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-colors duration-150 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center"
                  >
                    {badge > 9 ? "9+" : badge}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
