-- AlterTable
ALTER TABLE "Lottery" ALTER COLUMN "bets" SET DEFAULT 0,
ALTER COLUMN "benefits" DROP NOT NULL,
ALTER COLUMN "benefits" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "surcharge" SET DEFAULT 0;
