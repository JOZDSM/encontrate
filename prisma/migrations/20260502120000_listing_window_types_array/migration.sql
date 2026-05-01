-- AlterTable: support multiple window types per listing
ALTER TABLE "Listing" ADD COLUMN "windowTypes" "WindowType"[] DEFAULT ARRAY[]::"WindowType"[];

UPDATE "Listing" SET "windowTypes" = ARRAY["windowType"]::"WindowType"[];

ALTER TABLE "Listing" DROP COLUMN "windowType";

ALTER TABLE "Listing" ALTER COLUMN "windowTypes" SET NOT NULL;
