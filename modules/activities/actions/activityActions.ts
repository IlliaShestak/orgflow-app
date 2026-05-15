'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Role } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'
import {
  activityCreateSchema,
  activityUpdateSchema,
  saveAgendaSchema,
  markAttendanceSchema,
  removeAttendanceSchema,
  type ActivityCreateInput,
  type ActivityUpdateInput,
  type SaveAgendaInput,
  type MarkAttendanceInput,
} from '../validators/activitySchema'

export async function createActivity(input: ActivityCreateInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const data = activityCreateSchema.parse(input)
    const activity = await prisma.activity.create({ data })
    revalidatePath('/activities')
    return { success: true, data: activity }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка створення заходу' }
  }
}

export async function updateActivity(input: ActivityUpdateInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const { id, ...data } = activityUpdateSchema.parse(input)
    const activity = await prisma.activity.update({ where: { id }, data })
    revalidatePath('/activities')
    revalidatePath(`/activities/${id}`)
    return { success: true, data: activity }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка оновлення заходу' }
  }
}

export async function deleteActivity(id: string) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    await prisma.activity.delete({ where: { id } })
    revalidatePath('/activities')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення заходу' }
  }
}

export async function saveAgenda(input: SaveAgendaInput) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    const { activityId, items } = saveAgendaSchema.parse(input)

    await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      await tx.activityAgendaItem.deleteMany({ where: { activityId } })
      if (items.length > 0) {
        await tx.activityAgendaItem.createMany({
          data: items.map((item) => ({
            activityId,
            order: item.order,
            text: item.text,
            knowledgeTopicId: item.knowledgeTopicId,
          })),
        })
      }
    })

    revalidatePath(`/activities/${activityId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка збереження порядку денного' }
  }
}

export async function markAttendance(input: MarkAttendanceInput) {
  try {
    const session = await getSession()
    if (!session?.user) throw new Error('Unauthorized')

    const { activityId, memberId } = markAttendanceSchema.parse(input)
    const role = session.user.role as Role

    // RBAC: FullMember can only mark self and own mentees
    if (role === Role.FullMember) {
      const { getMemberByUserId } = await import('@/modules/hr/repository/memberRepository')
      const selfMember = await getMemberByUserId(session.user.id)
      if (!selfMember) throw new Error('Unauthorized')
      const isSelf = selfMember.id === memberId
      const isMentee = selfMember.mentees.some((m: { id: string }) => m.id === memberId)
      if (!isSelf && !isMentee) throw new Error('Unauthorized')
    } else if (role !== Role.Admin && role !== Role.VP4HR) {
      throw new Error('Unauthorized')
    }

    // Upsert attendance record
    await prisma.activityAttendance.upsert({
      where: { activity_attendance_unique: { activityId, memberId } },
      create: { activityId, memberId },
      update: {},
    })

    // Auto-assign knowledge coverage from agenda topic items
    const agendaItems = await prisma.activityAgendaItem.findMany({
      where: { activityId, knowledgeTopicId: { not: null } },
      select: { knowledgeTopicId: true },
    })

    for (const item of agendaItems) {
      if (!item.knowledgeTopicId) continue

      // Get all transfer type columns for the topic's table
      const topic = await prisma.knowledgeTopic.findUnique({
        where: { id: item.knowledgeTopicId },
        select: {
          knowledgeTableId: true,
          knowledgeTable: {
            select: {
              columns: { select: { knowledgeTransferTypeId: true } },
            },
          },
        },
      })

      if (!topic) continue

      // Upsert coverage for each transfer type in the table
      for (const col of topic.knowledgeTable.columns) {
        await prisma.knowledgeCoverage.upsert({
          where: {
            knowledge_coverage_unique: {
              memberId,
              knowledgeTopicId: item.knowledgeTopicId,
              knowledgeTransferTypeId: col.knowledgeTransferTypeId,
            },
          },
          create: {
            memberId,
            knowledgeTopicId: item.knowledgeTopicId,
            knowledgeTransferTypeId: col.knowledgeTransferTypeId,
            sourceActivityId: activityId,
          },
          update: {},
        })
      }
    }

    revalidatePath(`/activities/${activityId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка відмітки відвідуваності' }
  }
}

export async function removeAttendance(input: { activityId: string; memberId: string }) {
  try {
    const session = await getSession()
    if (!session?.user) throw new Error('Unauthorized')

    const { activityId, memberId } = removeAttendanceSchema.parse(input)
    const role = session.user.role as Role

    if (role === Role.FullMember) {
      const { getMemberByUserId } = await import('@/modules/hr/repository/memberRepository')
      const selfMember = await getMemberByUserId(session.user.id)
      if (!selfMember) throw new Error('Unauthorized')
      const isSelf = selfMember.id === memberId
      const isMentee = selfMember.mentees.some((m: { id: string }) => m.id === memberId)
      if (!isSelf && !isMentee) throw new Error('Unauthorized')
    } else if (role !== Role.Admin && role !== Role.VP4HR) {
      throw new Error('Unauthorized')
    }

    await prisma.activityAttendance.deleteMany({ where: { activityId, memberId } })
    revalidatePath(`/activities/${activityId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення відвідуваності' }
  }
}
