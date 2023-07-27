-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentDeviceId" TEXT;

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "otp" TEXT,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);
