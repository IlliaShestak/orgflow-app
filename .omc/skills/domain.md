---
name: OrgFlow Domain
description: Domain context, business rules, and terminology for OrgFlow
triggers: ["best", "orgflow", "member", "members", "team", "teams", "activity", "activities", "knowledge", "КСПЗ", "кспз", "mentor", "mentee", "observer", "baby", "alumni", "gathering", "SIT", "coreteam", "coverage", "attendance", "agenda", "position", "VP4HR", "family", "родина", "статус", "стан", "information book", "admin", "адмін"]
---

## Organization Context
BEST Lviv — non-profit youth student NGO, part of international BEST network.
Volunteers only. Active lifecycle per member: ~2–4 years.
Core problem: loss of institutional memory when experienced members leave.

## UI Language
ALL user-facing text must be in Ukrainian, except the terms listed in the Terminology section below.

## Terminology — UI vs Code

### КСПЗ
- **In UI**: "КСПЗ" (Cyrillic) — sidebar label, page titles, tab names, all user-visible text
- **In code**: `kspz` (Latin) — function names, variable names, file/folder names
- **In DB**: `knowledge_*` prefix — `knowledge_tables`, `knowledge_topics`, `knowledge_coverage`, `knowledge_transfer_types`
- **URL route**: `/knowledge`

Examples:
```
modules/knowledge/          ← folder
app/(dashboard)/knowledge/  ← route
getKspzTables()             ← function
kspzModule                  ← variable
"КСПЗ"                      ← sidebar label
```

### Information book
- **In UI**: "Information book" — page title shown to user
- **In code / URL**: `/information-book`, `informationBook`

### Other terms — same in UI and code
| Term | Notes |
|---|---|
| Observer, Baby, Full, Alumni | Member statuses — used as-is in UI and as enum values in code |
| Active, Inactive | Member states |
| Admin, VP4HR, FullMember | Roles — UI shows "Full Member" with space; code uses `FullMember` |
| Gathering, SIT, LeisureEvent | Activity types — UI shows "Leisure Event"; code uses `LeisureEvent` |
| Coreteam, Project, Team | Team types |
| Helper | Position type in Coreteam — boolean flag `is_helper` in DB |

## Member Lifecycle
Observer → Baby → Full Member → Alumni (field: `status`)

State is separate:
- Active = currently participating
- Inactive = exists in org but not active

## Mentorship
- Full Member can mentor multiple mentees
- Mentees: stored in `members` with `user_id = null` — no login, no system access
- Design allows granting login in the future without schema changes

## Admin Panel Scope
Admin manages what VP4HR cannot:
- User accounts: create, change role, deactivate/delete
- Reference data: `knowledge_transfer_types` (Training, Sharing, etc.)
Admin has full edit access to all main pages (Information book, Команди, Заходи, КСПЗ).
Admin does NOT have a personal profile page.
Admin panel is at `/admin`, protected by role check.

## Information Book
The main member list page is called **"Information book"** in the UI.
Route: `/information-book`
This is the HR module's primary view.

## Family Field
`family` is a free-text field in the member profile.
It is NOT a reference table and NOT managed through the admin panel.

## КСПЗ Structure (Knowledge System)
- Container with unlimited knowledge tables
- Each table linked to a target status: Observer | Baby | Full | Alumni
- Rows = topics (e.g., TeamWork, Feedback)
- Columns = transfer types (from static `knowledge_transfer_types` — selected at table creation)
- Cells = boolean coverage per member

Auto-assignment rule: when a member is marked present at an activity that has knowledge topics in its agenda → those topics are automatically marked as covered for that member.

## Team Types and Helper
- Coreteam: core org team. Supports additional position type: Helper (only for Coreteam)
- Project: project-based team
- Team: general team

Helper is a position type, not a team type. It exists only within Coreteam teams.

## Activity Types
Gathering | SIT | Leisure Event — no functional difference, used for categorization only.

## Knowledge Coverage Preservation Rule
NEVER cascade-delete `knowledge_coverage` records when member status changes to Alumni.
Alumni knowledge coverage represents institutional memory and must be preserved.
