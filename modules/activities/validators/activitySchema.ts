import { z } from 'zod'
import { ActivityType } from '@prisma/client'

const agendaItemDraftSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    text: z.string().min(1, 'Текст обовʼязковий'),
  }),
  z.object({
    kind: z.literal('topic'),
    knowledgeTopicId: z.string().cuid(),
  }),
])

export const activityCreateSchema = z.object({
  name: z.string().min(1, 'Назва обовʼязкова'),
  type: z.nativeEnum(ActivityType),
  date: z.coerce.date(),
  description: z.string().optional(),
  agendaItems: z.array(agendaItemDraftSchema).optional().default([]),
  memberIds: z.array(z.string().cuid()).optional().default([]),
})

export const activityUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Назва обовʼязкова'),
  type: z.nativeEnum(ActivityType),
  date: z.coerce.date(),
  description: z.string().optional(),
})

export const saveAgendaSchema = z.object({
  activityId: z.string().cuid(),
  items: z.array(
    z.object({
      id: z.string().optional(),
      order: z.number().int().min(0),
      text: z.string().nullable(),
      knowledgeTopicId: z.string().nullable(),
    })
  ),
})

export const markAttendanceSchema = z.object({
  activityId: z.string().cuid(),
  memberId: z.string().cuid(),
})

export const removeAttendanceSchema = z.object({
  activityId: z.string().cuid(),
  memberId: z.string().cuid(),
})

export type ActivityCreateInput = z.input<typeof activityCreateSchema>
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>
export type SaveAgendaInput = z.infer<typeof saveAgendaSchema>
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
