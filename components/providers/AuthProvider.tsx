
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import { apiFetch } from '@/lib/api/clientApi';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginUser: (p: any) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customUser, setCustomUser] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('athiaa_user') || localStorage.getItem('athia_user');
      if (stored) {
        try {
          setCustomUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const loginUser = (userProfile: any) => {
    setCustomUser(userProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('athiaa_user', JSON.stringify(userProfile));
    }
  };

  const logoutUser = () => {
    setCustomUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('athiaa_user');
      localStorage.removeItem('athia_user');
    }
    signOut();
  };

  let supabase: any;
  let hasError = false;
  try {
    supabase = createClient();
  } catch {
    hasError = true;
  }

  const [dbIsAdmin, setDbIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const [{ data: prof }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId)
      ]);

      if (prof) setProfile(prof as Profile);

      if (roles && roles.length > 0) {
        const hasAdmin = roles.some((r: any) => ['admin', 'super_admin', 'ngo_staff'].includes(r.role));
        setDbIsAdmin(hasAdmin);
      } else {
        const { data: isAdm } = await supabase.rpc('is_admin', { _user_id: userId });
        setDbIsAdmin(!!isAdm);
      }
    } catch {
      setProfile(null);
      setDbIsAdmin(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        fetchProfile(initialSession.user.id).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await fetchProfile(currentSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setDbIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      logoutUser();
      setUser(null);
      setSession(null);
      setProfile(null);
      setDbIsAdmin(false);
    } catch (e) {
      console.error("Logout failed:", e);
      logoutUser();
    } finally {
      setIsLoading(false);
    }
  };

  const userToReturn = user || customUser;
  const isAdmin = dbIsAdmin || (userToReturn?.role?.toLowerCase() === 'admin');

  if (hasError || !supabase) {
    return (
      <AuthContext.Provider
        value={{
          user: customUser,
          profile: null,
          session: null,
          isAdmin: customUser?.role?.toLowerCase() === 'admin',
          isLoading: false,
          signOut: async () => {},
          refreshProfile: async () => {},
          loginUser,
          logoutUser,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: userToReturn,
        profile,
        session,
        isAdmin,
        isLoading,
        signOut,
        refreshProfile,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
