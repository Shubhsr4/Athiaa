import { z } from 'zod';

export const blogCreateSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(200),
  slug: z.string()
    .min(1, { message: "Slug is required" })
    .max(100)
    .regex(/^[a-z0-9-]+$/, { message: "Slug must be lowercase, hyphenated, matching /^[a-z0-9-]+$/" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  summary: z.string().max(500).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
  cover_image_url: z.string().url({ message: "Cover image must be a valid URL" }).nullable().optional()
});

export const blogUpdateSchema = blogCreateSchema.partial();

export type CreateBlogInput = z.infer<typeof blogCreateSchema>;
export type UpdateBlogInput = z.infer<typeof blogUpdateSchema>;
