import type {
  Address,
  Banner,
  Brand,
  Category,
  Coupon,
  Order,
  OrderItem,
  Product,
  Review,
  User,
} from "./types.js";

/**
 * Canonical demo dataset for KAJOK.
 * Used by the embedded store automatically and by `npm run db:seed` for PostgreSQL.
 * Images live in web/public/images and are served by the web app.
 */

export const seedCategories: Omit<Category, "id">[] = [
  { slug: "electronics", nameEn: "Electronics", nameAr: "إلكترونيات", image: "/images/categories/electronics.jpg", sort: 1 },
  { slug: "fashion", nameEn: "Fashion", nameAr: "أزياء", image: "/images/categories/fashion.jpg", sort: 2 },
  { slug: "home-kitchen", nameEn: "Home & Kitchen", nameAr: "المنزل والمطبخ", image: "/images/categories/home.jpg", sort: 3 },
  { slug: "beauty", nameEn: "Beauty", nameAr: "الجمال", image: "/images/categories/beauty.jpg", sort: 4 },
  { slug: "sports", nameEn: "Sports & Outdoors", nameAr: "الرياضة والرحلات", image: "/images/categories/sports.jpg", sort: 5 },
  { slug: "groceries", nameEn: "Groceries", nameAr: "البقالة", image: "/images/categories/groceries.jpg", sort: 6 },
];

export const seedBrands: Omit<Brand, "id">[] = [
  { slug: "aurora", name: "Aurora" },
  { slug: "pulse", name: "Pulse" },
  { slug: "vision", name: "Vision" },
  { slug: "barista", name: "Barista" },
  { slug: "glow", name: "Glow" },
  { slug: "heritage", name: "Heritage" },
];

export interface SeedProduct
  extends Omit<Product, "id" | "rating" | "reviewCount" | "salesCount" | "createdAt" | "brandId" | "categoryId"> {
  rating: number;
  reviewCount: number;
  salesCount: number;
  categorySlug: string;
  brandSlug: string;
}

