import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { query, nextId, schedulePersist } from '../db/index.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { asyncHandler, parseBody } from '../utils/http.js';

export const authRouter = Router();

const registerSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  phone: z.string().min(6).max(30).optional().or(z.literal('')),
  language: z.enum(['ar', 'en']).optional(),
  country: z.enum(['EG', 'SD']).optional(),
  currency: z.enum(['EGP', 'SDG']).optional(),
});

const publicUser = (u: any) => ({
  id: u.id, email: u.email, full_name: u.full_name, phone: u.phone,
  role: u.role, language: u.language, country: u.country, currency: u.currency,
  created_at: u.created_at,
});

authRouter.post('/register', asyncHandler(async (req, res) => {
  const body = parseBody(registerSchema, req, res); if (!body) return;
  const email = body.email.trim().toLowerCase();
  const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rows.length > 0) return res.status(409).json({ error: 'EMAIL_TAKEN', message: 'This email is already registered' });
  const id = await nextId('users');
  const hash = await bcrypt.hash(body.password, 10);
  await query(
    'INSERT INTO users(id, email, password_hash, full_name, phone, role, language, country, currency, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id, email, hash, body.full_name.trim(), body.phone || null, 'customer', body.language || 'ar', body.country || 'EG', body.currency || 'EGP', new Date().toISOString()]
  );
  schedulePersist();
  const user = { id, email, full_name: body.full_name.trim(), role: 'customer' as const };
  res.status(201).json({ token: signToken(user), user: { ...publicUser({ ...body, id, email, role: 'customer', language: body.language || 'ar', country: body.country || 'EG', currency: body.currency || 'EGP', created_at: new Date().toISOString() }) } });
}));

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

authRouter.post('/login', asyncHandler(async (req, res) => {
  const body = parseBody(loginSchema, req, res); if (!body) return;
  const resRows = await query('SELECT * FROM users WHERE email = $1', [body.email.trim().toLowerCase()]);
  const u = resRows.rows[0];
  if (!u || !(await bcrypt.compare(body.password, u.password_hash))) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' });
  }
  const token = signToken({ id: u.id, email: u.email, role: u.role, full_name: u.full_name });
  res.json({ token, user: publicUser(u) });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
  if (!rows.rows[0]) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ user: publicUser(rows.rows[0]) });
}));

const profileSchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional(),
  language: z.enum(['ar', 'en']).optional(),
  country: z.enum(['EG', 'SD']).optional(),
  currency: z.enum(['EGP', 'SDG']).optional(),
});

authRouter.put('/profile', requireAuth, asyncHandler(async (req, res) => {
  const body = parseBody(profileSchema, req, res); if (!body) return;
  const u = (await query('SELECT * FROM users WHERE id = $1', [req.user!.id])).rows[0];
  if (!u) return res.status(404).json({ error: 'NOT_FOUND' });
  const merged = { ...u, ...body };
  await query('UPDATE users SET full_name=$1, phone=$2, language=$3, country=$4, currency=$5 WHERE id=$6',
    [merged.full_name, merged.phone, merged.language, merged.country, merged.currency, u.id]);
  schedulePersist();
  res.json({ user: publicUser(merged) });
}));

const addressSchema = z.object({
  label: z.string().max(60).optional(),
  country: z.enum(['EG', 'SD']),
  city: z.string().min(1).max(80),
  street: z.string().min(3).max(300),
  phone: z.string().max(30).optional(),
  is_default: z.boolean().optional(),
});

authRouter.get('/addresses', requireAuth, asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC', [req.user!.id]);
  res.json({ addresses: rows.rows });
}));

authRouter.post('/addresses', requireAuth, asyncHandler(async (req, res) => {
  const body = parseBody(addressSchema, req, res); if (!body) return;
  const id = await nextId('addresses');
  if (body.is_default) await query('UPDATE addresses SET is_default = 0 WHERE user_id = $1', [req.user!.id]);
  await query('INSERT INTO addresses(id, user_id, label, country, city, street, phone, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, req.user!.id, body.label || 'Home', body.country, body.city, body.street, body.phone || null, body.is_default ? 1 : 0]);
  schedulePersist();
  res.status(201).json({ id });
}));

authRouter.delete('/addresses/:id', requireAuth, asyncHandler(async (req, res) => {
  await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.user!.id]);
  schedulePersist();
  res.json({ ok: true });
}));

const forgotSchema = z.object({ email: z.string().email() });

authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const body = parseBody(forgotSchema, req, res); if (!body) return;
  const u = (await query('SELECT id FROM users WHERE email = $1', [body.email.trim().toLowerCase()])).rows[0];
  // Always respond with the same message to avoid leaking which emails exist.
  const generic = { message: 'If this email is registered, password reset instructions have been generated. In development the reset token is printed to the server log.' };
  if (u) {
    const token = crypto.randomBytes(24).toString('hex');
    const id = await nextId('password_resets');
    await query('INSERT INTO password_resets(id, user_id, token, expires_at, used) VALUES ($1,$2,$3,$4,0)',
      [id, u.id, token, new Date(Date.now() + 1000 * 60 * 30).toISOString()]);
    schedulePersist();
    console.log(`[auth] password reset token for user ${u.id}: ${token} (valid 30 minutes)`);
  }
  res.json(generic);
}));

const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(8).max(100) });

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const body = parseBody(resetSchema, req, res); if (!body) return;
  const row = (await query('SELECT * FROM password_resets WHERE token = $1', [body.token])).rows[0];
  if (!row || row.used === 1 || new Date(row.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'TOKEN_INVALID', message: 'Reset link is invalid or expired' });
  }
  const hash = await bcrypt.hash(body.password, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, row.user_id]);
  await query('UPDATE password_resets SET used = 1 WHERE id = $1', [row.id]);
  schedulePersist();
  res.json({ message: 'Password updated successfully' });
}));
