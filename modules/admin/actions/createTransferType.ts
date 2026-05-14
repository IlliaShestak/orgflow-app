'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createTransferTypeSchema } from '../validators/adminSchema'
import { createTransferType as createTransferTypeInDb } from '../repository/referenceRepository'

export async function createTransferType(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  const parsed = createTransferTypeSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await createTransferTypeInDb(parsed.data.name)
    revalidatePath('/admin/references')
    return { success: true }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { error: 'Тип з такою назвою вже існує' }
    }
    return { error: 'Помилка при створенні типу' }
  }
}
