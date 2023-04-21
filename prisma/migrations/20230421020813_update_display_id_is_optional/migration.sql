-- AlterTable
ALTER TABLE "Lottery" ADD COLUMN     "displayId" SERIAL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "displayId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "displayId" SERIAL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayId" SERIAL;
