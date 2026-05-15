import { prisma } from '@/shared/lib/prisma'
import { Role } from '@prisma/client'
import { hash } from 'bcryptjs'
import { UserWithMember, MemberForSelect } from '../types'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function getUserList(): Promise<UserWithMember[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      generatedPassword: true,
      createdAt: true,
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createUser(data: {
  email: string
  role: Role
  memberId?: string
}): Promise<{ generatedPassword: string }> {
  const plainPassword = generatePassword()
  const passwordHash = await hash(plainPassword, 10)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      role: data.role,
      passwordHash,
      generatedPassword: plainPassword,
    },
  })

  if (data.memberId) {
    await prisma.member.update({
      where: { id: data.memberId },
      data: { userId: user.id },
    })
  }

  return { generatedPassword: plainPassword }
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.member.updateMany({
    where: { userId },
    data: { userId: null },
  })
  await prisma.user.delete({
    where: { id: userId },
  })
}

export async function getMembersForSelect(): Promise<MemberForSelect[]> {
  return prisma.member.findMany({
    where: { userId: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })
}
