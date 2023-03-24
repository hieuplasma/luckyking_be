/*
  Warnings:

  - You are about to drop the column `cartId` on the `Lottery` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CART';

-- DropForeignKey
ALTER TABLE "Lottery" DROP CONSTRAINT "Lottery_cartId_fkey";

-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "cartId";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cartId" TEXT;

-- CreateTable
CREATE TABLE "JackPot" (
    "id" TEXT NOT NULL,
    "JackPot1" INTEGER,
    "JackPot2" INTEGER,

    CONSTRAINT "JackPot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
