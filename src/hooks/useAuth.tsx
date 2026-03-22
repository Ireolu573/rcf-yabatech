import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastCheckedUserId = useRef<string | null>(null);

  const checkAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      const result = !!data && !error;
      setIsAdmin(result);
      return result;
    } catch {
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const resolveAuth = async (currentSession: Session | null) => {
      const userId = currentSession?.user?.id ?? null;
      if (userId && userId === lastCheckedUserId.current) {
        if (isMounted) setLoading(false);
        return;
      }
      lastCheckedUserId.current = userId;
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        try { await checkAdmin(currentSession.user.id); }
        catch { if (isMounted) setIsAdmin(false); }
      } else {
        if (isMounted) setIsAdmin(false);
      }
      if (isMounted) setLoading(false);
    };

    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const fallbackSession = currentUser
          ? ({ user: currentUser, access_token: "", refresh_token: "" } as unknown as Session)
          : null;
        await resolveAuth(fallbackSession);
      } catch {
        if (isMounted) { setSession(null); setUser(null); setIsAdmin(false); setLoading(false); }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        if (!newSession) {
          lastCheckedUserId.current = null;
          setSession(null); setUser(null); setIsAdmin(false); setLoading(false);
          return;
        }
        setLoading(true);
        await resolveAuth(newSession);
      }
    );

    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    lastCheckedUserId.current = null;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    lastCheckedUserId.current = null;
    setIsAdmin(false); setUser(null); setSession(null);
    await supabase.auth.signOut();
  };

  const refreshAdmin = async () => {
    try {
      lastCheckedUserId.current = null;
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) await checkAdmin(currentUser.id);
    } catch { setIsAdmin(false); }
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signIn, signOut, refreshAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};