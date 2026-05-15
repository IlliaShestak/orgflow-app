import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockPrisma = vi.hoisted(() => {
  const mp = {
    activity: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    activityAttendance: { upsert: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    activityAgendaItem: { deleteMany: vi.fn(), createMany: vi.fn(), findMany: vi.fn() },
    knowledgeCoverage: { upsert: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction: vi.fn(),
  }
  mp.$transaction.mockImplementation(async (fn: (tx: typeof mp) => Promise<unknown>) => fn(mp))
  return mp
})

vi.mock('@/shared/lib/auth', () => ({ requireRole: vi.fn(), getSession: vi.fn() }))
vi.mock('@/shared/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/modules/hr/repository/memberRepository', () => ({
  getMemberByUserId: vi.fn(),
}))

import { createActivity, markAttendance, removeAttendance, saveAgenda } from './activityActions'
import { requireRole, getSession } from '@/shared/lib/auth'
import { getMemberByUserId } from '@/modules/hr/repository/memberRepository'

const VALID_CUID = 'clxxxxxxxxxxxxxxxxxxxxxx01'
const VALID_CUID2 = 'clxxxxxxxxxxxxxxxxxxxxxx02'

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma))
})

// ---------------------------------------------------------------------------
// createActivity
// ---------------------------------------------------------------------------

describe('createActivity', () => {
  it('returns success true when role is authorised and activity is created', async () => {
    vi.mocked(requireRole).mockResolvedValue(undefined)
    const mockActivity = { id: VALID_CUID, name: 'Збір', type: 'Gathering', date: new Date(), description: null }
    mockPrisma.activity.create.mockResolvedValue(mockActivity)

    const result = await createActivity({ name: 'Збір', type: 'Gathering', date: new Date() })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockActivity)
  })

  it('creates agenda items inside the transaction when provided', async () => {
    vi.mocked(requireRole).mockResolvedValue(undefined)
    mockPrisma.activity.create.mockResolvedValue({ id: VALID_CUID })
    mockPrisma.activityAgendaItem.createMany.mockResolvedValue({ count: 1 })

    await createActivity({
      name: 'Захід',
      type: 'SIT',
      date: new Date(),
      agendaItems: [{ kind: 'text', text: 'Привітання' }],
    })

    expect(mockPrisma.activityAgendaItem.createMany).toHaveBeenCalledWith({
      data: [{ activityId: VALID_CUID, order: 0, text: 'Привітання', knowledgeTopicId: null }],
    })
  })

  it('creates attendance records inside the transaction when memberIds provided', async () => {
    vi.mocked(requireRole).mockResolvedValue(undefined)
    mockPrisma.activity.create.mockResolvedValue({ id: VALID_CUID })
    mockPrisma.activityAttendance.createMany.mockResolvedValue({ count: 1 })

    await createActivity({
      name: 'Захід',
      type: 'Gathering',
      date: new Date(),
      memberIds: [VALID_CUID2],
    })

    expect(mockPrisma.activityAttendance.createMany).toHaveBeenCalledWith({
      data: [{ activityId: VALID_CUID, memberId: VALID_CUID2 }],
    })
  })

  it('returns success false when requireRole throws Unauthorized', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('Unauthorized'))

    const result = await createActivity({ name: 'Захід', type: 'Gathering', date: new Date() })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })
})

// ---------------------------------------------------------------------------
// saveAgenda
// ---------------------------------------------------------------------------

