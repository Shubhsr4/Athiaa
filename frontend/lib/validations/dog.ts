import { z } from 'zod';

export const dogCreateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  slug: z.string()
    .min(1, { message: "Slug is required" })
    .max(100)
    .regex(/^[a-z0-9-]+$/, { message: "Slug must be lowercase, hyphenated, matching /^[a-z0-9-]+$/" }),
  breed: z.string().min(1, { message: "Breed is required" }).max(100),
  status: z.enum(['available', 'adopted', 'foster', 'medical_hold', 'deceased']).default('available'),
  gender: z.enum(['male', 'female', 'unknown']),
  size: z.enum(['tiny', 'small', 'medium', 'large', 'giant']),
  age: z.string().min(1, { message: "Age is required" }),
  flags: z.array(z.string()).default([]),
  fee: z.number()
    .positive({ message: "Monetary fee must be a positive number" })
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Amount must have at most 2 decimal places"
    }),
  description: z.string().max(2000).nullable().optional(),
  main_image_url: z.string().url({ message: "Must be a valid URL" }).nullable().optional()
});

export const dogUpdateSchema = dogCreateSchema.partial();

export const healthRecordCreateSchema = z.object({
  record_type: z.string().max(100).optional().nullable(),
  title: z.string().min(1, { message: "Title is required" }).max(200),
  description: z.string().max(1000).optional().nullable(),
  vet_name: z.string().max(100).optional().nullable(),
  clinic_name: z.string().max(100).optional().nullable(),
  record_date: z.string().min(1, { message: "Record date is required" }),
  next_due_date: z.string().optional().nullable(),
  document_url: z.string().url({ message: "Must be a valid document URL" }).or(z.literal('')).optional().nullable(),
  cost: z.number().nonnegative().optional().nullable()
});

export type CreateDogInput = z.infer<typeof dogCreateSchema>;
export type UpdateDogInput = z.infer<typeof dogUpdateSchema>;
export type CreateHealthRecordInput = z.infer<typeof healthRecordCreateSchema>;
