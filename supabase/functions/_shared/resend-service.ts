// supabase/functions/_shared/resend-service.ts

export interface SendReceiptEmailParams {
  toEmail: string;
  donorName: string;
  amount: number;
  receiptNumber: string;
  pdfBytes: Uint8Array;
}

// Convert Uint8Array to Base64 in Deno environment
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function sendReceiptEmailWithAttachment(params: SendReceiptEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('[Resend] RESEND_API_KEY is not configured in Edge Function secrets. Skipping email transmission.');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const ngoLegalName = Deno.env.get('NGO_LEGAL_NAME') || 'Athiaa Animal Welfare Foundation';
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Athiaa Donations <onboarding@resend.dev>';
  const cleanReceiptFilename = `Athia_80G_Receipt_${params.receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  const base64Pdf = uint8ArrayToBase64(params.pdfBytes);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FDFBF7; margin: 0; padding: 20px; color: #1C1C2E; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #FFEBE0; overflow: hidden; }
    .header { background: #1C1C2E; padding: 28px; text-align: center; }
    .header h1 { color: #F4C430; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { color: #FFFFFF; opacity: 0.85; margin: 6px 0 0 0; font-size: 13px; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 700; color: #1C1C2E; margin-bottom: 12px; }
    .card { background: #FFF8F5; border: 1px solid #FFD9C7; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .card-row:last-child { margin-bottom: 0; }
    .card-label { color: #73738C; font-weight: 600; }
    .card-value { color: #1C1C2E; font-weight: 700; }
    .amount-highlight { color: #E8572A; font-size: 18px; font-weight: 800; }
    .tax-badge { display: inline-block; background: #E6F7F0; color: #0F9D58; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 8px; }
    .footer { background: #F8F9FA; padding: 20px 28px; font-size: 11px; color: #8C8C9E; border-top: 1px solid #ECECF0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${ngoLegalName.toUpperCase()}</h1>
      <p>Official 80G Tax Exemption Donation Receipt</p>
    </div>
    <div class="content">
      <p class="greeting">Dear ${params.donorName || 'Compassionate Supporter'},</p>
      <p>Thank you with all our hearts for your generous contribution to <strong>${ngoLegalName}</strong>. Your kindness directly fuels emergency stray medical treatment, trauma ambulance dispatch, and peaceful sanctuary care.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Receipt Number:</span>
          <span class="card-value">${params.receiptNumber}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Contribution Amount:</span>
          <span class="card-value amount-highlight">₹ ${Number(params.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="card-row">
          <span class="card-label">80G Status:</span>
          <span class="tax-badge">Eligible for 50% Tax Exemption (Sec 80G)</span>
        </div>
      </div>

      <p>Attached to this email is your <strong>official, computer-generated 80G Tax Exemption Receipt (PDF)</strong> for your financial records and annual Income Tax Return (ITR) filing.</p>
      <p>You can also download your past receipts anytime directly from your <a href="https://athiaango.org/dashboard" style="color: #E8572A; font-weight: bold;">Athiaa Donor Dashboard</a>.</p>
      
      <p style="margin-top: 28px;">With deep gratitude,<br><strong>The Care & Veterinary Team</strong><br>${ngoLegalName}</p>
    </div>
    <div class="footer">
      <p>This is a computer-generated tax certificate. Inquiries: <a href="mailto:contact@athiaango.org" style="color: #73738C;">contact@athiaango.org</a></p>
      <p>${ngoLegalName} • Section 8 Registered Nonprofit</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const payload = {
      from: fromEmail,
      to: [params.toEmail],
      subject: `Official 80G Tax Exemption Receipt — ${params.receiptNumber}`,
      html: htmlContent,
      attachments: [
        {
          filename: cleanReceiptFilename,
          content: base64Pdf,
        }
      ]
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Resend Error]', data);
      return { success: false, error: data?.message || 'Failed to send email via Resend' };
    }

    console.log(`[Resend Success] Email delivered to ${params.toEmail} for receipt ${params.receiptNumber}. Resend ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err.message || 'Resend network error' };
  }
}
