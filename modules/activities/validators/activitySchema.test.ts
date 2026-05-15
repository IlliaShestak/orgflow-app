import {
  activityCreateSchema,
  activityUpdateSchema,
  saveAgendaSchema,
  markAttendanceSchema,
} from './activitySchema'

describe('activityCreateSchema', () => {
  it('rejects missing required fields', () => {
    const result = activityCreateSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('type')
      expect(paths).toContain('date')
    }
  })

  it('accepts valid full data', () => {
    const result = activityCreateSchema.safeParse({
      type: 'Gathering',
      date: new Date('2024-03-15'),
      description: 'Щотижневий збір',
    })
    expect(result.success).toBe(true)
  })

  it('rejects unknown type', () => {
    const result = activityCreateSchema.safeParse({
      type: 'Workshop',
      date: new Date(),
      description: 'Опис',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid activity types', () => {
    for (const type of ['Gathering', 'SIT', 'LeisureEvent']) {
      const result = activityCreateSchema.safeParse({
        type,
        date: new Date(),
        description: 'Опис заходу',
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects empty description', () => {
    const result = activityCreateSchema.safeParse({
      type: 'SIT',
      date: new Date(),
      description: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('activityUpdateSchema', () => {
  it('requires id', () => {
    const result = activityUpdateSchema.safeParse({
      type: 'Gathering',
      date: new Date(),
      description: 'Опис',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('id')
    }
  })

  it('accepts valid update with cuid id', () => {
    const result = activityUpdateSchema.safeParse({
      id: 'clh1234567890abcdefghijklm',
      type: 'LeisureEvent',
      date: new Date(),
      description: 'Оновлений опис',
    })
    expect(result.success).toBe(true)
  })
})

describe('saveAgendaSchema', () => {
  it('requires activityId and items', () => {
    const result = saveAgendaSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('activityId')
      expect(paths).toContain('items')
    }
  })

  it('accepts item with text', () => {
    const result = saveAgendaSchema.safeParse({
      activityId: 'clh1234567890abcdefghijklm',
      items: [{ order: 0, text: 'Вступне слово', knowledgeTopicId: null }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts item with knowledgeTopicId', () => {
    const result = saveAgendaSchema.safeParse({
      activityId: 'clh1234567890abcdefghijklm',
      items: [{ order: 0, text: null, knowledgeTopicId: 'clh1234567890abcdefghijkln' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty items array', () => {
    const result = saveAgendaSchema.safeParse({
      activityId: 'clh1234567890abcdefghijklm',
      items: [],
    })
    expect(result.success).toBe(true)
  })
})

describe('markAttendanceSchema', () => {
  it('requires activityId and memberId', () => {
    const result = markAttendanceSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('activityId')
      expect(paths).toContain('memberId')
    }
  })

  it('accepts valid activityId and memberId', () => {
    const result = markAttendanceSchema.safeParse({
      activityId: 'clh1234567890abcdefghijklm',
      memberId: 'clh1234567890abcdefghijkln',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-cuid ids', () => {
    const result = markAttendanceSchema.safeParse({
      activityId: 'not-a-cuid',
      memberId: 'also-not-a-cuid',
    })
    expect(result.success).toBe(false)
  })
})
