-- Migrate MovingWith enum from (SOLO/COUPLE/FAMILY/ROOMMATES) to (SOLO/COUPLE/OTHER).
-- Existing FAMILY + ROOMMATES rows collapse into OTHER on both the scalar
-- `Signal.movingWith` column and the array `BuscarHuespedFilter.movingWith`
-- column. We cast through `text`/`text[]`, drop the old enum, recreate it,
-- then cast back so the column type tracks the new enum.

-- 1) Convert columns to text so we can rewrite values freely.
ALTER TABLE "Signal" ALTER COLUMN "movingWith" TYPE TEXT;
ALTER TABLE "BuscarHuespedFilter" ALTER COLUMN "movingWith" DROP DEFAULT;
ALTER TABLE "BuscarHuespedFilter" ALTER COLUMN "movingWith" TYPE TEXT[]
  USING "movingWith"::TEXT[];

-- 2) Backfill legacy values to OTHER.
UPDATE "Signal"
SET "movingWith" = 'OTHER'
WHERE "movingWith" IN ('FAMILY', 'ROOMMATES');

UPDATE "BuscarHuespedFilter"
SET "movingWith" = (
  SELECT COALESCE(
    ARRAY(
      SELECT DISTINCT CASE WHEN v IN ('FAMILY', 'ROOMMATES') THEN 'OTHER' ELSE v END
      FROM unnest("movingWith") AS v
    ),
    ARRAY[]::TEXT[]
  )
);

-- 3) Replace the enum.
DROP TYPE "MovingWith";
CREATE TYPE "MovingWith" AS ENUM ('SOLO', 'COUPLE', 'OTHER');

-- 4) Cast columns back to the enum type and restore the array default.
ALTER TABLE "Signal" ALTER COLUMN "movingWith" TYPE "MovingWith"
  USING "movingWith"::"MovingWith";
ALTER TABLE "BuscarHuespedFilter" ALTER COLUMN "movingWith" TYPE "MovingWith"[]
  USING "movingWith"::"MovingWith"[];
ALTER TABLE "BuscarHuespedFilter" ALTER COLUMN "movingWith"
  SET DEFAULT ARRAY[]::"MovingWith"[];
