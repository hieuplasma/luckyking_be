-- CreateTable
CREATE TABLE "PriorityNumber" (
    "id" TEXT NOT NULL,
    "displayId" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriorityNumber_pkey" PRIMARY KEY ("id")
);
