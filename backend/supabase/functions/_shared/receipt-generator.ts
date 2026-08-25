// supabase/functions/_shared/receipt-generator.ts
import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.9';

export interface DonationReceiptData {
  receiptNumber: string;
  donationDate: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorPan?: string;
  amount: number;
  campaignName?: string;
  paymentId: string;
  orderId?: string;
  paymentMethod?: string;
}

// Convert amount number to Indian currency words
export function numberToIndianWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  };

  const integerPart = Math.floor(num);
  const words = inWords(integerPart).trim();
  return words ? `Rupees ${words} Only` : 'Rupees Zero Only';
}

export async function generate80GReceiptPdf(data: DonationReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (points)
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Environment variables for NGO details with fallback defaults
  const ngoLegalName = Deno.env.get('NGO_LEGAL_NAME') || 'ATHIAA ANIMAL WELFARE FOUNDATION';
  const ngoAddress = Deno.env.get('NGO_ADDRESS') || '123 Rescue Way, South Extension, New Delhi - 110001, India';
  const ngoPan = Deno.env.get('NGO_PAN') || 'AABTA1234F';
  const ngo80G = Deno.env.get('NGO_80G_REG_NUMBER') || 'CIT-EXPT/80G/ATH-ND2025';
  const ngo12A = Deno.env.get('NGO_12A_REG_NUMBER') || '12A/TRUST-REG/25B084';

  // Palette Colors
  const primaryOrange = rgb(0.91, 0.34, 0.16); // #E8572A
  const darkNavy = rgb(0.11, 0.11, 0.18);      // #1C1C2E
  const textGray = rgb(0.35, 0.35, 0.40);
  const lightBg = rgb(0.98, 0.96, 0.94);
  const borderGray = rgb(0.85, 0.85, 0.88);
  const emeraldGreen = rgb(0.06, 0.60, 0.40);

  // Top Accent Banner
  page.drawRectangle({
    x: 0,
    y: height - 12,
    width: width,
    height: 12,
    color: primaryOrange,
  });

  // Header Box
  page.drawRectangle({
    x: 36,
    y: height - 130,
    width: width - 72,
    height: 110,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // NGO Title
  page.drawText(ngoLegalName, {
    x: 52,
    y: height - 55,
    size: 16,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText('(Registered Non-Profit Animal Welfare Organization under Section 8, Companies Act 2013)', {
    x: 52,
    y: height - 70,
    size: 8.5,
    font: fontRegular,
    color: textGray,
  });

  page.drawText(`Registered Address: ${ngoAddress}`, {
    x: 52,
    y: height - 85,
    size: 8.5,
    font: fontRegular,
    color: textGray,
  });

  page.drawText(`NGO PAN: ${ngoPan}  |  12A Reg. No: ${ngo12A}  |  80G Approval URN: ${ngo80G}`, {
    x: 52,
    y: height - 100,
    size: 8.5,
    font: fontBold,
    color: primaryOrange,
  });

  // Receipt Title Badge
  page.drawRectangle({
    x: width - 230,
    y: height - 62,
    width: 178,
    height: 26,
    color: darkNavy,
  });

  page.drawText('80G DONATION RECEIPT', {
    x: width - 218,
    y: height - 53,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Meta Info Grid (Receipt No & Date)
  const metaY = height - 170;
  page.drawRectangle({
    x: 36,
    y: metaY - 30,
    width: width - 72,
    height: 38,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('RECEIPT NUMBER:', { x: 50, y: metaY - 12, size: 8, font: fontBold, color: textGray });
  page.drawText(data.receiptNumber, { x: 50, y: metaY - 24, size: 10, font: fontBold, color: darkNavy });

  page.drawText('DONATION DATE:', { x: 260, y: metaY - 12, size: 8, font: fontBold, color: textGray });
  page.drawText(data.donationDate, { x: 260, y: metaY - 24, size: 10, font: fontBold, color: darkNavy });

  page.drawText('80G TAX EXEMPTION:', { x: 420, y: metaY - 12, size: 8, font: fontBold, color: textGray });
  page.drawText('50% Tax Relief (Sec 80G)', { x: 420, y: metaY - 24, size: 9.5, font: fontBold, color: emeraldGreen });

  // Donor Details Section
  let curY = metaY - 60;
  page.drawText('DONOR INFORMATION', { x: 36, y: curY, size: 11, font: fontBold, color: darkNavy });
  curY -= 10;

  page.drawRectangle({
    x: 36,
    y: curY - 70,
    width: width - 72,
    height: 70,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Donor fields
  page.drawText('Donor Full Name:', { x: 50, y: curY - 20, size: 9, font: fontBold, color: textGray });
  page.drawText(data.donorName || 'Anonymous Well-Wisher', { x: 160, y: curY - 20, size: 9.5, font: fontBold, color: darkNavy });

  page.drawText('Donor PAN Card:', { x: 50, y: curY - 38, size: 9, font: fontBold, color: textGray });
  if (data.donorPan) {
    page.drawText(data.donorPan.toUpperCase(), { x: 160, y: curY - 38, size: 9.5, font: fontBold, color: primaryOrange });
  } else {
    page.drawText('Not Provided (Mandatory for ITR 80G claim)', { x: 160, y: curY - 38, size: 8.5, font: fontOblique, color: rgb(0.7, 0.3, 0.3) });
  }

  page.drawText('Contact / Email:', { x: 50, y: curY - 56, size: 9, font: fontBold, color: textGray });
  page.drawText(`${data.donorEmail || 'N/A'} ${data.donorPhone ? ' | ' + data.donorPhone : ''}`, { x: 160, y: curY - 56, size: 9, font: fontRegular, color: textGray });

  // Payment Details Section
  curY -= 95;
  page.drawText('DONATION CONTRIBUTION DETAILS', { x: 36, y: curY, size: 11, font: fontBold, color: darkNavy });
  curY -= 10;

  page.drawRectangle({
    x: 36,
    y: curY - 110,
    width: width - 72,
    height: 110,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('Amount Contributed:', { x: 50, y: curY - 22, size: 9.5, font: fontBold, color: textGray });
  page.drawText(`INR ₹ ${Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, {
    x: 180,
    y: curY - 22,
    size: 13,
    font: fontBold,
    color: emeraldGreen,
  });

  page.drawText('Amount in Words:', { x: 50, y: curY - 42, size: 9, font: fontBold, color: textGray });
  page.drawText(numberToIndianWords(data.amount), { x: 180, y: curY - 42, size: 9, font: fontBold, color: darkNavy });

  page.drawText('Fund Allocation:', { x: 50, y: curY - 62, size: 9, font: fontBold, color: textGray });
  page.drawText(data.campaignName || 'General Emergency Stray Rescue Fund', { x: 180, y: curY - 62, size: 9, font: fontRegular, color: darkNavy });

  page.drawText('Payment Mode:', { x: 50, y: curY - 82, size: 9, font: fontBold, color: textGray });
  page.drawText(data.paymentMethod || 'Online (UPI / Cards / NetBanking)', { x: 180, y: curY - 82, size: 9, font: fontRegular, color: darkNavy });

  page.drawText('Razorpay Reference:', { x: 50, y: curY - 100, size: 9, font: fontBold, color: textGray });
  page.drawText(`Payment ID: ${data.paymentId} ${data.orderId ? ' | Order ID: ' + data.orderId : ''}`, {
    x: 180,
    y: curY - 100,
    size: 8.5,
    font: fontRegular,
    color: textGray,
  });

  // Statutory Declaration Box
  curY -= 130;
  page.drawRectangle({
    x: 36,
    y: curY - 70,
    width: width - 72,
    height: 70,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('STATUTORY 80G TAX EXEMPTION DECLARATION', { x: 50, y: curY - 16, size: 8.5, font: fontBold, color: primaryOrange });
  
  const statutoryText1 = `This donation is eligible for deduction under Section 80G(5) of the Income Tax Act, 1961 vide Approval Order URN ${ngo80G}.`;
  const statutoryText2 = 'Donations made to Athiaa Animal Welfare Foundation are utilized exclusively for charitable rescue, medical treatment, and sanctuary rehabilitation of stray and injured animals across India.';
  const statutoryText3 = 'Note: This computerized receipt is eligible for filing your annual Income Tax Return (ITR). Athiaa will upload donation details under Form 10BD for donor Form 10BE generation.';

  page.drawText(statutoryText1, { x: 50, y: curY - 30, size: 7.8, font: fontRegular, color: darkNavy });
  page.drawText(statutoryText2, { x: 50, y: curY - 42, size: 7.8, font: fontRegular, color: darkNavy });
  page.drawText(statutoryText3, { x: 50, y: curY - 56, size: 7.5, font: fontOblique, color: textGray });

  // Signature Block & QR/Stamp Area
  curY -= 130;

  // Left side: NGO stamp note
  page.drawRectangle({
    x: 50,
    y: curY,
    width: 140,
    height: 55,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page.drawText('OFFICIAL SEAL', { x: 80, y: curY + 38, size: 7.5, font: fontBold, color: textGray });
  page.drawText('ATHIAA ANIMAL WELFARE', { x: 56, y: curY + 24, size: 7, font: fontBold, color: primaryOrange });
  page.drawText('SEC 8 NONPROFIT • 80G', { x: 62, y: curY + 12, size: 6.5, font: fontRegular, color: textGray });

  // Right side: Authorized Signatory
  page.drawText('For ATHIAA ANIMAL WELFARE FOUNDATION', { x: width - 260, y: curY + 44, size: 8.5, font: fontBold, color: darkNavy });
  page.drawLine({
    start: { x: width - 260, y: curY + 18 },
    end: { x: width - 60, y: curY + 18 },
    thickness: 1,
    color: borderGray,
  });
  page.drawText('Authorized Trustee / Finance Signatory', { x: width - 260, y: curY + 6, size: 8, font: fontRegular, color: textGray });
  page.drawText('(Computer Generated Valid 80G Receipt)', { x: width - 260, y: curY - 6, size: 7, font: fontOblique, color: textGray });

  // Footer Disclaimer Line
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 24,
    color: darkNavy,
  });

  page.drawText('Athiaa Animal Welfare Foundation  •  Website: athiaango.org  •  Email: contact@athiaango.org', {
    x: 100,
    y: 8,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.85, 0.85, 0.85),
  });

  return await pdfDoc.save();
}
