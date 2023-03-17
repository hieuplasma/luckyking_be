-- CreateTable
CREATE TABLE "Ffluctuations" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "payment" INTEGER NOT NULL,
    "balanceBefor" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "decription" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Ffluctuations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ffluctuations" ADD CONSTRAINT "Ffluctuations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
