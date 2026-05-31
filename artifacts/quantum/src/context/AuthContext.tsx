import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: Profile | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setCurrentUser(data);
    } catch {
      // profil alınamazsa sessizce devam et
    }
  };

  const refreshProfile = async () => {
    if (session?.user.id) await fetchProfile(session.user.id);
  };

  useEffect(() => {
    // Güvenlik: en fazla 8 saniye bekle, sonra loading'i kapat
    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        if (s?.user.id) {
          return fetchProfile(s.user.id);
        }
      })
      .catch(() => {
        // Supabase erişilemez — giriş yapılmamış gibi davran
      })
      .finally(() => {
        clearTimeout(safetyTimer);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user.id) {
        await fetchProfile(s.user.id);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!session?.user.id) return;
    const { data } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", session.user.id)
      .select()
      .single();
    if (data) setCurrentUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!session && !!currentUser,
        currentUser,
        session,
        loading,
        logout,
        updateAvatar,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
