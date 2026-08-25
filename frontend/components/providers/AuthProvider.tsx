import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: any;
  profile: Profile | null;
  session: Session | null;
  roles: string[];
  isAdmin: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  refreshProfile: () => Promise<void>;
  loginUser: (p: any) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customUser, setCustomUser] = useState<any | null>(null);

  let supabase: any;
  let hasError = false;
  try {
    supabase = createClient();
  } catch {
    hasError = true;
  }

  // Load custom demo user if stored in local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('athiaa_user') || localStorage.getItem('athia_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCustomUser(parsed);
          if (parsed?.role?.toLowerCase() === 'admin') {
            setRoles(['admin', 'donor']);
          } else {
            setRoles(['donor']);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const fetchProfileAndRoles = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      // Parallel fetch profile and roles
      const [{ data: prof }, { data: userRoleRecords }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId)
      ]);

      if (prof) setProfile(prof as Profile);

      if (userRoleRecords && userRoleRecords.length > 0) {
        const fetchedRoleNames = userRoleRecords
          .map((ur: any) => ur.role?.toLowerCase())
          .filter(Boolean);
        setRoles(fetchedRoleNames.length > 0 ? fetchedRoleNames : ['donor']);
      } else {
        setRoles(['donor']);
      }
    } catch (err) {
      console.error('Error loading user profile & roles:', err);
    }
  }, []);

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfileAndRoles(user.id);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    let mounted = true;

    // Get initial Auth Session
    supabase.auth.getSession().then(({ data: { session: initialSession } }: any) => {
      if (!mounted) return;
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        fetchProfileAndRoles(initialSession.user.id).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen to Supabase Auth State Changes (Login, Signout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: any) => {
      if (!mounted) return;

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await fetchProfileAndRoles(currentSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndRoles]);

  // Sign Up with Email + Password
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    if (!supabase) return { data: null, error: { message: 'Supabase client error' } };
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
      }
    });
  };

  // Sign In with Email + Password
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase client error' } };
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  // Reset Password Email Trigger
  const resetPassword = async (email: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase client error' } };
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
    });
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      logoutUser();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      setIsLoading(false);
    }
  };

  const loginUser = (userProfile: any) => {
    setCustomUser(userProfile);
    if (userProfile?.role?.toLowerCase() === 'admin') {
      setRoles(['admin', 'donor']);
    } else {
      setRoles(['donor']);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('athiaa_user', JSON.stringify(userProfile));
    }
  };

  const logoutUser = () => {
    setCustomUser(null);
    setRoles([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('athiaa_user');
      localStorage.removeItem('athia_user');
    }
  };

  const userToReturn = user || customUser;
  const activeRoles = roles.length > 0 ? roles : (customUser?.role?.toLowerCase() === 'admin' ? ['admin', 'donor'] : ['donor']);

  const hasRole = (roleName: string) => {
    const target = roleName.toLowerCase();
    return activeRoles.includes(target);
  };

  const isAdmin = hasRole('admin') || hasRole('super_admin');

  if (hasError || !supabase) {
    return (
      <AuthContext.Provider
        value={{
          user: customUser,
          profile: null,
          session: null,
          roles: activeRoles,
          isAdmin,
          isLoading: false,
          hasRole,
          signUp: async () => ({ data: null, error: null }),
          signIn: async () => ({ data: null, error: null }),
          signOut: async () => {},
          resetPassword: async () => ({ data: null, error: null }),
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
        roles: activeRoles,
        isAdmin,
        isLoading,
        hasRole,
        signUp,
        signIn,
        signOut,
        resetPassword,
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
