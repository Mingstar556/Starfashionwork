-- StarFashion Database Schema Migration 001

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('starboy', 'old_money', 'casual', 'streetwear')),
    images TEXT[] NOT NULL DEFAULT '{}',
    sizes TEXT[] NOT NULL DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_name TEXT NOT NULL,
    telegram_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    total_price NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'KHQR')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    telegram_message_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    banner_images TEXT[] NOT NULL DEFAULT '{}',
    announcement_text TEXT DEFAULT '⚡ FREE WORLDWIDE SHIPPING ON ORDERS OVER $150 | USE CODE: STAR10',
    is_store_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store settings if not exists
INSERT INTO store_settings (id, banner_images, announcement_text, is_store_open)
VALUES (
    'main',
    ARRAY['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'],
    '⚡ STARFASHION 2026 COLLECTION DROPPED | FAST TELEGRAM ORDER APPROVAL',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Policies for public reading
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (true);

-- Policies for public order creation
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own order" ON orders FOR SELECT USING (true);

-- Policies for admin (service role bypasses RLS, but we can also add authenticated admin policies if needed)
CREATE POLICY "Admin full access products" ON products USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access orders" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access store_settings" ON store_settings USING (true) WITH CHECK (true);
