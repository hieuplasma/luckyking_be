-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "displayId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "printerUrl" TEXT;
