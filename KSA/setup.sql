-- ============================================================
-- CHICK BUCK — Supabase CMS Tables Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. SITE SETTINGS (branding, contact, social, theme, footer)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          TEXT PRIMARY KEY DEFAULT 'global',
  site_name   TEXT DEFAULT 'Chick Buck',
  logo_url    TEXT,
  favicon_url TEXT,
  brand_desc  TEXT DEFAULT 'The Unique Taste Of Saudi Arabia',
  phone       TEXT DEFAULT '05013-62558',
  whatsapp    TEXT DEFAULT '966501362558',
  email       TEXT,
  address     TEXT,
  instagram   TEXT DEFAULT 'https://www.instagram.com/chick_buck_ksa',
  facebook    TEXT,
  tiktok      TEXT DEFAULT 'https://www.tiktok.com/@chick_buck_ksa',
  snapchat    TEXT DEFAULT 'https://www.snapchat.com/add/chickbuckksa',
  youtube     TEXT,
  footer_desc TEXT DEFAULT 'The Unique Taste Of Saudi Arabia',
  footer_copy TEXT DEFAULT '© 2026 CHICK BUCK · All Rights Reserved.',
  business_hours TEXT DEFAULT 'Daily 10:00 AM – 2:00 AM',
  currency    TEXT DEFAULT 'SR',
  delivery_info TEXT DEFAULT 'Delivery fee: 5 SR',
  -- Theme Colors
  theme_primary   TEXT DEFAULT '#C4323A',
  theme_secondary TEXT DEFAULT '#250506',
  theme_accent    TEXT DEFAULT '#B8935A',
  theme_background TEXT DEFAULT '#F5EBD9',
  theme_surface   TEXT DEFAULT '#FAF4E8',
  theme_text      TEXT DEFAULT '#1A1A1A',
  theme_heading   TEXT DEFAULT '#250506',
  theme_button    TEXT DEFAULT '#C4323A',
  theme_button_text TEXT DEFAULT '#F5EBD9',
  theme_header    TEXT DEFAULT '#250506',
  theme_footer    TEXT DEFAULT '#250506',
  theme_border    TEXT DEFAULT '#E8DCC4',
  theme_success   TEXT DEFAULT '#10B981',
  theme_warning   TEXT DEFAULT '#F59E0B',
  theme_error     TEXT DEFAULT '#EF4444',
  theme_preset    TEXT DEFAULT 'chick-buck-classic',
  -- Header
  announcement_enabled BOOLEAN DEFAULT false,
  announcement_text TEXT DEFAULT '🔥 TODAY ONLY — GET 20% OFF ON COMBOS 🔥',
  announcement_bg TEXT DEFAULT '#C4323A',
  announcement_color TEXT DEFAULT '#FFFFFF',
  announcement_link TEXT,
  announcement_start TIMESTAMPTZ,
  announcement_end   TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row
INSERT INTO public.site_settings (id) VALUES ('global')
  ON CONFLICT (id) DO NOTHING;

-- 2. BANNERS (offer carousel banners)
CREATE TABLE IF NOT EXISTS public.banners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT,
  subtitle     TEXT,
  description  TEXT,
  discount     TEXT,
  coupon_code  TEXT,
  cta_text     TEXT DEFAULT 'ORDER NOW',
  cta_action   TEXT DEFAULT 'menu',
  link_type    TEXT DEFAULT 'none',
  link_value   TEXT,
  desktop_img  TEXT,
  mobile_img   TEXT,
  bg_color     TEXT DEFAULT '#250506',
  text_color   TEXT DEFAULT '#F5EBD9',
  display_order INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  start_date   TIMESTAMPTZ,
  end_date     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Sample banner
INSERT INTO public.banners (title, subtitle, description, discount, cta_text, cta_action, display_order, is_active)
VALUES 
  ('CRISPY CHICKEN COMBO', 'Limited Time Offer', 'Get our signature crispy chicken combo at an unbeatable price', '20% OFF', 'ORDER NOW', 'menu', 1, true),
  ('BROASTED PERFECTION', 'Fresh Every Day', 'Crispy, juicy broasted chicken made fresh for every craving', 'FROM 11 SR', 'EXPLORE MENU', 'menu', 2, true)
ON CONFLICT DO NOTHING;

-- 3. HOMEPAGE SECTIONS (section order, visibility, config)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id           TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  is_enabled   BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  config       JSONB DEFAULT '{}',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Default sections
INSERT INTO public.homepage_sections (id, label, is_enabled, display_order, config) VALUES
  ('hero',         'Hero Section',       true, 1,  '{"title":"CRISPY. JUICY. IRRESISTIBLE.","subtitle":"Fresh chicken made for every craving.","btn_text":"ORDER NOW","btn_action":"menu","overlay":0.5}'),
  ('announcement', 'Announcement Bar',   true, 0,  '{}'),
  ('banners',      'Offer Banners',      true, 2,  '{"autoplay":true,"interval":5000}'),
  ('categories',   'Food Categories',    true, 3,  '{}'),
  ('bestsellers',  'Best Sellers',       true, 4,  '{"title":"Best Sellers","subtitle":"Our most loved items"}'),
  ('offers',       'Special Offers',     true, 5,  '{"title":"Special Offers","subtitle":"Exclusive deals just for you"}'),
  ('combos',       'Popular Combos',     true, 6,  '{"title":"Popular Combos","subtitle":"Complete meals, great value"}'),
  ('featured',     'Featured Products',  true, 7,  '{"title":"Chef Picks","subtitle":"Handpicked favourites"}'),
  ('promo',        'Promotional Section',true, 8,  '{"title":"Why Chick Buck?","subtitle":"We use only the finest ingredients"}'),
  ('reviews',      'Customer Reviews',   true, 9,  '{"title":"What Our Customers Say"}'),
  ('branches',     'Our Branches',       true, 10, '{"title":"Find Us","subtitle":"Two locations to serve you better"}'),
  ('cta',          'WhatsApp CTA',       true, 11, '{"title":"Order via WhatsApp","subtitle":"Fast, easy, delicious"}'),
  ('footer',       'Footer',             true, 12, '{}')
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (optional but recommended)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public read (for customer site)
CREATE POLICY "Public can read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Public can read homepage_sections" ON public.homepage_sections FOR SELECT USING (true);

-- Authenticated (admin) can do everything
CREATE POLICY "Admins full access site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access banners" ON public.banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access homepage_sections" ON public.homepage_sections FOR ALL USING (auth.role() = 'authenticated');

-- 5. Storage bucket for banners (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;
