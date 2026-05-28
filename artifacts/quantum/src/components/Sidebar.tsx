import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Compass, Bell, Mail, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: Home, label: "Ana Sayfa", href: "/home" },
  { icon: Compass, label: "Keşfet", href: "/explore" },
  { icon: Bell, label: "Bildirimler", href: "/notifications" },
  { icon: Mail, label: "Mesajlar", href: "/messages" },
  { icon: User, label: "Profil", href: "/profile" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { currentUser, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 border-r border-sidebar-border bg-sidebar">
      <div className="flex flex-col h-full py-6 px-4">
        <Link href="/home">
          <span
            className="font-display font-black text-2xl tracking-tight text-primary px-2 mb-8 cursor-pointer block"
            data-testid="logo-sidebar"
          >
            Quantum
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid={`nav-${href.replace("/", "")}`}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                    isActive
                      ? "bg-primary/12 text-primary font-semibold"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1">
          <Link href="/profile">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sidebar-accent transition-colors duration-150 cursor-pointer">
              <img
                src={currentUser?.avatar ?? "https://i.pravatar.cc/150?img=3"}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUser?.displayName}</p>
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
