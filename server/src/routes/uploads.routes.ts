import { Router } from 'express';
import multer from 'multer';
import { requireSeller } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { asyncHandler } from '../lib/validate.js';
import { saveMedia } from '../lib/media-storage.js';

const upload = multer({ limits: { fileSize: 12 * 1024 * 1024, files: 1, fields: 0 } });
const router = Router();
router.post('/', requireSeller, asyncHandler(async (req, _res, next) => {
  if (req.user!.role !== 'admin' && (await req.app.locals.store.getSellerProfileByUserId(req.user!.id))?.status !== 'approved') throw new HttpError(403, 'Seller approval is required');
  next();
}), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  const file = await saveMedia('catalog', req.file.buffer);
  res.status(201).json({ url: `/uploads/${file.name}`, type: file.mime, size: file.size });
}));
export default router;
