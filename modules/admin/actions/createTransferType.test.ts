import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('../repository/referenceRepository', () => ({
  createTransferType: vi.fn(),
}))

import { createTransferType } from './createTransferType'
import { auth } from '@/auth'
import { createTransferType as createTransferTypeInDb } from '../repository/referenceRepository'

const mockAuth = vi.mocked(auth)
const mockCreateInDb = vi.mocked(createTransferTypeInDb)

function makeFormData(name: string): FormData {
  const fd = new FormData()
  fd.append('name', name)
  return fd
}

describe('createTransferType', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a transfer type successfully for Admin', async () => {
    mockAuth.mockResolvedValueOnce({ user: { role: 'Admin' }, expires: '' } as never)
    mockCreateInDb.mockResolvedValueOnce({ id: 'tt-1', name: 'Training' } as never)

    const result = await createTransferType(makeFormData('Training'))

    expect(result).toEqual({ success: true })
    expect(mockCreateInDb).toHaveBeenCalledWith('Training')
  })

  it('returns validation error when name is empty', async () => {
    mockAuth.mockResolvedValueOnce({ user: { role: 'Admin' }, expires: '' } as never)

    const result = await createTransferType(makeFormData(''))

    expect(result).toHaveProperty('error')
    expect(mockCreateInDb).not.toHaveBeenCalled()
  })

  it('returns error when transfer type name already exists (Unique constraint)', async () => {
    mockAuth.mockResolvedValueOnce({ user: { role: 'Admin' }, expires: '' } as never)
    mockCreateInDb.mockRejectedValueOnce(new Error('Unique constraint failed'))

    const result = await createTransferType(makeFormData('Training'))

    expect(result).toEqual({ error: 'Тип з такою назвою вже існує' })
  })

  it('redirects non-Admin users away', async () => {
    mockAuth.mockResolvedValueOnce({ user: { role: 'VP4HR' }, expires: '' } as never)
    // Next.js redirect() throws a special error to abort execution; simulate that here
    const { redirect } = await import('next/navigation')
    vi.mocked(redirect).mockImplementationOnce(() => { throw new Error('NEXT_REDIRECT') })

    await expect(createTransferType(makeFormData('Training'))).rejects.toThrow('NEXT_REDIRECT')
    expect(mockCreateInDb).not.toHaveBeenCalled()
  })
})
