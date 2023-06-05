-- CreateTable
CREATE TABLE "BalanceFluctuations" (
    "id" TEXT NOT NULL,
    "rewardWalletId" TEXT,
    "moneyAccountId" TEXT,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,

    CONSTRAINT "BalanceFluctuations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BalanceFluctuations" ADD CONSTRAINT "BalanceFluctuations_rewardWalletId_fkey" FOREIGN KEY ("rewardWalletId") REFERENCES "RewardWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceFluctuations" ADD CONSTRAINT "BalanceFluctuations_moneyAccountId_fkey" FOREIGN KEY ("moneyAccountId") REFERENCES "MoneyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
