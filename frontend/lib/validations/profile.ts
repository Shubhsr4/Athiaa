import { z } from 'zod';

export const profileUpdateSchema = z.object({
  full_name: z.string().max(150).nullable().optional(),
  display_name: z.string().max(80).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  preferred_lang: z.string().max(10).nullable().optional(),
  currency: z.string().max(10).nullable().optional(),
  avatar_url: z.string().url({ message: "Avatar must be a valid URL" }).nullable().optional()
});

export const profileCreateSchema = profileUpdateSchema.extend({
  id: z.string().uuid({ message: "Must be a valid user ID UUID" }),
  email: z.string().email({ message: "Must be a valid email address" }),
  role: z.enum(['super_admin', 'admin', 'volunteer', 'donor', 'user']).default('user')
});

export type CreateProfileInput = z.infer<typeof profileCreateSchema>;
export type UpdateProfileInput = z.infer<typeof profileUpdateSchema>;
