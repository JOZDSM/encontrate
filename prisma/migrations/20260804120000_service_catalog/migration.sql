-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "professionalName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "instagramUrl" TEXT,
    "instagramHandle" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "showWhatsapp" BOOLEAN NOT NULL DEFAULT true,
    "showEmail" BOOLEAN NOT NULL DEFAULT true,
    "offeringItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "neighborhood" TEXT,
    "priceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceReview" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "avatarUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_category_published_idx" ON "Service"("category", "published");

-- CreateIndex
CREATE INDEX "Service_published_featured_sortOrder_idx" ON "Service"("published", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "ServiceReview_serviceId_sortOrder_idx" ON "ServiceReview"("serviceId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ServiceReview" ADD CONSTRAINT "ServiceReview_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
