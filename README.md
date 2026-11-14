# KAJOK — Your Order. Your Way.

**كجوك — طلبك. بطريقتك.**

Bilingual (Arabic RTL / English LTR) e-commerce platform for the **Egyptian** and **Sudanese** markets with native multi-currency pricing (EGP · SDG), a full customer storefront, and a protected admin panel.

![KAJOK logo](client/public/logo.jpg)

## Architecture

```
client/   React 18 + TypeScript + Vite + Tailwind CSS (RTL-first, AR/EN i18n)
server/   Node.js + Express + TypeScript — REST API (JWT auth, zod validation)
data/     Runtime database snapshots (embedded mode only; git-ignored)
```

**Database layer (PostgreSQL).** `server/src/db/index.ts` exposes one `query()` contract with two backends:

| Mode | When | Engine |
|---|---|---|
| Real PostgreSQL | `DATABASE_URL=postgresql://user:pass@host:5432/db` | `pg` driver, FK-safe DDL with `CREATE TABLE IF NOT EXISTS` |
| Embedded (zero-config) | `DATABASE_URL` unset | `pg-mem` — 100% in-memory **PostgreSQL-compatible** engine, persisted to `data/kajok-snapshot.json` after every mutation and on shutdown |

PostgreSQL remains the system of record — no table was deleted, moved, or replaced. In embedded mode the schema and SQL are plain PostgreSQL and migration to a real server is just setting `DATABASE_URL`.

**Data ownership (no dual sources of truth)**
- PostgreSQL: users, products, categories, brands, orders, order_items, reviews, coupons, banners, wishlist, settings, addresses.
- Firebase Auth / Firestore / Storage: initialized client-side in `client/src/lib/firebase.ts` (Analytics guarded). Firestore & Storage are **not** used for business data — `firestore.rules` and `storage.rules` deny all access by default.
- Cart & recently-viewed: browser localStorage (standard storefront practice); orders always re-price server-side.

## Quick start

```bash
npm run install:all   # install server + client deps
npm run build         # build storefront → client/dist
npm start             # serves API + built storefront on http://localhost:8080
```

Development with hot reload (two terminals):

```bash
npm run dev           # API on :8080 (tsx watch)
npm run dev:client    # Vite on :5173, proxies /api → :8080
```

### Demo accounts (change immediately in production)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@kajok.com` | `Admin@12345` |
| Customer | `user@kajok.com` | `User@12345` |

### Demo coupons
`KAJOK10` (10% off, min 200), `WELCOME5` (5% off), `KAJOK100` (100 fixed, min 1000).

## Multi-currency & markets (EGP · SDG)

- **One order = one currency**, stored on the order with the exchange rate captured at purchase time — historical orders never change when the rate is edited.
- Each product chooses a **pricing mode** (admin → product form):
  - `independent` — explicit price per market (e.g. 12,999 EGP / 880,000 SDG). Recommended to avoid market-inappropriate auto-conversion.
  - `converted` — SDG price computed from the approved rate + optional margin, rounded to the nearest 5 SDG for shelf-friendly prices.
- **Currency admin** (`/admin/currency`, backend-enforced `requireAdmin`): enable/disable EGP & SDG, default market, default currency, exchange rate `1 EGP = N SDG`, conversion margin %, per-market delivery fees and minimum order values, and the timestamp/source of the last rate update. Changes apply to **new orders only**.
- Public storefront reads `GET /api/settings/public`. Order totals are always recomputed server-side — the client is never trusted.

Initial rate: `1 EGP = 68 SDG`, margin 2%, source `manual` (update it in `/admin/currency`). To wire a trusted live FX feed later, implement the fetch in the admin "تحديث سعر الصرف" flow and set `exchange_rate_source` accordingly — the schema is ready.

## Features

