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
      expect(paths).toContain('name')
      expect(paths).toContain('type')
      expect(paths).toContain('date')
    }
  })

  it('accepts valid data with only required fields', () => {
    const result = activityCreateSchema.safeParse({
      name: 'Щотижневий збір',
      type: 'Gathering',
      date: new Date('2024-03-15'),
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid data with all fields including optional', () => {
    const result = activityCreateSchema.safeParse({
      name: 'Збір',
      type: 'Gathering',
      date: new Date('2024-03-15'),
      description: 'Опис заходу',
    })
    expect(result.success).toBe(true)
  })

  it('accepts omitted description (now optional)', () => {
    const result = activityCreateSchema.safeParse({
      name: 'Захід без опису',
      type: 'SIT',
      date: new Date(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = activityCreateSchema.safeParse({
      name: '',
      type: 'SIT',
      date: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown type', () => {
    const result = activityCreateSchema.safeParse({
      name: 'Захід',
      type: 'Workshop',
      date: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid activity types', () => {
    for (const type of ['Gathering', 'SIT', 'LeisureEvent']) {
      const result = activityCreateSchema.safeParse({
        name: 'Захід',
        type,
        date: new Date(),
      })
      expect(result.success).toBe(true)
    }
  })

  it('accepts agenda items', () => {
    const result = activityCreateSchema.safeParse({
      name: 'Захід з порядком денним',
      type: 'Gathering',
      date: new Date(),
      agendaItems: [
        { kind: 'text', text: 'Привітання' },
        { kind: 'topic', knowledgeTopicId: 'clh1234567890abcdefghijklm' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts memberIds', () => {
    const result = activityCreateSchema.safeParse({
      name: 'Захід',
      type: 'SIT',
      date: new Date(),
      memberIds: ['clh1234567890abcdefghijklm'],
    })
    expect(result.success).toBe(true)
  })
})

describe('activityUpdateSchema', () => {
  it('requires id', () => {
    const result = activityUpdateSchema.safeParse({
      name: 'Назва',
      type: 'Gathering',
      date: new Date(),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('id')
    }
  })

  it('accepts valid update with cuid id', () => {
    const result = activityUpdateSchema.safeParse({
      id: 'clh1234567890abcdefghijklm',
      name: 'Оновлена назва',
      type: 'LeisureEvent',
      date: new Date(),
      description: 'Оновлений опис',
    })
    expect(result.success).toBe(true)
  })

  it('accepts update without description', () => {
    const result = activityUpdateSchema.safeParse({
      id: 'clh1234567890abcdefghijklm',
      name: 'Назва',
      type: 'SIT',
      date: new Date(),
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
