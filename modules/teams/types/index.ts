import { TeamType } from '../../../generated/prisma'

export type TeamWithPositions = {
  id: string
  name: string
  type: TeamType
  startDate: Date | null
  endDate: Date | null
  isArchived: boolean
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
