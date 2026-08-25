import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthError {
  status: number;
  message: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Extracts and verifies the JWT token from the Authorization header using Supabase Auth.
 * Returns the authenticated User object or throws a 401 response error.
 */
export async function requireAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { status: 401, message: 'Missing or malformed Authorization header. Bearer token required.' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw { status: 500, message: 'Supabase server environment configuration error.' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw { status: 401, message: `Invalid or expired authentication token: ${error?.message || 'Unauthorized'}` };
  }

  return { user, supabase };
}

/**
 * Given a verified User, performs an RPC check against has_role(user.id, role).
 * Throws a 403 response error if the user lacks the required role.
 */
export async function requireRole(user: any, requiredRole: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw { status: 500, message: 'Supabase service configuration error.' };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: hasPermission, error } = await supabaseAdmin.rpc('has_role', {
    check_user_id: user.id,
    check_role: requiredRole
  });

  if (error) {
    console.error('Error executing has_role RPC:', error);
    throw { status: 500, message: 'Failed to verify user authorization role.' };
  }

  if (!hasPermission) {
    throw { status: 403, message: `Forbidden. Action requires '${requiredRole}' role.` };
  }

  return true;
}
