---
name: OrgFlow Constraints
description: Hard constraints, forbidden patterns, and mandatory rules for OrgFlow development
triggers: ["database", "analytics", "export", "chart", "recharts", "redux", "express", "nestjs", "mongodb", "css module", "styled-components", "any type", "raw sql", "camelCase", "column name", "table name", "snake_case", "admin", "route protection"]
---

## Hard Constraints — Never Violate

### Database naming — snake_case ONLY
ALL identifiers in the database must use lowercase + underscores:
- Tables: `members`, `team_memberships`, `knowledge_transfer_types`
- Columns: `first_name`, `joined_at`, `mentor_id`, `user_id`, `knowledge_table_id`
- Enums in DB: `observer`, `baby`, `full_member`, `alumni`, `active`, `inactive`
- Indexes: `members_status_idx`, `activity_attendance_member_id_idx`

Use Prisma `@map` / `@@map` to bridge TypeScript (camelCase) ↔ DB (snake_case).
NEVER use camelCase or PascalCase for DB table or column names directly.

### Technology
- PostgreSQL ONLY (Neon cloud) — no MongoDB, SQLite, NoSQL
- Next.js Server Actions for all mutations — no Express/NestJS/Fastify
- Prisma for all DB access — no raw SQL (only `$queryRaw` for specific analytics views if unavoidable)
- Tailwind CSS ONLY for styling — no CSS Modules, styled-components, inline style objects
- shadcn/ui as component base — do not reinvent standard UI elements
- TypeScript strict mode — no `any` anywhere
- Zod for ALL input validation

### Analytics
- NO Recharts, Chart.js, or any charting library
- NO data export endpoints or API routes for Looker Studio
- Looker Studio connects DIRECTLY to Neon PostgreSQL
- DO NOT embed Looker Studio iframes in the app

### State Management
- NO Redux, Zustand, MobX, or global state library
- Use Next.js server components for data fetching
- Use URL search params for filter/pagination state
- `useState` only for local UI state (modal open, tab selection, etc.)

### GitHub
- NEVER skip pushing after completing a logical unit
- ALWAYS use conventional commit format
- Repository must stay PUBLIC

### Admin panel
- Route `/admin` and all subroutes must check for Admin role
- Redirect non-Admin users to `/information-book`
- VP4HR does NOT have access to `/admin`

## Mandatory Patterns

### Every page must handle three states:
1. Loading — skeleton or spinner
2. Error — error message with retry
3. Empty — empty state component with relevant action

### Every Server Action must:
1. Call `requireRole()` — verify authentication and role
2. Validate input with Zod
3. Return `{ success: true, data } | { success: false, error: string }`

### Knowledge coverage:
- NEVER cascade-delete `knowledge_coverage` when member status changes to Alumni
- Coverage records = institutional memory, must be preserved forever

### Mentee records:
- Mentees stored in `members` with `user_id = null`
- Never create a `users` record for a mentee
- `mentor_id` must reference a member WITH a user account (not another mentee)

### Environment variables:
- Database URL is in `.env` as `DATABASE_URL`
- Never hardcode connection strings or secrets in source code
- Create `.env.example` with placeholder values

## Common Mistakes to Avoid
- Do NOT fetch data in `useEffect` — use async Server Components
- Do NOT put Prisma queries directly in page components — use repository functions
- Do NOT use `pages/` directory — App Router only
- Do NOT use `next/router` — use `next/navigation`
- Do NOT forget `'use client'` on components using hooks/browser APIs
- Do NOT forget `'use server'` on Server Action files
- Do NOT use camelCase column names in `schema.prisma` without `@map`
