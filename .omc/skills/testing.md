---
name: OrgFlow Testing
description: Testing stack, conventions, and examples for OrgFlow — Vitest, React Testing Library, Playwright
triggers: ["test", "testing", "vitest", "playwright", "unit test", "integration test", "e2e", "spec", "coverage", "mock", "describe", "it(", "expect("]
---

## Testing Stack
- **Vitest** — unit and integration tests (fast, TypeScript-native)
- **@testing-library/react** — component tests
- **@testing-library/user-event** — user interaction simulation in component tests
- **Playwright** — end-to-end tests

## Setup

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['modules/**/*.ts', 'modules/**/*.tsx', 'shared/lib/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/types/**'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

### vitest.setup.ts
```typescript
import '@testing-library/jest-dom'
```

### Install dependencies
```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitejs/plugin-react jsdom
npm install -D @playwright/test
npx playwright install
```

### package.json scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

## File Conventions
- Unit/integration tests: `<name>.test.ts` — same directory as source file
- Component tests: `<name>.test.tsx` — same directory as component
- E2E tests: `e2e/<feature>.spec.ts`

## What to Test (Priority Order)

### 1. Server Actions — highest priority
Test RBAC checks and business logic. Mock Prisma and `getServerSession`.

```typescript
// modules/hr/actions/createMember.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMember } from './createMember'
import { getServerSession } from 'next-auth'
import { prisma } from '@/shared/lib/prisma'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/shared/lib/prisma', () => ({
  prisma: { member: { create: vi.fn() } },
}))

describe('createMember', () => {
  it('throws Unauthorized when user is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    await expect(createMember({ firstName: 'Test', lastName: 'User' }))
      .rejects.toThrow('Unauthorized')
  })

  it('throws Unauthorized when Full Member tries to create member', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: 'FullMember', id: '1' }
    } as any)
    await expect(createMember({ firstName: 'Test', lastName: 'User' }))
      .rejects.toThrow('Unauthorized')
  })

  it('creates member when VP4HR calls it', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: 'VP4HR', id: '1' }
    } as any)
    vi.mocked(prisma.member.create).mockResolvedValue({ id: 'new-id' } as any)

    const result = await createMember({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      status: 'Observer',
      state: 'Active',
    })

    expect(result.success).toBe(true)
    expect(prisma.member.create).toHaveBeenCalledOnce()
  })
})
```

### 2. Knowledge auto-assignment — critical business rule
```typescript
// modules/activities/actions/markAttendance.test.ts
describe('markAttendance — knowledge auto-assignment', () => {
  it('creates knowledge_coverage records for all agenda topics', async () => {
    // Mock: activity has 2 knowledge topics in agenda
    // Mock: member is marked as present
    // Assert: knowledge_coverage upsert called twice with correct topic IDs
    // Assert: source_activity_id is set on both records
  })

  it('does not create coverage when agenda item is text-only', async () => {
    // Mock: activity has only text agenda items (no knowledge_topic_id)
    // Assert: knowledge_coverage upsert never called
  })

  it('is idempotent — marking attendance twice does not duplicate coverage', async () => {
    // Assert: upsert (not create) is used — no duplicate on re-mark
  })
})
```

### 3. RBAC middleware
```typescript
// middleware.test.ts
describe('middleware route protection', () => {
  it('redirects unauthenticated user from /information-book to /login', async () => {})
  it('redirects FullMember from /admin to /information-book', async () => {})
  it('redirects VP4HR from /admin to /information-book', async () => {})
  it('allows Admin to access /admin', async () => {})
  it('allows VP4HR to access /information-book', async () => {})
})
```

### 4. Zod validators
```typescript
// modules/hr/validators/memberSchema.test.ts
describe('memberCreateSchema', () => {
  it('rejects missing required fields', () => {
    const result = memberCreateSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error.issues.map(i => i.path[0]))
      .toContain('firstName')
  })

  it('accepts valid member data', () => {
    const result = memberCreateSchema.safeParse({
      firstName: 'Іван',
      lastName: 'Коваленко',
      joinedAt: new Date(),
      status: 'Observer',
      state: 'Active',
    })
    expect(result.success).toBe(true)
  })
})
```

### 5. Key components
```typescript
// modules/hr/components/MemberForm.test.tsx
describe('MemberForm', () => {
  it('renders all required fields', () => {
    render(<MemberForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText("Ім'я")).toBeInTheDocument()
    expect(screen.getByLabelText('Прізвище')).toBeInTheDocument()
  })

  it('shows validation error when required field is empty', async () => {
    const user = userEvent.setup()
    render(<MemberForm onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Зберегти' }))
    expect(await screen.findByText("Ім'я є обов'язковим")).toBeInTheDocument()
  })
})
```

### 6. E2E — happy path flows
```typescript
// e2e/members.spec.ts
import { test, expect } from '@playwright/test'

test('VP4HR can create and view a new member', async ({ page }) => {
  await page.goto('/login')
  // login as VP4HR
  await page.goto('/information-book')
  await page.getByRole('button', { name: 'Додати учасника' }).click()
  await page.getByLabel("Ім'я").fill('Іван')
  await page.getByLabel('Прізвище').fill('Коваленко')
  await page.getByRole('button', { name: 'Зберегти' }).click()
  await expect(page.getByText('Іван Коваленко')).toBeVisible()
})

test('Full Member cannot access admin panel', async ({ page }) => {
  // login as Full Member
  await page.goto('/admin')
  await expect(page).toHaveURL('/information-book')
})
```

## Coverage Targets
| Layer | Target |
|---|---|
| Server Actions | 80%+ |
| Repository functions | 70%+ |
| Validators (Zod schemas) | 90%+ |
| Components | Key interactions only |
| E2E | Happy path per module |

## Mocking Prisma in Tests
Use `vi.mock` for Prisma — never hit a real database in unit tests:
```typescript
vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    member: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // add other models as needed
  },
}))
```

For integration tests that need a real DB, use a separate test database (separate `DATABASE_URL_TEST` in `.env.test`).
