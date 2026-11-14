import bcrypt from 'bcryptjs';
import { query, nextId, getSetting, setSetting, schedulePersist } from './index.js';

const now = () => new Date().toISOString();

const categories: Array<[string, string, string, string, number]> = [
  ['الهواتف والموبايلات', 'Phones & Mobile', 'phones', 'Smartphone', 1],
  ['الإلكترونيات', 'Electronics', 'electronics', 'Cpu', 2],
  ['الكمبيوتر واللابتوب', 'Computers & Laptops', 'computers', 'Laptop', 3],
  ['الملابس', 'Fashion & Clothing', 'fashion', 'Shirt', 4],
  ['الأحذية', 'Shoes', 'shoes', 'Footprints', 5],
  ['الإكسسوارات', 'Accessories', 'accessories', 'Watch', 6],
  ['المنزل والمطبخ', 'Home & Kitchen', 'home', 'CookingPot', 7],
  ['الجمال والعناية الشخصية', 'Beauty & Personal Care', 'beauty', 'Sparkles', 8],
  ['الرياضة', 'Sports', 'sports', 'Trophy', 9],
  ['الألعاب', 'Toys & Games', 'toys', 'Gamepad2', 10],
];

const brands: Array<[string, string, string]> = [
  ['Samsung', 'samsung', '#1428A0'],
  ['Apple', 'apple', '#555555'],
  ['Xiaomi', 'xiaomi', '#FF6900'],
  ['Sony', 'sony', '#000000'],
  ['LG', 'lg', '#A50034'],
  ['Adidas', 'adidas', '#191523'],
  ['Nike', 'nike', '#F55B3E'],
  ['JBL', 'jbl', '#FF5722'],
  ['Lenovo', 'lenovo', '#E2231A'],
  ['Philips', 'philips', '#0B5ED7'],
];

interface SeedProduct {
  sku: string; name_ar: string; name_en: string;
  description_ar: string; description_en: string;
  category: string; brand: string;
  price_egp: number; price_sdg: number | null; price_mode?: 'independent' | 'converted';
  discount: number; stock: number; image: string;
  featured?: boolean; bestseller?: boolean; isNew?: boolean; sold: number;
  rating: number; review_count: number; specs: Record<string, string>;
}

const P = (p: Partial<SeedProduct> & Pick<SeedProduct, 'sku' | 'name_ar' | 'name_en' | 'category' | 'brand' | 'price_egp' | 'price_sdg' | 'stock' | 'image'>): SeedProduct => ({
  description_ar: 'منتج أصلي 100% مع ضمان وكفالة، وتوصيل سريع لباب البيت وخدمة ما بعد البيع.',
  description_en: '100% genuine product with warranty, fast doorstep delivery and after-sales support.',
  discount: 0, price_mode: 'independent', sold: 100, rating: 4.5, review_count: 12,
  specs: {}, ...p,
});

