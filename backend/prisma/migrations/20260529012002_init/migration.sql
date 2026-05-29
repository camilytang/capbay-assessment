-- CreateEnum
CREATE TYPE "Status" AS ENUM ('REGISTERED', 'TEST_DRIVE_SCHEDULED', 'TEST_DRIVE_COMPLETED', 'PURCHASED', 'CANCELLED');

-- CreateTable
CREATE TABLE "registrations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "ic_number" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'REGISTERED',
    "down_payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "loan_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_promotion_eligible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_email_key" ON "registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_ic_number_key" ON "registrations"("ic_number");
