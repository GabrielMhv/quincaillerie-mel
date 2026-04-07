"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as User;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        const session = data?.session;
        if (session) {
          fetchProfile(session.user.id).then((profile) => {
            setUser(profile);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      // Faster: do both concurrently (or at least start signOut and redirect)
      supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  const value = {
    user,
    loading,
    signOut,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isEmployee: user?.role === "employee",
    isClient: user?.role === "client",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
