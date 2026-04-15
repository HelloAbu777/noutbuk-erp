-- Demo mahsulotlar qo'shish (10 ta)

INSERT INTO "Product" (id, name, category, "buyPrice", "sellPrice", quantity, barcode, description, status, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'HP Pavilion 15', 'Noutbuk', 3500000, 4200000, 5, '000001', 'Intel Core i5, 8GB RAM, 512GB SSD', 'active', NOW(), NOW()),
(gen_random_uuid(), 'Dell Inspiron 14', 'Noutbuk', 4000000, 4800000, 3, '000002', 'Intel Core i7, 16GB RAM, 1TB SSD', 'active', NOW(), NOW()),
(gen_random_uuid(), 'Lenovo ThinkPad X1', 'Noutbuk', 5500000, 6500000, 2, '000003', 'Intel Core i7, 16GB RAM, 512GB SSD', 'active', NOW(), NOW()),
(gen_random_uuid(), 'MacBook Air M2', 'Noutbuk', 8000000, 9500000, 4, '000004', 'Apple M2, 8GB RAM, 256GB SSD', 'active', NOW(), NOW()),
(gen_random_uuid(), 'ASUS ROG Strix', 'Noutbuk', 7000000, 8500000, 2, '000005', 'Intel Core i9, 32GB RAM, 1TB SSD, RTX 3070', 'active', NOW(), NOW()),
(gen_random_uuid(), 'Logitech MX Master 3', 'Aksessuar', 350000, 450000, 15, '000006', 'Wireless mouse', 'active', NOW(), NOW()),
(gen_random_uuid(), 'Samsung USB-C Hub', 'Aksessuar', 150000, 200000, 20, '000007', '7-in-1 USB-C Hub', 'active', NOW(), NOW()),
(gen_random_uuid(), 'Apple Magic Keyboard', 'Aksessuar', 500000, 650000, 8, '000008', 'Wireless keyboard', 'active', NOW(), NOW()),
(gen_random_uuid(), 'iPhone 15 Pro', 'Telefon', 12000000, 14000000, 6, '000009', '256GB, Titanium', 'active', NOW(), NOW()),
(gen_random_uuid(), 'Samsung Galaxy S24', 'Telefon', 9000000, 11000000, 7, '000010', '256GB, Phantom Black', 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Mahsulotlar sonini ko'rsatish
SELECT COUNT(*) as "Jami mahsulotlar" FROM "Product";
SELECT name, barcode, quantity, "sellPrice" FROM "Product" ORDER BY barcode;
