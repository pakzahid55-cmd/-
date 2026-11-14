import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDb, persistNow, isUsingRealPostgres } from './db/index.js';
import { seedIfEmpty } from './db/seed.js';
import { authRouter } from './routes/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { ordersRouter } from './routes/orders.js';
import { adminRouter } from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  await initDb();
  await seedIfEmpty();
  await persistNow();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })); // SPA + Google Fonts/Firebase
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'RATE_LIMITED', message: 'Too many attempts, please try later' } });

  app.get('/api/health', (_req, res) => res.json({ ok: true, db: isUsingRealPostgres ? 'postgresql' : 'embedded-postgresql', time: new Date().toISOString() }));

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth', apiLimiter, authRouter);
  app.use('/api', apiLimiter, catalogRouter);
  app.use('/api', apiLimiter, ordersRouter);
  app.use('/api/admin', apiLimiter, adminRouter);

  // JSON 404 for unmatched API routes
  app.use('/api', (_req, res) => res.status(404).json({ error: 'NOT_FOUND', message: 'Endpoint not found' }));

  // Serve built client (production mode)
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  // Central error handler — never leak internals
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[api] error:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' });
  });

  const server = app.listen(PORT, HOST, () => {
    console.log(`KAJOK server listening on http://${HOST}:${PORT} (db: ${isUsingRealPostgres ? 'postgresql' : 'embedded-postgresql'})`);
  });

  const shutdown = async () => {
    console.log('\n[server] shutting down, persisting data...');
    try { await persistNow(); } catch {}
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => { console.error('[server] fatal:', err); process.exit(1); });
