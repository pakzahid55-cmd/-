# KAJOK — Your Order. Your Way.

A premium, bilingual (English / Arabic RTL) e-commerce platform with smart search, full cart & checkout, customer accounts, order tracking, and a secure admin dashboard.

![stack](https://img.shields.io/badge/React%2018-TypeScript-blue) ![stack](https://img.shields.io/badge/Tailwind-CSS-purple) ![stack](https://img.shields.io/badge/Node-Express-green) ![stack](https://img.shields.io/badge/PostgreSQL-ready-blue) ![stack](https://img.shields.io/badge/Firebase-integrated-orange)

## Quick start

**Deployment (Koyeb + Neon):** see [the Arabic deployment guide](./DEPLOY-AR.md) for the multi-stage Docker image, runtime secrets, free-tier/card caveats, and verification steps.

```bash
npm install                 # installs server + web workspaces
npm run dev:server          # API on http://localhost:4000
npm run dev:web             # Store on http://localhost:5173 (proxies /api → 4000)
```

Demo accounts:

| Role     | Email              | Password      |
|----------|--------------------|---------------|
| Customer | sara@example.com   | Customer123!  |
| Admin    | admin@kajok.com    | Admin123!     |

## Architecture

```
├── server/                 # Node.js + Express + TypeScript REST API
│   ├── src/db/
│   │   ├── schema.sql      # PostgreSQL schema (idempotent, CREATE IF NOT EXISTS)
│   │   ├── pg-store.ts     # PostgreSQL adapter (production store)
│   │   ├── memory-store.ts # Embedded dev store (server/data/db.json)
│   │   └── store.ts        # Storage contract both adapters implement
│   ├── src/routes/         # auth, products, orders, coupons, admin
│   └── src/middleware/     # JWT auth, admin authz, validation, errors
└── web/                    # React 18 + TypeScript + Vite + Tailwind
    └── src/
        ├── lib/firebase.ts # Firebase (project kajok-65089) — auth/firestore/storage
        ├── i18n/           # English + Arabic dictionaries (RTL aware)
        ├── store/          # cart, wishlist, auth (zustand + persistence)
        └── pages/          # 18 storefront pages + admin dashboard
```

### Database

- **PostgreSQL is the canonical production store.** Set `DATABASE_URL` in `server/.env`,
  then run `npm run build` followed by `npm run db:schema --workspace=server` (demo seed only: `npm run db:seed --workspace=server`, never on a live database).
- Without `DATABASE_URL`, an embedded store (`server/data/db.json`) powers development —
  the API code is identical for both.
- Nothing is ever dropped or migrated destructively; schema uses conditional creates and additive `ADD COLUMN IF NOT EXISTS` changes.

### Firebase (project `kajok-65089`)

`web/src/lib/firebase.ts` initializes Auth, Firestore and Storage exactly once
(duplicate-init guard) and lazy-initializes Analytics. Firebase sits **alongside** the
PostgreSQL-backed API — it does not replace existing data or auth flows.
Run the initialization test: `npm run test:firebase --workspace=web`.

## Feature highlights

- **Bilingual** — English (LTR) / العربية (RTL) with a language switcher, RTL layout, and localized products
- **Smart search** — instant suggestions, keyword/brand/category matching, price filters, sorting, no-result suggestions
- **Commerce** — product catalog with images/specs/reviews/related items, cart, coupons, COD checkout (online payments prepared but intentionally disabled until a real provider is connected), stock enforcement
- **Accounts** — register/login/profile/password, saved addresses, order history
- **Order tracking** — public tracking by reference with status timeline
- **Admin dashboard** — sales stats + 14-day chart, product/category/brand/coupon/banner CRUD, order status management, customer list — all protected by server-side admin authorization
- **Quality** — validated inputs (zod), JWT auth, role-based authz, lazy-loaded routes, loading/empty states, mobile-first responsive design, accessible focus states

See [FINAL_REPORT.md](./FINAL_REPORT.md) for the full delivery report.

Deployment regression checks (after `npm run build`): `node --test scripts/deploy.test.mjs`.
