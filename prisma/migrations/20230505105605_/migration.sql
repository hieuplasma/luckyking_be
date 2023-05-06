/*
  Warnings:

  - A unique constraint covering the columns `[drawCode,type]` on the table `ResultMax3d` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResultMax3d_drawCode_type_key" ON "ResultMax3d"("drawCode", "type");
