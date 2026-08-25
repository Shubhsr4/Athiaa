import { z } from 'zod';

export const contactCreateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(150),
  email: z.string().email({ message: "Must be a valid email address" }),
  phone: z.string().min(5, { message: "Phone must be at least 5 chars" }).max(30).nullable().optional(),
  subject: z.string().min(1, { message: "Subject is required" }).max(200),
  message: z.string().min(10, { message: "Message must be at least 10 characters long" }).max(3000),
  category: z.string().min(1, { message: "Category is required" }).max(50),
  is_read: z.boolean().default(false)
});

export const contactUpdateSchema = contactCreateSchema.partial();

export type CreateContactInput = z.infer<typeof contactCreateSchema>;
export type UpdateContactInput = z.infer<typeof contactUpdateSchema>;
