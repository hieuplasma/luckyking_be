/*
  Warnings:

  - You are about to drop the column `balanceFlucId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_balanceFlucId_fkey";

-- DropIndex
DROP INDEX "Transaction_balanceFlucId_key";

-- AlterTable
ALTER TABLE "BalanceFluctuations" ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "balanceFlucId";

-- AddForeignKey
ALTER TABLE "BalanceFluctuations" ADD CONSTRAINT "BalanceFluctuations_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
