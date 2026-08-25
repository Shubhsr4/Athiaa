import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { requireAuth, requireRole, corsHeaders } from '../_shared/auth-middleware.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Reference Implementation 2: Require verified JWT + 'admin' role check
    const { user } = await requireAuth(req);
    await requireRole(user, 'admin');

    const body = await req.json().catch(() => ({}));
    const { action, animal_id, name, status } = body;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Admin action '${action || 'manage'}' executed successfully`,
        adminUserId: user.id,
        record: { id: animal_id || `animal-${Date.now()}`, name, status }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
