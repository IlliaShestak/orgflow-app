'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Role } from '@prisma/client'
import {
  kspzTableCreateSchema,
  kspzTableUpdateSchema,
  kspzTopicCreateSchema,
  kspzTopicUpdateSchema,
  kspzCoverageToggleSchema,
  type KspzTableCreateInput,
  type KspzTableUpdateInput,
  type KspzTopicCreateInput,
  type KspzTopicUpdateInput,
  type KspzCoverageToggleInput,
} from '../validators/kspzSchema'

export async function createKspzTable(input: KspzTableCreateInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const { transferTypeIds, ...tableData } = kspzTableCreateSchema.parse(input)

    const table = await prisma.knowledgeTable.create({
      data: {
        ...tableData,
        columns: {
          create: transferTypeIds.map((id) => ({ knowledgeTransferTypeId: id })),
        },
      },
    })

    revalidatePath('/knowledge')
    return { success: true, data: table }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка створення таблиці' }
  }
}

export async function updateKspzTable(input: KspzTableUpdateInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const { id, ...data } = kspzTableUpdateSchema.parse(input)
    const table = await prisma.knowledgeTable.update({ where: { id }, data })
    revalidatePath('/knowledge')
    revalidatePath(`/knowledge/${id}`)
    return { success: true, data: table }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка оновлення таблиці' }
  }
}

export async function deleteKspzTable(id: string) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    await prisma.knowledgeTable.delete({ where: { id } })
    revalidatePath('/knowledge')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення таблиці' }
  }
}

export async function createKspzTopic(input: KspzTopicCreateInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const { knowledgeTableId, name, transferTypeIds } = kspzTopicCreateSchema.parse(input)

    const maxOrder = await prisma.knowledgeTopic.aggregate({
      where: { knowledgeTableId },
      _max: { order: true },
    })
    const order = (maxOrder._max.order ?? -1) + 1

    const topic = await prisma.knowledgeTopic.create({
      data: {
        knowledgeTableId,
        name,
        order,
        transferTypes: {
          create: transferTypeIds.map((id) => ({ knowledgeTransferTypeId: id })),
        },
      },
    })

    revalidatePath(`/knowledge/${knowledgeTableId}`)
    return { success: true, data: topic }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка створення теми' }
  }
}

export async function updateKspzTopic(input: KspzTopicUpdateInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const { id, name, transferTypeIds } = kspzTopicUpdateSchema.parse(input)

    const topic = await prisma.$transaction(async (tx) => {
      await tx.knowledgeTopicTransferType.deleteMany({ where: { knowledgeTopicId: id } })
      const updated = await tx.knowledgeTopic.update({ where: { id }, data: { name } })
      if (transferTypeIds.length > 0) {
        await tx.knowledgeTopicTransferType.createMany({
          data: transferTypeIds.map((ttId) => ({
            knowledgeTopicId: id,
            knowledgeTransferTypeId: ttId,
          })),
        })
      }
      return updated
    })

    revalidatePath(`/knowledge/${topic.knowledgeTableId}`)
    return { success: true, data: topic }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка оновлення теми' }
  }
}

export async function deleteKspzTopic(id: string) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const topic = await prisma.knowledgeTopic.delete({ where: { id } })
    revalidatePath(`/knowledge/${topic.knowledgeTableId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення теми' }
  }
}

export async function toggleKspzCoverage(input: KspzCoverageToggleInput) {
  try {
    const session = await getSession()
    if (!session?.user) throw new Error('Unauthorized')

    const { memberId, knowledgeTopicId, covered } = kspzCoverageToggleSchema.parse(input)
    const role = session.user.role as Role

    if (role === Role.FullMember) {
      // Verify FullMember can only toggle for self or own mentees
      const selfMember = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: { mentees: { select: { id: true } } },
      })
      if (!selfMember) throw new Error('Unauthorized')
      const isSelf = selfMember.id === memberId
      const isMentee = selfMember.mentees.some((m: { id: string }) => m.id === memberId)
      if (!isSelf && !isMentee) throw new Error('Unauthorized')
    } else if (role !== Role.Admin && role !== Role.VP4HR) {
      throw new Error('Unauthorized')
    }

    if (covered) {
      await prisma.knowledgeCoverage.upsert({
        where: { knowledge_coverage_unique: { memberId, knowledgeTopicId } },
        create: { memberId, knowledgeTopicId },
        update: {},
      })
    } else {
      await prisma.knowledgeCoverage.deleteMany({
        where: { memberId, knowledgeTopicId },
      })
    }

    revalidatePath('/knowledge')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка оновлення покриття' }
  }
}
