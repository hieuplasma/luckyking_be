-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'LOCK';

-- AlterTable
ALTER TABLE "Lottery" ALTER COLUMN "displayId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "displayId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "displayId" DROP NOT NULL;
