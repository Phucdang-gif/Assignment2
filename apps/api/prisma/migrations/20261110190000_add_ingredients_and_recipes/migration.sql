-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRecipeItem" (
    "id" SERIAL NOT NULL,
    "productId" BIGINT NOT NULL,
    "size" "product_size" NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRecipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_recipe_product_size" ON "ProductRecipeItem"("productId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRecipeItem_productId_size_ingredientId_key" ON "ProductRecipeItem"("productId", "size", "ingredientId");

-- AddForeignKey
ALTER TABLE "ProductRecipeItem" ADD CONSTRAINT "ProductRecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductRecipeItem" ADD CONSTRAINT "ProductRecipeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
