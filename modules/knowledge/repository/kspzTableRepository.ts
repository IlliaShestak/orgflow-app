import { prisma } from '@/shared/lib/prisma'
import { MemberStatus } from '@prisma/client'

export async function getKspzTables() {
  return prisma.knowledgeTable.findMany({
    select: {
      id: true,
      name: true,
      targetStatus: true,
      createdAt: true,
      _count: { select: { topics: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getKspzTableById(id: string) {
  return prisma.knowledgeTable.findUnique({
    where: { id },
    include: {
      topics: { orderBy: { order: 'asc' } },
      columns: {
        include: {
          knowledgeTransferType: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export async function getKspzTableByStatus(status: MemberStatus) {
  return prisma.knowledgeTable.findFirst({
    where: { targetStatus: status },
    include: {
      topics: { orderBy: { order: 'asc' } },
      columns: {
        include: {
          knowledgeTransferType: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export async function getKspzTransferTypes() {
  return prisma.knowledgeTransferType.findMany({
    orderBy: { name: 'asc' },
  })
}
