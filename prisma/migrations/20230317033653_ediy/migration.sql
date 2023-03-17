/*
  Warnings:

  - You are about to drop the column `type` on the `MoneyAccount` table. All the data in the column will be lost.
  - Made the column `balance` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lottery" ALTER COLUMN "buyTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MoneyAccount" DROP COLUMN "type",
ADD COLUMN     "name" TEXT,
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "decription" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "createAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0;
