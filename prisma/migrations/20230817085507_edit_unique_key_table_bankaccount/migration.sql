/*
  Warnings:

  - A unique constraint covering the columns `[shortName,accountNumber,userId]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BankAccount_shortName_accountNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_shortName_accountNumber_userId_key" ON "BankAccount"("shortName", "accountNumber", "userId");
