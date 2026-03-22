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
  const initialized = useRef(false);

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

    const init = async () => {
      try {
        // Try getUser() first — hits server directly, no lock needed
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
          await checkAdmin(currentUser.id);
        }
      } catch {
        // Silent fail — user just not logged in
      } finally {
        if (isMounted) setLoading(false);
        initialized.current = true;
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        // Only react to explicit sign in/out events after init
        if (event === "SIGNED_IN" && newSession) {
          setSession(newSession);
          setUser(newSession.user);
          setLoading(true);
          await checkAdmin(newSession.user.id);
          if (isMounted) setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && newSession) {
          setSession(newSession);
          setUser(newSession.user);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setIsAdmin(false);
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const refreshAdmin = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) await checkAdmin(currentUser.id);
    } catch {
      setIsAdmin(false);
    }
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