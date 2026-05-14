# OrgFlow — Build Prompt

/team 3:executor "Build the complete OrgFlow web application from scratch."

---

## Before starting

Read these files in order before writing any code:
1. `.claude/CLAUDE.md` — full project context, stack, modules, all rules
2. `.omc/skills/domain.md` — business rules, terminology, UI language
3. `.omc/skills/architecture.md` — architecture and code patterns
4. `.omc/skills/constraints.md` — hard constraints and forbidden patterns
5. `.omc/skills/design.md` — design system and UI tokens
6. `.omc/skills/database.md` — complete Prisma schema
7. `.omc/skills/testing.md` — testing stack and conventions

---

## What to build

A full-stack web application for BEST Lviv NGO with these modules:

**HR — Information book**
Member profiles (Observer/Baby/Full/Alumni statuses, Active/Inactive state), table and kanban views, member profile with tabs, personal profile for VP4HR and Full Member, position application history, RBAC access control.

**Admin panel** (`/admin`, Admin role only)
User account management (create, change role, deactivate). Reference data management (`knowledge_transfer_types`).

**Teams**
Three team types (Coreteam/Project/Team), position management, member assignments with history. Helper position type for Coreteam only.

**Activities**
Three activity types (Gathering/SIT/Leisure Event), agenda editor (text items + knowledge topic items), attendance marking with RBAC, automatic knowledge coverage assignment when attendance is marked.

**КСПЗ (Knowledge)**
Knowledge tables per member status, topic and transfer type management, manual coverage marking, coverage matrix view, member profile КСПЗ tab.

---

## Non-negotiable rules

- All UI text in Ukrainian (except terms listed in `domain.md`)
- All DB identifiers in snake_case with Prisma `@map`/`@@map`
- Use exact Prisma schema from `database.md`
- RBAC enforced at Server Action level on every mutation
- Tests written alongside every module (see `testing.md`)
- Feature branches + granular conventional commits + PRs to main
- Push to public GitHub repo `orgflow-app` throughout development
- `DATABASE_URL` read from `.env` — never hardcoded

## Setup steps before coding
```bash
# Create GitHub repo
gh repo create orgflow-app --public

# Create .env with user's Neon connection string
DATABASE_URL="<user's Neon connection string>"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_URL="http://localhost:3000"
```

## Definition of done
Every feature is done when: it works end-to-end, `tsc --noEmit` passes, tests pass, loading/error/empty states are handled, and the branch is merged to main.
