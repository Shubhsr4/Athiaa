import { z } from 'zod';

export const volunteerCreateSchema = z.object({
  skills: z.array(z.string()).min(1, { message: "At least one skill is required" }),
  availability: z.string().min(1, { message: "Availability details are required" }).max(500),
  emergency_contact: z.string().min(1, { message: "Emergency contact details are required" }).max(200),
  status: z.enum(['pending', 'active', 'inactive', 'rejected']).default('pending')
});

export const volunteerUpdateSchema = volunteerCreateSchema.partial();

export const taskCreateSchema = z.object({
  title: z.string().min(1, { message: "Task title is required" }).max(150),
  description: z.string().max(1000).optional().nullable(),
  dog_id: z.string().uuid({ message: "Must be a valid dog ID" }).optional().nullable(),
  scheduled_date: z.string().min(1, { message: "Scheduled date is required" })
});

export type CreateVolunteerInput = z.infer<typeof volunteerCreateSchema>;
export type UpdateVolunteerInput = z.infer<typeof volunteerUpdateSchema>;
export type CreateTaskInput = z.infer<typeof taskCreateSchema>;
