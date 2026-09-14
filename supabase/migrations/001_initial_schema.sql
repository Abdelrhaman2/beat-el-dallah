-- Migration: 001_initial_schema.sql
-- Beit El Dallah (بيت الدلة) - E-Commerce Platform
-- Database Schema for Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  short_description_ar TEXT,
  short_description_en TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  base_price NUMERIC(10, 2) NOT NULL,
  image_url_1 TEXT NOT NULL,
  image_url_2 TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order, created_at DESC);

-- 3. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  attribute_type TEXT NOT NULL, -- e.g. 'weight', 'grind', 'size'
  attribute_value_ar TEXT NOT NULL,
  attribute_value_en TEXT NOT NULL,
  price_override NUMERIC(10, 2),
  is_default BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address_details TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  deposit_percentage NUMERIC(5, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  coupon_code TEXT,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_user_id);

-- 5. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  variant_snapshot TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL,
  line_total NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 6. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  times_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Site Settings (Single Row)
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  deposit_percentage NUMERIC(5, 2) DEFAULT 25.00,
  whatsapp_number TEXT NOT NULL DEFAULT '201012345678',
  payment_instructions_ar TEXT NOT NULL,
  payment_instructions_en TEXT NOT NULL,
  store_name_ar TEXT DEFAULT 'بيت الدلة',
  store_name_en TEXT DEFAULT 'Beit El Dallah',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- 8. Row-Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 9. Security Policies
-- Public can read active catalog and site settings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'public_read_active_categories') THEN
    CREATE POLICY "public_read_active_categories" ON categories FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'public_read_active_products') THEN
    CREATE POLICY "public_read_active_products" ON products FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'public_read_variants') THEN
    CREATE POLICY "public_read_variants" ON product_variants FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'public_read_settings') THEN
    CREATE POLICY "public_read_settings" ON site_settings FOR SELECT USING (true);
  END IF;
  -- CRITICAL: Orders and order_items have NO public insert/update/delete.
  -- Only server-side route handlers with the service_role key can insert orders.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'customers_read_own_orders') THEN
    CREATE POLICY "customers_read_own_orders" ON orders FOR SELECT USING (auth.uid() = customer_user_id);
  END IF;
END $$;
