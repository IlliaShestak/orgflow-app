'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createTeamSchema } from '../validators/teamSchema'
import { createTeam as createTeamInDb, createCoreteamPositions } from '../repository/teamRepository'
import { TeamType } from '@prisma/client'

export async function createTeam(formData: FormData) {
  const session = await auth()
  if (!session || (session.user.role !== 'Admin' && session.user.role !== 'VP4HR')) {
    redirect('/information-book')
  }

  const raw = {
    name: formData.get('name'),
    type: formData.get('type'),
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  }

  const parsed = createTeamSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const team = await createTeamInDb({
      name: parsed.data.name,
      type: parsed.data.type as TeamType,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    })
    if (parsed.data.type === 'Coreteam') {
      await createCoreteamPositions(team.id)
    }
    revalidatePath('/teams')
    return { success: true, id: team.id }
  } catch {
    return { error: 'Помилка при створенні команди' }
  }
}
