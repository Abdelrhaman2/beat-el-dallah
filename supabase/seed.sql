-- Seed Data: supabase/seed.sql
-- Beit El Dallah (بيت الدلة) - E-Commerce Platform

-- 1. Site Settings
INSERT INTO site_settings (id, deposit_percentage, whatsapp_number, payment_instructions_ar, payment_instructions_en, store_name_ar, store_name_en, logo_url)
VALUES (
  1,
  25.00,
  '201012345678',
  'طرق دفع العربون المتاحة:\n• فودافون كاش / المحافظ الإلكترونية: 01012345678\n• انستاباي (InstaPay): beit.eldallah@instapay\n• تحويل بنكي (البنك الأهلي المصري): 12345678901234\nيرجى إرسال لقطة شاشة لإيصال التحويل في رسالة الواتساب لتأكيد طلبك وبدء التجهيز.',
  'Available Deposit Payment Methods:\n• Vodafone Cash / Smart Wallets: 01012345678\n• InstaPay: beit.eldallah@instapay\n• Bank Transfer (NBE): 12345678901234\nPlease send a screenshot of the transfer receipt in the WhatsApp chat to confirm your order.',
  'بيت الدلة',
  'Beit El Dallah',
  '/logo.svg'
)
ON CONFLICT (id) DO UPDATE SET
  deposit_percentage = EXCLUDED.deposit_percentage,
  whatsapp_number = EXCLUDED.whatsapp_number,
  payment_instructions_ar = EXCLUDED.payment_instructions_ar,
  payment_instructions_en = EXCLUDED.payment_instructions_en,
  store_name_ar = EXCLUDED.store_name_ar,
  store_name_en = EXCLUDED.store_name_en;

-- 2. Seed 6 Categories
INSERT INTO categories (slug, name_ar, name_en, sort_order, is_active, image_url)
VALUES
  ('dallah-coffee', 'بن الدله', 'Dallah Coffee', 1, true, '/images/categories/dallah.webp'),
  ('star-coffee', 'ستار كوفي', 'Star Coffee', 2, true, '/images/categories/star.webp'),
  ('espresso', 'اسبريسو', 'Espresso', 3, true, '/images/categories/espresso.webp'),
  ('turkish-coffee', 'بن تركي', 'Turkish Coffee', 4, true, '/images/categories/turkish.webp'),
  ('tea', 'شاي', 'Tea', 5, true, '/images/categories/tea.webp'),
  ('cafe-supplies', 'مستلزمات الكافيهات', 'Cafe Supplies', 6, true, '/images/categories/supplies.webp')
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  sort_order = EXCLUDED.sort_order;