export const seedProducts: SeedProduct[] = [
  {
    slug: "aurora-anc-wireless-headphones",
    nameEn: "Aurora ANC Wireless Headphones",
    nameAr: "سماعات أورورا اللاسلكية بعزل الضوضاء",
    descriptionEn:
      "Immersive sound with adaptive active noise cancellation, 40-hour battery life and plush memory-foam ear cushions. Engineered for all-day comfort on flights, commutes and deep-work sessions.",
    descriptionAr:
      "صوت غامر مع إلغاء ضوضاء نشط وتكيّفي، وبطارية تدوم 40 ساعة ووسائد أذن من الإسفنج الذكي. مصممة لراحة طوال اليوم في السفر والتنقل والعمل العميق.",
    price: 299.99,
    discountPrice: 249.99,
    stock: 48,
    images: ["/images/products/headphones.jpg", "/images/categories/electronics.jpg"],
    specs: { "Battery Life": "40 hours", Bluetooth: "5.3", Weight: "250 g", Warranty: "2 years" },
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 214,
    salesCount: 980,
    categorySlug: "electronics",
    brandSlug: "aurora",
  },
  {
    slug: "pulse-pro-smart-watch",
    nameEn: "Pulse Pro Smart Watch",
    nameAr: "ساعة بَلْس برو الذكية",
    descriptionEn:
      "A premium health companion with AMOLED display, ECG, blood-oxygen tracking, 14-day battery and 120+ workout modes. Water resistant to 50 meters.",
    descriptionAr:
      "رفيق صحي فاخر بشاشة AMOLED، تخطيط قلب، قياس الأكسجين في الدم، بطارية 14 يومًا وأكثر من 120 وضعًا رياضيًا. مقاومة للماء حتى 50 مترًا.",
    price: 199.99,
    discountPrice: 169.99,
    stock: 65,
    images: ["/images/products/watch.jpg", "/images/categories/electronics.jpg"],
    specs: { Display: '1.43" AMOLED', Battery: "14 days", "Water Resistance": "50 m", Sensors: "ECG, SpO2, HR" },
    isFeatured: true,
    isNew: true,
    rating: 4.6,
    reviewCount: 156,
    salesCount: 720,
    categorySlug: "electronics",
    brandSlug: "pulse",
  },
  {
    slug: "vision-4k-smart-tv-55",
    nameEn: "Vision 4K Ultra HD Smart TV 55\"",
    nameAr: "تلفزيون فيجن ذكي 4K مقاس 55 بوصة",
    descriptionEn:
      "Crystal-clear 4K QLED panel with Dolby Vision, 120Hz refresh rate and a cinematic built-in sound bar. Smart hub with all major streaming apps.",
    descriptionAr:
      "شاشة QLED بدقة 4K مع دعم Dolby Vision ومعدل تحديث 120 هرتز وصوت سينمائي مدمج. منصة ذكية تضم جميع تطبيقات البث.",
    price: 799.0,
    discountPrice: 699.0,
    stock: 21,
    images: ["/images/categories/electronics.jpg", "/images/products/watch.jpg"],
    specs: { Panel: "QLED 4K", Refresh: "120 Hz", HDR: "Dolby Vision", Ports: "HDMI x4" },
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 98,
    salesCount: 310,
    categorySlug: "electronics",
    brandSlug: "vision",
  },
  {
    slug: "airflex-running-sneakers",
    nameEn: "AirFlex Running Sneakers",
    nameAr: "حذاء إيرفلكس للجري",
    descriptionEn:
      "Featherlight responsive cushioning with a breathable engineered knit upper. Designed for daily training and long-distance comfort.",
    descriptionAr:
      "تبطين مرن خفيف الوزن مع علوي من النسيج الهندسي المتنفس. مصمم للتدريب اليومي والراحة في المسافات الطويلة.",
    price: 129.99,
    discountPrice: 99.99,
    stock: 120,
    images: ["/images/products/sneakers.jpg", "/images/categories/sports.jpg"],
    specs: { Upper: "Engineered knit", Sole: "AirFlex foam", Weight: "240 g", Use: "Running, Training" },
    isFeatured: true,
    isNew: false,
    rating: 4.5,
    reviewCount: 342,
    salesCount: 1240,
    categorySlug: "sports",
    brandSlug: "aurora",
  },
  {
    slug: "voyager-leather-backpack",
    nameEn: "Voyager Leather Backpack",
    nameAr: "حقيبة فوياجر الجلدية للظهر",
    descriptionEn:
      "Full-grain leather backpack with a padded 16\" laptop sleeve, anti-theft back pocket and timeless minimal design for work and travel.",
    descriptionAr:
      "حقيبة ظهر من الجلد الكامل مع جيب مبطن لحاسوب 16 بوصة، وجيب خلفي مضاد للسرقة وتصميم أنيق بسيط للعمل والسفر.",
    price: 89.99,
    discountPrice: null,
    stock: 54,
    images: ["/images/products/backpack.jpg", "/images/categories/fashion.jpg"],
    specs: { Material: "Full-grain leather", Laptop: 'Up to 16"', Capacity: "22 L", Warranty: "5 years" },
    isFeatured: false,
    isNew: true,
    rating: 4.4,
    reviewCount: 87,
    salesCount: 260,
    categorySlug: "fashion",
    brandSlug: "heritage",
  },
  {
    slug: "essential-cotton-tshirt",
    nameEn: "Essential Cotton T-Shirt",
    nameAr: "تي شيرت قطني أساسي",
    descriptionEn:
      "Premium 100% combed cotton with a relaxed fit that holds its shape wash after wash. A wardrobe essential in versatile colors.",
    descriptionAr:
      "قطن ممشط 100% فاخر بقصة مريحة تحافظ على شكلها بعد كل غسلة. قطعة أساسية بخانة ملابسك بألوان متعددة.",
    price: 24.99,
    discountPrice: null,
    stock: 240,
    images: ["/images/categories/fashion.jpg", "/images/products/backpack.jpg"],
    specs: { Fabric: "100% combed cotton", Fit: "Relaxed", Care: "Machine wash" },
    isFeatured: false,
    isNew: false,
    rating: 4.3,
    reviewCount: 512,
    salesCount: 2100,
    categorySlug: "fashion",
    brandSlug: "heritage",
  },
  {
    slug: "barista-espresso-machine",
    nameEn: "Barista Espresso Machine",
    nameAr: "آلة إسبريسو باريستا",
    descriptionEn:
      "Café-quality espresso at home with a 15-bar Italian pump, precision PID temperature control and a professional steam wand for silky microfoam.",
    descriptionAr:
      "إسبريسو بجودة المقاهي في منزلك مع مضخة إيطالية 15 بار، وتحكم دقيق بدرجة الحرارة وعصابة بخار احترافية لرغوة حريرية.",
    price: 249.0,
    discountPrice: 199.0,
    stock: 32,
    images: ["/images/products/coffee-maker.jpg", "/images/categories/home.jpg"],
    specs: { Pump: "15 bar", Control: "PID", Tank: "2 L", Wand: "Pro steam wand" },
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 176,
    salesCount: 540,
    categorySlug: "home-kitchen",
    brandSlug: "barista",
  },
  {
    slug: "luma-ceramic-dinnerware-set",
    nameEn: "Luma Ceramic Dinnerware Set (16 pcs)",
    nameAr: "طقم أطباق لوما السيراميك (16 قطعة)",
    descriptionEn:
      "Hand-glazed stoneware dinnerware for 4, dishwasher and microwave safe, with a soft matte finish that elevates every table setting.",
    descriptionAr:
      "أطباق حجرية مزججة يدويًا لأربعة أشخاص، آمنة في غسالة الصحون والميكروويف، بلمسة مطفية ناعمة تجمل كل مائدة.",
    price: 119.99,
    discountPrice: null,
    stock: 40,
    images: ["/images/categories/home.jpg", "/images/products/coffee-maker.jpg"],
    specs: { Pieces: "16", Material: "Stoneware", Safe: "Dishwasher & microwave", Service: "4 people" },
    isFeatured: false,
    isNew: false,
    rating: 4.5,
    reviewCount: 122,
    salesCount: 380,
    categorySlug: "home-kitchen",
    brandSlug: "barista",
  },
  {
    slug: "velvet-matte-lipstick-kit",
    nameEn: "Velvet Matte Lipstick Kit",
    nameAr: "طقم أحمر شفاه فيلفيت مات",
    descriptionEn:
      "Three creamy matte shades with long-wear pigment, infused with vitamin E and jojoba oil for comfortable, non-drying color.",
    descriptionAr:
      "ثلاث درجات مطفية كريمية بتصبغ يدوم طويلًا، مدعمة بفيتامين E وزيت الجوجوبا للون مريح غير مجفف.",
    price: 49.99,
    discountPrice: 39.99,
    stock: 86,
    images: ["/images/products/lipstick.jpg", "/images/categories/beauty.jpg"],
    specs: { Shades: "3", Finish: "Matte", "Wear Time": "12 hours", Infused: "Vitamin E, Jojoba" },
    isFeatured: true,
    isNew: false,
    rating: 4.6,
    reviewCount: 238,
    salesCount: 890,
    categorySlug: "beauty",
    brandSlug: "glow",
  },
  {
    slug: "glow-hyaluronic-serum",
    nameEn: "Glow Hyaluronic Acid Serum",
    nameAr: "سيروم جلو بحمض الهيالورونيك",
    descriptionEn:
      "A weightless daily serum with triple-weight hyaluronic acid and niacinamide for deep hydration, plumper skin and a radiant finish.",
    descriptionAr:
      "سيروم يومي خفيف بحمض هيالورونيك ثلاثي الوزن والنياسيناميد للترطيب العميق وبشرة أكثر امتلاءً وإشراقًا.",
    price: 34.99,
    discountPrice: null,
    stock: 150,
    images: ["/images/products/serum.jpg", "/images/categories/beauty.jpg"],
    specs: { Volume: "30 ml", Key: "Hyaluronic Acid + Niacinamide", Skin: "All skin types" },
    isFeatured: false,
    isNew: true,
    rating: 4.4,
    reviewCount: 164,
    salesCount: 610,
    categorySlug: "beauty",
    brandSlug: "glow",
  },
  {
    slug: "zengrip-premium-yoga-mat",
    nameEn: "ZenGrip Premium Yoga Mat",
    nameAr: "سجادة زين جريب اليوغا الفاخرة",
    descriptionEn:
      "6 mm natural rubber mat with a moisture-wicking grip surface and alignment lines. Extra cushioning for joints, zero-slip in hot yoga.",
    descriptionAr:
      "سجادة مطاط طبيعي بسماكة 6 مم بسطح مانع للانزلاق وخطوط محاذاة. تبطين إضافي للمفاصل، ثبات تام في اليوغا الساخنة.",
    price: 59.99,
    discountPrice: null,
    stock: 72,
    images: ["/images/products/yoga-mat.jpg", "/images/categories/sports.jpg"],
    specs: { Thickness: "6 mm", Material: "Natural rubber", Size: "183 x 66 cm", Grip: "Wet-grip surface" },
    isFeatured: false,
    isNew: false,
    rating: 4.5,
    reviewCount: 143,
    salesCount: 470,
    categorySlug: "sports",
    brandSlug: "aurora",
  },
  {
    slug: "heritage-organic-coffee-beans",
    nameEn: "Heritage Organic Coffee Beans 1kg",
    nameAr: "قهوة هيريتيج العضوية 1 كجم",
    descriptionEn:
      "Single-origin Arabica beans, medium roast with notes of cocoa and hazelnut. Ethically sourced, freshly roasted and packed with a one-way valve.",
    descriptionAr:
      "حبوب أرابيكا من مصدر واحد، تحميص متوسط مع نكهات الكاكاو والبندق. مصادر مسؤولة، تحميص طازج وتغليف بصمام أحادي الاتجاه.",
    price: 29.99,
    discountPrice: 24.99,
    stock: 200,
    images: ["/images/categories/groceries.jpg", "/images/products/coffee-maker.jpg"],
    specs: { Weight: "1 kg", Roast: "Medium", Origin: "Single-origin Arabica", Notes: "Cocoa, Hazelnut" },
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 301,
    salesCount: 1320,
    categorySlug: "groceries",
    brandSlug: "heritage",
  },
];

