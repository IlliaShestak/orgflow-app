import { prisma } from '@/shared/lib/prisma'

export async function getKspzTopicsByTable(knowledgeTableId: string) {
  return prisma.knowledgeTopic.findMany({
    where: { knowledgeTableId },
    orderBy: { order: 'asc' },
    include: { transferTypes: { select: { knowledgeTransferTypeId: true } } },
  })
}
