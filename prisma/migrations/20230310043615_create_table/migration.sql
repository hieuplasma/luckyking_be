-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "identify" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "int" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("int")
);
