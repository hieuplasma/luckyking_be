/*
  Warnings:

  - You are about to drop the column `cartId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_cartId_fkey";

-- AlterTable
ALTER TABLE "Lottery" ADD COLUMN     "cartId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cartId";

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
