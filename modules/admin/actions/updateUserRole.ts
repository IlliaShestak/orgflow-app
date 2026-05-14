'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { updateUserRoleSchema } from '../validators/adminSchema'
import { updateUserRole as updateUserRoleInDb } from '../repository/adminRepository'
import { Role } from '@prisma/client'

export async function updateUserRole(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  const raw = {
    userId: formData.get('userId'),
    role: formData.get('role'),
  }

  const parsed = updateUserRoleSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await updateUserRoleInDb(parsed.data.userId, parsed.data.role as Role)
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { error: 'РџРѕРјРёР»РєР° РїСЂРё Р·РјС–РЅС– СЂРѕР»С–' }
  }
}
