-- AlterTable Ingredient: change stock from DOUBLE PRECISION to INTEGER
ALTER TABLE "Ingredient" ALTER COLUMN "stock" TYPE INTEGER USING stock::integer;

-- AlterTable ProductRecipeItem: change amount from DOUBLE PRECISION to INTEGER
ALTER TABLE "ProductRecipeItem" ALTER COLUMN "amount" TYPE INTEGER USING amount::integer;
