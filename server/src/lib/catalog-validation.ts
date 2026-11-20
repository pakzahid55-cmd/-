import { z } from 'zod';

export const mediaRef = z.string().max(768).refine(value => value === '' || /^\/(images|uploads)\/[a-z0-9/_\-.]+$/i.test(value) || /^https:\/\/[^\s]+$/i.test(value), 'Use an HTTPS or uploaded media URL');
export const slug = z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug');
export const catalogPrice = z.number().min(0).max(1_000_000).transform(v => Math.round(v * 100) / 100);
