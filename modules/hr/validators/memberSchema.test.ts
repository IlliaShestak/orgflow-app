import { describe, it, expect } from 'vitest'
import { memberCreateSchema } from './memberSchema'

describe('memberCreateSchema', () => {
  it('rejects missing required fields', () => {
    const result = memberCreateSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('firstName')
      expect(paths).toContain('lastName')
      expect(paths).toContain('joinedAt')
    }
  })

  it('accepts valid minimal member data', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('Observer')
      expect(result.data.state).toBe('Active')
    }
  })

  it('rejects invalid email', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid full member data', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Марія',
      lastName: 'Шевченко',
      joinedAt: new Date('2023-09-01'),
      email: 'maria@example.com',
      status: 'Full',
      state: 'Active',
      gender: 'Female',
      studyYear: 3,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status value', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      status: 'Unknown',
    })
    expect(result.success).toBe(false)
  })
})