export const seedCoupons: Omit<Coupon, "id">[] = [
  { code: "WELCOME10", type: "percent", value: 10, minOrder: 50, active: true, expiresAt: "2027-12-31T00:00:00.000Z" },
  { code: "KAJOK20", type: "percent", value: 20, minOrder: 150, active: true, expiresAt: "2027-12-31T00:00:00.000Z" },
  { code: "SAVE15", type: "fixed", value: 15, minOrder: 75, active: true, expiresAt: "2027-12-31T00:00:00.000Z" },
];

export const seedBanners: Omit<Banner, "id">[] = [
  {
    titleEn: "Your Order. Your Way.",
    titleAr: "طلبك. على طريقتك.",
    subtitleEn: "Discover premium brands, smart deals and delivery you can track — all in one place.",
    subtitleAr: "اكتشف العلامات الفاخرة والعروض الذكية والتوصيل الذي يمكنك تتبعه — كل ذلك في مكان واحد.",
    image: "/images/hero.jpg",
    link: "/products",
    active: true,
    sort: 1,
  },
  {
    titleEn: "Mega Deals — Up to 40% Off",
    titleAr: "عروض ضخمة — خصومات حتى 40%",
    subtitleEn: "Limited-time offers on electronics, beauty and home essentials.",
    subtitleAr: "عروض لفترة محدودة على الإلكترونيات والجمال ومستلزمات المنزل.",
    image: "/images/banner-offers.jpg",
    link: "/offers",
    active: true,
    sort: 2,
  },
];

