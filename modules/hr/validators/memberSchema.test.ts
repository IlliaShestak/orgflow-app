import { memberCreateSchema, memberUpdateSchema } from './memberSchema'

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

  it('rejects invalid gender value', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      gender: 'Unknown',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid state value', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      state: 'Pending',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative studyYear', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      studyYear: -1,
    })
    expect(result.success).toBe(false)
  })

  it('accepts null/undefined optional fields', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      email: null,
      phone: null,
      telegram: undefined,
      instagram: null,
      facebook: undefined,
      family: null,
      birthDate: null,
      studyYear: null,
      mentorId: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('memberUpdateSchema', () => {
  it('requires id field', () => {
    const result = memberUpdateSchema.safeParse({
      firstName: 'Іван',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('id')
    }
  })

  it('accepts partial update with id', () => {
    const result = memberUpdateSchema.safeParse({
      id: 'abc123',
      lastName: 'Шевченко',
    })
    expect(result.success).toBe(true)
  })

  it('accepts full update with id', () => {
    const result = memberUpdateSchema.safeParse({
      id: 'abc123',
      firstName: 'Марія',
      lastName: 'Шевченко',
      joinedAt: new Date(),
      status: 'Full',
      state: 'Active',
    })
    expect(result.success).toBe(true)
  })
})
