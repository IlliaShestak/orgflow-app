'use server'

import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Невірний формат email'),
  role: z.enum(['Admin', 'VP4HR', 'FullMember']),
  memberId: z.string().optional(),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['Admin', 'VP4HR', 'FullMember']),
})

export const createTransferTypeSchema = z.object({
  name: z.string().min(1, 'Назва не може бути порожньою').max(100),
})

export const updateTransferTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Назва не може бути порожньою').max(100),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type CreateTransferTypeInput = z.infer<typeof createTransferTypeSchema>
export type UpdateTransferTypeInput = z.infer<typeof updateTransferTypeSchema>
