-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "autoConfirmKenoResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxNumberOfLockedOrder" INTEGER DEFAULT 10,
ADD COLUMN     "minAmountCanWithdrawn" INTEGER DEFAULT 100000,
ADD COLUMN     "notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stopDistributingBasicTickets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stopDistributingKenoTickets" BOOLEAN NOT NULL DEFAULT false;
