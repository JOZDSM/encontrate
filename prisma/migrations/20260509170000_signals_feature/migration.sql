-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE', 'NON_BINARY', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ES', 'EN', 'CA', 'IT', 'FR', 'DE', 'PT', 'OTHER');

-- CreateEnum
CREATE TYPE "MovingWith" AS ENUM ('SOLO', 'COUPLE', 'FAMILY', 'ROOMMATES');

-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('STUDENT', 'EMPLOYED', 'FREELANCE', 'ENTREPRENEUR', 'REMOTE_WORKER', 'OTHER');

-- CreateEnum
CREATE TYPE "FlexStayLength" AS ENUM ('WEEKEND', 'WEEK', 'MONTH');

-- AlterTable: Message.listingId becomes nullable so a message can reference a Signal instead.
ALTER TABLE "Message" ALTER COLUMN "listingId" DROP NOT NULL;

-- AlterTable: add Message.signalId
ALTER TABLE "Message" ADD COLUMN "signalId" TEXT;

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SignalStatus" NOT NULL DEFAULT 'DRAFT',
    "wizardStep" INTEGER NOT NULL DEFAULT 0,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "countryOfOrigin" TEXT,
    "occupation" "Occupation",
    "languages" "Language"[] DEFAULT ARRAY[]::"Language"[],
    "movingWith" "MovingWith",
    "timeUseDescription" TEXT,
    "indoorOutdoorDescription" TEXT,
    "cleanlinessImportance" INTEGER,
    "orderImportance" INTEGER,
    "instagramHandle" TEXT,
    "twitterHandle" TEXT,
    "facebookHandle" TEXT,
    "tiktokHandle" TEXT,
    "dateMode" TEXT,
    "exactCheckIn" DATE,
    "exactCheckOut" DATE,
    "exactFlexDays" INTEGER,
    "flexStayLengths" "FlexStayLength"[] DEFAULT ARRAY[]::"FlexStayLength"[],
    "flexMonths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "asapUrgent" BOOLEAN NOT NULL DEFAULT false,
    "preferredZones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredBedSizes" "BedSize"[] DEFAULT ARRAY[]::"BedSize"[],
    "preferredWindowTypes" "WindowType"[] DEFAULT ARRAY[]::"WindowType"[],
    "preferredRoomSizeSqmMin" INTEGER,
    "preferredFurnished" BOOLEAN,
    "preferredApartmentRoomsMin" INTEGER,
    "preferredApartmentBathsMin" INTEGER,
    "preferredApartmentSizeSqmMin" INTEGER,
    "preferredWifi" BOOLEAN,
    "description" TEXT,
    "listingAlertInApp" BOOLEAN NOT NULL DEFAULT false,
    "listingAlertEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalPhoto" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SignalPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuscarHuespedFilter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT false,
    "genders" "Gender"[] DEFAULT ARRAY[]::"Gender"[],
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "countriesOfOrigin" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "occupations" "Occupation"[] DEFAULT ARRAY[]::"Occupation"[],
    "languages" "Language"[] DEFAULT ARRAY[]::"Language"[],
    "movingWith" "MovingWith"[] DEFAULT ARRAY[]::"MovingWith"[],
    "cleanlinessMin" INTEGER,
    "cleanlinessMax" INTEGER,
    "orderMin" INTEGER,
    "orderMax" INTEGER,
    "dateMode" TEXT,
    "exactCheckIn" DATE,
    "exactCheckOut" DATE,
    "exactFlexDays" INTEGER,
    "flexStayLengths" "FlexStayLength"[] DEFAULT ARRAY[]::"FlexStayLength"[],
    "flexMonths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "includeAsap" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuscarHuespedFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalMatch" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "SignalMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestListingMatch" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),

    CONSTRAINT "GuestListingMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_signalId_createdAt_idx" ON "Message"("signalId", "createdAt");

-- CreateIndex
CREATE INDEX "Signal_userId_status_idx" ON "Signal"("userId", "status");

-- CreateIndex
CREATE INDEX "Signal_status_idx" ON "Signal"("status");

-- CreateIndex: partial unique — at most one ACTIVE Signal per user.
CREATE UNIQUE INDEX "Signal_one_active_per_user" ON "Signal"("userId") WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "SignalPhoto_signalId_idx" ON "SignalPhoto"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "BuscarHuespedFilter_userId_key" ON "BuscarHuespedFilter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SignalMatch_hostId_signalId_key" ON "SignalMatch"("hostId", "signalId");

-- CreateIndex
CREATE INDEX "SignalMatch_hostId_notifiedAt_idx" ON "SignalMatch"("hostId", "notifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuestListingMatch_signalId_listingId_key" ON "GuestListingMatch"("signalId", "listingId");

-- CreateIndex
CREATE INDEX "GuestListingMatch_signalId_notifiedAt_idx" ON "GuestListingMatch"("signalId", "notifiedAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalPhoto" ADD CONSTRAINT "SignalPhoto_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuscarHuespedFilter" ADD CONSTRAINT "BuscarHuespedFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalMatch" ADD CONSTRAINT "SignalMatch_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalMatch" ADD CONSTRAINT "SignalMatch_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestListingMatch" ADD CONSTRAINT "GuestListingMatch_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestListingMatch" ADD CONSTRAINT "GuestListingMatch_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