const products: SeedProduct[] = [
  P({ sku: 'KJK-PH-001', name_ar: 'سامسونج جالاكسي S25 ألترا 256 جيجا', name_en: 'Samsung Galaxy S25 Ultra 256GB', category: 'phones', brand: 'Samsung', price_egp: 42999, price_sdg: 2950000, stock: 40, image: '/products/phone-s25.svg', featured: true, bestseller: true, sold: 845, rating: 4.9, review_count: 132, specs: { 'الشاشة': '6.9 بوصة Dynamic AMOLED', 'المعالج': 'Snapdragon 8 Elite', 'الكاميرا': '200MP', 'البطارية': '5000 مللي أمبير' } }),
  P({ sku: 'KJK-PH-002', name_ar: 'آيفون 16 برو 128 جيجا تيتانيوم', name_en: 'iPhone 16 Pro 128GB Titanium', category: 'phones', brand: 'Apple', price_egp: 59999, price_sdg: 4150000, stock: 35, image: '/products/phone-ip16.svg', featured: true, bestseller: true, discount: 5, sold: 730, rating: 4.8, review_count: 98, specs: { 'الشاشة': '6.3 بوصة Super Retina XDR', 'الشريحة': 'A18 Pro', 'الكاميرا': '48MP Fusion', 'البطارية': 'حتى 27 ساعة فيديو' } }),
  P({ sku: 'KJK-PH-003', name_ar: 'شاومي ريدمي نوت 14 برو 8/256', name_en: 'Xiaomi Redmi Note 14 Pro 8/256', category: 'phones', brand: 'Xiaomi', price_egp: 12999, price_sdg: 880000, stock: 120, image: '/products/phone-redmi.svg', discount: 10, bestseller: true, isNew: true, sold: 1520, rating: 4.6, review_count: 210, specs: { 'الشاشة': '6.67 بوصة AMOLED 120Hz', 'المعالج': 'Dimensity 7300 Ultra', 'الكاميرا': '200MP OIS', 'الشحن': '45W توربو' } }),
  P({ sku: 'KJK-PH-004', name_ar: 'آيفون 16 128 جيجا', name_en: 'iPhone 16 128GB', category: 'phones', brand: 'Apple', price_egp: 45500, price_sdg: null, price_mode: 'converted', stock: 50, image: '/products/phone-ip16b.svg', isNew: true, sold: 320, rating: 4.7, review_count: 45, specs: { 'الشاشة': '6.1 بوصة', 'الشريحة': 'A18', 'الكاميرا': '48MP' } }),
  P({ sku: 'KJK-EL-001', name_ar: 'تلفزيون سوني برافيا 55 بوصة 4K سمارت', name_en: 'Sony BRAVIA 55" 4K Smart TV', category: 'electronics', brand: 'Sony', price_egp: 32999, price_sdg: 2250000, stock: 30, image: '/products/tv-sony.svg', featured: true, discount: 15, sold: 410, rating: 4.8, review_count: 76, specs: { 'المقاس': '55 بوصة', 'الدقة': '4K UHD HDR', 'النظام': 'Google TV', 'الصوت': 'Dolby Atmos' } }),
  P({ sku: 'KJK-EL-002', name_ar: 'سماعات سوني WH-1000XM5 لاسلكية بخاصية إلغاء الضجيج', name_en: 'Sony WH-1000XM5 Wireless Noise Cancelling', category: 'electronics', brand: 'Sony', price_egp: 14500, price_sdg: 990000, stock: 65, image: '/products/headphones-xm5.svg', bestseller: true, featured: true, sold: 980, rating: 4.9, review_count: 187, specs: { 'نوع': 'Over-Ear ANC', 'البطارية': '30 ساعة', 'السائق': '30mm', 'الاتصال': 'Bluetooth 5.2 + LDAC' } }),
  P({ sku: 'KJK-EL-003', name_ar: 'مكبر صوت JBL فليكس 6 محمول', name_en: 'JBL Flip 6 Portable Speaker', category: 'electronics', brand: 'JBL', price_egp: 4299, price_sdg: 295000, stock: 150, image: '/products/speaker-jbl.svg', discount: 20, bestseller: true, sold: 1340, rating: 4.7, review_count: 240, specs: { 'القدرة': '30W', 'مقاومة الماء': 'IP67', 'البطارية': '12 ساعة', 'الوزن': '550 جم' } }),
  P({ sku: 'KJK-CP-001', name_ar: 'لابتوب لينوفو آيدياباد 5 i7 الجيل 13 / 16GB / 512GB SSD', name_en: 'Lenovo IdeaPad 5 i7 13th Gen / 16GB / 512GB SSD', category: 'computers', brand: 'Lenovo', price_egp: 38500, price_sdg: 2650000, stock: 45, image: '/products/laptop-ip5.svg', featured: true, bestseller: true, discount: 8, sold: 390, rating: 4.6, review_count: 64, specs: { 'المعالج': 'Intel Core i7-1355U', 'الذاكرة': '16GB DDR4', 'التخزين': '512GB NVMe SSD', 'الشاشة': '15.6 بوصة FHD IPS' } }),
  P({ sku: 'KJK-CP-002', name_ar: 'لابتوب لينوفو ثينك باد X1 كاربون الجيل 12', name_en: 'Lenovo ThinkPad X1 Carbon Gen 12', category: 'computers', brand: 'Lenovo', price_egp: 72500, price_sdg: null, price_mode: 'converted', stock: 18, image: '/products/laptop-x1.svg', isNew: true, sold: 85, rating: 4.9, review_count: 17, specs: { 'المعالج': 'Core Ultra 7', 'الذاكرة': '32GB', 'التخزين': '1TB SSD', 'الوزن': '1.08 كجم' } }),
  P({ sku: 'KJK-CP-003', name_ar: 'شاشة LG ألترا جير 27 بوصة 165Hz', name_en: 'LG UltraGear 27" 165Hz Monitor', category: 'computers', brand: 'LG', price_egp: 15800, price_sdg: 1080000, stock: 55, image: '/products/monitor-lg.svg', discount: 12, sold: 260, rating: 4.5, review_count: 52, specs: { 'المقاس': '27 بوصة QHD', 'معدل التحديث': '165Hz 1ms', 'اللوحة': 'Nano IPS' } }),
  P({ sku: 'KJK-FS-001', name_ar: 'تيشيرت قطن أوورسايز - أسود', name_en: 'Oversized Cotton T-Shirt - Black', category: 'fashion', brand: 'Nike', price_egp: 850, price_sdg: 58000, stock: 300, image: '/products/tshirt-black.svg', isNew: true, discount: 25, sold: 2100, rating: 4.4, review_count: 320, specs: { 'الخامة': '100% قطن', 'المقاسات': 'S - XXL', 'الغسيل': 'غسيل بارد' } }),
  P({ sku: 'KJK-FS-002', name_ar: 'جاكيت رياضي أداء خفيف - كحلي', name_en: 'Performance Light Jacket - Navy', category: 'fashion', brand: 'Adidas', price_egp: 2350, price_sdg: 160000, stock: 140, image: '/products/jacket-navy.svg', bestseller: true, sold: 640, rating: 4.6, review_count: 88, specs: { 'الخامة': 'بوليستر مقاوم للرياح', 'المقاسات': 'M - XXL' } }),
  P({ sku: 'KJK-SH-001', name_ar: 'حذاء نايك إير ماكس 270 - أبيض', name_en: 'Nike Air Max 270 - White', category: 'shoes', brand: 'Nike', price_egp: 4900, price_sdg: 335000, stock: 110, image: '/products/shoe-am270.svg', featured: true, bestseller: true, discount: 15, sold: 1150, rating: 4.7, review_count: 150, specs: { 'المقاسات': '40 - 46', 'النعل': 'Air Max 270', 'الخامة': 'شبك وأفاست' } }),
  P({ sku: 'KJK-SH-002', name_ar: 'حذاء أديداس ألترابوست 5 للجري', name_en: 'Adidas Ultraboost 5 Running Shoes', category: 'shoes', brand: 'Adidas', price_egp: 7200, price_sdg: 490000, stock: 80, image: '/products/shoe-ub5.svg', isNew: true, sold: 280, rating: 4.8, review_count: 39, specs: { 'النعل': 'Boost Light', 'المقاسات': '39 - 46' } }),
  P({ sku: 'KJK-AC-001', name_ar: 'ساعة سامسونج جالاكسي ووتش 7 44mm', name_en: 'Samsung Galaxy Watch 7 44mm', category: 'accessories', brand: 'Samsung', price_egp: 11500, price_sdg: 790000, stock: 70, image: '/products/watch-gw7.svg', featured: true, discount: 10, sold: 520, rating: 4.6, review_count: 95, specs: { 'الشاشة': '1.5 بوصة Super AMOLED', 'البطارية': 'حتى 40 ساعة', 'المستشعرات': 'BioActive' } }),
  P({ sku: 'KJK-AC-002', name_ar: 'ساعة أبل ووتش سيريس 10 46mm', name_en: 'Apple Watch Series 10 46mm', category: 'accessories', brand: 'Apple', price_egp: 21500, price_sdg: null, price_mode: 'converted', stock: 45, image: '/products/watch-aw10.svg', isNew: true, sold: 190, rating: 4.8, review_count: 28, specs: { 'الشاشة': 'Always-On Retina', 'المقاس': '46mm', 'المقاومة': '50m water resistant' } }),
  P({ sku: 'KJK-HM-001', name_ar: 'غسالة LG أوتوماتيك 10 كجم إنفرتر', name_en: 'LG 10kg AI DD Inverter Washing Machine', category: 'home', brand: 'LG', price_egp: 28999, price_sdg: 1980000, stock: 25, image: '/products/washer-lg.svg', featured: true, bestseller: true, discount: 18, sold: 300, rating: 4.7, review_count: 71, specs: { 'السعة': '10 كجم', 'المحرك': 'Inverter Direct Drive', 'السرعة': '1400 لفة/دقيقة', 'الضمان': '10 سنوات على المحرك' } }),
  P({ sku: 'KJK-HM-002', name_ar: 'خلاط فيليبس 1800 وات برو هاي سبيد', name_en: 'Philips 1800W Pro High-Speed Blender', category: 'home', brand: 'Philips', price_egp: 3450, price_sdg: 235000, stock: 130, image: '/products/blender-ph.svg', discount: 15, sold: 870, rating: 4.5, review_count: 140, specs: { 'القدرة': '1800 وات', 'السعة': '2 لتر', 'السرعة': '35,000 لفة/دقيقة' } }),
  P({ sku: 'KJK-BT-001', name_ar: 'عطر أو دي تويليت نسائي - فلورا 50مل', name_en: 'Floral Eau de Toilette 50ml', category: 'beauty', brand: 'Philips', price_egp: 1650, price_sdg: 112000, stock: 200, image: '/products/perfume.svg', isNew: true, sold: 450, rating: 4.3, review_count: 67, specs: { 'النوع': 'Eau de Toilette', 'الحجم': '50 مل', 'العائلة': 'زهري خشبي' } }),
  P({ sku: 'KJK-BT-002', name_ar: 'مجفف شعر فيليبس 2100 وات أيوني', name_en: 'Philips 2100W Ionic Hair Dryer', category: 'beauty', brand: 'Philips', price_egp: 1250, price_sdg: 85000, stock: 180, image: '/products/dryer.svg', discount: 30, sold: 1050, rating: 4.4, review_count: 175, specs: { 'القدرة': '2100 وات', 'الأيونات': 'تقنية تقليل التجعد', 'النماذج': '3 سرعات / حرارتين' } }),
  P({ sku: 'KJK-SP-001', name_ar: 'كرة قدم أديداس رسمية دوري الأبطال', name_en: 'Adidas Champions League Official Ball', category: 'sports', brand: 'Adidas', price_egp: 1950, price_sdg: 130000, stock: 90, image: '/products/ball.svg', bestseller: true, sold: 720, rating: 4.6, review_count: 83, specs: { 'المقاس': '5', 'الطبقات': 'Thermo bonded' } }),
  P({ sku: 'KJK-SP-002', name_ar: 'دمبل قابل للتعديل 24 كجم', name_en: 'Adjustable Dumbbell 24kg', category: 'sports', brand: 'Nike', price_egp: 5300, price_sdg: 360000, stock: 60, image: '/products/dumbbell.svg', discount: 10, sold: 340, rating: 4.7, review_count: 44, specs: { 'الوزن': '2 - 24 كجم', 'الخطوات': '15 خطوة تعديل' } }),
  P({ sku: 'KJK-TY-001', name_ar: 'جهاز تحكم بلايستيشن 5 لاسلكي - أبيض', name_en: 'PlayStation 5 DualSense Wireless Controller - White', category: 'toys', brand: 'Sony', price_egp: 3600, price_sdg: 245000, stock: 100, image: '/products/gamepad.svg', featured: true, isNew: true, sold: 890, rating: 4.9, review_count: 160, specs: { 'المحرك': 'Haptic Feedback + Adaptive Triggers', 'البطارية': 'حتى 12 ساعة' } }),
  P({ sku: 'KJK-TY-002', name_ar: 'مجموعة ليغو سباق ليلي 758 قطع', name_en: 'LEGO Night Racer Set 758 pcs', category: 'toys', brand: 'Nike', price_egp: 2750, price_sdg: 190000, stock: 75, image: '/products/lego.svg', discount: 12, sold: 380, rating: 4.8, review_count: 51, specs: { 'القطع': '758', 'العمر': '+9 سنوات' } }),
];

