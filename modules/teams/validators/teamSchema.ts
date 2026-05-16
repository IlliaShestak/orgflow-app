import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Назва не може бути порожньою').max(200),
  type: z.enum(['Coreteam', 'Project', 'Team']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const updateTeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Назва не може бути порожньою').max(200),
  type: z.enum(['Coreteam', 'Project', 'Team']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().nullable().optional(),
})

export const createPositionSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().min(1, 'Назва не може бути порожньою').max(200),
  isHelper: z.boolean().optional().default(false),
})

export const assignMemberSchema = z.object({
  positionId: z.string().min(1),
  memberId: z.string().min(1),
  startDate: z.string().min(1, 'Дата початку обов\'язкова'),
})

export const removeMemberSchema = z.object({
  membershipId: z.string().min(1),
  endDate: z.string().min(1, 'Дата завершення обов\'язкова'),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type CreatePositionInput = z.infer<typeof createPositionSchema>
export type AssignMemberInput = z.infer<typeof assignMemberSchema>
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>
