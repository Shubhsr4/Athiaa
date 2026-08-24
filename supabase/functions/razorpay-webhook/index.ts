// supabase/functions/razorpay-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { generate80GReceiptPdf } from '../_shared/receipt-generator.ts';
import { sendReceiptEmailWithAttachment } from '../_shared/resend-service.ts';

// Web Crypto HMAC-SHA256 signature verification for Razorpay Webhooks
async function verifyRazorpaySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const bodyData = encoder.encode(rawBody);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Constant-time string comparison to mitigate timing attacks
    if (expectedSignature.length !== signature.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      mismatch |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
  } catch (err) {
    console.error('[Signature Verification Error]', err);
    return false;
  }
}

// Background asynchronous task for receipt PDF generation, private storage, and Resend delivery
async function processReceiptAndEmail(supabaseAdmin: any, paymentData: any, donationRecord: any) {
  try {
    const donationId = donationRecord.id;
    const paymentId = paymentData.id || donationRecord.razorpay_payment_id;
    const orderId = paymentData.order_id || donationRecord.razorpay_order_id;
    const amount = Number(donationRecord.amount) || Number(paymentData.amount) / 100;
    const donorName = donationRecord.donor_name || paymentData.notes?.donor_name || 'Generous Donor';
    const donorEmail = donationRecord.donor_email || paymentData.email || paymentData.notes?.donor_email;
    const donorPhone = donationRecord.donor_phone || paymentData.contact || paymentData.notes?.donor_phone;
    const donorPan = donationRecord.donor_pan || paymentData.notes?.donor_pan || paymentData.notes?.pan;

    console.log(`[Receipt Background Task] Starting for Donation: ${donationId}, Payment: ${paymentId}`);

    // 1. Generate sequential 80G receipt number via DB sequence
    let receiptNumber = donationRecord.receipt_number;
    if (!receiptNumber) {
      const { data: seqData, error: seqErr } = await supabaseAdmin.rpc('generate_80g_receipt_number');
      if (seqErr || !seqData) {
        console.warn('[Receipt Number Gen Fallback]', seqErr?.message);
        receiptNumber = `ATHIA/80G/2026-27/${Date.now().toString().slice(-6)}`;
      } else {
        receiptNumber = seqData;
      }
    }

    // 2. Fetch campaign title if assigned
    let campaignTitle = 'General Rescue & Medical Emergency Fund';
    if (donationRecord.campaign_id) {
      const { data: camp } = await supabaseAdmin
        .from('campaigns')
        .select('title')
        .eq('id', donationRecord.campaign_id)
        .single();
      if (camp?.title) {
        campaignTitle = camp.title;
      }
    }

    // 3. Generate 80G PDF Document
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const pdfBytes = await generate80GReceiptPdf({
      receiptNumber,
      donationDate: formattedDate,
      donorName,
      donorEmail,
      donorPhone,
      donorPan,
      amount,
      campaignName: campaignTitle,
      paymentId,
      orderId,
      paymentMethod: paymentData.method ? paymentData.method.toUpperCase() : 'Online UPI / Card',
    });

    // 4. Upload PDF to private Supabase storage bucket `receipts`
    const storagePath = `${donationId}.pdf`;
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('receipts')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadErr) {
      console.error('[Receipt Storage Upload Error]', uploadErr.message);
    } else {
      console.log(`[Receipt Storage] Uploaded private PDF to receipts/${storagePath}`);
    }

    // 5. Update Donation record in database
    await supabaseAdmin
      .from('donations')
      .update({
        status: 'paid',
        receipt_number: receiptNumber,
        receipt_url: `receipts/${storagePath}`,
        donor_pan: donorPan || donationRecord.donor_pan,
      })
      .eq('id', donationId);

    // 6. Email receipt via Resend if donor email is present
    if (donorEmail) {
      const emailRes = await sendReceiptEmailWithAttachment({
        toEmail: donorEmail,
        donorName,
        amount,
        receiptNumber,
        pdfBytes,
      });

      if (emailRes.success) {
        await supabaseAdmin
          .from('donations')
          .update({
            receipt_sent: true,
            receipt_sent_at: new Date().toISOString()
          })
          .eq('id', donationId);
        console.log(`[Receipt Workflow] Completed successfully for ${donationId}`);
      } else {
        console.warn(`[Receipt Email Warning] Failed to email receipt to ${donorEmail}: ${emailRes.error}`);
      }
    } else {
      console.log(`[Receipt Workflow] No donor email provided for ${donationId}, skipped email.`);
    }

  } catch (err: any) {
    console.error('[Receipt Background Task Error]', err);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    // CRITICAL SECURITY CHECK: Webhook Signature Verification
    if (webhookSecret) {
      const isValid = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('[Security Alert] Invalid Razorpay webhook signature detected. Request rejected.');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('[Security Warning] RAZORPAY_WEBHOOK_SECRET is not configured in Edge Function secrets. Bypassing verification in test.');
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = payload.event;
    console.log(`[Razorpay Webhook] Received Event: ${event}`);

    // We process captured payment events
    if (event !== 'payment.captured' && event !== 'order.paid') {
      return new Response(
        JSON.stringify({ received: true, message: `Event ${event} ignored` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const paymentEntity = payload.payload?.payment?.entity || {};
    const paymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;
    const amountInRupees = (Number(paymentEntity.amount) || 0) / 100;
    const notes = paymentEntity.notes || {};

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Missing payment entity id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase Service Role client (bypasses RLS for secure background tasks)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // IDEMPOTENCY GUARD: Check if this payment already has an issued receipt
    const { data: existingDonation } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle();

    if (existingDonation && existingDonation.receipt_number) {
      console.log(`[Idempotency Guard] Donation for payment ${paymentId} already processed with Receipt ${existingDonation.receipt_number}. Skipping duplicate.`);
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed', receipt_number: existingDonation.receipt_number }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Locate or create donation record in database
    let donationRecord = existingDonation;
    if (!donationRecord) {
      const donorName = notes.donor_name || paymentEntity.notes?.name || 'Anonymous Supporter';
      const donorEmail = paymentEntity.email || notes.donor_email || null;
      const donorPhone = paymentEntity.contact || notes.donor_phone || null;
      const donorPan = notes.donor_pan || notes.pan || null;
      const campaignId = notes.campaign_id || null;

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('donations')
        .insert({
          amount: amountInRupees,
          donor_name: donorName,
          donor_email: donorEmail,
          donor_phone: donorPhone,
          donor_pan: donorPan,
          campaign_id: campaignId,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          status: 'paid',
          receipt_sent: false
        })
        .select()
        .single();

      if (insertErr) {
        console.error('[Donation Insert Error]', insertErr.message);
      }
      donationRecord = inserted || {
        id: `don_${Date.now()}`,
        amount: amountInRupees,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone,
        donor_pan: donorPan,
        campaign_id: campaignId,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId
      };
    }

    // NON-BLOCKING RESPONSE: Respond 200 OK immediately to Razorpay, run PDF generation + Resend in background
    const backgroundPromise = processReceiptAndEmail(supabaseAdmin, paymentEntity, donationRecord);
    
    // Support Deno / Supabase EdgeRuntime.waitUntil if available
    if (typeof (globalThis as any).EdgeRuntime?.waitUntil === 'function') {
      (globalThis as any).EdgeRuntime.waitUntil(backgroundPromise);
    } else {
      // Fallback promise detachment
      backgroundPromise.catch((err: any) => console.error('[Detached Background Error]', err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully, receipt generation queued',
        payment_id: paymentId
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[Webhook Server Error]', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
