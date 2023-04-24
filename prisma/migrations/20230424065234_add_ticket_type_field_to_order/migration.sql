/*
  Warnings:

  - You are about to drop the column `creataAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "creataAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ticketType" TEXT DEFAULT 'basic';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
