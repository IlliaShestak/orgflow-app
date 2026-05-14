---
name: OrgFlow Architecture
description: Architecture decisions, module structure, and file organization for OrgFlow
triggers: ["module", "architecture", "structure", "folder", "route", "page", "layout", "server action", "repository", "component", "import", "prisma", "schema", "migration"]
---

## Architecture Pattern
Domain-Driven Modular Monolith on Next.js 14+ App Router.
Server logic via Server Actions and Route Handlers — NO separate backend framework.

## Module Structure
Each module (hr, teams, activities, knowledge) follows this internal structure:
```
modules/<name>/
  components/   — React components specific to this module
  actions/      — Next.js Server Actions (all DB mutations go here)
  repository/   — Prisma query functions (data access layer)
  types/        — TypeScript interfaces and types for this module
  validators/   — Zod schemas for input validation
```

## App Router Page Structure
```
app/
  (auth)/
    login/page.tsx            — unauthenticated layout
  (dashboard)/
    layout.tsx                — main layout with Sidebar + TopBar
    members/
      page.tsx                — member list (table/kanban)
      [id]/page.tsx           — member profile
    teams/
      page.tsx                — teams list + archived
      [id]/page.tsx           — team detail
    activities/
      page.tsx                — activities list
      [id]/page.tsx           — activity detail (agenda + attendance)
    knowledge/
      page.tsx                — КСПЗ (two tabs: tables + coverage matrix)
      [id]/page.tsx           — single knowledge table detail
    profile/
      page.tsx                — personal profile (not available for Admin)
  api/
    auth/[...nextauth]/route.ts
```

## Data Flow Pattern
```
User interaction
  → Server Action (in modules/<name>/actions/)
    → Validator (Zod schema from modules/<name>/validators/)
      → Repository function (modules/<name>/repository/)
        → Prisma client (shared/lib/prisma.ts)
          → PostgreSQL
```

## Authentication
- Auth.js (NextAuth v5) manages the `users` table
- Session contains: userId, role (Admin | VP4HR | Full Member)
- Middleware at `middleware.ts` protects all `/dashboard` routes
- Role checking happens in Server Actions and page-level via `getServerSession()`

## Key Shared Components
```
shared/components/
  Sidebar.tsx           — left navigation with role-based menu items
  TopBar.tsx            — breadcrumb + page actions area
  DataTable.tsx         — reusable sortable/filterable table
  KanbanBoard.tsx       — status-column kanban for members
  MemberAvatar.tsx      — avatar with initials fallback
  StatusBadge.tsx       — color-coded status pill
  StateBadge.tsx        — Active/Inactive badge
  ConfirmDialog.tsx     — reusable confirmation modal
  EmptyState.tsx        — empty state illustration + message
  LoadingSpinner.tsx    — loading indicator
```

## Prisma Client Setup
Single Prisma client instance at `shared/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Server Actions Pattern
Every Server Action must:
1. Call `getServerSession()` and verify role authorization
2. Parse input through Zod validator
3. Call repository function
4. Return `{ success: true, data }` or `{ success: false, error: string }`

## Knowledge Auto-Assignment Logic
When `activity_attendance` record is created:
1. Query `activity_agenda_items` for the activity — find items with `knowledgeTopicId` set
2. For each such topic, upsert a `knowledge_coverage` record for the member
3. This logic lives in `modules/activities/actions/markAttendance.ts`

## RBAC Helper
```typescript
// shared/lib/auth.ts
export function requireRole(session: Session, ...roles: Role[]) {
  if (!session || !roles.includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
}
```
