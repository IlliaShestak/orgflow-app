-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'vp4hr', 'full_member');

-- CreateEnum
CREATE TYPE "member_status" AS ENUM ('observer', 'baby', 'full', 'alumni');

-- CreateEnum
CREATE TYPE "member_state" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "team_type" AS ENUM ('coreteam', 'project', 'team');

-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('gathering', 'sit', 'leisure_event');

-- CreateEnum
CREATE TYPE "application_result" AS ENUM ('success', 'fail');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "role" "role" NOT NULL DEFAULT 'full_member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "gender",
    "birth_date" TIMESTAMP(3),
    "study_year" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "telegram" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "family" TEXT,
    "status" "member_status" NOT NULL DEFAULT 'observer',
    "state" "member_state" NOT NULL DEFAULT 'active',
    "mentor_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "team_type" NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "is_helper" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_history" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "position_name" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL,
    "result" "application_result" NOT NULL,

    CONSTRAINT "application_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "type" "activity_type" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_agenda_items" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT,
    "knowledge_topic_id" TEXT,

    CONSTRAINT "activity_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attendance" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_tables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_status" "member_status",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_topics" (
    "id" TEXT NOT NULL,
    "knowledge_table_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "knowledge_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_transfer_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "knowledge_transfer_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_table_columns" (
    "knowledge_table_id" TEXT NOT NULL,
    "knowledge_transfer_type_id" TEXT NOT NULL,

    CONSTRAINT "knowledge_table_columns_pkey" PRIMARY KEY ("knowledge_table_id","knowledge_transfer_type_id")
);

-- CreateTable
CREATE TABLE "knowledge_coverage" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "knowledge_topic_id" TEXT NOT NULL,
    "knowledge_transfer_type_id" TEXT NOT NULL,
    "covered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_activity_id" TEXT,

    CONSTRAINT "knowledge_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_key" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE INDEX "members_state_idx" ON "members"("state");

-- CreateIndex
CREATE INDEX "members_mentor_id_idx" ON "members"("mentor_id");

-- CreateIndex
CREATE INDEX "positions_team_id_idx" ON "positions"("team_id");

-- CreateIndex
CREATE INDEX "team_memberships_member_id_idx" ON "team_memberships"("member_id");

-- CreateIndex
CREATE INDEX "team_memberships_position_id_idx" ON "team_memberships"("position_id");

-- CreateIndex
CREATE INDEX "application_history_member_id_idx" ON "application_history"("member_id");

-- CreateIndex
CREATE INDEX "activities_date_idx" ON "activities"("date");

-- CreateIndex
CREATE INDEX "activity_agenda_items_activity_id_idx" ON "activity_agenda_items"("activity_id");

-- CreateIndex
CREATE INDEX "activity_attendance_activity_id_idx" ON "activity_attendance"("activity_id");

-- CreateIndex
CREATE INDEX "activity_attendance_member_id_idx" ON "activity_attendance"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_attendance_activity_id_member_id_key" ON "activity_attendance"("activity_id", "member_id");

-- CreateIndex
CREATE INDEX "knowledge_topics_table_id_idx" ON "knowledge_topics"("knowledge_table_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_transfer_types_name_key" ON "knowledge_transfer_types"("name");

-- CreateIndex
CREATE INDEX "knowledge_coverage_member_id_idx" ON "knowledge_coverage"("member_id");

-- CreateIndex
CREATE INDEX "knowledge_coverage_topic_id_idx" ON "knowledge_coverage"("knowledge_topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_coverage_member_id_knowledge_topic_id_knowledge_t_key" ON "knowledge_coverage"("member_id", "knowledge_topic_id", "knowledge_transfer_type_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_history" ADD CONSTRAINT "application_history_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_agenda_items" ADD CONSTRAINT "activity_agenda_items_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_agenda_items" ADD CONSTRAINT "activity_agenda_items_knowledge_topic_id_fkey" FOREIGN KEY ("knowledge_topic_id") REFERENCES "knowledge_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attendance" ADD CONSTRAINT "activity_attendance_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attendance" ADD CONSTRAINT "activity_attendance_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_topics" ADD CONSTRAINT "knowledge_topics_knowledge_table_id_fkey" FOREIGN KEY ("knowledge_table_id") REFERENCES "knowledge_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_table_columns" ADD CONSTRAINT "knowledge_table_columns_knowledge_table_id_fkey" FOREIGN KEY ("knowledge_table_id") REFERENCES "knowledge_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_table_columns" ADD CONSTRAINT "knowledge_table_columns_knowledge_transfer_type_id_fkey" FOREIGN KEY ("knowledge_transfer_type_id") REFERENCES "knowledge_transfer_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_coverage" ADD CONSTRAINT "knowledge_coverage_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_coverage" ADD CONSTRAINT "knowledge_coverage_knowledge_topic_id_fkey" FOREIGN KEY ("knowledge_topic_id") REFERENCES "knowledge_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_coverage" ADD CONSTRAINT "knowledge_coverage_knowledge_transfer_type_id_fkey" FOREIGN KEY ("knowledge_transfer_type_id") REFERENCES "knowledge_transfer_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
