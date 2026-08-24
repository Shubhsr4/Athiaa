import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { requireAuth, corsHeaders } from '../_shared/auth-middleware.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Reference Implementation 1: Verify JWT via requireAuth middleware
    const { user } = await requireAuth(req);

    const body = await req.json().catch(() => ({}));
    const { amount, campaign_id, donor_name } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valid donation amount is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Donation order initiated successfully',
        userId: user.id,
        userEmail: user.email,
        amount: amount,
        campaign_id: campaign_id || null,
        orderId: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
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
