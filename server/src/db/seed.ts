/**
 * Seed demo data into PostgreSQL (idempotent: skips when data already exists).
 * Requires DATABASE_URL. The embedded store seeds itself automatically.
 */
import pg from "pg";
import { env, usingPostgres } from "../config/env.js";
import { hashPassword } from "../lib/password.js";
import {
  seedAddresses,
  seedBanners,
  seedBrands,
  seedCategories,
  seedCoupons,
  seedProducts,
  seedReviews,
  seedSampleOrders,
  seedUsers,
} from "./seed-data.js";

async function main(): Promise<void> {
  if (!usingPostgres) {
    console.error("DATABASE_URL is not set — nothing to seed. (The embedded store self-seeds.)");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: env.databaseUrl });
  await client.connect();
  try {
    const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM products");
    if (rows[0].n > 0) {
      console.log("Products already present — skipping seed to protect existing records.");
      return;
    }
    await client.query("BEGIN");
    const catIds = new Map<string, number>();
    for (const c of seedCategories) {
      const r = await client.query(
        "INSERT INTO categories (slug, name_en, name_ar, image, sort) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug RETURNING id",
        [c.slug, c.nameEn, c.nameAr, c.image, c.sort],
      );
      catIds.set(c.slug, Number(r.rows[0].id));
    }
    const brandIds = new Map<string, number>();
    for (const b of seedBrands) {
      const r = await client.query("INSERT INTO brands (slug, name) VALUES ($1,$2) ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug RETURNING id", [b.slug, b.name]);
      brandIds.set(b.slug, Number(r.rows[0].id));
    }
    const productIds = new Map<string, number>();
    for (const p of seedProducts) {
      const { categorySlug, brandSlug, rating, reviewCount, salesCount, ...rest } = p;
      const r = await client.query(
        `INSERT INTO products (slug, name_en, name_ar, description_en, description_ar, price, discount_price, brand_id, category_id, stock, images, specs, rating, review_count, is_featured, is_new, sales_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13,$14,$15,$16,$17) RETURNING id`,
        [rest.slug, rest.nameEn, rest.nameAr, rest.descriptionEn, rest.descriptionAr, rest.price, rest.discountPrice, brandIds.get(brandSlug) ?? null, catIds.get(categorySlug) ?? null, rest.stock, JSON.stringify(rest.images), JSON.stringify(rest.specs), rating, reviewCount, rest.isFeatured, rest.isNew, salesCount],
      );
      productIds.set(p.slug, Number(r.rows[0].id));
    }
    const userIds = new Map<string, number>();
    for (const u of seedUsers) {
      const r = await client.query(
        "INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id",
        [u.name, u.email, await hashPassword(u.password), u.role, u.phone],
      );
      userIds.set(u.email, Number(r.rows[0].id));
    }
    for (const a of seedAddresses) {
      const uid = userIds.get(a.userEmail);
      if (!uid) continue;
      await client.query(
        "INSERT INTO addresses (user_id, label, full_name, phone, country, city, address, instructions, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [uid, a.label, a.fullName, a.phone, a.country, a.city, a.address, a.instructions, a.isDefault],
      );
    }
    for (const r0 of seedReviews) {
      const uid = userIds.get(r0.userEmail);
      const pid = productIds.get(r0.productSlug);
      if (!uid || !pid) continue;
      await client.query("INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES ($1,$2,$3,$4,$5)", [pid, uid, r0.userName, r0.rating, r0.comment]);
    }
    for (const c of seedCoupons) {
      await client.query("INSERT INTO coupons (code, type, value, min_order, active, expires_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (code) DO NOTHING", [c.code, c.type, c.value, c.minOrder, c.active, c.expiresAt]);
    }
    for (const b of seedBanners) {
      await client.query("INSERT INTO banners (title_en, title_ar, subtitle_en, subtitle_ar, image, link, active, sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [b.titleEn, b.titleAr, b.subtitleEn, b.subtitleAr, b.image, b.link, b.active, b.sort]);
    }
    const sara = userIds.get("sara@example.com");
    if (sara) {
      for (const o of seedSampleOrders("Sara Hassan", sara)) {
        await client.query(
          `INSERT INTO orders (reference, user_id, items, subtotal, discount, shipping, total, coupon_code, payment_method, payment_status, status, customer)
           VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb) ON CONFLICT (reference) DO NOTHING`,
          [o.reference, o.userId, JSON.stringify(o.items), o.subtotal, o.discount, o.shipping, o.total, o.couponCode, o.paymentMethod, o.paymentStatus, o.status, JSON.stringify(o.customer)],
        );
      }
    }
    await client.query("COMMIT");
    console.log("KAJOK PostgreSQL seed completed.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
