import {
  kspzTableCreateSchema,
  kspzTableUpdateSchema,
  kspzTopicCreateSchema,
  kspzTopicUpdateSchema,
  kspzCoverageToggleSchema,
} from './kspzSchema'

describe('kspzTableCreateSchema', () => {
  it('requires name', () => {
    const result = kspzTableCreateSchema.safeParse({
      targetStatus: null,
      transferTypeIds: ['some-id'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('name')
    }
  })

  it('requires at least one transferTypeId', () => {
    const result = kspzTableCreateSchema.safeParse({
      name: 'Таблиця знань',
      targetStatus: null,
      transferTypeIds: [],
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid data with targetStatus', () => {
    const result = kspzTableCreateSchema.safeParse({
      name: 'Таблиця знань',
      targetStatus: 'Observer',
      transferTypeIds: ['type-id-1', 'type-id-2'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts null targetStatus', () => {
    const result = kspzTableCreateSchema.safeParse({
      name: 'Загальна таблиця',
      targetStatus: null,
      transferTypeIds: ['type-id-1'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid targetStatus', () => {
    const result = kspzTableCreateSchema.safeParse({
      name: 'Таблиця',
      targetStatus: 'Unknown',
      transferTypeIds: ['type-id-1'],
    })
    expect(result.success).toBe(false)
  })
})

describe('kspzTableUpdateSchema', () => {
  it('requires id', () => {
    const result = kspzTableUpdateSchema.safeParse({
      name: 'Нова назва',
      targetStatus: null,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid update', () => {
    const result = kspzTableUpdateSchema.safeParse({
      id: 'table-id-1',
      name: 'Оновлена назва',
      targetStatus: 'Baby',
    })
    expect(result.success).toBe(true)
  })
})

describe('kspzTopicCreateSchema', () => {
  it('requires knowledgeTableId and name', () => {
    const result = kspzTopicCreateSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('knowledgeTableId')
      expect(paths).toContain('name')
    }
  })

  it('accepts valid topic data', () => {
    const result = kspzTopicCreateSchema.safeParse({
      knowledgeTableId: 'table-id-1',
      name: 'Командна робота',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = kspzTopicCreateSchema.safeParse({
      knowledgeTableId: 'table-id-1',
      name: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('kspzTopicUpdateSchema', () => {
  it('requires id and name', () => {
    const result = kspzTopicUpdateSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('accepts valid update', () => {
    const result = kspzTopicUpdateSchema.safeParse({
      id: 'topic-id-1',
      name: 'Зворотній зв\'язок',
    })
    expect(result.success).toBe(true)
  })
})

describe('kspzCoverageToggleSchema', () => {
  it('requires all four fields', () => {
    const result = kspzCoverageToggleSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('memberId')
      expect(paths).toContain('knowledgeTopicId')
      expect(paths).toContain('knowledgeTransferTypeId')
      expect(paths).toContain('covered')
    }
  })

  it('accepts covered = true', () => {
    const result = kspzCoverageToggleSchema.safeParse({
      memberId: 'member-id-1',
      knowledgeTopicId: 'topic-id-1',
      knowledgeTransferTypeId: 'type-id-1',
      covered: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts covered = false', () => {
    const result = kspzCoverageToggleSchema.safeParse({
      memberId: 'member-id-1',
      knowledgeTopicId: 'topic-id-1',
      knowledgeTransferTypeId: 'type-id-1',
      covered: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-boolean covered', () => {
    const result = kspzCoverageToggleSchema.safeParse({
      memberId: 'member-id-1',
      knowledgeTopicId: 'topic-id-1',
      knowledgeTransferTypeId: 'type-id-1',
      covered: 'yes',
    })
    expect(result.success).toBe(false)
  })
})
