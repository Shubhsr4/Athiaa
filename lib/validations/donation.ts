import { z } from 'zod';

export const donationCreateSchema = z.object({
  campaign_id: z.string().uuid({ message: "campaign_id must be a valid UUID" }).nullable().optional(),
  amount: z.number()
    .positive({ message: "Donation amount must be positive" })
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Amount must have at most 2 decimal places"
    }),
  currency: z.string().min(1, { message: "Currency is required" }).max(10).default('INR'),
  method: z.enum(['stripe', 'razorpay', 'paypal', 'bank_transfer', 'cash', 'upi']).default('razorpay'),
  status: z.enum(['pending', 'completed', 'paid', 'failed', 'refunded']).default('pending'),
  donor_name: z.string().min(1, { message: "Donor name must be at least 1 letter" }).max(150).nullable().optional(),
  donor_email: z.string().email({ message: "Must be a valid email address" }).nullable().optional(),
  donor_phone: z.string().max(20).nullable().optional(),
  donor_pan: z.string().max(10).nullable().optional(),
  receipt_number: z.string().nullable().optional(),
  receipt_url: z.string().nullable().optional(),
  transaction_id: z.string().max(200).nullable().optional(),
  is_anonymous: z.boolean().default(false)
});

export const donationUpdateSchema = donationCreateSchema.partial();

export type CreateDonationInput = z.infer<typeof donationCreateSchema>;
export type UpdateDonationInput = z.infer<typeof donationUpdateSchema>;
