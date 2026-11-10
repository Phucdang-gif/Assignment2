DROP TABLE IF EXISTS "OrderItemTopping" CASCADE;
DROP TABLE IF EXISTS "ProductRecipeItem" CASCADE;
DROP TABLE IF EXISTS "Ingredient" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Topping" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "order_status" CASCADE;
DROP TYPE IF EXISTS "product_size" CASCADE;
DROP TYPE IF EXISTS "payment_method" CASCADE;
DROP TYPE IF EXISTS "user_role" CASCADE;
DROP TYPE IF EXISTS "ProductStatus" CASCADE;

CREATE TYPE "user_role" AS ENUM ('customer', 'barista');

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

CREATE TYPE "product_size" AS ENUM ('S', 'M', 'L');

CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive');

CREATE TABLE "Category" (
    "id"        SERIAL PRIMARY KEY,
    "name"      VARCHAR(100) NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

CREATE TABLE "Product" (
    "id"          BIGSERIAL PRIMARY KEY,
    "categoryId"  INTEGER REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    "name"        VARCHAR(255) NOT NULL,
    "price"       DECIMAL(12,2) NOT NULL CHECK ("price" >= 0),
    "imageUrl"    VARCHAR(500),
    "description" TEXT,
    "stock"       INTEGER NOT NULL DEFAULT 0 CHECK ("stock" >= 0),
    "version"     INTEGER NOT NULL DEFAULT 0,     "status"      "ProductStatus" NOT NULL DEFAULT 'active',
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_product_categoryid" ON "Product"("categoryId");

CREATE TABLE "Topping" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(255) NOT NULL UNIQUE,
    "price"       INTEGER NOT NULL CHECK ("price" >= 0),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Topping_name_key" ON "Topping"("name");

CREATE TABLE "Order" (
    "id"        BIGSERIAL PRIMARY KEY,
    "userId"    BIGINT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "status"    "order_status" NOT NULL DEFAULT 'PENDING',
    "total"     DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("total" >= 0),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_order_userid" ON "Order"("userId");
CREATE INDEX "idx_order_status" ON "Order"("status");

CREATE TABLE "OrderItem" (
    "id"        BIGSERIAL PRIMARY KEY,
    "orderId"   BIGINT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "productId" BIGINT NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "size"      "product_size" NOT NULL,
    "qty"       INTEGER NOT NULL CHECK ("qty" > 0),
    "lineTotal" DECIMAL(12,2) NOT NULL CHECK ("lineTotal" >= 0)
);

CREATE INDEX "idx_orderitem_orderid" ON "OrderItem"("orderId");
CREATE INDEX "idx_orderitem_productid" ON "OrderItem"("productId");

CREATE TABLE "OrderItemTopping" (
    "orderItemId" BIGINT NOT NULL REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "toppingId"   INTEGER NOT NULL REFERENCES "Topping"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "priceAtTime" INTEGER NOT NULL CHECK ("priceAtTime" >= 0),     CONSTRAINT "OrderItemTopping_pkey" PRIMARY KEY ("orderItemId", "toppingId")
);

CREATE TABLE "Payment" (
    "id"             BIGSERIAL PRIMARY KEY,
    "orderId"        BIGINT NOT NULL REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
    "idempotencyKey" VARCHAR(255) NOT NULL UNIQUE,     "amount"         DECIMAL(12,2) NOT NULL CHECK ("amount" >= 0),
    "method"         "payment_method" NOT NULL
);

CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
CREATE INDEX "idx_payment_orderid" ON "Payment"("orderId");

CREATE TABLE "Ingredient" (
    "id"          SERIAL PRIMARY KEY,
    "name"        VARCHAR(255) NOT NULL,
    "unit"        VARCHAR(20) NOT NULL,
    "stock"       DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK ("stock" >= 0),
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProductRecipeItem" (
    "id"           SERIAL PRIMARY KEY,
    "productId"    BIGINT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "size"         "product_size" NOT NULL,
    "ingredientId" INTEGER NOT NULL REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    "amount"       DOUBLE PRECISION NOT NULL CHECK ("amount" > 0),
    "createdAt"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductRecipeItem_productId_size_ingredientId_key" UNIQUE ("productId", "size", "ingredientId")
);

CREATE INDEX "idx_recipe_product_size" ON "ProductRecipeItem"("productId", "size");

