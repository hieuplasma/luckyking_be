/*
  Warnings:

  - You are about to drop the column `periodCode` on the `Lottery` table. All the data in the column will be lost.
  - You are about to drop the column `periodTime` on the `Lottery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "periodCode",
DROP COLUMN "periodTime",
ADD COLUMN     "drawCode" INTEGER,
ADD COLUMN     "drawTime" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ResultKeno" (
    "id" TEXT NOT NULL,
    "drawCode" INTEGER NOT NULL,
    "drawTime" TIMESTAMP(3) NOT NULL,
    "result" TEXT,

    CONSTRAINT "ResultKeno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultMega" (
    "id" TEXT NOT NULL,
    "drawCode" INTEGER NOT NULL,
    "drawTime" TIMESTAMP(3) NOT NULL,
    "result" TEXT,

    CONSTRAINT "ResultMega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultPower" (
    "id" TEXT NOT NULL,
    "drawCode" INTEGER NOT NULL,
    "drawTime" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "specialNumber" TEXT,

    CONSTRAINT "ResultPower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultMax3d" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "drawCode" INTEGER NOT NULL,
    "drawTime" TIMESTAMP(3) NOT NULL,
    "first" TEXT[],
    "second" TEXT[],
    "third" TEXT[],
    "consolation" TEXT[],

    CONSTRAINT "ResultMax3d_pkey" PRIMARY KEY ("id")
);
