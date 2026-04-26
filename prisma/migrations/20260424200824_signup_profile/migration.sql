-- AlterTable
ALTER TABLE "User" ADD COLUMN     "whatsappNumber" TEXT;

-- CreateTable
CREATE TABLE "SignupProfile" (
    "email" TEXT NOT NULL,
    "name" TEXT,
    "whatsappNumber" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupProfile_pkey" PRIMARY KEY ("email")
);
