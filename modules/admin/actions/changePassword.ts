'use server'

import { auth } from '@/auth'
import { prisma } from '@/shared/lib/prisma'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Введіть поточний пароль'),
  newPassword: z.string().min(6, 'Пароль має бути не менше 6 символів'),
  confirmPassword: z.string().min(1, 'Підтвердіть пароль'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Паролі не співпадають',
  path: ['confirmPassword'],
})

export async function changePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: 'Не авторизовано' }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) return { error: 'Не вдалося знайти обліковий запис' }

  const valid = await compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return { error: 'Невірний поточний пароль' }

  const newHash = await hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash, generatedPassword: null },
  })

  return { success: true }
}
