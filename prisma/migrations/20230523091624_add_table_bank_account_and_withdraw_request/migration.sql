-- CreateTable
CREATE TABLE "BankAcount" (
    "id" TEXT NOT NULL,
    "displayId" SERIAL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "shortName" TEXT,
    "accountNumber" TEXT,
    "amount" INTEGER DEFAULT 0,

    CONSTRAINT "BankAcount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawRequest" (
    "id" TEXT NOT NULL,
    "displayId" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "shortName" TEXT,
    "accountNumber" TEXT,
    "amount" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "statusDescription" TEXT,
    "confirmAt" TIMESTAMP(3),
    "confirmBy" TEXT,
    "confirmUserId" TEXT,

    CONSTRAINT "WithdrawRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAcount_shortName_key" ON "BankAcount"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "BankAcount_shortName_accountNumber_key" ON "BankAcount"("shortName", "accountNumber");

-- AddForeignKey
ALTER TABLE "BankAcount" ADD CONSTRAINT "BankAcount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawRequest" ADD CONSTRAINT "WithdrawRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
