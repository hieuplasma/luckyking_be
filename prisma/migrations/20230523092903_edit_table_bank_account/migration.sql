/*
  Warnings:

  - Added the required column `updatedAt` to the `BankAcount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankAcount" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "displayId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WithdrawRequest" ALTER COLUMN "displayId" DROP NOT NULL;
