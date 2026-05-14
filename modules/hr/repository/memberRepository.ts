import { prisma } from '@/shared/lib/prisma'
import { MemberFilters } from '../types'
import { MemberStatus, MemberState } from '@prisma/client'

export async function getMembers(filters: MemberFilters = {}) {
  const { search, status, state, mentorId } = filters

  return prisma.member.findMany({
    where: {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(state && { state }),
      ...(mentorId && { mentorId }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      state: true,
      joinedAt: true,
      email: true,
      telegram: true,
      userId: true,
      mentor: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}

export async function getMemberById(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      mentor: {
        select: { id: true, firstName: true, lastName: true },
      },
      mentees: {
        select: { id: true, firstName: true, lastName: true, status: true },
      },
      teamMemberships: {
        include: {
          position: {
            include: { team: { select: { id: true, name: true, type: true } } },
          },
        },
        orderBy: { startDate: 'desc' },
      },
      applicationHistory: {
        orderBy: { appliedAt: 'desc' },
      },
    },
  })
}

export async function getMembersForMentorSelect() {
  return prisma.member.findMany({
    where: {
      userId: { not: null },
      status: { in: ['Full', 'Alumni'] as MemberStatus[] },
    },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}

export async function getMemberByUserId(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    include: {
      mentor: { select: { id: true, firstName: true, lastName: true } },
      mentees: { select: { id: true, firstName: true, lastName: true, status: true } },
      teamMemberships: {
        include: {
          position: {
            include: { team: { select: { id: true, name: true, type: true } } },
          },
        },
        orderBy: { startDate: 'desc' },
      },
      applicationHistory: {
        orderBy: { appliedAt: 'desc' },
      },
    },
  })
}
