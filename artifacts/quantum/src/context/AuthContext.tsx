import React, { createContext, useContext, useState, useEffect } from "react";

export type User = {
  id: number;
  displayName: string;
  username: string;
  email: string;
  avatar: string;
  joinDate: string;
  following: number;
  followers: number;
};

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (user: Partial<User>) => void;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
}

const STORAGE_KEY = "quantum_user";

function loadFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveToStorage(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const JOIN_DATE = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date());

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(currentUser);
  }, [currentUser]);

  const login = (userData: Partial<User>) => {
    const user: User = {
      id: Date.now(),
      displayName: userData.displayName ?? "Kullanıcı",
      username: userData.username ?? "kullanici",
      email: userData.email ?? "",
      avatar: userData.avatar ?? "",
      joinDate: JOIN_DATE,
      following: 0,
      followers: 0,
    };
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateAvatar = (avatar: string) => {
    setCurrentUser((prev) => (prev ? { ...prev, avatar } : prev));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!currentUser, currentUser, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
