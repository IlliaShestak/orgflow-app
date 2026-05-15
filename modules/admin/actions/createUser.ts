'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createUserSchema } from '../validators/adminSchema'
import { createUser as createUserInDb } from '../repository/adminRepository'
import { Role } from '@prisma/client'

export async function createUser(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'Admin') redirect('/information-book')

  const raw = {
    email: formData.get('email'),
    role: formData.get('role'),
    memberId: formData.get('memberId') || undefined,
  }

  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const { generatedPassword } = await createUserInDb({
      email: parsed.data.email,
      role: parsed.data.role as Role,
      memberId: parsed.data.memberId,
    })
    revalidatePath('/admin/users')
    return { success: true, generatedPassword }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { error: 'Користувач з таким email вже існує' }
    }
    return { error: 'Помилка при створенні користувача' }
  }
}
