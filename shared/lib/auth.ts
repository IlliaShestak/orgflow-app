'use server'

import { auth } from '@/auth'
import { Role } from '@/generated/prisma'

export async function requireRole(...roles: Role[]): Promise<void> {
  const session = await auth()
  if (!session?.user || !roles.includes(session.user.role as Role)) {
    throw new Error('Unauthorized')
  }
}

export async function getSession() {
  return auth()
}
