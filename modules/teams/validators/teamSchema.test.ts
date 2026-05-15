import {
  createTeamSchema,
  updateTeamSchema,
  createPositionSchema,
  assignMemberSchema,
  removeMemberSchema,
} from './teamSchema'

describe('createTeamSchema', () => {
  it('requires name and type', () => {
    const result = createTeamSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('name')
      expect(paths).toContain('type')
    }
  })

  it('accepts valid team data', () => {
    const result = createTeamSchema.safeParse({
      name: 'Coreteam 2024',
      type: 'Coreteam',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid team types', () => {
    for (const type of ['Coreteam', 'Project', 'Team']) {
      const result = createTeamSchema.safeParse({ name: 'Команда', type })
      expect(result.success).toBe(true)
    }
  })

  it('rejects unknown team type', () => {
    const result = createTeamSchema.safeParse({
      name: 'Команда',
      type: 'Department',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = createTeamSchema.safeParse({
      name: '',
      type: 'Team',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional startDate and endDate', () => {
    const result = createTeamSchema.safeParse({
      name: 'Проект 2024',
      type: 'Project',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    })
    expect(result.success).toBe(true)
  })
})

describe('updateTeamSchema', () => {
  it('requires id', () => {
    const result = updateTeamSchema.safeParse({
      name: 'Команда',
      type: 'Team',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('id')
    }
  })

  it('accepts valid update', () => {
    const result = updateTeamSchema.safeParse({
      id: 'team-id-1',
      name: 'Оновлена команда',
      type: 'Coreteam',
    })
    expect(result.success).toBe(true)
  })
})

describe('createPositionSchema', () => {
  it('requires teamId and name', () => {
    const result = createPositionSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('teamId')
      expect(paths).toContain('name')
    }
  })

  it('accepts position with isHelper flag', () => {
    const result = createPositionSchema.safeParse({
      teamId: 'team-id-1',
      name: 'Head of HR',
      isHelper: true,
    })
    expect(result.success).toBe(true)
  })

  it('defaults isHelper to false', () => {
    const result = createPositionSchema.safeParse({
      teamId: 'team-id-1',
      name: 'Head of HR',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isHelper).toBe(false)
    }
  })
})

describe('assignMemberSchema', () => {
  it('requires positionId, memberId, and startDate', () => {
    const result = assignMemberSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('positionId')
      expect(paths).toContain('memberId')
      expect(paths).toContain('startDate')
    }
  })

  it('accepts valid assignment data', () => {
    const result = assignMemberSchema.safeParse({
      positionId: 'pos-id-1',
      memberId: 'member-id-1',
      startDate: '2024-09-01',
    })
    expect(result.success).toBe(true)
  })
})

describe('removeMemberSchema', () => {
  it('requires membershipId and endDate', () => {
    const result = removeMemberSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('membershipId')
      expect(paths).toContain('endDate')
    }
  })

  it('accepts valid removal data', () => {
    const result = removeMemberSchema.safeParse({
      membershipId: 'membership-id-1',
      endDate: '2024-12-31',
    })
    expect(result.success).toBe(true)
  })
})
