"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: { user: User; token: string }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.role) {
            setUser(parsedUser);
            console.log("✅ Auth initialized with user:", parsedUser);
          } else {
            console.warn("⚠️ Invalid user data in localStorage:", parsedUser);
          }
        } else {
          console.log("🔒 No auth data in localStorage.");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        toast.error("Session initialization failed");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: { user: User; token: string }) => {
    try {
      console.log("🔐 Login with:", userData);
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData.user));
      setUser(userData.user);
      toast.success(`Welcome back, ${userData.user.username}!`);
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Failed to save auth data");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
