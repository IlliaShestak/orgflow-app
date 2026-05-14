'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { deleteUser as deleteUserInDb } from '../repository/adminRepository'

export async function deleteUser(userId: string) {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  if (!userId) return { error: 'Невірний ідентифікатор' }

  try {
    await deleteUserInDb(userId)
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { error: 'Помилка при видаленні користувача' }
  }
}
