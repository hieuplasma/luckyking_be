/*
  Warnings:

  - A unique constraint covering the columns `[withdrawRequestId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "withdrawRequestId" TEXT;

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "autoRewardThreshold" INTEGER NOT NULL DEFAULT 5000000,
    "listBank" JSONB,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_withdrawRequestId_key" ON "Transaction"("withdrawRequestId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_withdrawRequestId_fkey" FOREIGN KEY ("withdrawRequestId") REFERENCES "WithdrawRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
