/*
  Warnings:

  - Added the required column `update` to the `Popup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Popup" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "update" TIMESTAMP(3) NOT NULL;
