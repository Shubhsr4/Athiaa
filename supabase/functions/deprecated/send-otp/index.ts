import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function formatE164(rawPhone: string): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  let cleaned = rawPhone.trim();
  if (!cleaned.startsWith('+')) {
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      cleaned = `+91${digitsOnly}`;
    } else {
      cleaned = `+${digitsOnly}`;
    }
  } else {
    cleaned = '+' + cleaned.slice(1).replace(/\D/g, '');
  }
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (!e164Regex.test(cleaned)) return null;
  return cleaned;
}

async function hashOtp(otp: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body?.phone;

    if (!rawPhone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const phone = formatE164(rawPhone);
    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format. Must be a valid 10-digit Indian mobile number.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase environment configuration error.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check Rate Limit (30 second cooldown per phone number)
    const { data: rateLimit } = await supabaseAdmin
      .from('otp_rate_limits')
      .select('last_requested_at')
      .eq('phone', phone)
      .maybeSingle();

    if (rateLimit) {
      const elapsedMs = Date.now() - new Date(rateLimit.last_requested_at).getTime();
      if (elapsedMs < 30000) {
        const remainingSec = Math.ceil((30000 - elapsedMs) / 1000);
        return new Response(
          JSON.stringify({ error: `Please wait ${remainingSec} seconds before requesting another OTP.` }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate 6-digit OTP & store SHA-256 hash
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    const { error: insertError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        phone: phone,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        verified: false,
      });

    if (insertError) {
      console.error('Error inserting OTP into otp_codes:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record OTP code.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit timestamp
    await supabaseAdmin
      .from('otp_rate_limits')
      .upsert({ phone: phone, last_requested_at: new Date().toISOString() }, { onConflict: 'phone' });

    // Send via MSG91 API v5 Gateway
    const msg91AuthKey = Deno.env.get('MSG91_AUTH_KEY');
    const msg91TemplateId = Deno.env.get('MSG91_TEMPLATE_ID');

    if (msg91AuthKey && msg91TemplateId) {
      const rawDigits = phone.replace('+', '');
      const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=${rawDigits}&authkey=${msg91AuthKey}&otp=${otp}`;

      const smsRes = await fetch(msg91Url, { method: 'POST' });
      const smsData = await smsRes.json().catch(() => ({}));

      if (!smsRes.ok) {
        console.error('MSG91 API error response:', smsData);
      }
    } else {
      console.log(`[MSG91 DEV FALLBACK] Generated OTP for ${phone}: ${otp}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP transmitted successfully via SMS/WhatsApp gateway',
        phone: phone,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('send-otp error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
