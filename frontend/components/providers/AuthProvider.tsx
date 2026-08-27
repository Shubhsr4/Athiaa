import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  roles: string[];
  isAdmin: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
  signUp: (email: string, password: string, metadata: { full_name: string; phone: string; [key: string]: any }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfileAndRoles = useCallback(async (userId: string) => {
    if (!supabase || !userId) return;
    try {
      // 1. Fetch Profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profErr) {
        console.warn('[Auth] Profile fetch note:', profErr.message);
      } else if (prof) {
        setProfile(prof as Profile);
      }

      // 2. Determine Roles with full resilience (RPC + Table check)
      const rolesAccumulator: Set<string> = new Set(['user', 'donor']);

      // 2a. Check direct has_role('admin') RPC (single source of truth in DB)
      try {
        const { data: isDbAdmin } = await supabase.rpc('has_role', {
          check_user_id: userId,
          check_role: 'admin'
        });
        if (isDbAdmin) {
          rolesAccumulator.add('admin');
        }
      } catch (rpcErr) {
        console.warn('[Auth] has_role RPC check fallback:', rpcErr);
      }

      // 2b. Query user_roles table rows directly
      try {
        const { data: userRoleRecords } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId);

        if (userRoleRecords && userRoleRecords.length > 0) {
          // Fetch roles lookup table to map role_ids if present
          const { data: lookupRoles } = await supabase.from('roles').select('id, name');
          const roleIdMap = new Map<number, string>();
          if (lookupRoles) {
            lookupRoles.forEach((r: any) => roleIdMap.set(r.id, String(r.name).toLowerCase()));
          }

          userRoleRecords.forEach((ur: any) => {
            // Direct role string
            if (ur.role) {
              rolesAccumulator.add(String(ur.role).toLowerCase());
            }
            // Role ID lookup
            if (ur.role_id && roleIdMap.has(ur.role_id)) {
              rolesAccumulator.add(roleIdMap.get(ur.role_id)!);
            }
          });
        }
      } catch (tableErr) {
        console.warn('[Auth] user_roles table query fallback:', tableErr);
      }

      const finalRolesList = Array.from(rolesAccumulator);
      console.log('[Auth] Roles verified for session:', finalRolesList);
      setRoles(finalRolesList);
    } catch (err) {
      console.warn('[Auth] Error in fetchProfileAndRoles:', err);
      setRoles(['user', 'donor']);
    }
  }, [supabase]);

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

    // 1. Get initial Auth Session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }: any) => {
      if (!mounted) return;
      if (error) {
        console.warn('Initial session check note:', error.message);
      }
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        fetchProfileAndRoles(initialSession.user.id).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRoles([]);
        setIsLoading(false);
      }
    }).catch((e: any) => {
      console.warn('Session retrieval exception:', e);
      if (mounted) setIsLoading(false);
    });

    // 2. Subscribe to Supabase Auth State Changes (Login, Signout, Token Refresh, Password Recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: any) => {
      if (!mounted) return;

      if (currentSession?.user) {
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
  }, [fetchProfileAndRoles, supabase]);

  // Sign Up with Email + Password & metadata (full_name, phone)
  const signUp = async (email: string, password: string, metadata: { full_name: string; phone: string; [key: string]: any }) => {
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

  // Sign In with Email + Password only
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
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?mode=reset` : undefined
    });
  };

  // Update Password (when authenticated or in recovery session)
  const updatePassword = async (newPassword: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase client error' } };
    return await supabase.auth.updateUser({
      password: newPassword
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
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      setIsLoading(false);
    }
  };

  const hasRole = (roleName: string) => {
    const target = roleName.toLowerCase();
    return roles.includes(target);
  };

  const isAdmin = hasRole('admin') || hasRole('super_admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        roles,
        isAdmin,
        isLoading,
        hasRole,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
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
