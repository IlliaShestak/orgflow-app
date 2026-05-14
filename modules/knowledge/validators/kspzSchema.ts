import { z } from 'zod'
import { MemberStatus } from '@/generated/prisma'

export const kspzTableCreateSchema = z.object({
  name: z.string().min(1, 'Назва обов\'язкова'),
  targetStatus: z.nativeEnum(MemberStatus).nullable(),
  transferTypeIds: z.array(z.string()).min(1, 'Оберіть хоча б один тип передачі'),
})

export const kspzTableUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Назва обов\'язкова'),
  targetStatus: z.nativeEnum(MemberStatus).nullable(),
})

export const kspzTopicCreateSchema = z.object({
  knowledgeTableId: z.string(),
  name: z.string().min(1, 'Назва теми обов\'язкова'),
})

export const kspzTopicUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Назва теми обов\'язкова'),
})

export const kspzCoverageToggleSchema = z.object({
  memberId: z.string(),
  knowledgeTopicId: z.string(),
  knowledgeTransferTypeId: z.string(),
  covered: z.boolean(),
})

export type KspzTableCreateInput = z.infer<typeof kspzTableCreateSchema>
export type KspzTableUpdateInput = z.infer<typeof kspzTableUpdateSchema>
export type KspzTopicCreateInput = z.infer<typeof kspzTopicCreateSchema>
export type KspzTopicUpdateInput = z.infer<typeof kspzTopicUpdateSchema>
export type KspzCoverageToggleInput = z.infer<typeof kspzCoverageToggleSchema>
