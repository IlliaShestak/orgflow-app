import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/shared/lib/auth', () => ({
  requireRole: vi.fn(),
  getSession: vi.fn(),
}))
vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    member: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/modules/hr/repository/memberRepository', () => ({
  getMemberByUserId: vi.fn(),
}))

import { createMember, updateMember, deleteMember } from './memberActions'
import { requireRole, getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { getMemberByUserId } from '@/modules/hr/repository/memberRepository'

const mockRequireRole = vi.mocked(requireRole)
const mockGetSession = vi.mocked(getSession)
const mockMemberCreate = vi.mocked(prisma.member.create)
const mockMemberUpdate = vi.mocked(prisma.member.update)
const mockMemberDelete = vi.mocked(prisma.member.delete)
const mockGetMemberByUserId = vi.mocked(getMemberByUserId)

const validCreateInput = {
  firstName: 'Іван',
  lastName: 'Петренко',
  joinedAt: new Date('2023-09-01'),
  status: 'Observer' as const,
  state: 'Active' as const,
}

describe('createMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a member successfully when role is allowed', async () => {
    const mockMember = { id: 'member-1', ...validCreateInput }
    mockRequireRole.mockResolvedValueOnce(undefined)
    mockMemberCreate.mockResolvedValueOnce(mockMember as never)

    const result = await createMember(validCreateInput)

    expect(result).toEqual({ success: true, data: mockMember })
    expect(mockMemberCreate).toHaveBeenCalledOnce()
  })

  it('returns unauthorized error when requireRole throws', async () => {
    mockRequireRole.mockRejectedValueOnce(new Error('Unauthorized'))

    const result = await createMember(validCreateInput)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockMemberCreate).not.toHaveBeenCalled()
  })

  it('returns validation error when firstName is missing', async () => {
    mockRequireRole.mockResolvedValueOnce(undefined)

    const result = await createMember({ lastName: 'Петренко', joinedAt: new Date() } as never)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(mockMemberCreate).not.toHaveBeenCalled()
  })
})

describe('updateMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('allows Admin to update any member', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-admin', role: 'Admin' },
      expires: '',
    } as never)
    const mockMember = { id: 'member-1', firstName: 'Оновлено', lastName: 'Петренко' }
    mockMemberUpdate.mockResolvedValueOnce(mockMember as never)

    const result = await updateMember({ id: 'member-1', firstName: 'Оновлено' })

    expect(result).toEqual({ success: true, data: mockMember })
    // memberUpdateSchema.partial() preserves defaults for provided enum fields
    expect(mockMemberUpdate).toHaveBeenCalledWith({
      where: { id: 'member-1' },
      data: expect.objectContaining({ firstName: 'Оновлено' }),
    })
  })

  it('allows FullMember to update own member record', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'FullMember' },
      expires: '',
    } as never)
    mockGetMemberByUserId.mockResolvedValueOnce({
      id: 'member-self',
      mentees: [],
    } as never)
    const mockMember = { id: 'member-self', firstName: 'Оновлено', lastName: 'Петренко' }
    mockMemberUpdate.mockResolvedValueOnce(mockMember as never)

    const result = await updateMember({ id: 'member-self', firstName: 'Оновлено' })

    expect(result).toEqual({ success: true, data: mockMember })
  })

  it('returns unauthorized when FullMember tries to update unrelated member', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'FullMember' },
      expires: '',
    } as never)
    mockGetMemberByUserId.mockResolvedValueOnce({
      id: 'member-self',
      mentees: [{ id: 'mentee-1' }],
    } as never)

    const result = await updateMember({ id: 'unrelated-member', firstName: 'Hack' })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockMemberUpdate).not.toHaveBeenCalled()
  })
})

describe('deleteMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a member successfully', async () => {
    mockRequireRole.mockResolvedValueOnce(undefined)
    mockMemberDelete.mockResolvedValueOnce({} as never)

    const result = await deleteMember('member-1')

    expect(result).toEqual({ success: true })
    expect(mockMemberDelete).toHaveBeenCalledWith({ where: { id: 'member-1' } })
  })

  it('returns unauthorized error when requireRole throws', async () => {
    mockRequireRole.mockRejectedValueOnce(new Error('Unauthorized'))

    const result = await deleteMember('member-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockMemberDelete).not.toHaveBeenCalled()
  })
})
