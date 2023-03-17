/*
  Warnings:

  - You are about to drop the column `detail` on the `Lottery` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Lottery` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Lottery` table. All the data in the column will be lost.
  - You are about to drop the `Ffluctuations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bonusStatus` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageback` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodCode` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodTime` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMoney` to the `Lottery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ffluctuations" DROP CONSTRAINT "Ffluctuations_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lottery" DROP CONSTRAINT "Lottery_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- AlterTable
ALTER TABLE "Lottery" DROP COLUMN "detail",
DROP COLUMN "image",
DROP COLUMN "transactionId",
ADD COLUMN     "bonusStatus" BOOLEAN NOT NULL,
ADD COLUMN     "cartId" INTEGER,
ADD COLUMN     "imageFront" TEXT,
ADD COLUMN     "imageback" TEXT NOT NULL,
ADD COLUMN     "orderId" INTEGER,
ADD COLUMN     "periodCode" TEXT NOT NULL,
ADD COLUMN     "periodTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalMoney" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "payment" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "personNumber" INTEGER;

-- DropTable
DROP TABLE "Ffluctuations";

-- DropTable
DROP TABLE "Purchase";

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "description" TEXT,
    "statusDescription" TEXT,
    "status" TEXT NOT NULL,
    "creataAt" TIMESTAMP(3) NOT NULL,
    "confirmAt" TIMESTAMP(3),
    "confirmBy" TEXT,
    "confrimByStaff" TEXT,
    "payment" TEXT,
    "tradingCode" TEXT NOT NULL,
    "surcharge" INTEGER NOT NULL,
    "dataPart" TEXT NOT NULL,
    "rewardStatus" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyAccount" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "decription" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "MoneyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberLotery" (
    "id" SERIAL NOT NULL,
    "lotteryId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "numberSets" INTEGER NOT NULL,
    "numberDetail" JSONB NOT NULL,
    "statusWinning" TEXT NOT NULL,

    CONSTRAINT "NumberLotery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberLotery_lotteryId_key" ON "NumberLotery"("lotteryId");

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAccount" ADD CONSTRAINT "MoneyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NumberLotery" ADD CONSTRAINT "NumberLotery_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