export interface SeedUser extends Omit<User, "id" | "createdAt" | "passwordHash"> {
  /** Plain password — hashed with bcrypt at seed time. Never stored as-is. */
  password: string;
}

export const seedUsers: SeedUser[] = [
  { name: "KAJOK Admin", email: "admin@kajok.com", password: "Admin123!", role: "admin", phone: "+201000000001" },
  { name: "Sara Hassan", email: "sara@example.com", password: "Customer123!", role: "customer", phone: "+201000000002" },
];

export const seedAddresses: Array<Omit<Address, "id" | "userId"> & { userEmail: string }> = [
  {
    userEmail: "sara@example.com",
    label: "Home",
    fullName: "Sara Hassan",
    phone: "+201000000002",
    country: "Egypt",
    city: "Alexandria",
    address: "12 Corniche Road, Smouha",
    instructions: "Ring the bell twice, apartment 4B",
    isDefault: true,
  },
];

export const seedReviews: Array<
  Omit<Review, "id" | "createdAt" | "userId" | "productId"> & { userEmail: string; productSlug: string }
> = [
  { userEmail: "sara@example.com", productSlug: "aurora-anc-wireless-headphones", userName: "Sara Hassan", rating: 5, comment: "Best headphones I have ever owned. The noise cancellation is unreal." },
  { userEmail: "sara@example.com", productSlug: "airflex-running-sneakers", userName: "Sara Hassan", rating: 4, comment: "Very light and comfortable for daily runs." },
  { userEmail: "admin@kajok.com", productSlug: "barista-espresso-machine", userName: "KAJOK Admin", rating: 5, comment: "Café quality espresso at home. The steam wand is excellent." },
];

