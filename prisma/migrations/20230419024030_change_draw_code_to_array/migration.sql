/*
  Warnings:

  - The `drawCode` column on the `Lottery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `drawTime` column on the `Lottery` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "drawCode",
ADD COLUMN     "drawCode" INTEGER[],
DROP COLUMN "drawTime",
ADD COLUMN     "drawTime" TIMESTAMP(3)[];
