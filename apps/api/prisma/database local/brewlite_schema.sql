SET client_encoding = 'UTF8';

-- ==============================================================================
-- BREWLITE - TẬP LỆNH KHỞI TẠO CẤU TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)
-- Hệ quản trị CSDL: PostgreSQL 16+
-- Bao gồm: 12 Bảng nghiệp vụ, 8 Enums, Ràng buộc khóa chính/ngoại, Indexes
-- ==============================================================================

-- 1. XÓA BẢNG CŨ THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI
DROP TABLE IF EXISTS "OrderItemTopping" CASCADE;
DROP TABLE IF EXISTS "ProductRecipeItem" CASCADE;
DROP TABLE IF EXISTS "Ingredient" CASCADE;
DROP TABLE IF EXISTS "LoyaltyTransaction" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Promotion" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Topping" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. XÓA & KHỞI TẠO CÁC KIỂU ENUM
DROP TYPE IF EXISTS "order_status" CASCADE;
DROP TYPE IF EXISTS "product_size" CASCADE;
DROP TYPE IF EXISTS "payment_method" CASCADE;
DROP TYPE IF EXISTS "payment_status" CASCADE;
DROP TYPE IF EXISTS "user_role" CASCADE;
DROP TYPE IF EXISTS "ProductStatus" CASCADE;
DROP TYPE IF EXISTS "discount_type" CASCADE;
DROP TYPE IF EXISTS "loyalty_type" CASCADE;

CREATE TYPE "user_role" AS ENUM ('customer', 'barista', 'admin');

CREATE TYPE "order_status" AS ENUM (
    'PENDING', 
    'PAID', 
    'PREPARING', 
    'READY', 
    'COMPLETED', 
    'PAYMENT_FAILED', 
    'CANCELLED'
);

CREATE TYPE "payment_method" AS ENUM ('WALLET', 'CARD');

CREATE TYPE "payment_status" AS ENUM ('SUCCESS', 'FAILED');

CREATE TYPE "product_size" AS ENUM ('S', 'M', 'L');

CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive');

CREATE TYPE "discount_type" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'MEMBERSHIP_TIER');

CREATE TYPE "loyalty_type" AS ENUM ('EARN', 'REDEEM', 'ADJUST');

-- 3. TẠO CÁC BẢNG DỮ LIỆU

