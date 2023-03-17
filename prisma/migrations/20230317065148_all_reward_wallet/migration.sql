-- CreateTable
CREATE TABLE "RewardWallet" (
    "id" SERIAL NOT NULL,
    "name" TEXT DEFAULT 'Ví Lucky King',
    "balance" INTEGER NOT NULL DEFAULT 0,
    "decription" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RewardWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardWallet_userId_key" ON "RewardWallet"("userId");

-- AddForeignKey
ALTER TABLE "RewardWallet" ADD CONSTRAINT "RewardWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
