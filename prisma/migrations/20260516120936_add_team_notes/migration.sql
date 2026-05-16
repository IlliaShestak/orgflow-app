-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "notes" TEXT;

-- RenameIndex
ALTER INDEX "knowledge_coverage_unique" RENAME TO "knowledge_coverage_member_id_knowledge_topic_id_key";
