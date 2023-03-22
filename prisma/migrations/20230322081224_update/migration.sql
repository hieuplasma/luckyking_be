/*
  Warnings:

  - The `specialNumber` column on the `ResultPower` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ResultPower" DROP COLUMN "specialNumber",
ADD COLUMN     "specialNumber" INTEGER;
