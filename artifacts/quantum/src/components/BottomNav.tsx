import { Link, useLocation } from "wouter";
import { Home, Compass, Bell, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, href: "/home" },
  { icon: Compass, href: "/explore" },
  { icon: Bell, href: "/notifications" },
  { icon: Mail, href: "/messages" },
  { icon: User, href: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ icon: Icon, href }) => {
          const isActive = location === href || (href === "/home" && location === "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                data-testid={`bottom-nav-${href.replace("/", "")}`}
                className={`flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-colors duration-150 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
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
