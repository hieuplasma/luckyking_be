/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `BalanceFluctuations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BalanceFluctuations_transactionId_key" ON "BalanceFluctuations"("transactionId");
