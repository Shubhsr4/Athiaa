import { z } from 'zod';

export const campaignBaseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(150),
  slug: z.string()
    .min(1, { message: "Slug is required" })
    .max(100)
    .regex(/^[a-z0-9-]+$/, { message: "Slug must be lowercase, hyphenated, matching /^[a-z0-9-]+$/" }),
  description: z.string().max(3000).nullable().optional(),
  goal_amount: z.number()
    .positive({ message: "Goal amount must be positive" })
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Goal amount must have at most 2 decimal places"
    }),
  currency: z.string().min(1, { message: "Currency is required" }).max(10).default('USD'),
  start_date: z.string().datetime({ message: "Start date must be a valid ISO 8601 string" }).nullable().optional(),
  end_date: z.string().datetime({ message: "End date must be a valid ISO 8601 string" }).nullable().optional(),
  image_url: z.string().url({ message: "Must be a valid URL" }).nullable().optional(),
  is_active: z.boolean().default(true)
});

export const campaignCreateSchema = campaignBaseSchema.refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "End date must be greater than or equal to start date",
  path: ["end_date"]
});

export const campaignUpdateSchema = campaignBaseSchema.partial();

export type CreateCampaignInput = z.infer<typeof campaignCreateSchema>;
export type UpdateCampaignInput = z.infer<typeof campaignUpdateSchema>;