**Storefront** — bilingual AR/RTL + EN/LTR UI with persisted language toggle; country (🇪🇬 Egypt / 🇸🇩 Sudan) and currency (EGP/SDG) selectors persisted per browser & per account; live search with suggestions (AR/EN, product/brand/category/SKU); filters (price, brand), sorting (newest/oldest/price/bestselling/rating/discount), pagination; product detail with specs, rating, reviews (create + rolling average), similar products, recently-viewed; cart with quantities & coupon validation; checkout with COD (online payment shown as "coming soon" — never faked); order success screen; account area (profile, saved addresses, language/currency/country preferences, order history); order tracking timeline (new → confirming → confirmed → preparing → out for delivery → delivered / cancelled).

**Admin** (`/admin`, role-gated both in UI and via backend `requireAdmin`)
- Overview: revenue per market, orders, pending, customers, products & low-stock counters, 14-day orders chart, top sellers, recent orders.
- Products: search, create, edit, delete (products referenced by orders are deactivated, not deleted — history is preserved). Dual EGP/SDG pricing, pricing mode, discount, stock, images, merchandising flags, specs.
- Orders: status filter + search, expandable items, one-click status flow; cancelling auto-restocks.
- Customers: list with orders count and lifetime spend per currency.
- Marketing: coupons (percent/fixed, min order, usage limits, active toggle), hero banners, categories, brands.
- Currency management: as described above.

## Security

- Passwords hashed with bcrypt. Sessions via signed JWT (7-day), secret from `JWT_SECRET`.
- Admin routes require `role='admin'` verified **on the server**, not hidden in the UI.
- zod input validation on all mutating endpoints; rate limiting on the API (stricter on login/register/forgot); `helmet` headers; central error handler never leaks internals; SQL via parameterized queries only.
- Firebase Admin credentials are **not** in the repo; the client web config is public by design; Firestore/Storage deny-all rules included.

## i18n & RTL

`client/src/i18n/translations.ts` — full Arabic/English dictionary; `I18nProvider` sets `<html lang dir>` and persists to `localStorage('kajok_lang')`. Icons/layouts use logical CSS properties (`ms/me/ps/pe/start/end`) so the layout mirrors correctly.

## Firebase (project `kajok-65089`)

- `client/src/lib/firebase.ts` initializes app (once, `getApps()` guard), Auth, Firestore, Storage; Analytics only when `isSupported()`.
- Web config can be overridden with `VITE_FIREBASE_*` env vars.
- **Not enabled yet (needs Firebase console setup):** Google sign-in, phone OTP, online payment. Email/password auth is fully implemented against the PostgreSQL user store. See `firestore.rules` / `storage.rules` — apply them in the Firebase console.
- Note: the web API key is not a secret; it identifies the project. Restrict it by HTTP referrer in Google Cloud Console for production.

## Testing performed

End-to-end API tests against the running server: health, catalog search/filters/sort, dual-price resolution (independent + converted with margin), register/login/me/profile, coupon validation paths (valid / invalid / below minimum), order creation with stock decrement & coupon, order cancellation with automatic restock, order currency & exchange-rate snapshot, reviews with rolling average, wishlist toggle + server sync, admin sign-in, admin stats, admin product/category/coupon/banner/settings CRUD, JSON 404 for unknown API routes, persistence across restart (embedded snapshot restore), and role-based access control (customer blocked from `/api/admin/*`).

Frontend: `tsc --noEmit` clean on both packages; production build succeeds. No headless browser was available in this environment — see the final report for what was and wasn't verified visually.

## Remaining manual steps (production)

1. Set `JWT_SECRET` and point `DATABASE_URL` at a managed PostgreSQL instance (Neon/Supabase/RDS).
2. Change demo passwords or delete demo users; set your real support hotline/email.
3. Apply `firestore.rules` / `storage.rules` in the Firebase console; enable Google/Phone providers only when you're ready to ship them (requires backend token verification).
4. Configure a real FX feed or update the rate manually in `/admin/currency` and record the source.
5. Integrate a licensed payment gateway (Fawry/Paymob/MyFatoorah…) for the "online payment" option — COD works out of the box.
6. Set up backups for `data/kajok-snapshot.json` (embedded mode) or your managed Postgres.
