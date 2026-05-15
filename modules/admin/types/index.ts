import { Role } from '@prisma/client'

export type UserWithMember = {
  id: string
  email: string
  role: Role
  generatedPassword: string | null
  createdAt: Date
  member: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export type MemberForSelect = {
  id: string
  firstName: string
  lastName: string
}

export type TransferType = {
  id: string
  name: string
}
