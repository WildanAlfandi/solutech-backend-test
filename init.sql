-- init.sql
-- Solutech Technical Test - Backend Developer
-- Create table statements untuk PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum untuk status order
CREATE TYPE "order_status" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- Table: users
CREATE TABLE "users" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email"      VARCHAR(255) NOT NULL UNIQUE,
    "password"   VARCHAR(255) NOT NULL,
    "name"       VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: products
CREATE TABLE "products" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"        VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price"       DECIMAL(12,2) NOT NULL,
    "stock"       INTEGER NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"  TIMESTAMP(3)
);

CREATE INDEX "idx_products_name" ON "products" ("name");

-- Table: orders
CREATE TABLE "orders" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"     UUID NOT NULL REFERENCES "users"("id"),
    "total_price" DECIMAL(12,2) NOT NULL,
    "status"      "order_status" NOT NULL DEFAULT 'PENDING',
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_orders_user_id" ON "orders" ("user_id");

-- Table: order_items
CREATE TABLE "order_items" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id"   UUID NOT NULL REFERENCES "orders"("id"),
    "product_id" UUID NOT NULL REFERENCES "products"("id"),
    "quantity"   INTEGER NOT NULL,
    "price"      DECIMAL(12,2) NOT NULL
);

CREATE INDEX "idx_order_items_order_id" ON "order_items" ("order_id");
CREATE INDEX "idx_order_items_product_id" ON "order_items" ("product_id");