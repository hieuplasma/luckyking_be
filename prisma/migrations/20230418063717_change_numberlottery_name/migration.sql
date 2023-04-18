/*
  Warnings:

  - You are about to drop the `NumberLotery` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NumberLotery" DROP CONSTRAINT "NumberLotery_lotteryId_fkey";

-- DropTable
DROP TABLE "NumberLotery";

-- CreateTable
CREATE TABLE "NumberLottery" (
    "id" TEXT NOT NULL,
    "lotteryId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "numberSets" INTEGER NOT NULL,
    "numberDetail" JSONB NOT NULL,

    CONSTRAINT "NumberLottery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NumberLottery_lotteryId_key" ON "NumberLottery"("lotteryId");

-- AddForeignKey
ALTER TABLE "NumberLottery" ADD CONSTRAINT "NumberLottery_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
