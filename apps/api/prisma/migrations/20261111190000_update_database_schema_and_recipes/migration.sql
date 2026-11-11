-- AlterEnum
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'admin';

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "payment_status" AS ENUM ('SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "discount_type" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'MEMBERSHIP_TIER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "loyalty_type" AS ENUM ('EARN', 'REDEEM', 'ADJUST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable Product: drop stock column
ALTER TABLE "Product" DROP COLUMN IF EXISTS "stock";

-- CreateTable Ingredient (if not exists)
CREATE TABLE IF NOT EXISTS "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProductRecipeItem (if not exists)
CREATE TABLE IF NOT EXISTS "ProductRecipeItem" (
    "id" SERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "size" "product_size" NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRecipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_recipe_product_size" ON "ProductRecipeItem"("productId", "size");

-- CreateIndex
DO $$ BEGIN
    CREATE UNIQUE INDEX "ProductRecipeItem_productId_size_ingredientId_key" ON "ProductRecipeItem"("productId", "size", "ingredientId");
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN null;
END $$;

-- AddForeignKey ProductRecipeItem -> Product
DO $$ BEGIN
    ALTER TABLE "ProductRecipeItem" ADD CONSTRAINT "ProductRecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey ProductRecipeItem -> Ingredient
DO $$ BEGIN
    ALTER TABLE "ProductRecipeItem" ADD CONSTRAINT "ProductRecipeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable Promotion
CREATE TABLE IF NOT EXISTS "Promotion" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "discountType" "discount_type" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "idx_promotion_code" ON "Promotion"("code");

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "promotionId" BIGINT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "idx_order_promotionid" ON "Order"("promotionId");

DO $$ BEGIN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable OrderItem
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "status" "payment_status" NOT NULL DEFAULT 'SUCCESS';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "transactionRef" VARCHAR(255);
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable LoyaltyTransaction
CREATE TABLE IF NOT EXISTS "LoyaltyTransaction" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "orderId" BIGINT,
    "points" INTEGER NOT NULL,
    "type" "loyalty_type" NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_loyalty_userid" ON "LoyaltyTransaction"("userId");
CREATE INDEX IF NOT EXISTS "idx_loyalty_orderid" ON "LoyaltyTransaction"("orderId");

DO $$ BEGIN
    ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
