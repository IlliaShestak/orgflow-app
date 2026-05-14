'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createPositionSchema, assignMemberSchema, removeMemberSchema } from '../validators/teamSchema'
import {
  createPosition as createPositionInDb,
  deletePosition as deletePositionInDb,
  assignMember as assignMemberInDb,
  removeMember as removeMemberInDb,
  getTeamById,
} from '../repository/teamRepository'

function requireAdminOrVP(role: string) {
  return role === 'Admin' || role === 'VP4HR'
}

export async function createPosition(formData: FormData) {
  const session = await auth()
  if (!session || !requireAdminOrVP(session.user.role)) redirect('/information-book')

  const raw = {
    teamId: formData.get('teamId'),
    name: formData.get('name'),
    isHelper: formData.get('isHelper') === 'true',
  }

  const parsed = createPositionSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await createPositionInDb(parsed.data)
    revalidatePath(`/teams/${parsed.data.teamId}`)
    return { success: true }
  } catch {
    return { error: 'Помилка при створенні позиції' }
  }
}

export async function deletePosition(positionId: string, teamId: string) {
  const session = await auth()
  if (!session || !requireAdminOrVP(session.user.role)) redirect('/information-book')

  try {
    await deletePositionInDb(positionId)
    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (e: unknown) {
    if (e instanceof Error) return { error: e.message }
    return { error: 'Помилка при видаленні позиції' }
  }
}

export async function assignMember(formData: FormData) {
  const session = await auth()
  if (!session || !requireAdminOrVP(session.user.role)) redirect('/information-book')

  const raw = {
    positionId: formData.get('positionId'),
    memberId: formData.get('memberId'),
    startDate: formData.get('startDate'),
  }

  const parsed = assignMemberSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const teamId = formData.get('teamId') as string
  const positionName = formData.get('positionName') as string
  const teamName = formData.get('teamName') as string

  try {
    await assignMemberInDb({
      positionId: parsed.data.positionId,
      memberId: parsed.data.memberId,
      startDate: new Date(parsed.data.startDate),
      teamName,
      positionName,
    })
    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch {
    return { error: 'Помилка при призначенні учасника' }
  }
}

export async function removeMember(membershipId: string, teamId: string, endDate: string) {
  const session = await auth()
  if (!session || !requireAdminOrVP(session.user.role)) redirect('/information-book')

  const parsed = removeMemberSchema.safeParse({ membershipId, endDate })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await removeMemberInDb(parsed.data.membershipId, new Date(parsed.data.endDate))
    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch {
    return { error: 'Помилка при видаленні учасника з позиції' }
  }
}
