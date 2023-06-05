/*
  Warnings:

  - Added the required column `transactionId` to the `BalanceFluctuations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BalanceFluctuations" ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BalanceFluctuations" ADD CONSTRAINT "BalanceFluctuations_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