describe('saveAgenda', () => {
  it('returns success true and calls $transaction on valid input', async () => {
    vi.mocked(requireRole).mockResolvedValue(undefined)
    mockPrisma.activityAgendaItem.deleteMany.mockResolvedValue({ count: 0 })
    mockPrisma.activityAgendaItem.createMany.mockResolvedValue({ count: 2 })

    const result = await saveAgenda({
      activityId: VALID_CUID,
      items: [
        { order: 0, text: 'Item 1', knowledgeTopicId: null },
        { order: 1, text: null, knowledgeTopicId: VALID_CUID2 },
      ],
    })

    expect(result.success).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })

  it('passes items correctly into createMany', async () => {
    vi.mocked(requireRole).mockResolvedValue(undefined)
    mockPrisma.activityAgendaItem.deleteMany.mockResolvedValue({ count: 0 })
    mockPrisma.activityAgendaItem.createMany.mockResolvedValue({ count: 1 })

    await saveAgenda({
      activityId: VALID_CUID,
      items: [{ order: 0, text: 'Hello', knowledgeTopicId: null }],
    })

    expect(mockPrisma.activityAgendaItem.createMany).toHaveBeenCalledWith({
      data: [{ activityId: VALID_CUID, order: 0, text: 'Hello', knowledgeTopicId: null }],
    })
  })

  it('skips createMany when items array is empty', async () => {
    vi.mocked(requireRole).mockResolvedValue(undefined)
    mockPrisma.activityAgendaItem.deleteMany.mockResolvedValue({ count: 0 })

    const result = await saveAgenda({ activityId: VALID_CUID, items: [] })

    expect(result.success).toBe(true)
    expect(mockPrisma.activityAgendaItem.createMany).not.toHaveBeenCalled()
  })

  it('returns success false when requireRole throws', async () => {
    vi.mocked(requireRole).mockRejectedValue(new Error('Unauthorized'))

    const result = await saveAgenda({ activityId: VALID_CUID, items: [] })

    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// markAttendance — auto-knowledge-coverage business rule
// ---------------------------------------------------------------------------

describe('markAttendance', () => {
  it('auto-assigns knowledge coverage per topic when agenda has topic items', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1', role: 'Admin' } } as any)
    mockPrisma.activityAttendance.upsert.mockResolvedValue({})
    mockPrisma.activityAgendaItem.findMany.mockResolvedValue([{ knowledgeTopicId: 'topic-1' }])
    mockPrisma.knowledgeCoverage.upsert.mockResolvedValue({})

    const result = await markAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(result.success).toBe(true)
    expect(mockPrisma.knowledgeCoverage.upsert).toHaveBeenCalledTimes(1)
    expect(mockPrisma.knowledgeCoverage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          memberId: VALID_CUID2,
          knowledgeTopicId: 'topic-1',
        }),
      })
    )
  })

  it('does not upsert coverage when agenda has no topic items', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1', role: 'Admin' } } as any)
    mockPrisma.activityAttendance.upsert.mockResolvedValue({})
    mockPrisma.activityAgendaItem.findMany.mockResolvedValue([])

    const result = await markAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(result.success).toBe(true)
    expect(mockPrisma.knowledgeCoverage.upsert).not.toHaveBeenCalled()
  })

  it('records sourceActivityId on each coverage upsert', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1', role: 'Admin' } } as any)
    mockPrisma.activityAttendance.upsert.mockResolvedValue({})
    mockPrisma.activityAgendaItem.findMany.mockResolvedValue([{ knowledgeTopicId: 'topic-1' }])
    mockPrisma.knowledgeCoverage.upsert.mockResolvedValue({})

    await markAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(mockPrisma.knowledgeCoverage.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ sourceActivityId: VALID_CUID }),
      })
    )
  })

  it('upserts coverage once per topic when multiple topics in agenda', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1', role: 'Admin' } } as any)
    mockPrisma.activityAttendance.upsert.mockResolvedValue({})
    mockPrisma.activityAgendaItem.findMany.mockResolvedValue([
      { knowledgeTopicId: 'topic-1' },
      { knowledgeTopicId: 'topic-2' },
    ])
    mockPrisma.knowledgeCoverage.upsert.mockResolvedValue({})

    await markAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(mockPrisma.knowledgeCoverage.upsert).toHaveBeenCalledTimes(2)
  })

  it('FullMember can mark attendance for self', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u-self', role: 'FullMember' } } as any)
    vi.mocked(getMemberByUserId).mockResolvedValue({ id: VALID_CUID2, mentees: [] } as any)
    mockPrisma.activityAttendance.upsert.mockResolvedValue({})
    mockPrisma.activityAgendaItem.findMany.mockResolvedValue([])

    const result = await markAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(result.success).toBe(true)
  })

  it('FullMember can mark attendance for own mentee', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u-self', role: 'FullMember' } } as any)
    const menteeId = 'clxxxxxxxxxxxxxxxxxxxxxx03'
    vi.mocked(getMemberByUserId).mockResolvedValue({
      id: VALID_CUID2,
      mentees: [{ id: menteeId }],
    } as any)
    mockPrisma.activityAttendance.upsert.mockResolvedValue({})
    mockPrisma.activityAgendaItem.findMany.mockResolvedValue([])

    const result = await markAttendance({ activityId: VALID_CUID, memberId: menteeId })

    expect(result.success).toBe(true)
  })

  it('FullMember cannot mark attendance for unrelated member', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u-self', role: 'FullMember' } } as any)
    vi.mocked(getMemberByUserId).mockResolvedValue({ id: VALID_CUID2, mentees: [] } as any)

    const unrelatedId = 'clxxxxxxxxxxxxxxxxxxxxxx99'
    const result = await markAttendance({ activityId: VALID_CUID, memberId: unrelatedId })

    expect(result.success).toBe(false)
    expect(mockPrisma.activityAttendance.upsert).not.toHaveBeenCalled()
  })

  it('returns success false when session is missing', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const result = await markAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// removeAttendance
// ---------------------------------------------------------------------------

describe('removeAttendance', () => {
  it('calls deleteMany and returns success true for Admin', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u1', role: 'Admin' } } as any)
    mockPrisma.activityAttendance.deleteMany.mockResolvedValue({ count: 1 })

    const result = await removeAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(result.success).toBe(true)
    expect(mockPrisma.activityAttendance.deleteMany).toHaveBeenCalledWith({
      where: { activityId: VALID_CUID, memberId: VALID_CUID2 },
    })
  })

  it('FullMember cannot remove attendance for unrelated member', async () => {
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'u-self', role: 'FullMember' } } as any)
    vi.mocked(getMemberByUserId).mockResolvedValue({ id: VALID_CUID2, mentees: [] } as any)

    const unrelatedId = 'clxxxxxxxxxxxxxxxxxxxxxx99'
    const result = await removeAttendance({ activityId: VALID_CUID, memberId: unrelatedId })

    expect(result.success).toBe(false)
    expect(mockPrisma.activityAttendance.deleteMany).not.toHaveBeenCalled()
  })

  it('returns success false when session is missing', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const result = await removeAttendance({ activityId: VALID_CUID, memberId: VALID_CUID2 })

    expect(result.success).toBe(false)
  })
})
