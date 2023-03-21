/*
  Warnings:

  - You are about to drop the column `rewardStatus` on the `Lottery` table. All the data in the column will be lost.
  - The `status` column on the `Lottery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `rewardStatus` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ERROR', 'RETURNED', 'WON', 'PAID', 'NO_PRIZE');

-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "rewardStatus",
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "rewardStatus",
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus";
