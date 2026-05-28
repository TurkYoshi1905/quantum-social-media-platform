import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Camera, LogOut } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/data/mockData";

type Tab = "Gönderiler" | "Yeniden Gönderiler" | "Yanıtlar" | "Medya" | "Beğeniler";
const TABS: Tab[] = ["Gönderiler", "Yeniden Gönderiler", "Yanıtlar", "Medya", "Beğeniler"];

function EmptyTab({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 text-muted-foreground"
    >
      <p className="text-sm">{text}</p>
    </motion.div>
  );
}

function AvatarDisplay({
  src,
  displayName,
  className,
  onClick,
}: {
  src: string;
  displayName: string;
  className?: string;
  onClick?: () => void;
}) {
  const initials = displayName?.trim().charAt(0).toUpperCase() || "?";
  if (src) {
    return (
      <img
        src={src}
        alt="profile"
        data-testid="img-profile-avatar"
        className={className}
        onClick={onClick}
      />
    );
  }
  return (
    <div
      data-testid="img-profile-avatar"
      onClick={onClick}
      className={`${className} bg-primary/20 flex items-center justify-center select-none`}
    >
      <span className="text-primary font-bold text-2xl sm:text-3xl leading-none">{initials}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser, logout, updateAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Gönderiler");
  const [avatarSrc, setAvatarSrc] = useState(currentUser?.avatar ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [userPosts] = useState<Post[]>([]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setAvatarSrc(result);
        updateAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabContent: Record<Tab, React.ReactNode> = {
    Gönderiler:
      userPosts.length === 0 ? (
        <EmptyTab text="Henüz gönderi yok. Ana sayfadan ilk gönderini paylaş!" />
      ) : (
        <div className="space-y-3">
          {userPosts.map((p) => (
            <div key={p.id}>{p.content}</div>
          ))}
        </div>
      ),
    "Yeniden Gönderiler": <EmptyTab text="Henüz yeniden gönderi yok." />,
    Yanıtlar: <EmptyTab text="Henüz yanıt yok." />,
    Medya: <EmptyTab text="Henüz medya paylaşımı yok." />,
    Beğeniler: <EmptyTab text="Henüz beğenilen gönderi yok." />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto w-full">
          <div className="h-36 sm:h-52 bg-gradient-to-br from-primary/30 via-primary/15 to-background relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>

          <div className="px-4 sm:px-6 relative">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
              <div className="relative group shrink-0">
                <AvatarDisplay
                  src={avatarSrc}
                  displayName={currentUser?.displayName ?? ""}
                  className="w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-background"
                />
                <button
                  data-testid="button-upload-avatar"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
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
              <h1
                className="text-lg sm:text-xl font-bold text-foreground leading-tight"
                data-testid="text-display-name"
              >
                {currentUser?.displayName}
              </h1>
              <p className="text-muted-foreground text-sm" data-testid="text-username">
                @{currentUser?.username}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-xs">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span data-testid="text-join-date">
                  {currentUser?.joinDate}&apos;dan beri Quantum&apos;da
                </span>
              </div>
              <div className="flex items-center gap-5 mt-3">
                <button
                  data-testid="stat-following"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                >
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    {currentUser?.following ?? 0}
                  </span>
                  <span className="text-muted-foreground text-xs">Takip Edilen</span>
                </button>
                <button
                  data-testid="stat-followers"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                >
                  <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    {currentUser?.followers ?? 0}
                  </span>
                  <span className="text-muted-foreground text-xs">Takipçi</span>
                </button>
              </div>
            </div>

            <div className="relative border-b border-border mb-5 -mx-4 sm:-mx-6 px-4 sm:px-6">
              <div className="flex overflow-x-auto scrollbar-hide gap-0 -mb-px">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    data-testid={`tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`relative shrink-0 px-3 py-3 text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                      activeTab === tab
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
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

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="pb-8"
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
