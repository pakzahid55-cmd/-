# KAJOK — Deploy to a real URL (Render / Railway + PostgreSQL)

This guide takes the repo you already have and gets you a permanent public URL like
`https://kajok.onrender.com` (later `https://kajok.com`). ~15 minutes, all of it in your browser.

## Option A — Render (recommended, free tier)

1. Push this branch to GitHub (`arena/14370066-repo`).
2. Create a free PostgreSQL database — pick one:
   - **Neon** (https://neon.tech) — free, or
   - **Supabase** (https://supabase.com) — free.
   Copy the connection string (`postgresql://user:pass@host:5432/dbname?sslmode=require`).
3. https://dashboard.render.com → **New → Web Service** → connect the GitHub repo.
4. Settings:
   - Environment: **Docker**
   - Port: **8080**
   - Environment variables:
     - `DATABASE_URL` = the connection string from step 2
     - `JWT_SECRET` = a long random string (e.g. output of `openssl rand -hex 32`)
     - `NODE_ENV` = `production`
5. Click **Create Web Service**. Render builds the Dockerfile and gives you
   `https://kajok.onrender.com`. Everyone on Earth can open it.

> The server creates/updates the schema automatically on first boot and seeds the
> demo catalog (products, brands, categories, coupons). With `DATABASE_URL` set it uses
> real PostgreSQL — no code changes needed.

## Option B — Railway (https://railway.app)

New Project → Deploy from GitHub repo → it auto-detects the Dockerfile.
Add the same `DATABASE_URL` and `JWT_SECRET` variables. Done.

## Continuous deployment (GitHub Actions)

Any push to the branch triggers a fresh deploy on Render/Railway automatically.
For a custom domain (`kajok.com`): buy the domain, then in Render/Railway →
Settings → Custom Domains → add `kajok.com` and point the DNS A/CNAME records as instructed.
The platform provisions HTTPS automatically.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | recommended | Real PostgreSQL. If unset, the server uses an embedded PostgreSQL-compatible engine with a JSON snapshot — fine for demos, **not** for real orders (filesystem is wiped on redeploy). |
| `JWT_SECRET` | yes | Signs login sessions. Never commit the real value. |
| `PORT` | no (8080) | Port to listen on. |
| `HOST` | no (0.0.0.0) | Bind address. |
| `KAJOK_DATA_DIR` | no | Where the embedded-engine snapshot is stored. |

## Notes & limits

- COD (cash on delivery) is the only real payment path — electronic payment is marked "soon" in the UI.
- Seed demo accounts (`admin@kajok.com` / `Admin@12345`, `user@kajok.com` / `User@12345`) exist only in a freshly seeded database. **Change them before going live**, or create a new admin and delete the demo users.
- Demo products/prices are placeholders — enter real products and exchange rates from `/admin`.
- Firebase (project kajok-65089) is already wired for Auth/Analytics on the client; enable the providers you want (Google, phone) in the Firebase console — email/password login works out of the box via the API.

---

## Supabase database — already provisioned (KAJOK-DELIVERY)

The project **KAJOK-DELIVERY** in the user's Supabase organization ("كجوك", region `eu-west-3`,
project ref `klhvhjwffjfdeljwulgm`, status ACTIVE_HEALTHY, PostgreSQL 17) has an empty `public` schema —
nothing to migrate. The KAJOK server creates all tables and seeds the catalog automatically on
first boot (`CREATE TABLE IF NOT EXISTS`, then `seedIfEmpty`).

### DATABASE_URL for Render (use the Supabase *session pooler* — IPv4 & fully compatible)

```
postgresql://postgres.klhvhjwffjfdeljwulgm:<DB-PASSWORD>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

`<DB-PASSWORD>` is the database password chosen when the project was created. If you don't remember it:
Supabase dashboard → project **KAJOK-DELIVERY** → **Settings → Database → Reset database password** →
use the new password in the URL above. (Direct connection `db.klhvhjwffjfdeljwulgm.supabase.co:5432`
also works if your network resolves IPv6; the pooler is safer on Render/Railway.)

### Render steps (free)

1. https://dashboard.render.com → **New → Web Service** → sign in (GitHub).
2. Select repository `pakzahid55-cmd/-` → branch **`arena/14370066-repo`** (important: NOT main — main is a placeholder).
3. **Language: Docker** (Render detects the repo's Dockerfile), **Region: EU (Frankfurt)**.
4. Environment variables:
   - `DATABASE_URL` = the URL above (with your password)
   - `JWT_SECRET` = a long random hex string (see .env.example / ask the assistant)
   - `NODE_ENV` = `production`
5. **Create Web Service** → first build takes ~5–10 minutes.
6. The app seeds itself on first boot (24 products, categories, brands, coupons, banners, demo users).
7. Open `https://<service-name>.onrender.com` — done: a real, public link, any phone, no Arena needed.
8. Custom domain: service → **Settings → Custom Domains** → add `kajok.com`, point DNS as instructed.

Notes: free Render services sleep after ~15 min idle (first request after sleep takes ~30–60 s);
demo admin `admin@kajok.com` / `Admin@12345` exists only on first seed — change it from the admin panel.
