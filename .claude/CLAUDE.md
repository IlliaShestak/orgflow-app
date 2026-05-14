<!-- OMC:START -->
<!-- OMC:VERSION:4.13.7 -->

# oh-my-claudecode - Intelligent Multi-Agent Orchestration

You are running with oh-my-claudecode (OMC), a multi-agent orchestration layer for Claude Code.
Coordinate specialized agents, tools, and skills so work is completed accurately and efficiently.

<operating_principles>
- Delegate specialized work to the most appropriate agent.
- Prefer evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality.
- Consult official docs before implementing with SDKs/frameworks/APIs.
</operating_principles>

<delegation_rules>
Delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification.
Work directly for: trivial ops, small clarifications, single commands.
Route code to `executor` (use `model=opus` for complex work). Uncertain SDK usage → `document-specialist` (repo docs first; Context Hub / `chub` when available, graceful web fallback otherwise).
</delegation_rules>

<model_routing>
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis).
Direct writes OK for: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`.
</model_routing>

<skills>
Invoke via `/oh-my-claudecode:<name>`. Trigger patterns auto-detect keywords.
Tier-0 workflows include `autopilot`, `ultrawork`, `ralph`, `team`, and `ralplan`.
Keyword triggers: `"autopilot"→autopilot`, `"ralph"→ralph`, `"ulw"→ultrawork`, `"ccg"→ccg`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner, `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel.
Team orchestration is explicit via `/team`.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skills registry live in the native `omc-reference` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (ralph/ultrawork active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-claudecode:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State: `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-claudecode:omc-setup`.

<!-- OMC:END -->

<!-- User customizations (migrated from previous CLAUDE.md) -->
# OrgFlow — Project Context

## Project Identity
- **Name**: OrgFlow
- **Type**: Full-stack web application (Next.js monolith)
- **Domain**: HR & Knowledge Management for non-profit youth organization
- **Client**: BEST Lviv (Board of European Students of Technology)
- **GitHub**: public repository `orgflow-app` on the user's personal GitHub account
- **Deployment**: Vercel + Neon PostgreSQL (cloud)

## UI Language
**ALL user-facing text must be in Ukrainian.** This includes:
- All page titles, labels, buttons, placeholders, tooltips
- Error messages, empty states, confirmation dialogs
- Navigation items, table column headers, badge labels
- The only exceptions are proper names intentionally kept in original form (see Terminology section)

## Architecture
**Domain-Driven Modular Monolith** based on Next.js 14+ App Router.
Principle: "monolith ready for decomposition."
Server logic via Route Handlers and Server Actions — no separate backend framework.

## Tech Stack (NON-NEGOTIABLE — do not deviate)
| Component      | Solution                                                       |
|----------------|----------------------------------------------------------------|
| Language       | TypeScript (strict mode)                                       |
| Framework      | Next.js 14+ (App Router)                                       |
| ORM            | Prisma                                                         |
| Database       | PostgreSQL (Neon cloud)                                        |
| Authentication | Auth.js (NextAuth v5)                                          |
| UI components  | Tailwind CSS + shadcn/ui                                       |
| Analytics      | Looker Studio (direct DB connection — no code needed in app)  |
| Deployment     | Vercel + Neon PostgreSQL                                       |

## Database Setup (Neon)
The PostgreSQL database is hosted on Neon (neon.tech). The user has already created the project.
Before running any Prisma commands, ensure `.env` contains the user's Neon connection string:
```
DATABASE_URL="<user's Neon connection string>"
```
Claude Code must NOT hardcode the connection string — always read from `.env`.
After `.env` is in place, run: `npx prisma migrate dev --name init`
Prisma will automatically create all tables in the Neon database.

## Database Naming Convention (CRITICAL)
ALL database identifiers must use snake_case (lowercase + underscores):
- Table names: `members`, `team_memberships`, `knowledge_transfer_types`
- Column names: `first_name`, `joined_at`, `mentor_id`, `user_id`, `knowledge_table_id`
- Enum values: `observer`, `baby`, `full_member`, `alumni`

In Prisma schema, use `@map` and `@@map` to keep TypeScript names clean while DB uses snake_case:
```prisma
model Member {
  id        String   @id @default(cuid())
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  joinedAt  DateTime @map("joined_at")
  mentorId  String?  @map("mentor_id")
  userId    String?  @unique @map("user_id")
  @@map("members")
}
```

## Terminology

### UI labels vs code identifiers
Some terms differ between what is shown in the UI and what is used in code.

| Concept | In UI (Ukrainian or kept term) | In code (variables, files, routes, DB) |
|---|---|---|
| Knowledge system | **КСПЗ** | `kspz` (e.g., `/knowledge`, `kspzModule`, `kspz_tables`) |
| Members list page | **Information book** | `/information-book`, `informationBook` |
| Member status: Observer | **Observer** | `Observer` (enum value) |
| Member status: Baby | **Baby** | `Baby` |
| Member status: Full | **Full** / **Full Member** | `Full` |
| Member status: Alumni | **Alumni** | `Alumni` |
| Member state: Active | **Active** | `Active` |
| Member state: Inactive | **Inactive** | `Inactive` |
| Role: Admin | **Admin** | `Admin` |
| Role: VP4HR | **VP4HR** | `VP4HR` |
| Role: Full Member | **Full Member** | `FullMember` |
| Activity: Gathering | **Gathering** | `Gathering` |
| Activity: SIT | **SIT** | `SIT` |
| Activity: Leisure Event | **Leisure Event** | `LeisureEvent` |
| Team type: Coreteam | **Coreteam** | `Coreteam` |
| Team type: Project | **Project** | `Project` |
| Team type: Team | **Team** | `Team` |
| Position type: Helper | **Helper** | `isHelper` (boolean flag) |

### КСПЗ naming rules
- **In UI**: always shown as "КСПЗ" (Cyrillic)
- **In code**: always `kspz` (Latin) — file names, folder names, function names, variable names
- **In DB**: `knowledge_*` prefix (snake_case Latin) — `knowledge_tables`, `knowledge_topics`, `knowledge_coverage`, `knowledge_transfer_types`
- **URL route**: `/knowledge` (matches the `modules/knowledge/` folder)

Examples:
```
modules/knowledge/          ← folder name
app/(dashboard)/knowledge/  ← route
getKspzTables()             ← function name
kspzModule                  ← variable name
"КСПЗ"                      ← sidebar label in UI
```

All other UI text (actions, descriptions, form labels, error messages, empty states) must be in Ukrainian.

## Project File Structure
```
orgflow-app/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # sidebar + topbar layout
│   │   ├── information-book/            # member list — "Information book"
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx            # member profile
│   │   ├── teams/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── activities/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── knowledge/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── profile/page.tsx             # personal profile (not for Admin)
│   │   └── admin/                       # admin panel (Admin only)
│   │       ├── page.tsx
│   │       ├── users/page.tsx
│   │       └── references/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── modules/
│   ├── hr/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── repository/
│   │   ├── types/
│   │   └── validators/
│   ├── teams/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── repository/
│   │   ├── types/
│   │   └── validators/
│   ├── activities/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── repository/
│   │   ├── types/
│   │   └── validators/
│   ├── knowledge/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── repository/
│   │   ├── types/
│   │   └── validators/
│   └── admin/
│       ├── components/
│       ├── actions/
│       ├── repository/
│       ├── types/
│       └── validators/
├── shared/
│   ├── components/        # Sidebar, TopBar, DataTable, KanbanBoard, StatusBadge, etc.
│   ├── hooks/
│   ├── lib/               # prisma.ts, auth.ts, utils.ts
│   └── types/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── public/
```

## User Roles (RBAC)
| Role        | Access |
|-------------|--------|
| **Admin**   | Full system access. Manages user accounts and reference data via admin panel (`/admin`). Full edit rights on all main pages. Does NOT have personal profile page. |
| **VP4HR**   | Full access to all organizational data: Information book, teams, activities, КСПЗ. Has personal profile page. |
| **Full Member** | Edit own profile and own mentees only. Mark attendance for self and mentees. Mark knowledge coverage for self and mentees. Has personal profile page. |
| **Mentee**  | Record in `members` table only. No user account (`user_id = null`). No login. |

## Module: HR — Information book
**UI page name: "Information book"**
**URL: `/information-book`**

Member profile fields (table: `members`):
- `first_name`, `last_name` (required)
- `gender`: Male | Female
- `birth_date`
- `study_year`
- `joined_at` (required)
- `email` (unique), `phone`, `telegram`, `instagram`, `facebook`
- `family` — free text (no reference table)
- `status`: Observer | Baby | Full | Alumni (required)
- `state`: Active | Inactive (required)
- `mentor_id` — self-referential FK, nullable
- `user_id` — FK to `users`, nullable (null = mentee, no login)

Features:
- CRUD for member profiles — Admin and VP4HR: all members; Full Member: own + own mentees only
- Search by first/last name; filter by status, state, mentor
- Two list views: table and kanban board (columns = Observer, Baby, Full, Alumni)
- Position application history: `position_name`, `team_name`, `applied_at`, `result` (Success | Fail)
- Personal profile page for VP4HR and Full Member (not Admin)
  - Tabs: загальна інформація, Команди, КСПЗ, Історія подач

## Module: Admin Panel
**URL: `/admin`**
**Accessible only to Admin role. Redirect all other roles away.**

Pages:
1. **`/admin/users`** — Користувачі:
   - List: email, role, linked member name
   - Create user: email + role + link to existing `members` record
   - Change role of existing user
   - Deactivate / delete user account

2. **`/admin/references`** — Довідники:
   - Manage `knowledge_transfer_types`: add, rename, delete
   - (Family is free text — not managed here)

## Module: Teams
Types: Coreteam | Project | Team

Features:
- Admin and VP4HR: create teams, define positions, archive
- Assign member to position → auto-recorded in member profile
- Remove from position → removed from active assignments
- Coreteam: additional position type Helper
- Track `start_date`, `end_date` per assignment; full history preserved
- Archived teams in "Історія" section

## Module: Activities
Types: Gathering | SIT | Leisure Event (no functional difference)
Fields: `type`, `date` (required), `description` (required)

Agenda (`activity_agenda_items`):
- Free text items
- Knowledge topic references (from КСПЗ)

Attendance:
- VP4HR: any member
- Full Member: self and own mentees
- Admin: full edit

Knowledge auto-assignment: on attendance mark → find agenda items with `knowledge_topic_id` → upsert `knowledge_coverage` for that member.

## Module: Knowledge (КСПЗ)
**UI: "КСПЗ"**

Structure:
- Unlimited knowledge tables, each linked to a target status (Observer | Baby | Full | Alumni)
- Rows = topics (`knowledge_topics`): e.g., TeamWork, Feedback
- Columns = transfer types (`knowledge_transfer_types`): selected at table creation from static list
- Cells = boolean coverage per member

Page tabs:
1. **Таблиці знань** — list, create, edit tables and topics
2. **Покриття по учасниках** — full matrix (members × topics), Admin and VP4HR only

Coverage marking:
- Admin, VP4HR: any member
- Full Member: self and own mentees

Member profile КСПЗ tab: shows knowledge table for member's current status; covered = green, uncovered = gray.

## Analytics
- Looker Studio connects directly to Neon PostgreSQL
- No code needed in the application
- Responsibility: clean, well-indexed schema only

## Navigation (Sidebar)
Labels shown in sidebar — mix of Ukrainian and kept terms:
- Information book
- Команди
- Заходи
- КСПЗ
- Адмін *(visible only to Admin role)*

Top right: personal profile button — hidden for Admin.

## Database Schema — All Tables (snake_case)
```
members                  — all member profiles including mentees
users                    — auth accounts (Auth.js managed)
teams                    — org teams
positions                — positions within teams
team_memberships         — member↔position assignments with dates
activities               — org events
activity_agenda_items    — agenda entries (text or topic ref)
activity_attendance      — attendance records (unique: activity + member)
knowledge_tables         — КСПЗ tables
knowledge_topics         — rows (topics) within tables
knowledge_transfer_types — static ref: Training, Sharing, etc.
knowledge_table_columns  — which transfer types apply to which table
knowledge_coverage       — member × topic × transfer type coverage facts
application_history      — position application records per member
```

## Design System (Design 3 — Tricolor Minimal)
Font: **Plus Jakarta Sans** (Google Fonts — import in root layout)

Color tokens (add to `tailwind.config.ts`):
```js
colors: {
  brand: {
    blue:          '#0A3D91',
    'blue-soft':   '#4472CA',
    'blue-tint':   '#E8EDF8',
    orange:        '#E85D04',
    'orange-soft': '#F4845F',
    'orange-tint': '#FDF0E8',
    green:         '#0B7B45',
    'green-soft':  '#3CB371',
    'green-tint':  '#E6F5EE',
    sidebar:       '#1A1D2E',
  }
}
```

Semantic color usage:
- **Blue** → Observer status badge, active nav indicator
- **Orange** → primary CTA buttons, Active/Full member accent, onboarding progress
- **Green** → КСПЗ coverage, success states
- **Sidebar (#1A1D2E)** → sidebar background only
- **White** → content area background
- **Off-white (#F7F8FA)** → page background

Layout: 220px fixed sidebar + 56px sticky topbar + scrollable content (p-7/p-8).
Cards: `bg-white border border-gray-100 rounded-[10px]`.

## GitHub Workflow

### Repository setup
- Repo: `orgflow-app` — PUBLIC, user's personal GitHub account
- Create: `gh repo create orgflow-app --public`
- Default branch: `main` — always stable, never push broken code directly to main

### Branch strategy
Use a dedicated feature branch for every piece of work. Naming convention:
```
feature/<short-description>    # new functionality
fix/<short-description>        # bug fix
chore/<short-description>      # config, deps, tooling
refactor/<short-description>   # restructure without behavior change
```

Examples:
```
feature/project-setup
feature/prisma-schema
feature/auth-login-page
feature/member-list-table
feature/member-kanban-view
feature/member-profile
feature/admin-users
feature/team-assignments
feature/activity-agenda
feature/attendance-auto-knowledge
feature/kspz-tables
feature/kspz-coverage-matrix
feature/member-kspz-tab
fix/member-filter-state
```

### Workflow for each feature
```bash
# Start from up-to-date main
git checkout main && git pull origin main
git checkout -b feature/<name>

# Implement, committing small logical units as work progresses
# (see commit conventions below)

# When feature is complete and compiles clean:
git push origin feature/<name>
gh pr create --title "<type(scope): description>" --body "<what and why>" --base main
gh pr merge --squash
git checkout main && git pull origin main
```

### Commit convention — Conventional Commits, English
**Commit frequently** — after each small, self-contained unit of work. Never accumulate large uncommitted changes.

Format: `<type>(<scope>): <short description>`

Types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`, `test`

Scope examples: `auth`, `members`, `teams`, `activities`, `kspz`, `admin`, `db`, `ui`, `layout`

Good commit granularity — examples:
```
chore(deps): install prisma, zod, next-auth, shadcn
feat(db): add members and users schema
feat(db): add teams and positions schema
feat(db): add activities and attendance schema
feat(db): add knowledge tables schema
feat(db): add initial migration and knowledge_transfer_types seed
feat(auth): configure Auth.js with Prisma adapter
feat(auth): add login page with Ukrainian UI
feat(auth): add middleware for route protection and role redirect
feat(auth): add requireRole helper function
feat(members): add member repository — getMembers, getMemberById
feat(members): add create and update Server Actions with Zod validation
feat(members): add Information book list page — table view
feat(members): add kanban board view with status columns
feat(members): add search and filter controls
feat(members): add member profile page with tabs
feat(members): add personal profile page for VP4HR and Full Member
feat(admin): add user list and create user form
feat(admin): add role change and deactivation actions
feat(admin): add knowledge_transfer_types reference management
feat(teams): add team list with archived section
feat(teams): add team detail page and position list
feat(teams): add member assignment with profile sync
feat(activities): add activity list and detail pages
feat(activities): add agenda editor — text and topic items
feat(activities): add attendance marking with RBAC
feat(activities): add knowledge auto-assignment on attendance
feat(kspz): add knowledge table list and creation form
feat(kspz): add topic management within tables
feat(kspz): add coverage matrix tab for Admin and VP4HR
feat(kspz): add manual coverage marking with RBAC
feat(kspz): add member profile КСПЗ tab
refactor(members): extract filter logic to repository layer
fix(kspz): correct auto-assignment when topic appears in multiple tables
```

### Pull Request conventions
- Title: same format as a commit message
- Body: brief description of what changed and why
- One logical feature per PR — do not batch unrelated changes
- Merge to `main` only when TypeScript compiles clean (`tsc --noEmit` passes)

## Development Priorities (strict order)
1. Bootstrap: GitHub repo, Next.js + Tailwind + shadcn/ui, folder structure, base layout
2. Database: full Prisma schema with snake_case mapping, migration on Neon, seed `knowledge_transfer_types`
3. Auth: login page, Auth.js, middleware, `requireRole()` helper
4. HR module: member CRUD, Information book page (table + kanban), member profile, personal profile
5. Admin panel: user management, reference management (`knowledge_transfer_types`)
6. Teams module: team CRUD, positions, assignments, history
7. Activities module: CRUD, agenda editor, attendance, knowledge auto-assignment
8. Knowledge module: КСПЗ tables management, coverage marking, coverage matrix tab
9. Member profile КСПЗ tab
10. Polish: search, filters, loading/error/empty states

Nothing may be skipped. Priority order determines sequence only.

## Code Quality
- TypeScript strict mode — no `any`
- Comments on non-obvious logic and business rules (WHY, not WHAT)
- Zod for all input validation
- Server Actions for all mutations
- Prisma for all DB access
- shadcn/ui as component base
- Tailwind only for styling
- Every page: loading + error + empty state

## Testing Stack
| Tool | Purpose |
|---|---|
| Vitest | Unit and integration tests |
| @testing-library/react | Component tests |
| @testing-library/user-event | User interaction simulation |
| Playwright | End-to-end tests |

Test file conventions:
- Unit/integration tests: `<name>.test.ts` alongside the source file
- Component tests: `<name>.test.tsx` alongside the component
- E2E tests: `e2e/<name>.spec.ts`

What to test:
- **Server Actions** — RBAC checks, business logic, Zod validation errors
- **Repository functions** — DB query correctness (use test DB or mock)
- **Knowledge auto-assignment** — core business rule: attendance → coverage
- **RBAC middleware** — route protection for each role
- **Key components** — member form, kanban board, coverage matrix

Minimum coverage targets:
- Server Actions: 80%+
- Repository functions: 70%+
- Components: key interactions only (form submit, role-based rendering)

## Forbidden
- Recharts or any chart library
- API endpoints for Looker Studio / data export
- Redux, Zustand, or any global state manager
- Express, NestJS, Fastify, or separate backend
- MongoDB or NoSQL
- camelCase or PascalCase in DB names
- Hardcoded secrets or `DATABASE_URL`
- Skipping GitHub push after logical unit completion
- Modifying another agent's module files during parallel phase

## Required Environment Variables
```
DATABASE_URL    # Neon PostgreSQL connection string (user provides)
AUTH_SECRET     # generate: openssl rand -base64 32
AUTH_URL        # http://localhost:3000 for dev, production URL for prod
```
