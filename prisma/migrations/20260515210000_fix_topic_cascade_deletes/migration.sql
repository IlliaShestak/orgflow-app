-- Fix KnowledgeCoverage: cascade delete when topic is deleted
ALTER TABLE "knowledge_coverage" DROP CONSTRAINT IF EXISTS "knowledge_coverage_knowledge_topic_id_fkey";
ALTER TABLE "knowledge_coverage" ADD CONSTRAINT "knowledge_coverage_knowledge_topic_id_fkey"
  FOREIGN KEY ("knowledge_topic_id") REFERENCES "knowledge_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix ActivityAgendaItem: set null when referenced topic is deleted (item becomes text-only)
ALTER TABLE "activity_agenda_items" DROP CONSTRAINT IF EXISTS "activity_agenda_items_knowledge_topic_id_fkey";
ALTER TABLE "activity_agenda_items" ADD CONSTRAINT "activity_agenda_items_knowledge_topic_id_fkey"
  FOREIGN KEY ("knowledge_topic_id") REFERENCES "knowledge_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
