-- Add name column (nullable first for backfill)
ALTER TABLE "activities" ADD COLUMN "name" TEXT;
-- Backfill: use existing description as name
UPDATE "activities" SET "name" = COALESCE("description", 'Захід');
-- Make name NOT NULL
ALTER TABLE "activities" ALTER COLUMN "name" SET NOT NULL;
-- Make description nullable
ALTER TABLE "activities" ALTER COLUMN "description" DROP NOT NULL;
