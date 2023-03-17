/*
  Warnings:

  - You are about to drop the column `detail` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "detail",
ADD COLUMN     "transactionPersonId" TEXT;
