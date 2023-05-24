-- AlterTable
ALTER TABLE "ResultKeno" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedUserId" TEXT,
ADD COLUMN     "displayId" SERIAL;

-- AlterTable
ALTER TABLE "ResultMax3d" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedUserId" TEXT,
ADD COLUMN     "displayId" SERIAL;

-- AlterTable
ALTER TABLE "ResultMega" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedUserId" TEXT;

-- AlterTable
ALTER TABLE "ResultPower" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedUserId" TEXT,
ADD COLUMN     "displayId" SERIAL;
