import { MemberStatus } from '@/generated/prisma'

export type { MemberStatus }

export interface KspzTopic {
  id: string
  knowledgeTableId: string
  name: string
  order: number
}

export interface KspzTransferType {
  id: string
  name: string
}

export interface KspzTableColumn {
  knowledgeTableId: string
  knowledgeTransferTypeId: string
  knowledgeTransferType: KspzTransferType
}

export interface KspzTable {
  id: string
  name: string
  targetStatus: MemberStatus | null
  createdAt: Date
  _count: { topics: number }
}

export interface KspzTableDetail {
  id: string
  name: string
  targetStatus: MemberStatus | null
  createdAt: Date
  topics: KspzTopic[]
  columns: KspzTableColumn[]
}

export interface CoverageCell {
  topicId: string
  transferTypeId: string
  covered: boolean
  coveredAt: Date | null
}

export interface MemberCoverageRow {
  memberId: string
  firstName: string
  lastName: string
  cells: CoverageCell[]
}
