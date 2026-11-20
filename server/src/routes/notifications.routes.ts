import { createHash } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { firebaseDb } from '../lib/firebase-admin.js';
import { asyncHandler, validateBody } from '../lib/validate.js';
import { HttpError } from '../middleware/error.js';

const router = Router();
router.use(requireAuth, (req, _res, next) => {
  if (req.app.locals.store.kind !== 'firestore') { next(new HttpError(503, 'Notifications require the Firestore store')); return; }
  next();
});
router.get('/', asyncHandler(async (req, res) => {
  const uid = req.user!.id;
  const recipients = req.user!.role === 'admin' ? [uid, 0] : [uid];
  const result = await firebaseDb().collection('kujuk_notifications').where('userId', 'in', recipients).orderBy('createdAt', 'desc').limit(50).get();
  res.json({ items: result.docs.map(doc => ({ id: doc.id, kind: doc.get('kind'), reference: doc.get('reference') ?? null, createdAt: doc.get('createdAt') })) });
}));
const tokenSchema = z.string().min(20).max(512).regex(/^[\w:-]+$/);
const ref = (token: string) => firebaseDb().collection('kujuk_devices').doc(createHash('sha256').update(token).digest('hex'));
router.put('/device', validateBody(z.object({ token: tokenSchema, lang: z.enum(['en', 'ar']) })), asyncHandler(async (req, res) => {
  await ref(req.body.token).set({ token: req.body.token, lang: req.body.lang, userId: req.user!.id, updatedAt: new Date().toISOString() });
  res.json({ ok: true });
}));
router.delete('/device', validateBody(z.object({ token: tokenSchema })), asyncHandler(async (req, res) => {
  const device = ref(req.body.token);
  await firebaseDb().runTransaction(async tx => {
    if ((await tx.get(device)).get('userId') === req.user!.id) tx.delete(device);
  });
  res.json({ ok: true });
}));
export default router;
