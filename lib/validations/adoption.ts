import { z } from 'zod';

export const adoptionCreateSchema = z.object({
  dog_id: z.string().uuid({ message: "dog_id must be a valid UUID" }),
  applicant_name: z.string().min(1, { message: "Applicant name is required" }).max(150),
  applicant_email: z.string().email({ message: "Must be a valid email address" }),
  applicant_phone: z.string().min(6, { message: "Phone number is required" }).max(30),
  living_situation: z.string().min(1, { message: "Living situation description is required" }).max(1000),
  experience_level: z.string().min(1, { message: "Experience level description is required" }).max(1000),
  status: z.enum(['pending', 'reviewing', 'approved', 'rejected', 'completed', 'withdrawn']).default('pending'),
  notes: z.string().max(2500).nullable().optional()
});

export const adoptionUpdateSchema = adoptionCreateSchema.partial();

export type CreateAdoptionInput = z.infer<typeof adoptionCreateSchema>;
export type UpdateAdoptionInput = z.infer<typeof adoptionUpdateSchema>;
