'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { memberCreateSchema, memberUpdateSchema, MemberCreateInput, MemberUpdateInput } from '../validators/memberSchema'

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

export async function deleteMember(id: string) {
  try {
    await requireRole('Admin', 'VP4HR')
    await prisma.member.delete({ where: { id } })
    revalidatePath('/information-book')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Помилка видалення учасника' }
  }
}
