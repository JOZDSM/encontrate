-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "showWhatsappOnListing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "showEmailOnListing" BOOLEAN NOT NULL DEFAULT true;
