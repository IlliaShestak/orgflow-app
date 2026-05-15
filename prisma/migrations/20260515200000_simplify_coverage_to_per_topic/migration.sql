-- Deduplicate: keep one row per (member_id, knowledge_topic_id) before dropping the column
DELETE FROM "knowledge_coverage"
WHERE "id" NOT IN (
  SELECT MIN("id")
  FROM "knowledge_coverage"
  GROUP BY "member_id", "knowledge_topic_id"
);

-- Drop FK on knowledge_transfer_type_id
ALTER TABLE "knowledge_coverage" DROP CONSTRAINT IF EXISTS "knowledge_coverage_knowledge_transfer_type_id_fkey";

-- Drop old unique constraint
ALTER TABLE "knowledge_coverage" DROP CONSTRAINT IF EXISTS "knowledge_coverage_unique";

-- Drop the column
ALTER TABLE "knowledge_coverage" DROP COLUMN IF EXISTS "knowledge_transfer_type_id";

-- Add new simplified unique constraint
ALTER TABLE "knowledge_coverage" ADD CONSTRAINT "knowledge_coverage_unique" UNIQUE ("member_id", "knowledge_topic_id");
