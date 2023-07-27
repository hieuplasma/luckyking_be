-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "exp" TIMESTAMP(3),
ADD COLUMN     "iat" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT;
