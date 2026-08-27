import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ycwldacrvzkooxijtrfi.supabase.co';
  const key = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b1Y9f2qug49nWHmuMQBIcQ_FRZg7jvV';
  
  if (!url || !key || url.includes('your-project') || key.includes('your-anon-key')) {
    return null;
  }

  try {
    supabaseClient = createSupabaseClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'athiaa_supabase_auth_token',
      },
    });
    return supabaseClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}


