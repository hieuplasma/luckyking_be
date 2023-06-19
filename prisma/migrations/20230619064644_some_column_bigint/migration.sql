DROP TRIGGER IF EXISTS "update_order_benefits_trigger" ON "Lottery";

-- AlterTable
ALTER TABLE "BalanceFluctuations" ALTER COLUMN "balanceBefore" SET DATA TYPE BIGINT,
ALTER COLUMN "balanceAfter" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "BankAccount" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Lottery" ALTER COLUMN "benefits" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "MoneyAccount" ALTER COLUMN "balance" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "amount" SET DATA TYPE BIGINT,
ALTER COLUMN "benefits" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "RewardWallet" ALTER COLUMN "balance" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "WithdrawRequest" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

CREATE OR REPLACE FUNCTION update_order_benefits()
RETURNS TRIGGER AS $$
DECLARE
  total_benefits BIGINT;
BEGIN
  SELECT COALESCE(SUM(benefits), 0) INTO total_benefits
  FROM "Lottery"
  WHERE "orderId" = NEW."orderId";

  UPDATE "Order"
  SET benefits = total_benefits
  WHERE id = NEW."orderId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_order_benefits_trigger
AFTER UPDATE ON "Lottery"
FOR EACH ROW
WHEN (OLD.benefits IS DISTINCT FROM NEW.benefits)
EXECUTE FUNCTION update_order_benefits();