import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { Response } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import { firebaseBucket } from './firebase-admin.js';
import { HttpError } from '../middleware/error.js';

const publicTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']);
const privateTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const formats: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm' };
const folder = (kind: 'catalog' | 'passports') => path.resolve(process.cwd(), kind === 'catalog' ? 'uploads' : 'data/passports');
const cloudEnabled = () => Boolean(process.env.FIREBASE_STORAGE_BUCKET);

export async function saveMedia(kind: 'catalog' | 'passports', data: Buffer) {
  const type = await fileTypeFromBuffer(data).catch(() => undefined);
  if (!type || !(kind === 'catalog' ? publicTypes : privateTypes).has(type.mime)) throw new HttpError(415, 'Unsupported or invalid file');
  const name = `${randomUUID()}.${type.ext}`;
  if (cloudEnabled()) {
    await firebaseBucket().file(`kujuk/${kind}/${name}`).save(data, { resumable: false, metadata: { contentType: type.mime,
      cacheControl: kind === 'catalog' ? 'public, max-age=86400' : 'private, no-store' } });
  } else {
    await fs.mkdir(folder(kind), { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(folder(kind), name), data, { flag: 'wx', mode: 0o600 });
  }
  return { name, mime: type.mime, size: data.length };
}

export async function streamMedia(kind: 'catalog' | 'passports', name: string, res: Response) {
  if (!/^[\da-z-]{1,140}\.[a-z]{2,5}$/i.test(name)) throw new HttpError(404, 'File not found');
  const mime = formats[name.split('.').at(-1) ?? ''];
  if (!mime || !(kind === 'catalog' ? publicTypes : privateTypes).has(mime)) throw new HttpError(404, 'File not found');
  const source = cloudEnabled() ? firebaseBucket().file(`kujuk/${kind}/${name}`) : null;
  const local = path.join(folder(kind), name);
  if (!(source ? (await source.exists())[0] : await fs.access(local).then(() => true, () => false))) throw new HttpError(404, 'File not found');
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', kind === 'catalog' ? 'public, max-age=86400' : 'private, no-store');
  if (kind === 'passports') res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  await pipeline(source ? source.createReadStream() : createReadStream(local), res);
}
