import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { requireAuth, requireRole, corsHeaders } from '../_shared/auth-middleware.ts';
import { sendReceiptEmailWithAttachment } from '../_shared/resend-service.ts';
import { generate80GReceiptPdf } from '../_shared/receipt-generator.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify JWT & Enforce Admin Role
    const { user } = await requireAuth(req);
    await requireRole(user, 'admin');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { donation_id, override_email } = body;

    if (!donation_id) {
      return new Response(
        JSON.stringify({ error: 'donation_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: donation, error: donErr } = await supabaseAdmin
      .from('donations')
      .select('*, campaigns(title)')
      .eq('id', donation_id)
      .single();

    if (donErr || !donation) {
      return new Response(
        JSON.stringify({ error: 'Donation record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetEmail = override_email || donation.donor_email;
    if (!targetEmail) {
      return new Response(
        JSON.stringify({ error: 'No donor email on file. Please specify override_email.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to read existing PDF from storage
    const rawPath = donation.receipt_url || `${donation.id}.pdf`;
    const cleanStoragePath = rawPath.startsWith('receipts/') ? rawPath.replace('receipts/', '') : rawPath;
    
    let pdfBytes: Uint8Array | null = null;
    const { data: fileData } = await supabaseAdmin.storage.from('receipts').download(cleanStoragePath);
    if (fileData) {
      pdfBytes = new Uint8Array(await fileData.arrayBuffer());
    } else {
      // Regenerate if not in storage
      const receiptNumber = donation.receipt_number || `ATHIA/80G/2026-27/${Date.now().toString().slice(-6)}`;
      pdfBytes = await generate80GReceiptPdf({
        receiptNumber,
        donationDate: new Date(donation.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        donorName: donation.donor_name || 'Donor',
        donorEmail: targetEmail,
        donorPhone: donation.donor_phone,
        donorPan: donation.donor_pan,
        amount: Number(donation.amount),
        campaignName: (donation as any).campaigns?.title || 'General Rescue Fund',
        paymentId: donation.razorpay_payment_id || 'OFFLINE_TX',
        orderId: donation.razorpay_order_id,
        paymentMethod: 'Online Payment (Razorpay)',
      });

      await supabaseAdmin.storage.from('receipts').upload(cleanStoragePath, pdfBytes, { upsert: true });
    }

    const emailRes = await sendReceiptEmailWithAttachment({
      toEmail: targetEmail,
      donorName: donation.donor_name || 'Donor',
      amount: Number(donation.amount),
      receiptNumber: donation.receipt_number || `ATHIA/80G/${donation.id.slice(0, 8)}`,
      pdfBytes: pdfBytes!,
    });

    if (!emailRes.success) {
      return new Response(
        JSON.stringify({ error: emailRes.error || 'Failed to dispatch email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabaseAdmin
      .from('donations')
      .update({
        receipt_sent: true,
        receipt_sent_at: new Date().toISOString(),
        donor_email: targetEmail
      })
      .eq('id', donation_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `80G receipt successfully resent to ${targetEmail}`,
        resend_id: emailRes.id
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
