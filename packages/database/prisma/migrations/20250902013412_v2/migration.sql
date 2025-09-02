/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('SPOT', 'CFD');

-- CreateEnum
CREATE TYPE "public"."OrderDirection" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- DropTable
DROP TABLE "public"."user";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "orderType" "public"."OrderType" NOT NULL,
    "direction" "public"."OrderDirection",
    "qty" DECIMAL(65,30) NOT NULL,
    "leverage" INTEGER,
    "margin" DECIMAL(65,30),
    "entryPrice" DECIMAL(65,30) NOT NULL,
    "stopLossPrice" DECIMAL(65,30),
    "takeProfitPrice" DECIMAL(65,30),
    "closePrice" DECIMAL(65,30),
    "pnl" DECIMAL(65,30),
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
