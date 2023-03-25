-- AlterTable
ALTER TABLE "Lottery" ALTER COLUMN "buyTime" SET DEFAULT now() at time zone 'GMT+7';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "creataAt" SET DEFAULT now() at time zone 'GMT+7';

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "createAt" SET DEFAULT now() at time zone 'GMT+7';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now() at time zone 'GMT-7',
ALTER COLUMN "updateAt" SET DEFAULT now() at time zone 'GMT-7';
