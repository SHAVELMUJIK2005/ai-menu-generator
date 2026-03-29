-- Удаляем дубликаты перед добавлением уникального индекса (оставляем строку с максимальным id)
DELETE FROM "StorePrices" a
USING "StorePrices" b
WHERE a.id < b.id
  AND a."productId" = b."productId"
  AND a."storeChain" = b."storeChain"
  AND a.region = b.region;

-- Уникальный индекс для корректного upsert скрейпера
CREATE UNIQUE INDEX IF NOT EXISTS "StorePrices_productId_storeChain_region_key"
  ON "StorePrices"("productId", "storeChain", region);

-- Индекс для быстрых запросов по магазину+региону
CREATE INDEX IF NOT EXISTS "StorePrices_storeChain_region_idx"
  ON "StorePrices"("storeChain", region);
