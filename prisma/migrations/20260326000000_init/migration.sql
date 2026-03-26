-- Migration: 20260326000000_init
-- La Carta IA — Schema inicial

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE "UserRole" AS ENUM ('superadmin', 'owner', 'staff');
CREATE TYPE "BusinessPlan" AS ENUM ('free', 'premium');

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE "users" (
    "id"          TEXT NOT NULL,
    "auth_id"     TEXT NOT NULL,
    "email"       TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "role"        "UserRole" NOT NULL DEFAULT 'owner',
    "business_id" TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");
CREATE UNIQUE INDEX "users_email_key"   ON "users"("email");
CREATE        INDEX "users_email_idx"   ON "users"("email");
CREATE        INDEX "users_auth_id_idx" ON "users"("auth_id");

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------

CREATE TABLE "businesses" (
    "id"            TEXT NOT NULL,
    "slug"          TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "address"       TEXT,
    "phone"         TEXT,
    "logo_url"      TEXT,
    "primary_color" TEXT,
    "plan"          "BusinessPlan" NOT NULL DEFAULT 'free',
    "owner_id"      TEXT NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "businesses_slug_key"     ON "businesses"("slug");
CREATE UNIQUE INDEX "businesses_owner_id_key" ON "businesses"("owner_id");
CREATE        INDEX "businesses_slug_idx"     ON "businesses"("slug");

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

CREATE TABLE "categories" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "position"    INTEGER NOT NULL DEFAULT 0,
    "business_id" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "categories_business_id_idx" ON "categories"("business_id");

-- ---------------------------------------------------------------------------
-- dishes
-- ---------------------------------------------------------------------------

CREATE TABLE "dishes" (
    "id"               TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "description"      TEXT,
    "recipe"           TEXT,
    "photo_url"        TEXT,
    "price"            DECIMAL(8,2) NOT NULL,
    "is_active"        BOOLEAN NOT NULL DEFAULT true,
    "is_daily_special" BOOLEAN NOT NULL DEFAULT false,
    "special_date"     TIMESTAMP(3),
    "business_id"      TEXT NOT NULL,
    "category_id"      TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dishes_business_id_idx"      ON "dishes"("business_id");
CREATE INDEX "dishes_category_id_idx"      ON "dishes"("category_id");
CREATE INDEX "dishes_is_active_idx"        ON "dishes"("is_active");
CREATE INDEX "dishes_is_daily_special_idx" ON "dishes"("is_daily_special");

-- ---------------------------------------------------------------------------
-- allergens
-- ---------------------------------------------------------------------------

CREATE TABLE "allergens" (
    "id"       TEXT NOT NULL,
    "name"     TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,

    CONSTRAINT "allergens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "allergens_name_key" ON "allergens"("name");

-- ---------------------------------------------------------------------------
-- dish_allergens  (tabla pivote)
-- ---------------------------------------------------------------------------

CREATE TABLE "dish_allergens" (
    "dish_id"     TEXT NOT NULL,
    "allergen_id" TEXT NOT NULL,

    CONSTRAINT "dish_allergens_pkey" PRIMARY KEY ("dish_id","allergen_id")
);

-- ---------------------------------------------------------------------------
-- qr_codes
-- ---------------------------------------------------------------------------

CREATE TABLE "qr_codes" (
    "id"          TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "color"       TEXT NOT NULL DEFAULT '#8D4B00',
    "logo_url"    TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "qr_codes_business_id_idx" ON "qr_codes"("business_id");

-- ---------------------------------------------------------------------------
-- Foreign keys
-- ---------------------------------------------------------------------------

-- users → businesses (miembro)
ALTER TABLE "users"
    ADD CONSTRAINT "users_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- businesses → users (propietario)
ALTER TABLE "businesses"
    ADD CONSTRAINT "businesses_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- categories → businesses
ALTER TABLE "categories"
    ADD CONSTRAINT "categories_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- dishes → businesses
ALTER TABLE "dishes"
    ADD CONSTRAINT "dishes_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- dishes → categories
ALTER TABLE "dishes"
    ADD CONSTRAINT "dishes_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- dish_allergens → dishes
ALTER TABLE "dish_allergens"
    ADD CONSTRAINT "dish_allergens_dish_id_fkey"
    FOREIGN KEY ("dish_id") REFERENCES "dishes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- dish_allergens → allergens
ALTER TABLE "dish_allergens"
    ADD CONSTRAINT "dish_allergens_allergen_id_fkey"
    FOREIGN KEY ("allergen_id") REFERENCES "allergens"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- qr_codes → businesses
ALTER TABLE "qr_codes"
    ADD CONSTRAINT "qr_codes_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
