-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "kenoDuration" INTEGER DEFAULT 30,
ADD COLUMN     "kenoPauseTime" INTEGER DEFAULT 30,
ADD COLUMN     "surcharge" INTEGER DEFAULT 0;
