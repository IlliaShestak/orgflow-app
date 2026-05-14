import { prisma } from '@/shared/lib/prisma'
import { Role } from '@prisma/client'
import { UserWithMember, MemberForSelect } from '../types'

export async function getUserList(): Promise<UserWithMember[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
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
}): Promise<void> {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      role: data.role,
    },
  })

  if (data.memberId) {
    await prisma.member.update({
      where: { id: data.memberId },
      data: { userId: user.id },
    })
  }
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })
}

export async function deleteUser(userId: string): Promise<void> {
  // Unlink member before deleting user
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
