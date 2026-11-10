import express, { type Request, type Response, type NextFunction } from 'express';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import type { UserProfile } from '../types';

type Session = { expires: number; csrf: string; role: 'super_admin' };
const sessions = new Map<string, Session>();
const attempts = new Map<string, { count: number; reset: number }>();
const TTL = 8 * 60 * 60 * 1000;
const COOKIE_NAME = 'hiau_media_session';

function credentialsConfigured() {
  return Boolean(process.env.HIAU_MEDIA_ADMIN_EMAIL && process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH);
}
function verifyPassword(password: string): boolean {
  const configured = process.env.HIAU_MEDIA_ADMIN_PASSWORD_HASH || '';
  const [salt, hash] = configured.split(':');
  if (!salt || !/^[0-9a-f]{32,}$/.test(salt) || !/^[0-9a-f]{128}$/.test(hash || '')) return false;
  const derived = scryptSync(password, Buffer.from(salt, 'hex'), 64);
  return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
}
function sessionId(req: Request): string | null {
  const cookie = (req.headers.cookie || '').split(';').map(v => v.trim())
    .find(item => item.startsWith(COOKIE_NAME + '='));
  const token = cookie?.slice(COOKIE_NAME.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? createHash('sha256').update(token).digest('hex') : null;
}
function activeSession(req: Request): Session | null {
  const key = sessionId(req);
  if (!key) return null;
  const value = sessions.get(key);
  if (!value) return null;
  if (value.expires <= Date.now()) { sessions.delete(key); return null; }
  return value;
}
function cookieOptions(): express.CookieOptions {
  return { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
    path: '/api', maxAge: TTL };
}
function publicAdminProfile(): UserProfile {
  return {
    id: 'website-content-admin',
    name: 'Website Content Administrator',
    email: process.env.HIAU_MEDIA_ADMIN_EMAIL || '',
    role: 'super_admin',
    title: 'Website Content Administrator',
    department: 'Website Content Management',
  };
}
function sameOrigin(req: Request): boolean {
  const origin = req.get('origin');
  const host = req.get('host');
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const forwarded = req.get('x-forwarded-proto');
    const protocol = process.env.NODE_ENV === 'production' ? 'https:' :
      (forwarded === 'https' ? 'https:' : req.protocol + ':');
    return parsed.protocol === protocol && parsed.host === host;
  } catch { return false; }
}
function csrfIsValid(req: Request, session: Session): boolean {
  const actual = req.get('x-hiau-csrf') || '';
  if (!/^[a-f0-9]{64}$/.test(actual)) return false;
  return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(session.csrf, 'hex'));
}
export const mediaAuthRouter = express.Router();
mediaAuthRouter.post('/login', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!sameOrigin(req)) return res.status(403).json({ success: false, error: 'Invalid origin.' });
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const current = Date.now();
  const bucket = attempts.get(ip);
  if (bucket && bucket.reset > current && bucket.count >= 5)
    return res.status(429).json({ success: false, error: 'Too many attempts; try later.' });
  const nextBucket = bucket && bucket.reset > current ? bucket : { count: 0, reset: current + 15 * 60_000 };
  nextBucket.count++;
  attempts.set(ip, nextBucket);
  const { email, password, role } = req.body || {};
  if (role !== undefined || !credentialsConfigured() || typeof email !== 'string' ||
      typeof password !== 'string' || password.length < 12 || password.length > 1024 ||
      email.trim().toLowerCase() !== process.env.HIAU_MEDIA_ADMIN_EMAIL!.trim().toLowerCase() ||
      !verifyPassword(password)) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }
  attempts.delete(ip);
  const rawToken = randomBytes(32).toString('hex');
  const csrf = randomBytes(32).toString('hex');
  sessions.set(createHash('sha256').update(rawToken).digest('hex'),
    { expires: current + TTL, csrf, role: 'super_admin' });
  res.cookie(COOKIE_NAME, rawToken, cookieOptions());
  return res.json({ success: true, user: publicAdminProfile(), csrf });
});
mediaAuthRouter.get('/session', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const session = activeSession(req);
  return session
    ? res.json({ success: true, user: publicAdminProfile(), csrf: session.csrf })
    : res.status(401).json({ success: false, error: 'Not signed in.' });
});
mediaAuthRouter.post('/logout', (req: Request, res: Response) => {
  const session = activeSession(req);
  if (session && sameOrigin(req) && csrfIsValid(req, session)) {
    const key = sessionId(req);
    if (key) sessions.delete(key);
    res.clearCookie(COOKIE_NAME, { path: '/api', sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', httpOnly: true });
    return res.json({ success: true });
  }
  return res.status(403).json({ success: false, error: 'Invalid session or CSRF token.' });
});

export function requireMediaAdministrator(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store');
  const session = activeSession(req);
  if (!session || session.role !== 'super_admin')
    return res.status(401).json({ success: false, error: 'Administrator sign-in required.' });
  if (req.method !== 'GET' && req.method !== 'HEAD' &&
      (!sameOrigin(req) || !csrfIsValid(req, session)))
    return res.status(403).json({ success: false, error: 'Invalid origin or CSRF token.' });
  return next();
}
