/*
  Warnings:

  - A unique constraint covering the columns `[drawCode]` on the table `ResultKeno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[drawCode]` on the table `ResultMax3d` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[drawCode]` on the table `ResultMega` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[drawCode]` on the table `ResultPower` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResultKeno_drawCode_key" ON "ResultKeno"("drawCode");

-- CreateIndex
CREATE UNIQUE INDEX "ResultMax3d_drawCode_key" ON "ResultMax3d"("drawCode");

-- CreateIndex
CREATE UNIQUE INDEX "ResultMega_drawCode_key" ON "ResultMega"("drawCode");

-- CreateIndex
CREATE UNIQUE INDEX "ResultPower_drawCode_key" ON "ResultPower"("drawCode");
