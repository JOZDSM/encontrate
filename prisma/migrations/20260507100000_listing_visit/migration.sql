-- CreateTable
CREATE TABLE "ListingVisit" (
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingVisit_pkey" PRIMARY KEY ("listingId", "userId")
);

-- CreateIndex
CREATE INDEX "ListingVisit_listingId_idx" ON "ListingVisit"("listingId");

-- AddForeignKey
ALTER TABLE "ListingVisit" ADD CONSTRAINT "ListingVisit_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingVisit" ADD CONSTRAINT "ListingVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
