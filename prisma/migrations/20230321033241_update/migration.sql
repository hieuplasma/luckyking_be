/*
  Warnings:

  - You are about to drop the column `confrimByStaff` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "confrimByStaff",
ADD COLUMN     "confrimUserId" TEXT;
