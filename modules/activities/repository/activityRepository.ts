import { prisma } from '@/shared/lib/prisma'
import { ActivityType } from '@prisma/client'

export async function getActivities(filters: { type?: ActivityType; search?: string } = {}) {
  const { type, search } = filters
  return prisma.activity.findMany({
    where: {
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      type: true,
      date: true,
      description: true,
      createdAt: true,
      _count: { select: { attendance: true, agendaItems: true } },
    },
    orderBy: { date: 'desc' },
  })
}

export async function getActivityById(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      agendaItems: {
        include: {
          knowledgeTopic: {
            select: {
              id: true,
              name: true,
              knowledgeTable: { select: { name: true } },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
      attendance: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}
