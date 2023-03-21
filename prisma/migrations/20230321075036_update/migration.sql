/*
  Warnings:

  - You are about to drop the column `imageback` on the `Lottery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "imageback",
ADD COLUMN     "imageBack" TEXT;
