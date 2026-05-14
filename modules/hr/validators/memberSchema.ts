import { z } from 'zod'

export const memberCreateSchema = z.object({
  firstName: z.string().min(1, "Ім'я є обов'язковим"),
  lastName: z.string().min(1, "Прізвище є обов'язковим"),
  gender: z.enum(['Male', 'Female']).optional(),
  birthDate: z.coerce.date().optional().nullable(),
  studyYear: z.coerce.number().int().min(1).max(6).optional().nullable(),
  joinedAt: z.coerce.date(),
  email: z.string().email('Невірний формат email').optional().nullable(),
  phone: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  family: z.string().optional().nullable(),
  status: z.enum(['Observer', 'Baby', 'Full', 'Alumni']).default('Observer'),
  state: z.enum(['Active', 'Inactive']).default('Active'),
  mentorId: z.string().optional().nullable(),
})

export const memberUpdateSchema = memberCreateSchema.partial().extend({
  id: z.string().min(1),
})

export type MemberCreateInput = z.infer<typeof memberCreateSchema>
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>
