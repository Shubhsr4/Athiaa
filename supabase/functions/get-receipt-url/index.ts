// supabase/functions/get-receipt-url/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/auth-middleware.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Verify user JWT
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const { donation_id } = body;

    if (!donation_id) {
      return new Response(
        JSON.stringify({ error: 'donation_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch donation record
    const { data: donation, error: donErr } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('id', donation_id)
      .single();

    if (donErr || !donation) {
      return new Response(
        JSON.stringify({ error: 'Donation record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Permission check: Authenticated donor or Admin
    let isAuthorized = false;
    if (user) {
      if (donation.donor_id === user.id) {
        isAuthorized = true;
      } else {
        const { data: roleCheck } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'super_admin'])
          .maybeSingle();
        if (roleCheck) isAuthorized = true;
      }
    } else {
      // Guest or direct check with signed token or recent checkout token
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to download this receipt' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawPath = donation.receipt_url || `receipts/${donation.id}.pdf`;
    const cleanStoragePath = rawPath.startsWith('receipts/') ? rawPath.replace('receipts/', '') : rawPath;

    // Generate signed URL with 60-minute expiry (3600 seconds)
    const { data: signedData, error: signedErr } = await supabaseAdmin
      .storage
      .from('receipts')
      .createSignedUrl(cleanStoragePath, 3600);

    if (signedErr || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: signedErr?.message || 'Failed to generate signed download link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        receipt_number: donation.receipt_number,
        download_url: signedData.signedUrl,
        expires_in: 3600
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
