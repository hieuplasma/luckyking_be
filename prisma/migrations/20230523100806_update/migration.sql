/*
  Warnings:

  - You are about to drop the `BankAcount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BankAcount" DROP CONSTRAINT "BankAcount_userId_fkey";

-- DropTable
DROP TABLE "BankAcount";

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "displayId" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "shortName" TEXT,
    "accountNumber" TEXT,
    "amount" INTEGER DEFAULT 0,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_shortName_key" ON "BankAccount"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_shortName_accountNumber_key" ON "BankAccount"("shortName", "accountNumber");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
