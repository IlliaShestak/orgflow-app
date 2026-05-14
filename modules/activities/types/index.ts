import { ActivityType } from '@prisma/client'

export type { ActivityType }

export interface ActivityListItem {
  id: string
  type: ActivityType
  date: Date
  description: string
  createdAt: Date
  _count: { attendance: number; agendaItems: number }
}

export interface AgendaItem {
  id: string
  activityId: string
  order: number
  text: string | null
  knowledgeTopicId: string | null
  knowledgeTopic: { id: string; name: string; knowledgeTable: { name: string } } | null
}

export interface ActivityDetail {
  id: string
  type: ActivityType
  date: Date
  description: string
  createdAt: Date
  agendaItems: AgendaItem[]
  attendance: {
    id: string
    memberId: string
    member: { id: string; firstName: string; lastName: string }
  }[]
}

export interface ActivityFilters {
  type?: ActivityType
  search?: string
}
