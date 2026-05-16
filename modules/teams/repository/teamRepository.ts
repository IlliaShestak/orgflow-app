import { prisma } from '@/shared/lib/prisma'
import { TeamType } from '@prisma/client'
import { TeamListItem, TeamWithPositions, MemberForSelect } from '../types'

export async function getTeams(): Promise<TeamListItem[]> {
  return prisma.team.findMany({
    orderBy: [{ isArchived: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      type: true,
      startDate: true,
      endDate: true,
      isArchived: true,
      createdAt: true,
      _count: { select: { positions: true } },
    },
  })
}

export async function getTeamById(id: string): Promise<TeamWithPositions | null> {
  return prisma.team.findUnique({
    where: { id },
    include: {
      positions: {
        include: {
          teamMemberships: {
            where: { endDate: null },
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function createTeam(data: {
  name: string
  type: TeamType
  startDate?: Date
  endDate?: Date
}) {
  return prisma.team.create({ data })
}

export async function updateTeam(id: string, data: {
  name: string
  type: TeamType
  startDate?: Date | null
  endDate?: Date | null
  notes?: string | null
}) {
  return prisma.team.update({ where: { id }, data })
}

export async function archiveTeam(id: string) {
  return prisma.team.update({ where: { id }, data: { isArchived: true } })
}

export async function unarchiveTeam(id: string) {
  return prisma.team.update({ where: { id }, data: { isArchived: false } })
}

const CORETEAM_PRESET_POSITIONS = ['MO', 'HR', 'PR', 'CT', 'LG', 'DS', 'IT', 'Mentor', 'CR']

export async function createCoreteamPositions(teamId: string) {
  await prisma.position.createMany({
    data: CORETEAM_PRESET_POSITIONS.map((name) => ({ teamId, name, isHelper: false })),
  })
}

export async function createPosition(data: {
  teamId: string
  name: string
  isHelper: boolean
}) {
  return prisma.position.create({ data })
}

export async function deletePosition(id: string) {
  const active = await prisma.teamMembership.findFirst({
    where: { positionId: id, endDate: null },
  })
  if (active) {
    throw new Error('Неможливо видалити позицію з активними учасниками')
  }
  return prisma.position.delete({ where: { id } })
}

export async function assignMember(data: {
  positionId: string
  memberId: string
  startDate: Date
  teamName: string
  positionName: string
}) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.teamMembership.create({
      data: {
        positionId: data.positionId,
        memberId: data.memberId,
        startDate: data.startDate,
      },
    })

    await tx.applicationHistory.create({
      data: {
        memberId: data.memberId,
        positionName: data.positionName,
        teamName: data.teamName,
        appliedAt: data.startDate,
        result: 'Success',
      },
    })

    return membership
  })
}

export async function removeMember(membershipId: string, endDate: Date) {
  return prisma.teamMembership.update({
    where: { id: membershipId },
    data: { endDate },
  })
}

export async function getMembersForSelect(): Promise<MemberForSelect[]> {
  return prisma.member.findMany({
    where: { state: 'Active' },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}
