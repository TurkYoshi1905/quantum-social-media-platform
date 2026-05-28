import { motion } from "framer-motion";
import { Compass, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";

export default function ExplorePage() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="font-display font-black text-2xl text-primary">Quantum</span>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              data-testid="input-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Quantum'da ara..."
              className="w-full bg-card border border-card-border rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Keşfet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Platform büyüdükçe burada ilginç içerikler ve kullanıcılar görünecek.
            </p>
          </motion.div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
