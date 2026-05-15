import { prisma } from '@/shared/lib/prisma'

export async function getCoverageForMember(memberId: string, knowledgeTableId: string) {
  const topics = await prisma.knowledgeTopic.findMany({
    where: { knowledgeTableId },
    select: { id: true },
  })
  const topicIds = topics.map((t) => t.id)

  return prisma.knowledgeCoverage.findMany({
    where: { memberId, knowledgeTopicId: { in: topicIds } },
    select: {
      knowledgeTopicId: true,
      coveredAt: true,
    },
  })
}

export async function getCoverageMatrixForTable(knowledgeTableId: string) {
  const topics = await prisma.knowledgeTopic.findMany({
    where: { knowledgeTableId },
    select: { id: true },
  })
  const topicIds = topics.map((t) => t.id)

  return prisma.knowledgeCoverage.findMany({
    where: { knowledgeTopicId: { in: topicIds } },
    select: {
      memberId: true,
      knowledgeTopicId: true,
      coveredAt: true,
    },
  })
}
