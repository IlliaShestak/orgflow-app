'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { updateTeamSchema } from '../validators/teamSchema'
import { updateTeam as updateTeamInDb, archiveTeam as archiveTeamInDb, unarchiveTeam as unarchiveTeamInDb } from '../repository/teamRepository'
import { TeamType } from '@prisma/client'

export async function updateTeam(formData: FormData) {
  const session = await auth()
  if (!session || (session.user.role !== 'Admin' && session.user.role !== 'VP4HR')) {
    redirect('/information-book')
  }

  const raw = {
    id: formData.get('id'),
    name: formData.get('name'),
    type: formData.get('type'),
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  }

  const parsed = updateTeamSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await updateTeamInDb(parsed.data.id, {
      name: parsed.data.name,
      type: parsed.data.type as TeamType,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    })
    revalidatePath('/teams')
    revalidatePath(`/teams/${parsed.data.id}`)
    return { success: true }
  } catch {
    return { error: 'Помилка при оновленні команди' }
  }
}

export async function archiveTeam(teamId: string) {
  const session = await auth()
  if (!session || (session.user.role !== 'Admin' && session.user.role !== 'VP4HR')) {
    redirect('/information-book')
  }

  try {
    await archiveTeamInDb(teamId)
    revalidatePath('/teams')
    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch {
    return { error: 'Помилка при архівуванні команди' }
  }
}

export async function unarchiveTeam(teamId: string) {
  const session = await auth()
  if (!session || (session.user.role !== 'Admin' && session.user.role !== 'VP4HR')) {
    redirect('/information-book')
  }

  try {
    await unarchiveTeamInDb(teamId)
    revalidatePath('/teams')
    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch {
    return { error: 'Помилка при розархівуванні команди' }
  }
}
