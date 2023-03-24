/*
  Warnings:

  - You are about to drop the column `JackPot1` on the `JackPot` table. All the data in the column will be lost.
  - You are about to drop the column `JackPot2` on the `JackPot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JackPot" DROP COLUMN "JackPot1",
DROP COLUMN "JackPot2",
ADD COLUMN     "JackPot1Power" INTEGER,
ADD COLUMN     "JackPot2Power" INTEGER,
ADD COLUMN     "JackPotMega" INTEGER,
ADD COLUMN     "uniqueCode" INTEGER NOT NULL DEFAULT 1;
