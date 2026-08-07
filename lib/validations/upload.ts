import { z } from 'zod';

export const uploadRequestSchema = z.object({
  bucket: z.enum([
    'dog-media',
    'avatars',
    'blog-covers',
    'event-covers',
    'campaign-covers',
    'success-stories',
    'documents',
    'receipts'
  ], {
    message: "Invalid target storage bucket"
  }),
  path: z.string()
    .min(1, { message: "Upload destination path is required" })
    .max(500)
    .regex(/^[a-zA-Z0-9_/.-]+$/, { message: "Path contains illegal characters" }),
  fileSize: z.number()
    .positive()
    .max(5 * 1024 * 1024, { message: "File size exceeds the 5MB maximum limit" })
    .optional(),
  mimeType: z.string()
    .max(100)
    .refine(val => {
      const allowed = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return allowed.includes(val);
    }, {
      message: "Unsupported media format/MIME type"
    })
    .optional()
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
