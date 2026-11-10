INSERT INTO "Category" ("name")
VALUES ('Cà phê'), ('Trà'), ('Trà sữa'), ('Khác')
ON CONFLICT ("name") DO NOTHING;

UPDATE "Product"
SET "categoryId" = category."id"
FROM "Category" AS category
WHERE "Product"."categoryId" IS NULL
  AND (
    ("Product"."name" IN ('Cà phê sữa đá', 'Americano', 'Cappuccino', 'Bạc xỉu 3 tầng') AND category."name" = 'Cà phê')
    OR ("Product"."name" = 'Trà đào cam sả' AND category."name" = 'Trà')
    OR ("Product"."name" = 'Trà sữa Oolong nướng' AND category."name" = 'Trà sữa')
  );
