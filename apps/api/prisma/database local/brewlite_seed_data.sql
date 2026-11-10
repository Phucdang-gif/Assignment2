BEGIN;

INSERT INTO "Category" (id, name, "createdAt", "updatedAt") VALUES
    (1, 'Cà phê',                  now(), now()),
    (2, 'Trà trái cây',             now(), now()),
    (3, 'Trà sữa',                 now(), now()),
    (4, 'Đá xay & Thức uống khác', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "User" (id, "fullName", email, phone, "passwordHash", "loyaltyPoints", role, "createdAt", "updatedAt") VALUES
    (1, 'Nguyễn Văn Barista', 'barista@brewlite.com',   '0901234567', '$2b$10$mP5dJ.qWueg02XGw/Bu/AevZNCBtware14sA3KYotm2IgfCBoUv7e', 100, 'barista',  now(), now()),
    (2, 'Trần Thị Khách Hàng', 'customer@brewlite.com',  '0912345678', '$2b$10$ptgUmawGGT9c4RLeqIoLx.OQj6vuIOfjrhOq/clKVgO5cNhPTyvF2',  50, 'customer', now(), now()),
    (3, 'Lê Văn Khách Hàng 2', 'khachhang2@example.com', '0987654321', '$2b$10$vaMHsq05UxbqkciIo9skZes9eoqKkO3wHyIx3ZYY76GvDHvM5lj4m',  20, 'customer', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Product" (id, "categoryId", name, price, "imageUrl", description, stock, version, status, "createdAt", "updatedAt") VALUES
        (1, 1, 'Cà phê sữa đá',              35000.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60', 'Cà phê Robusta Đắk Lắk truyền thống pha phin đậm đà, hòa quyện hài hòa cùng sữa đặc béo ngọt, chuẩn gu cà phê sữa đá đậm chất Việt Nam đánh thức mọi giác quan.', 100, 0, 'active', now(), now()),
    (2, 1, 'Americano',                  40000.00, 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=60', 'Sự kết hợp tinh tế giữa hai shot Espresso nguyên chất và nước nóng tinh khiết, mang lại hương vị cà phê êm dịu thanh thoát, đượm chút đắng nhẹ và hậu vị ngọt sâu lắng.',  80, 0, 'active', now(), now()),
    (3, 1, 'Cappuccino',                 45000.00, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=60', 'Thức uống phong cách Ý trứ danh với tỷ lệ vàng giữa Espresso thượng hạng, sữa nóng thơm béo và lớp bọt sữa mịn màng bồng bềnh phủ bột ca cao hảo hạng.',  60, 0, 'active', now(), now()),
    (4, 1, 'Bạc xỉu 3 tầng',             38000.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=60', 'Phiên bản nâng cấp đặc sắc của món bạc xỉu quen thuộc với 3 tầng phân tầng đẹp mắt: sữa đặc ngọt ngào, sữa tươi thanh mát và lớp cà phê sóng sánh đậm hương.',  90, 0, 'active', now(), now()),
    (5, 1, 'Caramel Macchiato',          48000.00, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=60', 'Hương vị ngọt ngào quyến rũ từ những đường vân sốt caramel thơm lừng phủ trên nền sữa tươi đánh bọt béo mịn, hòa cùng vị nồng nàn của cà phê rang xay đậm đặc.',  50, 0, 'active', now(), now()),

        (6, 2, 'Trà đào cam sả',             39000.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=60', 'Vị thanh tao của trà đen tự nhiên hòa quyện với những lát cam vàng mọng nước, hương sả thơm lừng thoang thoảng cùng những miếng đào tươi giòn sần sật mát lạnh.', 100, 0, 'active', now(), now()),
    (7, 2, 'Trà vải lài thanh long',     42000.00, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=60', 'Sắc hồng rực rỡ tươi mới chiết xuất từ thanh long đỏ tươi, kết hợp nền trà hoa lài ngát hương và thịt quả vải ngọt thơm mọng nước giải nhiệt cực đã.',  75, 0, 'active', now(), now()),
    (8, 2, 'Trà sen vàng hạt sen',       45000.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60', 'Vị trà Ô Long sen thơm ngát thanh tao, kết hợp cùng những hạt sen ninh mềm ngọt bùi tự nhiên, mang lại cảm giác thanh mát và an yên thuần khiết.',  65, 0, 'active', now(), now()),

        (9, 3, 'Trà sữa Oolong nướng',       42000.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60', 'Lá trà Ô Long cao cấp được sao nướng kỹ lưỡng tạo nên mùi thơm khói caramel đặc trưng, quyện cùng sữa béo bùi ngậy đậm đà, lưu luyến vị ngọt dịu nơi đầu lưỡi.', 120, 0, 'active', now(), now()),
    (10, 3, 'Trà sữa trân châu đường đen', 45000.00, 'https://images.unsplash.com/photo-1558857563-b37cf5a41764?w=600&auto=format&fit=crop&q=60', 'Món trà sữa quốc dân vạn người mê với siro đường đen đậm đặc phủ quanh thành ly, hòa cùng sữa tươi béo ngậy và trân châu dẻo mềm ấm nóng ngon khó cưỡng.', 110, 0, 'active', now(), now()),
    (11, 3, 'Trà sữa Matcha kem cheese', 48000.00, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=60', 'Bột Matcha Uji nguyên chất thơm thanh, đắng nhẹ hậu ngọt sâu, được phủ lớp foam kem cheese Macchiato sánh mịn béo ngậy điểm chút mằn mặn đầy lôi cuốn.',  85, 0, 'active', now(), now()),

        (12, 4, 'Cà phê dừa đá xay',         49000.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=60', 'Sự hòa quyện tuyệt đỉnh giữa vị cà phê thơm đắng nồng nàn và cốt dừa Bến Tre xay nhuyễn mát lạnh, béo ngọt thơm ngậy đem lại cảm giác sảng khoái bất tận.',  70, 0, 'active', now(), now())
ON CONFLICT (id) DO UPDATE SET
    "categoryId" = EXCLUDED."categoryId",
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    "imageUrl" = EXCLUDED."imageUrl",
    description = EXCLUDED.description,
    stock = EXCLUDED.stock,
    version = EXCLUDED.version,
    status = EXCLUDED.status,
    "updatedAt" = now();

INSERT INTO "Topping" (id, name, price, "isAvailable", "createdAt") VALUES
    (1, 'Trân châu đen hoàng gia',  5000, true, now()),
    (2, 'Kem cheese (Macchiato)',  10000, true, now()),
    (3, 'Thạch dừa non giòn',       5000, true, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Order" (id, "userId", status, total, "createdAt", "updatedAt") VALUES
    (1, 2, 'COMPLETED', 90000.00, now() - interval '2 day',    now() - interval '2 day'),
    (2, 2, 'PAID',      47000.00, now() - interval '1 hour',   now() - interval '1 hour'),
    (3, 3, 'PENDING',   44000.00, now() - interval '10 minute', now() - interval '10 minute')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "OrderItem" (id, "orderId", "productId", size, qty, "lineTotal") VALUES
        (1, 1, 3, 'M', 1, 45000.00),
    (2, 1, 1, 'M', 1, 35000.00),
        (3, 2, 9, 'M', 1, 42000.00),
        (4, 3, 6, 'M', 1, 39000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "OrderItemTopping" ("orderItemId", "toppingId", "priceAtTime") VALUES
        (1, 2, 10000),
        (3, 1, 5000),
        (4, 3, 5000)
ON CONFLICT ("orderItemId", "toppingId") DO NOTHING;

INSERT INTO "Payment" (id, "orderId", "idempotencyKey", amount, method) VALUES
    (1, 1, 'idem-brewlite-ord1-wallet-001', 90000.00, 'WALLET'),
    (2, 2, 'idem-brewlite-ord2-card-002',   47000.00, 'CARD'),
    (3, 3, 'idem-brewlite-ord3-wallet-003', 44000.00, 'WALLET')
ON CONFLICT (id) DO NOTHING;

-- Dữ liệu mẫu Nguyên vật liệu (Ingredients)
INSERT INTO "Ingredient" (id, name, unit, stock, "createdAt", "updatedAt") VALUES
    (1,  'Cà phê Robusta Đắk Lắk',   'g',    5000.0, now(), now()),
    (2,  'Cà phê Espresso Arabica',  'g',    5000.0, now(), now()),
    (3,  'Sữa đặc Ngôi Sao Phương Nam','ml', 10000.0, now(), now()),
    (4,  'Sữa tươi thanh trùng Barista', 'ml', 10000.0, now(), now()),
    (5,  'Cốt trà đen tự nhiên',     'ml',   8000.0, now(), now()),
    (6,  'Cốt trà Oolong nướng',     'ml',   8000.0, now(), now()),
    (7,  'Siro đào thượng hạng',     'ml',   3000.0, now(), now()),
    (8,  'Sốt Caramel thơm béo',     'ml',   2000.0, now(), now()),
    (9,  'Bột Matcha Uji nguyên chất','g',   2000.0, now(), now()),
    (10, 'Cốt dừa Bến Tre',          'ml',   4000.0, now(), now()),
    (11, 'Ly giấy Size S',           'cai',  500.0,  now(), now()),
    (12, 'Ly giấy Size M',           'cai',  500.0,  now(), now()),
    (13, 'Ly giấy Size L',           'cai',  500.0,  now(), now())
ON CONFLICT (id) DO NOTHING;

-- Công thức định mức tiêu hao (ProductRecipeItem) cho từng sản phẩm và size
INSERT INTO "ProductRecipeItem" ("productId", size, "ingredientId", amount, "createdAt", "updatedAt") VALUES
    -- 1. Cà phê sữa đá (id: 1)
    (1, 'S', 1,  20.0, now(), now()), -- 20g cà phê
    (1, 'S', 3,  25.0, now(), now()), -- 25ml sữa đặc
    (1, 'S', 11, 1.0,  now(), now()), -- 1 ly size S
    (1, 'M', 1,  25.0, now(), now()), -- 25g cà phê
    (1, 'M', 3,  35.0, now(), now()), -- 35ml sữa đặc
    (1, 'M', 12, 1.0,  now(), now()), -- 1 ly size M
    (1, 'L', 1,  35.0, now(), now()), -- 35g cà phê
    (1, 'L', 3,  50.0, now(), now()), -- 50ml sữa đặc
    (1, 'L', 13, 1.0,  now(), now()), -- 1 ly size L

    -- 2. Americano (id: 2)
    (2, 'S', 2,  18.0, now(), now()),
    (2, 'S', 11, 1.0,  now(), now()),
    (2, 'M', 2,  25.0, now(), now()),
    (2, 'M', 12, 1.0,  now(), now()),
    (2, 'L', 2,  36.0, now(), now()),
    (2, 'L', 13, 1.0,  now(), now()),

    -- 3. Cappuccino (id: 3)
    (3, 'S', 2,  18.0,  now(), now()),
    (3, 'S', 4,  120.0, now(), now()),
    (3, 'S', 11, 1.0,   now(), now()),
    (3, 'M', 2,  25.0,  now(), now()),
    (3, 'M', 4,  160.0, now(), now()),
    (3, 'M', 12, 1.0,   now(), now()),
    (3, 'L', 2,  36.0,  now(), now()),
    (3, 'L', 4,  220.0, now(), now()),
    (3, 'L', 13, 1.0,   now(), now()),

    -- 4. Bạc xỉu 3 tầng (id: 4)
    (4, 'S', 1,  15.0,  now(), now()),
    (4, 'S', 3,  30.0,  now(), now()),
    (4, 'S', 4,  80.0,  now(), now()),
    (4, 'S', 11, 1.0,   now(), now()),
    (4, 'M', 1,  20.0,  now(), now()),
    (4, 'M', 3,  40.0,  now(), now()),
    (4, 'M', 4,  100.0, now(), now()),
    (4, 'M', 12, 1.0,   now(), now()),
    (4, 'L', 1,  28.0,  now(), now()),
    (4, 'L', 3,  55.0,  now(), now()),
    (4, 'L', 4,  140.0, now(), now()),
    (4, 'L', 13, 1.0,   now(), now()),

    -- 5. Caramel Macchiato (id: 5)
    (5, 'S', 2,  18.0,  now(), now()),
    (5, 'S', 4,  100.0, now(), now()),
    (5, 'S', 8,  20.0,  now(), now()),
    (5, 'S', 11, 1.0,   now(), now()),
    (5, 'M', 2,  25.0,  now(), now()),
    (5, 'M', 4,  140.0, now(), now()),
    (5, 'M', 8,  30.0,  now(), now()),
    (5, 'M', 12, 1.0,   now(), now()),
    (5, 'L', 2,  36.0,  now(), now()),
    (5, 'L', 4,  180.0, now(), now()),
    (5, 'L', 8,  40.0,  now(), now()),
    (5, 'L', 13, 1.0,   now(), now()),

    -- 6. Trà đào cam sả (id: 6)
    (6, 'S', 5,  100.0, now(), now()),
    (6, 'S', 7,  25.0,  now(), now()),
    (6, 'S', 11, 1.0,   now(), now()),
    (6, 'M', 5,  140.0, now(), now()),
    (6, 'M', 7,  35.0,  now(), now()),
    (6, 'M', 12, 1.0,   now(), now()),
    (6, 'L', 5,  180.0, now(), now()),
    (6, 'L', 7,  45.0,  now(), now()),
    (6, 'L', 13, 1.0,   now(), now()),

    -- 7. Trà vải lài thanh long (id: 7)
    (7, 'S', 5,  100.0, now(), now()),
    (7, 'S', 7,  25.0,  now(), now()),
    (7, 'S', 11, 1.0,   now(), now()),
    (7, 'M', 5,  140.0, now(), now()),
    (7, 'M', 7,  35.0,  now(), now()),
    (7, 'M', 12, 1.0,   now(), now()),
    (7, 'L', 5,  180.0, now(), now()),
    (7, 'L', 7,  45.0,  now(), now()),
    (7, 'L', 13, 1.0,   now(), now()),

    -- 8. Trà sen vàng hạt sen (id: 8)
    (8, 'S', 6,  100.0, now(), now()),
    (8, 'S', 4,  40.0,  now(), now()),
    (8, 'S', 3,  15.0,  now(), now()),
    (8, 'S', 11, 1.0,   now(), now()),
    (8, 'M', 6,  140.0, now(), now()),
    (8, 'M', 4,  60.0,  now(), now()),
    (8, 'M', 3,  25.0,  now(), now()),
    (8, 'M', 12, 1.0,   now(), now()),
    (8, 'L', 6,  180.0, now(), now()),
    (8, 'L', 4,  80.0,  now(), now()),
    (8, 'L', 3,  35.0,  now(), now()),
    (8, 'L', 13, 1.0,   now(), now()),

    -- 9. Trà sữa Oolong nướng (id: 9)
    (9, 'S', 6,  100.0, now(), now()),
    (9, 'S', 4,  80.0,  now(), now()),
    (9, 'S', 3,  25.0,  now(), now()),
    (9, 'S', 11, 1.0,   now(), now()),
    (9, 'M', 6,  140.0, now(), now()),
    (9, 'M', 4,  100.0, now(), now()),
    (9, 'M', 3,  35.0,  now(), now()),
    (9, 'M', 12, 1.0,   now(), now()),
    (9, 'L', 6,  180.0, now(), now()),
    (9, 'L', 4,  140.0, now(), now()),
    (9, 'L', 3,  45.0,  now(), now()),
    (9, 'L', 13, 1.0,   now(), now()),

    -- 10. Trà sữa trân châu đường đen (id: 10)
    (10, 'S', 5,  100.0, now(), now()),
    (10, 'S', 4,  80.0,  now(), now()),
    (10, 'S', 3,  25.0,  now(), now()),
    (10, 'S', 11, 1.0,   now(), now()),
    (10, 'M', 5,  140.0, now(), now()),
    (10, 'M', 4,  100.0, now(), now()),
    (10, 'M', 3,  35.0,  now(), now()),
    (10, 'M', 12, 1.0,   now(), now()),
    (10, 'L', 5,  180.0, now(), now()),
    (10, 'L', 4,  140.0, now(), now()),
    (10, 'L', 3,  45.0,  now(), now()),
    (10, 'L', 13, 1.0,   now(), now()),

    -- 11. Trà sữa Matcha kem cheese (id: 11)
    (11, 'S', 9,  15.0,  now(), now()),
    (11, 'S', 4,  120.0, now(), now()),
    (11, 'S', 3,  20.0,  now(), now()),
    (11, 'S', 11, 1.0,   now(), now()),
    (11, 'M', 9,  20.0,  now(), now()),
    (11, 'M', 4,  160.0, now(), now()),
    (11, 'M', 3,  30.0,  now(), now()),
    (11, 'M', 12, 1.0,   now(), now()),
    (11, 'L', 9,  28.0,  now(), now()),
    (11, 'L', 4,  200.0, now(), now()),
    (11, 'L', 3,  40.0,  now(), now()),
    (11, 'L', 13, 1.0,   now(), now()),

    -- 12. Cà phê dừa đá xay (id: 12)
    (12, 'S', 1,  20.0,  now(), now()),
    (12, 'S', 10, 80.0,  now(), now()),
    (12, 'S', 3,  30.0,  now(), now()),
    (12, 'S', 11, 1.0,   now(), now()),
    (12, 'M', 1,  25.0,  now(), now()),
    (12, 'M', 10, 120.0, now(), now()),
    (12, 'M', 3,  40.0,  now(), now()),
    (12, 'M', 12, 1.0,   now(), now()),
    (12, 'L', 1,  35.0,  now(), now()),
    (12, 'L', 10, 160.0, now(), now()),
    (12, 'L', 3,  50.0,  now(), now()),
    (12, 'L', 13, 1.0,   now(), now())
ON CONFLICT ("productId", size, "ingredientId") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Ingredient"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "Ingredient"));
SELECT setval(pg_get_serial_sequence('"ProductRecipeItem"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "ProductRecipeItem"));

SELECT setval(pg_get_serial_sequence('"Category"', 'id'),  (SELECT COALESCE(MAX(id), 1) FROM "Category"));
SELECT setval(pg_get_serial_sequence('"User"', 'id'),      (SELECT COALESCE(MAX(id), 1) FROM "User"));
SELECT setval(pg_get_serial_sequence('"Product"', 'id'),   (SELECT COALESCE(MAX(id), 1) FROM "Product"));
SELECT setval(pg_get_serial_sequence('"Topping"', 'id'),   (SELECT COALESCE(MAX(id), 1) FROM "Topping"));
SELECT setval(pg_get_serial_sequence('"Order"', 'id'),     (SELECT COALESCE(MAX(id), 1) FROM "Order"));
SELECT setval(pg_get_serial_sequence('"OrderItem"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "OrderItem"));
SELECT setval(pg_get_serial_sequence('"Payment"', 'id'),   (SELECT COALESCE(MAX(id), 1) FROM "Payment"));

COMMIT;