// Sample orders so "My Orders" and tracking work out of the box for the demo account.
export function seedSampleOrders(userName: string, userId: number): Omit<Order, "id" | "createdAt" | "updatedAt">[] {
  const items: OrderItem[] = [
    {
      productId: 1,
      slug: "aurora-anc-wireless-headphones",
      nameEn: "Aurora ANC Wireless Headphones",
      nameAr: "سماعات أورورا اللاسلكية بعزل الضوضاء",
      image: "/images/products/headphones.jpg",
      price: 249.99,
      quantity: 1,
    },
    {
      productId: 12,
      slug: "heritage-organic-coffee-beans",
      nameEn: "Heritage Organic Coffee Beans 1kg",
      nameAr: "قهوة هيريتيج العضوية 1 كجم",
      image: "/images/categories/groceries.jpg",
      price: 24.99,
      quantity: 2,
    },
  ];
  const subtotal = 249.99 + 24.99 * 2;
  const shipping = 0;
  return [
    {
      reference: "KJ-100001",
      userId,
      items,
      subtotal,
      discount: 29.99,
      shipping,
      total: subtotal - 29.99 + shipping,
      couponCode: "SAVE15",
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "delivered",
      currency: "EGP",
      exchangeRate: 1,
      customer: {
        name: userName,
        phone: "+201000000002",
        country: "Egypt",
        city: "Alexandria",
        address: "12 Corniche Road, Smouha",
        instructions: "Ring the bell twice, apartment 4B",
      },
    },
    {
      reference: "KJ-100002",
      userId,
      items: [items[0]],
      subtotal: 249.99,
      discount: 0,
      shipping,
      total: 249.99 + shipping,
      couponCode: null,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "shipped",
      currency: "EGP",
      exchangeRate: 1,
      customer: {
        name: userName,
        phone: "+201000000002",
        country: "Egypt",
        city: "Alexandria",
        address: "12 Corniche Road, Smouha",
        instructions: null,
      },
    },
  ];
}
