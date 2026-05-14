import { MemberStatus, MemberState, Gender } from '@prisma/client'

export type { MemberStatus, MemberState, Gender }

export interface MemberListItem {
  id: string
  firstName: string
  lastName: string
  status: MemberStatus
  state: MemberState
  joinedAt: Date
  email: string | null
  telegram: string | null
  mentor: { id: string; firstName: string; lastName: string } | null
  userId: string | null
}

export interface MemberProfile {
  id: string
  firstName: string
  lastName: string
  gender: Gender | null
  birthDate: Date | null
  studyYear: number | null
  joinedAt: Date
  email: string | null
  phone: string | null
  telegram: string | null
  instagram: string | null
  facebook: string | null
  family: string | null
  status: MemberStatus
  state: MemberState
  mentorId: string | null
  userId: string | null
  mentor: { id: string; firstName: string; lastName: string } | null
  mentees: { id: string; firstName: string; lastName: string; status: MemberStatus }[]
}

export interface MemberFilters {
  search?: string
  status?: MemberStatus
  state?: MemberState
  mentorId?: string
}
