---
name: OrgFlow Database Schema
description: Complete database schema with snake_case naming, table relations, and indexing for OrgFlow PostgreSQL (Neon)
triggers: ["database", "schema", "prisma", "table", "migration", "relation", "foreign key", "index", "members", "teams", "activities", "knowledge_coverage", "knowledge_tables", "attendance", "query", "SQL", "snake_case", "neon", "seed"]
---

## Database: PostgreSQL on Neon, accessed via Prisma ORM
ALL table and column names: snake_case. Use `@map` / `@@map` in Prisma schema.

## Prisma Schema — Complete

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}

// ── Enums ──────────────────────────────────────────────────

enum Role {
  Admin       @map("admin")
  VP4HR       @map("vp4hr")
  FullMember  @map("full_member")
  @@map("role")
}

enum MemberStatus {
  Observer    @map("observer")
  Baby        @map("baby")
  Full        @map("full")
  Alumni      @map("alumni")
  @@map("member_status")
}

enum MemberState {
  Active      @map("active")
  Inactive    @map("inactive")
  @@map("member_state")
}

enum Gender {
  Male        @map("male")
  Female      @map("female")
  @@map("gender")
}

enum TeamType {
  Coreteam    @map("coreteam")
  Project     @map("project")
  Team        @map("team")
  @@map("team_type")
}

enum ActivityType {
  Gathering     @map("gathering")
  SIT           @map("sit")
  LeisureEvent  @map("leisure_event")
  @@map("activity_type")
}

enum ApplicationResult {
  Success @map("success")
  Fail    @map("fail")
  @@map("application_result")
}

// ── Auth ───────────────────────────────────────────────────

// Managed by Auth.js — do not modify structure
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime? @map("email_verified")
  image         String?
  role          Role      @default(FullMember)
  createdAt     DateTime  @default(now()) @map("created_at")
  member        Member?
  sessions      Session[]
  accounts      Account[]
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime
  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ── Members ────────────────────────────────────────────────

model Member {
  id          String       @id @default(cuid())
  firstName   String       @map("first_name")
  lastName    String       @map("last_name")
  gender      Gender?
  birthDate   DateTime?    @map("birth_date")
  studyYear   Int?         @map("study_year")
  joinedAt    DateTime     @map("joined_at")
  email       String?      @unique
  phone       String?
  telegram    String?
  instagram   String?
  facebook    String?
  family      String?      // free text — no reference table
  status      MemberStatus @default(Observer)
  state       MemberState  @default(Active)
  mentorId    String?      @map("mentor_id")
  userId      String?      @unique @map("user_id")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relations
  user              User?               @relation(fields: [userId], references: [id])
  mentor            Member?             @relation("MentorMentee", fields: [mentorId], references: [id])
  mentees           Member[]            @relation("MentorMentee")
  teamMemberships   TeamMembership[]
  attendance        ActivityAttendance[]
  knowledgeCoverage KnowledgeCoverage[]
  applicationHistory ApplicationHistory[]

  @@index([status], name: "members_status_idx")
  @@index([state], name: "members_state_idx")
  @@index([mentorId], name: "members_mentor_id_idx")
  @@map("members")
}

// ── Teams ──────────────────────────────────────────────────

model Team {
  id         String    @id @default(cuid())
  name       String
  type       TeamType
  startDate  DateTime? @map("start_date")
  endDate    DateTime? @map("end_date")
  isArchived Boolean   @default(false) @map("is_archived")
  createdAt  DateTime  @default(now()) @map("created_at")

  positions   Position[]
  @@map("teams")
}

model Position {
  id       String  @id @default(cuid())
  name     String
  teamId   String  @map("team_id")
  // isHelper: only valid when team.type == Coreteam
  isHelper Boolean @default(false) @map("is_helper")

  team            Team             @relation(fields: [teamId], references: [id])
  teamMemberships TeamMembership[]

  @@index([teamId], name: "positions_team_id_idx")
  @@map("positions")
}

model TeamMembership {
  id         String    @id @default(cuid())
  memberId   String    @map("member_id")
  positionId String    @map("position_id")
  startDate  DateTime  @map("start_date")
  endDate    DateTime? @map("end_date")   // null = currently active
  createdAt  DateTime  @default(now()) @map("created_at")

  member   Member   @relation(fields: [memberId], references: [id])
  position Position @relation(fields: [positionId], references: [id])

  @@index([memberId], name: "team_memberships_member_id_idx")
  @@index([positionId], name: "team_memberships_position_id_idx")
  @@map("team_memberships")
}

model ApplicationHistory {
  id           String            @id @default(cuid())
  memberId     String            @map("member_id")
  positionName String            @map("position_name")  // snapshot at time of application
  teamName     String            @map("team_name")       // snapshot at time of application
  appliedAt    DateTime          @map("applied_at")
  result       ApplicationResult

  member Member @relation(fields: [memberId], references: [id])

  @@index([memberId], name: "application_history_member_id_idx")
  @@map("application_history")
}

// ── Activities ─────────────────────────────────────────────

model Activity {
  id          String       @id @default(cuid())
  type        ActivityType
  date        DateTime
  description String
  createdAt   DateTime     @default(now()) @map("created_at")

  agendaItems ActivityAgendaItem[]
  attendance  ActivityAttendance[]

  @@index([date], name: "activities_date_idx")
  @@map("activities")
}

