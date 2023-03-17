/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `MoneyAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MoneyAccount_userId_key" ON "MoneyAccount"("userId");
