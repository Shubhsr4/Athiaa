import { z } from 'zod';

export const eventBaseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(150),
  slug: z.string()
    .min(1, { message: "Slug is required" })
    .max(100)
    .regex(/^[a-z0-9-]+$/, { message: "Slug must be lowercase, hyphenated, matching /^[a-z0-9-]+$/" }),
  description: z.string().max(3000).nullable().optional(),
  location: z.string().min(1, { message: "Location is required" }).max(250),
  start_date: z.string().datetime({ message: "Start date must be a valid ISO 8601 string" }),
  end_date: z.string().datetime({ message: "End date must be a valid ISO 8601 string" }),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  capacity: z.number().int().positive({ message: "Capacity must be a positive integer" }).nullable().optional(),
  pricing: z.number()
    .positive({ message: "Pricing must be positive" })
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Pricing must have at most 2 decimal places"
    }),
  image_url: z.string().url({ message: "Must be a valid URL" }).nullable().optional()
});

export const eventCreateSchema = eventBaseSchema.refine(data => {
  return new Date(data.start_date) <= new Date(data.end_date);
}, {
  message: "End date must be greater than or equal to start date",
  path: ["end_date"]
});

export const eventUpdateSchema = eventBaseSchema.partial();

export const eventRegistrationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  email: z.string().email({ message: "Must be a valid email address" }),
  phone: z.string().min(1, { message: "Phone is required" }).max(30),
  attendee_count: z.number().int().positive({ message: "Attendee count must be a positive integer" })
});

export type CreateEventInput = z.infer<typeof eventCreateSchema>;
export type UpdateEventInput = z.infer<typeof eventUpdateSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
