'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { deleteTransferType as deleteTransferTypeInDb } from '../repository/referenceRepository'

export async function deleteTransferType(id: string) {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  if (!id) return { error: 'Невірний ідентифікатор' }

  try {
    await deleteTransferTypeInDb(id)
    revalidatePath('/admin/references')
    return { success: true }
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { error: e.message }
    }
    return { error: 'Помилка при видаленні типу' }
  }
}
