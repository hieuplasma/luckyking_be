/*
  Warnings:

  - You are about to drop the column `consolation` on the `ResultMax3d` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResultMax3d" DROP COLUMN "consolation",
ADD COLUMN     "special" TEXT[];
