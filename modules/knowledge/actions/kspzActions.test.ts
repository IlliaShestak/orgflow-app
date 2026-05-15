import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/shared/lib/auth', () => ({ requireRole: vi.fn(), getSession: vi.fn() }))
vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    knowledgeTable: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    knowledgeTopic: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), aggregate: vi.fn() },
    knowledgeCoverage: { upsert: vi.fn(), deleteMany: vi.fn() },
    member: { findFirst: vi.fn() },
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createKspzTable, createKspzTopic, toggleKspzCoverage } from './kspzActions'
import { requireRole, getSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'

const mockRequireRole = vi.mocked(requireRole)
const mockGetSession = vi.mocked(getSession)
const mockTableCreate = vi.mocked(prisma.knowledgeTable.create)
const mockTopicCreate = vi.mocked(prisma.knowledgeTopic.create)
const mockTopicAggregate = vi.mocked(prisma.knowledgeTopic.aggregate)
const mockCoverageUpsert = vi.mocked(prisma.knowledgeCoverage.upsert)
const mockCoverageDeleteMany = vi.mocked(prisma.knowledgeCoverage.deleteMany)
const mockMemberFindFirst = vi.mocked(prisma.member.findFirst)

describe('createKspzTable', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a table with name and transferTypeIds successfully', async () => {
    const mockTable = { id: 'table-1', name: 'Таблиця 1', targetStatus: 'Observer' }
    mockRequireRole.mockResolvedValueOnce(undefined)
    mockTableCreate.mockResolvedValueOnce(mockTable as never)

    const result = await createKspzTable({
      name: 'Таблиця 1',
      targetStatus: 'Observer',
      transferTypeIds: ['type-1', 'type-2'],
    })

    expect(result).toEqual({ success: true, data: mockTable })
    expect(mockTableCreate).toHaveBeenCalledWith({
      data: {
        name: 'Таблиця 1',
        targetStatus: 'Observer',
        columns: {
          create: [
            { knowledgeTransferTypeId: 'type-1' },
            { knowledgeTransferTypeId: 'type-2' },
          ],
        },
      },
    })
  })

  it('returns unauthorized when requireRole throws', async () => {
    mockRequireRole.mockRejectedValueOnce(new Error('Unauthorized'))

    const result = await createKspzTable({
      name: 'Таблиця 1',
      targetStatus: null,
      transferTypeIds: ['type-1'],
    })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockTableCreate).not.toHaveBeenCalled()
  })
})

describe('createKspzTopic', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a topic with order = maxOrder + 1', async () => {
    mockRequireRole.mockResolvedValueOnce(undefined)
    mockTopicAggregate.mockResolvedValueOnce({ _max: { order: 2 } } as never)
    const mockTopic = { id: 'topic-1', name: 'Тема', knowledgeTableId: 'table-1', order: 3 }
    mockTopicCreate.mockResolvedValueOnce(mockTopic as never)

    const result = await createKspzTopic({ knowledgeTableId: 'table-1', name: 'Тема' })

    expect(result).toEqual({ success: true, data: mockTopic })
    expect(mockTopicCreate).toHaveBeenCalledWith({
      data: { knowledgeTableId: 'table-1', name: 'Тема', order: 3 },
    })
  })

  it('uses order 0 when no topics exist yet (maxOrder is null)', async () => {
    mockRequireRole.mockResolvedValueOnce(undefined)
    mockTopicAggregate.mockResolvedValueOnce({ _max: { order: null } } as never)
    const mockTopic = { id: 'topic-1', name: 'Перша тема', knowledgeTableId: 'table-1', order: 0 }
    mockTopicCreate.mockResolvedValueOnce(mockTopic as never)

    const result = await createKspzTopic({ knowledgeTableId: 'table-1', name: 'Перша тема' })

    expect(result).toEqual({ success: true, data: mockTopic })
    expect(mockTopicCreate).toHaveBeenCalledWith({
      data: { knowledgeTableId: 'table-1', name: 'Перша тема', order: 0 },
    })
  })
})

describe('toggleKspzCoverage', () => {
  beforeEach(() => vi.clearAllMocks())

  const baseInput = {
    memberId: 'member-1',
    knowledgeTopicId: 'topic-1',
    knowledgeTransferTypeId: 'type-1',
  }

  it('calls upsert when covered=true', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-admin', role: 'Admin' },
      expires: '',
    } as never)
    mockCoverageUpsert.mockResolvedValueOnce({} as never)

    const result = await toggleKspzCoverage({ ...baseInput, covered: true })

    expect(result).toEqual({ success: true })
    expect(mockCoverageUpsert).toHaveBeenCalledOnce()
    expect(mockCoverageDeleteMany).not.toHaveBeenCalled()
  })

  it('calls deleteMany when covered=false', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-admin', role: 'Admin' },
      expires: '',
    } as never)
    mockCoverageDeleteMany.mockResolvedValueOnce({ count: 1 } as never)

    const result = await toggleKspzCoverage({ ...baseInput, covered: false })

    expect(result).toEqual({ success: true })
    expect(mockCoverageDeleteMany).toHaveBeenCalledWith({
      where: { memberId: 'member-1', knowledgeTopicId: 'topic-1', knowledgeTransferTypeId: 'type-1' },
    })
    expect(mockCoverageUpsert).not.toHaveBeenCalled()
  })

  it('returns unauthorized when FullMember tries to toggle coverage for unrelated member', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'FullMember' },
      expires: '',
    } as never)
    mockMemberFindFirst.mockResolvedValueOnce({
      id: 'member-self',
      mentees: [{ id: 'mentee-1' }],
    } as never)

    const result = await toggleKspzCoverage({ ...baseInput, memberId: 'unrelated-member', covered: true })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockCoverageUpsert).not.toHaveBeenCalled()
  })
})
