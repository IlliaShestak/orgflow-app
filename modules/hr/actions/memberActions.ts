'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import {
  memberCreateSchema, memberUpdateSchema, MemberCreateInput, MemberUpdateInput,
  appHistoryCreateSchema, appHistoryUpdateSchema, AppHistoryCreateInput, AppHistoryUpdateInput,
} from '../validators/memberSchema'

export async function createMember(input: MemberCreateInput) {
  try {
    await requireRole('Admin', 'VP4HR')
    const data = memberCreateSchema.parse(input)
    const member = await prisma.member.create({ data })
    revalidatePath('/information-book')
    return { success: true, data: member }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка створення учасника' }
  }
}

export async function updateMember(input: MemberUpdateInput) {
  try {
    const session = await import('@/shared/lib/auth').then(m => m.getSession())
    if (!session) throw new Error('Unauthorized')

    const role = session.user.role
    const { id, ...data } = memberUpdateSchema.parse(input)

    if (role === 'FullMember') {
      const { getMemberByUserId } = await import('../repository/memberRepository')
      const selfMember = await getMemberByUserId(session.user.id)
      if (!selfMember) throw new Error('Unauthorized')
      const isSelf = selfMember.id === id
      const isMentee = selfMember.mentees.some((m: { id: string }) => m.id === id)
      if (!isSelf && !isMentee) throw new Error('Unauthorized')
      // FullMember can only update contact fields on their own record
      if (isSelf) {
        const member = await prisma.member.update({
          where: { id },
          data: { email: data.email, phone: data.phone, telegram: data.telegram, instagram: data.instagram, facebook: data.facebook, studyYear: data.studyYear },
        })
        revalidatePath('/information-book')
        revalidatePath(`/information-book/${id}`)
        return { success: true, data: member }
      }
    } else if (role !== 'Admin' && role !== 'VP4HR') {
      throw new Error('Unauthorized')
    }

    const member = await prisma.member.update({ where: { id }, data })
    revalidatePath('/information-book')
    revalidatePath(`/information-book/${id}`)
    return { success: true, data: member }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка оновлення учасника' }
  }
}

async function requireHistoryAccess(memberId: string) {
  const session = await import('@/shared/lib/auth').then(m => m.getSession())
  if (!session?.user) throw new Error('Unauthorized')
  const role = session.user.role as string
  if (role === 'Admin' || role === 'VP4HR') return
  if (role === 'FullMember') {
    const { getMemberByUserId } = await import('../repository/memberRepository')
    const self = await getMemberByUserId(session.user.id)
    if (self && (self.id === memberId || self.mentees.some((m: { id: string }) => m.id === memberId))) return
  }
  throw new Error('Unauthorized')
}

export async function createApplicationHistory(input: AppHistoryCreateInput) {
  try {
    const data = appHistoryCreateSchema.parse(input)
    await requireHistoryAccess(data.memberId)
    const record = await prisma.applicationHistory.create({ data })
    revalidatePath(`/information-book/${data.memberId}`)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка створення запису' }
  }
}

export async function updateApplicationHistory(input: AppHistoryUpdateInput) {
  try {
    const { id, memberId, ...data } = appHistoryUpdateSchema.parse(input)
    await requireHistoryAccess(memberId)
    const record = await prisma.applicationHistory.update({ where: { id }, data })
    revalidatePath(`/information-book/${memberId}`)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка оновлення запису' }
  }
}

export async function deleteApplicationHistory(id: string, memberId: string) {
  try {
    await requireHistoryAccess(memberId)
    await prisma.applicationHistory.delete({ where: { id } })
    revalidatePath(`/information-book/${memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення запису' }
  }
}

export async function deleteMember(id: string) {
  try {
    await requireRole('Admin', 'VP4HR')

    const member = await prisma.member.findUnique({ where: { id }, select: { userId: true } })

    await prisma.$transaction([
      // Unlink mentees (keep them, just clear the mentor reference)
      prisma.member.updateMany({ where: { mentorId: id }, data: { mentorId: null } }),
      prisma.teamMembership.deleteMany({ where: { memberId: id } }),
      prisma.activityAttendance.deleteMany({ where: { memberId: id } }),
      prisma.knowledgeCoverage.deleteMany({ where: { memberId: id } }),
      prisma.applicationHistory.deleteMany({ where: { memberId: id } }),
      prisma.member.delete({ where: { id } }),
    ])

    // Delete linked user account after member is gone
    if (member?.userId) {
      await prisma.user.delete({ where: { id: member.userId } })
    }

    revalidatePath('/information-book')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення учасника' }
  }
}
