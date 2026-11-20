# KUJUK – كجوك

**Your Order. Your Way.** A bilingual marketplace for multiple independent sellers in Egypt and Sudan, with server-quoted cash on delivery.

- [نشر نسخة تجربة برابط من الهاتف](./PREVIEW-AR.md)
- [دليل الإعداد والنشر](./DEPLOY-AR.md)
- [تقرير التسليم والاختبارات](./FINAL_REPORT_AR.md)
- [Expo / Android / iOS implementation plan](./mobile/README.md)

## Local preview

Node.js 22 is required. From the repository root:

```bash
npm ci
npm run dev:server       # Terminal 1: Express API, port 4000
npm run dev:web          # Terminal 2: Next.js, port 3000
npm test                 # Isolated HTTP tests and Firebase config check
npm run build            # TypeScript + production bundle
```

Open `http://localhost:3000`, not the API URL. Without server Firebase settings, the local API seeds a JSON store (`server/data/db.json`) with **sample** products and synthetic business data. Do not submit genuine personal documents or addresses to a preview. Local-only admin: `admin@kujuk.com` / `Admin123!`. Production refuses to start without Firebase configuration; these credentials are not deployed to Firebase or accepted in production.

```text
web/         Next.js + React + TypeScript; bilingual screens, seller and admin tools
server/      API with Firebase Admin SDK, validation, tenant-scoped access and COD rules
shared/      TypeScript checkout contract for all clients
functions/   Firestore-triggered Cloud Function for FCM Web Push
mobile/      Expo integration and release plan (no Android/iOS builds yet)
```

Production uses Firebase Authentication, Cloud Firestore and Firebase Storage via server credentials. Firestore and Storage deny **all direct client access**; the API performs the authorization. Firebase project setup, rule deployment and testing remain necessary before taking orders. A PostgreSQL adapter remains available for existing development data; Firebase notifications use Firestore.
