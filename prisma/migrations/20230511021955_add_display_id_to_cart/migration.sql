-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "displayId" SERIAL;

-- AlterTable
ALTER TABLE "ResultMega" ALTER COLUMN "displayId" DROP NOT NULL;