-- Bảng Danh mục đồ uống
CREATE TABLE "Category" (
    "id"        SERIAL PRIMARY KEY,
    "name"      VARCHAR(100) NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Người dùng hệ thống
CREATE TABLE "User" (
    "id"            BIGSERIAL PRIMARY KEY,
    "fullName"      VARCHAR(100),
    "email"         VARCHAR(255) NOT NULL UNIQUE,
    "phone"         VARCHAR(15) UNIQUE,
    "passwordHash"  VARCHAR(255) NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0 CHECK ("loyaltyPoints" >= 0),
    "role"          "user_role" NOT NULL DEFAULT 'customer',
    "createdAt"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Sản phẩm đồ uống (Không lưu stock tĩnh, tính toán động qua Ingredient + Recipe)
CREATE TABLE "Product" (
    "id"          BIGSERIAL PRIMARY KEY,
    "categoryId"  INTEGER REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    "name"        VARCHAR(255) NOT NULL,
    "price"       DECIMAL(12,2) NOT NULL CHECK ("price" >= 0),
    "imageUrl"    VARCHAR(500),
    "description" TEXT,
    "version"     INTEGER NOT NULL DEFAULT 0,
    "status"      "ProductStatus" NOT NULL DEFAULT 'active',
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_product_categoryid" ON "Product"("categoryId");

-- Bảng Topping kèm theo
CREATE TABLE "Topping" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(255) NOT NULL UNIQUE,
    "price"       INTEGER NOT NULL CHECK ("price" >= 0),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Kho Nguyên vật liệu (Ingredients)
CREATE TABLE "Ingredient" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(255) NOT NULL,
    "unit"        VARCHAR(20) NOT NULL,
    "stock"       INTEGER NOT NULL DEFAULT 0 CHECK ("stock" >= 0),
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Định mức tiêu hao / Công thức pha chế (ProductRecipeItem)
CREATE TABLE "ProductRecipeItem" (
    "id"           SERIAL PRIMARY KEY,
    "productId"    BIGINT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "size"         "product_size" NOT NULL,
    "ingredientId" INTEGER NOT NULL REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "amount"       INTEGER NOT NULL CHECK ("amount" > 0),
    "unit"         VARCHAR(20) NOT NULL,
    "createdAt"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductRecipeItem_productId_size_ingredientId_key" UNIQUE ("productId", "size", "ingredientId")
);
CREATE INDEX "idx_recipe_product_size" ON "ProductRecipeItem"("productId", "size");

-- Bảng Chương trình khuyến mãi (Promotion)
CREATE TABLE "Promotion" (
    "id"            BIGSERIAL PRIMARY KEY,
    "code"          VARCHAR(50) NOT NULL UNIQUE,
    "description"   TEXT,
    "discountType"  "discount_type" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL CHECK ("discountValue" >= 0),
    "minOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("minOrderValue" >= 0),
    "startDate"     TIMESTAMPTZ(6) NOT NULL,
    "endDate"       TIMESTAMPTZ(6) NOT NULL,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_promotion_code" ON "Promotion"("code");

-- Bảng Đơn đặt hàng (Order)
CREATE TABLE "Order" (
    "id"             BIGSERIAL PRIMARY KEY,
    "userId"         BIGINT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "promotionId"    BIGINT REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    "status"         "order_status" NOT NULL DEFAULT 'PENDING',
    "subtotal"       DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("subtotal" >= 0),
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("discountAmount" >= 0),
    "total"          DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("total" >= 0),
    "createdAt"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_order_userid" ON "Order"("userId");
CREATE INDEX "idx_order_status" ON "Order"("status");
CREATE INDEX "idx_order_promotionid" ON "Order"("promotionId");

-- Bảng Chi tiết món trong đơn (OrderItem)
CREATE TABLE "OrderItem" (
    "id"        BIGSERIAL PRIMARY KEY,
    "orderId"   BIGINT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "productId" BIGINT NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "size"      "product_size" NOT NULL,
    "qty"       INTEGER NOT NULL CHECK ("qty" > 0),
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("unitPrice" >= 0),
    "lineTotal" DECIMAL(12,2) NOT NULL CHECK ("lineTotal" >= 0)
);
CREATE INDEX "idx_orderitem_orderid" ON "OrderItem"("orderId");
CREATE INDEX "idx_orderitem_productid" ON "OrderItem"("productId");

-- Bảng Topping cho từng món (OrderItemTopping)
CREATE TABLE "OrderItemTopping" (
    "orderItemId" BIGINT NOT NULL REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "toppingId"   INTEGER NOT NULL REFERENCES "Topping"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "priceAtTime" INTEGER NOT NULL CHECK ("priceAtTime" >= 0),
    CONSTRAINT "OrderItemTopping_pkey" PRIMARY KEY ("orderItemId", "toppingId")
);

-- Bảng Giao dịch thanh toán (Payment)
CREATE TABLE "Payment" (
    "id"             BIGSERIAL PRIMARY KEY,
    "orderId"        BIGINT NOT NULL REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "idempotencyKey" VARCHAR(255) NOT NULL UNIQUE,
    "amount"         DECIMAL(12,2) NOT NULL CHECK ("amount" >= 0),
    "method"         "payment_method" NOT NULL,
    "status"         "payment_status" NOT NULL DEFAULT 'SUCCESS',
    "transactionRef" VARCHAR(255),
    "createdAt"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_payment_orderid" ON "Payment"("orderId");

-- Bảng Lịch sử giao dịch điểm thưởng (LoyaltyTransaction)
CREATE TABLE "LoyaltyTransaction" (
    "id"           BIGSERIAL PRIMARY KEY,
    "userId"       BIGINT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "orderId"      BIGINT REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    "points"       INTEGER NOT NULL,
    "type"         "loyalty_type" NOT NULL,
    "balanceAfter" INTEGER NOT NULL CHECK ("balanceAfter" >= 0),
    "reason"       VARCHAR(255),
    "createdAt"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_loyalty_userid" ON "LoyaltyTransaction"("userId");
CREATE INDEX "idx_loyalty_orderid" ON "LoyaltyTransaction"("orderId");
