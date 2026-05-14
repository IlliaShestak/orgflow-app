'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { updateTransferTypeSchema } from '../validators/adminSchema'
import { updateTransferType as updateTransferTypeInDb } from '../repository/referenceRepository'

export async function updateTransferType(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  const parsed = updateTransferTypeSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await updateTransferTypeInDb(parsed.data.id, parsed.data.name)
    revalidatePath('/admin/references')
    return { success: true }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { error: 'Тип з такою назвою вже існує' }
    }
    return { error: 'Помилка при оновленні типу' }
  }
}
