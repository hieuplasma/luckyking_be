/*
  Warnings:

  - You are about to drop the column `assignedStaffId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_assignedStaffId_fkey";

-- AlterTable
ALTER TABLE "Lottery" ADD COLUMN     "assignedStaffId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "assignedStaffId";

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
