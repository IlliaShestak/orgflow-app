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
    const { agendaItems, memberIds, ...baseData } = activityCreateSchema.parse(input)

    const activity = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      const act = await tx.activity.create({ data: baseData })

      if (agendaItems.length > 0) {
        await tx.activityAgendaItem.createMany({
          data: agendaItems.map((item, i) => ({
            activityId: act.id,
            order: i,
            text: item.kind === 'text' ? item.text : null,
            knowledgeTopicId: item.kind === 'topic' ? item.knowledgeTopicId : null,
          })),
        })
      }

      if (memberIds.length > 0) {
        await tx.activityAttendance.createMany({
          data: memberIds.map((memberId) => ({ activityId: act.id, memberId })),
        })
      }

      return act
    })

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

    await prisma.activityAttendance.upsert({
      where: { activity_attendance_unique: { activityId, memberId } },
      create: { activityId, memberId },
      update: {},
    })

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

export async function setAttendance(activityId: string, memberIds: string[]) {
  try {
    await requireRole(Role.Admin, Role.VP4HR)
    await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      await tx.activityAttendance.deleteMany({ where: { activityId } })
      if (memberIds.length > 0) {
        await tx.activityAttendance.createMany({
          data: memberIds.map((memberId) => ({ activityId, memberId })),
        })
      }
    })
    revalidatePath(`/activities/${activityId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка збереження відвідуваності' }
  }
}

export async function syncCoverageForActivity(activityId: string) {
  try {
    const session = await getSession()
    if (!session?.user) throw new Error('Unauthorized')

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        agendaItems: {
          where: { knowledgeTopicId: { not: null } },
          select: { knowledgeTopicId: true },
        },
        attendance: { select: { memberId: true } },
      },
    })

    if (!activity) return { success: true }

    const topicIds = activity.agendaItems
      .map((i) => i.knowledgeTopicId)
      .filter((id): id is string => id !== null)
    const memberIds = activity.attendance.map((a) => a.memberId)

    if (!topicIds.length || !memberIds.length) return { success: true }

    await Promise.all(
      memberIds.flatMap((memberId) =>
        topicIds.map((knowledgeTopicId) =>
          prisma.knowledgeCoverage.upsert({
            where: { knowledge_coverage_unique: { memberId, knowledgeTopicId } },
            create: { memberId, knowledgeTopicId, sourceActivityId: activityId },
            update: {},
          })
        )
      )
    )

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка синхронізації покриття' }
  }
}
