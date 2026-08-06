-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- Seed categories from distinct Service.category values (stable ids from name hash)
INSERT INTO "ServiceCategory" ("id", "name", "slug", "synonyms", "sortOrder", "createdAt", "updatedAt")
SELECT
  'cat_' || substr(md5(category), 1, 24),
  category,
  trim(both '-' FROM lower(regexp_replace(
    translate(
      category,
      'ÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÄËÏÖäëïöÂÊÎÔÛâêîôû',
      'AEIOUUnaeiounAEIOUaeiouAEIOUaeiouAEIOUaeiou'
    ),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  ))),
  ARRAY[]::TEXT[],
  (ROW_NUMBER() OVER (ORDER BY category))::INTEGER - 1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "category" AS category
  FROM "Service"
) AS distinct_categories;

-- Add FK column
ALTER TABLE "Service" ADD COLUMN "categoryId" TEXT;

-- Backfill
UPDATE "Service" AS s
SET "categoryId" = c."id"
FROM "ServiceCategory" AS c
WHERE c."name" = s."category";

-- Guard: fail migration if any service lacked a category match
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Service" WHERE "categoryId" IS NULL) THEN
    RAISE EXCEPTION 'ServiceCategory backfill left NULL categoryId rows';
  END IF;
END $$;

ALTER TABLE "Service" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old string category
DROP INDEX IF EXISTS "Service_category_published_idx";
ALTER TABLE "Service" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Service_categoryId_published_idx" ON "Service"("categoryId", "published");
