-- KAJOK PostgreSQL schema
-- This schema is the canonical relational model for the platform.
-- Apply with: npm run db:schema --workspace=server (requires DATABASE_URL)

CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','seller','admin')),
  phone          TEXT,
  firebase_uid   TEXT UNIQUE,
  photo_url      TEXT,
  country        TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'Home',
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  country     TEXT NOT NULL,
  city        TEXT NOT NULL,
  address     TEXT NOT NULL,
  instructions TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS categories (
  id       BIGSERIAL PRIMARY KEY,
  slug     TEXT NOT NULL UNIQUE,
  name_en  TEXT NOT NULL,
  name_ar  TEXT NOT NULL,
  image    TEXT NOT NULL DEFAULT '',
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brands (
  id   BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id              BIGSERIAL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name_en         TEXT NOT NULL,
  name_ar         TEXT NOT NULL,
  description_en  TEXT NOT NULL DEFAULT '',
  description_ar  TEXT NOT NULL DEFAULT '',
  price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_price  NUMERIC(10,2),
  brand_id        BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  category_id     BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images          JSONB NOT NULL DEFAULT '[]',
  video           TEXT,
  specs           JSONB NOT NULL DEFAULT '{}',
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_new          BOOLEAN NOT NULL DEFAULT false,
  sales_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name_en ON products USING gin (to_tsvector('english', name_en));

CREATE TABLE IF NOT EXISTS reviews (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name  TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id             BIGSERIAL PRIMARY KEY,
  reference      TEXT NOT NULL UNIQUE,
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC(10,2) NOT NULL,
  discount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping       NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL,
  coupon_code    TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  customer       JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

CREATE TABLE IF NOT EXISTS coupons (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value      NUMERIC(10,2) NOT NULL,
  min_order  NUMERIC(10,2) NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS banners (
  id         BIGSERIAL PRIMARY KEY,
  title_en   TEXT NOT NULL,
  title_ar   TEXT NOT NULL,
  subtitle_en TEXT NOT NULL DEFAULT '',
  subtitle_ar TEXT NOT NULL DEFAULT '',
  image      TEXT NOT NULL DEFAULT '',
  video      TEXT,
  link       TEXT NOT NULL DEFAULT '/',
  active     BOOLEAN NOT NULL DEFAULT true,
  sort       INTEGER NOT NULL DEFAULT 0
);