const banners: Array<[string, string, string, string, string, string, number]> = [
  ['عروض الإلكترونيات الكبرى', 'Mega Electronics Deals', 'خصومات حتى 30% على الهواتف والتلفزيونات والشاشات — لفترة محدودة', 'Up to 30% off phones, TVs and monitors — limited time', '/hero-electronics.jpg', '/search?category=electronics', 1],
  ['عالم الموضة الجديدة', 'New Season Fashion', 'تشكيلة صيف/شتاء 2026 بأسعار حصرية مع توصيل لكل المحافظات', 'The 2026 collection at exclusive prices with nationwide delivery', '/hero-fashion.jpg', '/search?category=fashion', 2],
];

export async function seedIfEmpty(): Promise<void> {
  const count = await query<{ c: string | number }>('SELECT COUNT(*) AS c FROM products');
  if (Number(count.rows[0].c) > 0) return;

  for (const [name_ar, name_en, slug, icon, sort_order] of categories) {
    await query('INSERT INTO categories(id, name_ar, name_en, slug, icon, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', [await nextId('categories'), name_ar, name_en, slug, icon, sort_order]);
  }
  const catId = async (slug: string) => Number((await query<{ id: number }>('SELECT id FROM categories WHERE slug=$1', [slug])).rows[0].id);

  for (const [name, slug, color] of brands) {
    await query('INSERT INTO brands(id, name, slug, color) VALUES ($1,$2,$3,$4)', [await nextId('brands'), name, slug, color]);
  }
  const brandId = async (name: string) => Number((await query<{ id: number }>('SELECT id FROM brands WHERE name=$1', [name])).rows[0].id);

  for (const p of products) {
    await query(
      `INSERT INTO products(id, sku, name_ar, name_en, description_ar, description_en, category_id, brand_id,
        price_egp, price_sdg, price_mode, discount_percent, stock, image, specs_json, featured, bestseller, new_arrival,
        sold_count, rating, review_count, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [await nextId('products'), p.sku, p.name_ar, p.name_en, p.description_ar, p.description_en,
       await catId(p.category), await brandId(p.brand), p.price_egp, p.price_sdg, p.price_mode || 'independent',
       p.discount, p.stock, p.image, JSON.stringify(p.specs), p.featured ? 1 : 0, p.bestseller ? 1 : 0, p.isNew ? 1 : 0,
       p.sold, p.rating, p.review_count, now()]
    );
  }

  for (const [title_ar, title_en, subtitle_ar, subtitle_en, image, link, sort_order] of banners) {
    await query('INSERT INTO banners(id, title_ar, title_en, subtitle_ar, subtitle_en, image, link, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)', [await nextId('banners'), title_ar, title_en, subtitle_ar, subtitle_en, image, link, sort_order]);
  }

  const coupons: Array<[string, string, number, number]> = [
    ['KAJOK10', 'percent', 10, 200],
    ['WELCOME5', 'percent', 5, 0],
    ['KAJOK100', 'fixed', 100, 1000],
  ];
  for (const [code, type, value, minOrder] of coupons) {
    await query('INSERT INTO coupons(id, code, type, value, min_order, active, uses_left) VALUES ($1,$2,$3,$4,$5,1,1000)', [await nextId('coupons'), code, type, value, minOrder]);
  }

  // Demo accounts — documented in README, change in production
  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const userHash = await bcrypt.hash('User@12345', 10);
  await query('INSERT INTO users(id, email, password_hash, full_name, phone, role, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [await nextId('users'), 'admin@kajok.com', adminHash, 'KAJOK Admin', '01000000000', 'admin', now()]);
  await query('INSERT INTO users(id, email, password_hash, full_name, phone, role, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [await nextId('users'), 'user@kajok.com', userHash, 'عميل تجريبي', '01012345678', 'customer', now()]);

  // Seed a few reviews so product pages are alive on first run
  const demoReviews: Array<[number, string, number, string, string]> = [
    [1, 'أحمد محمد', 5, 'ممتاز، التوصيل كان سريع والمنتج أصلي.', new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()],
    [1, 'Sara Ali', 5, 'Excellent quality and fast delivery to Cairo.', new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()],
    [6, 'محمود إبراهيم', 5, 'إلغاء الضوضاء خرافي، أنصح بها.', new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()],
    [7, 'فاطمة حسن', 4, 'صوت قوي وسعر منافس.', new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString()],
  ];
  for (const [pid, author, rating, comment, created] of demoReviews) {
    await query('INSERT INTO reviews(id, product_id, user_id, author_name, rating, comment, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [await nextId('reviews'), pid, null, author, rating, comment, created]);
  }

  // Currency & market settings (only set defaults if not present)
  const defaults: Array<[string, string]> = [
    ['egp_enabled', 'true'], ['sdg_enabled', 'true'],
    ['default_country', 'EG'], ['default_currency', 'EGP'],
    ['exchange_rate_egp_sdg', '68'], ['conversion_margin_percent', '2'],
    ['exchange_rate_updated_at', now()], ['exchange_rate_source', 'manual'],
    ['shipping_fee_eg', '50'], ['shipping_fee_sd', '5000'],
    ['min_order_eg', '100'], ['min_order_sd', '10000'],
    ['store_name', 'KAJOK'], ['support_phone', '19000'],
  ];
  for (const [k, v] of defaults) {
    if ((await getSetting(k, '')) === '') await setSetting(k, v);
  }

  schedulePersist();
  console.log('[db] seed completed: categories, brands, products, coupons, banners, settings');
}
