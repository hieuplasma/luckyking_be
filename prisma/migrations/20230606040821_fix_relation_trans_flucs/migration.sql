/*
  Warnings:

  - You are about to drop the column `transactionId` on the `BalanceFluctuations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[balanceFlucId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BalanceFluctuations" DROP CONSTRAINT "BalanceFluctuations_transactionId_fkey";

-- DropIndex
DROP INDEX "BalanceFluctuations_transactionId_key";

-- AlterTable
ALTER TABLE "BalanceFluctuations" DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "balanceFlucId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_balanceFlucId_key" ON "Transaction"("balanceFlucId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_balanceFlucId_fkey" FOREIGN KEY ("balanceFlucId") REFERENCES "BalanceFluctuations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
