-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('STUDENT', 'SPORT', 'FAMILY', 'SINGLE', 'OFFICE');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('LOSE_WEIGHT', 'GAIN_WEIGHT', 'HEALTHY', 'CHEAP');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('MOSCOW', 'SPB', 'OTHER');

-- CreateEnum
CREATE TYPE "CookingSkill" AS ENUM ('BEGINNER', 'BASIC', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('DAIRY', 'MEAT', 'FISH', 'GRAINS', 'VEGETABLES', 'FRUITS', 'BREAD', 'EGGS_OILS', 'GROCERY', 'FROZEN', 'DRINKS', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductSource" AS ENUM ('USDA', 'FATSECRET', 'MANUAL');

-- CreateEnum
CREATE TYPE "StoreChain" AS ENUM ('PYATEROCHKA', 'PEREKRESTOK', 'MAGNIT', 'VKUSVILL', 'LENTA');

-- CreateEnum
CREATE TYPE "MenuStatus" AS ENUM ('PENDING', 'DONE', 'ERROR');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "profileType" "ProfileType",
    "goal" "Goal",
    "dietaryRestrictions" TEXT[],
    "allergies" TEXT[],
    "dislikedProducts" TEXT[],
    "region" "Region",
    "cookingSkill" "CookingSkill",
    "equipment" TEXT[],
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "aliases" TEXT[],
    "unit" TEXT NOT NULL,
    "avgPriceRub" DECIMAL(10,2) NOT NULL,
    "caloriesPer100g" DECIMAL(8,2),
    "proteinPer100g" DECIMAL(8,2),
    "fatPer100g" DECIMAL(8,2),
    "carbsPer100g" DECIMAL(8,2),
    "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
    "source" "ProductSource" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "budgetInput" INTEGER NOT NULL,
    "storeChain" "StoreChain",
    "promptVersion" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL,
    "tokensOut" INTEGER NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "parsedMenu" JSONB NOT NULL,
    "shoppingList" JSONB NOT NULL,
    "nutritionSummary" JSONB,
    "status" "MenuStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePrices" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "storeChain" "StoreChain" NOT NULL,
    "priceRub" DECIMAL(10,2) NOT NULL,
    "isPromo" BOOLEAN NOT NULL DEFAULT false,
    "promoPrice" DECIMAL(10,2),
    "region" "Region" NOT NULL,
    "parsedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePrices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","menuId")
);

-- CreateTable
CREATE TABLE "GenerationLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL,
    "tokensOut" INTEGER NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paymentProvider" TEXT,
    "paymentId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_canonicalName_key" ON "Product"("canonicalName");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePrices" ADD CONSTRAINT "StorePrices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
