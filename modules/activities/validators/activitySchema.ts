import { z } from 'zod'
import { ActivityType } from '@/generated/prisma'

export const activityCreateSchema = z.object({
  type: z.nativeEnum(ActivityType),
  date: z.coerce.date(),
  description: z.string().min(1, 'РћРїРёСЃ РѕР±РѕРІКјСЏР·РєРѕРІРёР№'),
})

export const activityUpdateSchema = activityCreateSchema.extend({
  id: z.string().cuid(),
})

export const agendaItemSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    text: z.string().min(1, 'РўРµРєСЃС‚ РѕР±РѕРІКјСЏР·РєРѕРІРёР№'),
  }),
  z.object({
    kind: z.literal('topic'),
    knowledgeTopicId: z.string().cuid(),
  }),
])

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

export type ActivityCreateInput = z.infer<typeof activityCreateSchema>
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>
export type SaveAgendaInput = z.infer<typeof saveAgendaSchema>
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
