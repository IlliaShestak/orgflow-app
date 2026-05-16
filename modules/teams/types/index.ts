import { TeamType } from '@prisma/client'

export type TeamWithPositions = {
  id: string
  name: string
  type: TeamType
  startDate: Date | null
  endDate: Date | null
  isArchived: boolean
  notes: string | null
  createdAt: Date
  positions: PositionWithMemberships[]
}

export type PositionWithMemberships = {
  id: string
  name: string
  teamId: string
  isHelper: boolean
  teamMemberships: ActiveMembership[]
}

export type ActiveMembership = {
  id: string
  startDate: Date
  endDate: Date | null
  member: {
    id: string
    firstName: string
    lastName: string
    status: string
  }
}

export type TeamListItem = {
  id: string
  name: string
  type: TeamType
  startDate: Date | null
  endDate: Date | null
  isArchived: boolean
  createdAt: Date
  _count: { positions: number }
}

export type MemberForSelect = {
  id: string
  firstName: string
  lastName: string
}

export type PendingAssign = {
  type: 'assign'
  positionId: string
  positionName: string
  memberId: string
  memberFirstName: string
  memberLastName: string
  startDate: string
}

export type PendingRemove = {
  type: 'remove'
  positionId: string
  membershipId: string
  endDate: string
}

export type PendingChange = PendingAssign | PendingRemove
