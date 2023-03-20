/*
  Warnings:

  - You are about to drop the column `totalMoney` on the `Lottery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "totalMoney",
ALTER COLUMN "resultTime" DROP NOT NULL,
ALTER COLUMN "imageback" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'keep';
