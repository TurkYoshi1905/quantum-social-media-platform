import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="font-display font-black text-2xl text-primary">Quantum</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-6 hidden md:block">Bildirimler</h1>
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
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
