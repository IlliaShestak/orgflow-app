import {
  createUserSchema,
  updateUserRoleSchema,
  createTransferTypeSchema,
  updateTransferTypeSchema,
} from './adminSchema'

describe('createUserSchema', () => {
  it('requires email and role', () => {
    const result = createUserSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('email')
      expect(paths).toContain('role')
    }
  })

  it('accepts valid user data without memberId', () => {
    const result = createUserSchema.safeParse({
      email: 'admin@best.lviv.ua',
      role: 'Admin',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid user data with memberId', () => {
    const result = createUserSchema.safeParse({
      email: 'vp4hr@best.lviv.ua',
      role: 'VP4HR',
      memberId: 'member-id-1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      email: 'not-an-email',
      role: 'Admin',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown role', () => {
    const result = createUserSchema.safeParse({
      email: 'user@example.com',
      role: 'SuperAdmin',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid roles', () => {
    for (const role of ['Admin', 'VP4HR', 'FullMember']) {
      const result = createUserSchema.safeParse({
        email: 'user@example.com',
        role,
      })
      expect(result.success).toBe(true)
    }
  })
})

describe('updateUserRoleSchema', () => {
  it('requires userId and role', () => {
    const result = updateUserRoleSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('userId')
      expect(paths).toContain('role')
    }
  })

  it('accepts valid role update', () => {
    const result = updateUserRoleSchema.safeParse({
      userId: 'user-id-1',
      role: 'FullMember',
    })
    expect(result.success).toBe(true)
  })

  it('rejects unknown role', () => {
    const result = updateUserRoleSchema.safeParse({
      userId: 'user-id-1',
      role: 'Viewer',
    })
    expect(result.success).toBe(false)
  })
})

describe('createTransferTypeSchema', () => {
  it('requires name', () => {
    const result = createTransferTypeSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('name')
    }
  })

  it('accepts valid name', () => {
    const result = createTransferTypeSchema.safeParse({
      name: 'Training',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createTransferTypeSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name over 100 characters', () => {
    const result = createTransferTypeSchema.safeParse({
      name: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
  })
})

describe('updateTransferTypeSchema', () => {
  it('requires id and name', () => {
    const result = updateTransferTypeSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path[0])
      expect(paths).toContain('id')
      expect(paths).toContain('name')
    }
  })

  it('accepts valid update', () => {
    const result = updateTransferTypeSchema.safeParse({
      id: 'type-id-1',
      name: 'Sharing',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name on update', () => {
    const result = updateTransferTypeSchema.safeParse({
      id: 'type-id-1',
      name: '',
    })
    expect(result.success).toBe(false)
  })
})
