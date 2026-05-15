-- CreateTable
CREATE TABLE "knowledge_topic_transfer_types" (
    "knowledge_topic_id" TEXT NOT NULL,
    "knowledge_transfer_type_id" TEXT NOT NULL,

    CONSTRAINT "knowledge_topic_transfer_types_pkey" PRIMARY KEY ("knowledge_topic_id","knowledge_transfer_type_id")
);

-- AddForeignKey
ALTER TABLE "knowledge_topic_transfer_types" ADD CONSTRAINT "knowledge_topic_transfer_types_knowledge_topic_id_fkey" FOREIGN KEY ("knowledge_topic_id") REFERENCES "knowledge_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_topic_transfer_types" ADD CONSTRAINT "knowledge_topic_transfer_types_knowledge_transfer_type_id_fkey" FOREIGN KEY ("knowledge_transfer_type_id") REFERENCES "knowledge_transfer_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: existing topics inherit all transfer types from their parent table
INSERT INTO "knowledge_topic_transfer_types" ("knowledge_topic_id", "knowledge_transfer_type_id")
SELECT kt.id, ktc.knowledge_transfer_type_id
FROM "knowledge_topics" kt
JOIN "knowledge_table_columns" ktc ON ktc.knowledge_table_id = kt.knowledge_table_id
ON CONFLICT DO NOTHING;
