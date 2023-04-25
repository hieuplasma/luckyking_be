/*
  Warnings:

  - Changed the type of `drawCode` on the `Lottery` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `drawTime` on the `Lottery` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "drawCode",
ADD COLUMN     "drawCode" INTEGER NOT NULL,
DROP COLUMN "drawTime",
ADD COLUMN     "drawTime" TIMESTAMP(3) NOT NULL;