model ActivityAgendaItem {
  id               String  @id @default(cuid())
  activityId       String  @map("activity_id")
  order            Int
  // Exactly one of text or knowledge_topic_id must be non-null
  text             String?
  knowledgeTopicId String? @map("knowledge_topic_id")

  activity       Activity       @relation(fields: [activityId], references: [id], onDelete: Cascade)
  knowledgeTopic KnowledgeTopic? @relation(fields: [knowledgeTopicId], references: [id])

  @@index([activityId], name: "activity_agenda_items_activity_id_idx")
  @@map("activity_agenda_items")
}

model ActivityAttendance {
  id         String   @id @default(cuid())
  activityId String   @map("activity_id")
  memberId   String   @map("member_id")
  createdAt  DateTime @default(now()) @map("created_at")

  activity Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  member   Member   @relation(fields: [memberId], references: [id])

  @@unique([activityId, memberId], name: "activity_attendance_unique")
  @@index([activityId], name: "activity_attendance_activity_id_idx")
  @@index([memberId], name: "activity_attendance_member_id_idx")
  @@map("activity_attendance")
}

// ── Knowledge (КСПЗ) ───────────────────────────────────────

model KnowledgeTable {
  id           String        @id @default(cuid())
  name         String
  targetStatus MemberStatus? @map("target_status")  // null = applies to all
  createdAt    DateTime      @default(now()) @map("created_at")

  topics  KnowledgeTopic[]
  columns KnowledgeTableColumn[]

  @@map("knowledge_tables")
}

model KnowledgeTopic {
  id               String @id @default(cuid())
  knowledgeTableId String @map("knowledge_table_id")
  name             String
  order            Int

  knowledgeTable KnowledgeTable      @relation(fields: [knowledgeTableId], references: [id], onDelete: Cascade)
  agendaItems    ActivityAgendaItem[]
  coverage       KnowledgeCoverage[]

  @@index([knowledgeTableId], name: "knowledge_topics_table_id_idx")
  @@map("knowledge_topics")
}

// Static reference table — seeded on first migration
model KnowledgeTransferType {
  id   String @id @default(cuid())
  name String @unique  // e.g., "Training", "Sharing", "Workshop"

  tableColumns KnowledgeTableColumn[]
  coverage     KnowledgeCoverage[]

  @@map("knowledge_transfer_types")
}

// Which transfer types are used in which table
model KnowledgeTableColumn {
  knowledgeTableId        String @map("knowledge_table_id")
  knowledgeTransferTypeId String @map("knowledge_transfer_type_id")

  knowledgeTable        KnowledgeTable        @relation(fields: [knowledgeTableId], references: [id], onDelete: Cascade)
  knowledgeTransferType KnowledgeTransferType @relation(fields: [knowledgeTransferTypeId], references: [id])

  @@id([knowledgeTableId, knowledgeTransferTypeId])
  @@map("knowledge_table_columns")
}

// Central coverage fact table
model KnowledgeCoverage {
  id                      String   @id @default(cuid())
  memberId                String   @map("member_id")
  knowledgeTopicId        String   @map("knowledge_topic_id")
  knowledgeTransferTypeId String   @map("knowledge_transfer_type_id")
  coveredAt               DateTime @default(now()) @map("covered_at")
  // null = manual entry; set = auto-assigned via activity attendance
  sourceActivityId        String?  @map("source_activity_id")

  member                Member                @relation(fields: [memberId], references: [id])
  knowledgeTopic        KnowledgeTopic        @relation(fields: [knowledgeTopicId], references: [id])
  knowledgeTransferType KnowledgeTransferType @relation(fields: [knowledgeTransferTypeId], references: [id])

  @@unique([memberId, knowledgeTopicId, knowledgeTransferTypeId], name: "knowledge_coverage_unique")
  @@index([memberId], name: "knowledge_coverage_member_id_idx")
  @@index([knowledgeTopicId], name: "knowledge_coverage_topic_id_idx")
  @@map("knowledge_coverage")
}
```

## Seed Script (prisma/seed.ts)
Seed `knowledge_transfer_types` on first migration:
```typescript
const transferTypes = ['Training', 'Sharing', 'Workshop', 'Mentoring', 'Self-study']
```
Run: `npx prisma db seed`

## Cascade Rules Summary
| Action | Behavior |
|---|---|
| Delete activity | Cascade delete `activity_agenda_items` and `activity_attendance` |
| Delete team | Preserve `team_memberships` (historical data) |
| Delete member | Cascade delete `activity_attendance`, `knowledge_coverage` |
| Member status → Alumni | NO deletions of any kind — preserve all records |
| Delete knowledge table | Cascade delete `knowledge_topics`, `knowledge_table_columns` |

## Key Indexes
- `members`: status, state, mentor_id
- `activities`: date
- `team_memberships`: member_id, position_id
- `activity_attendance`: activity_id, member_id (+ unique constraint)
- `knowledge_coverage`: member_id, knowledge_topic_id
- `knowledge_topics`: knowledge_table_id
- `application_history`: member_id
