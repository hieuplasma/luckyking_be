-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "destination" TEXT,
ADD COLUMN     "source" TEXT,
ALTER COLUMN "detail" DROP NOT NULL,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "payment" SET DEFAULT '',
ALTER COLUMN "amount" SET DEFAULT 0;
