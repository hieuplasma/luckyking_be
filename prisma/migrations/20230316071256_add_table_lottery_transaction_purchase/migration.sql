-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "Lottery" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    "buyTime" TIMESTAMP(3) NOT NULL,
    "resultTime" TIMESTAMP(3) NOT NULL,
    "deleteTime" TIMESTAMP(3),
    "bets" INTEGER NOT NULL,
    "benefits" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "image" TEXT,
    "userId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "payment" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "payment" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
