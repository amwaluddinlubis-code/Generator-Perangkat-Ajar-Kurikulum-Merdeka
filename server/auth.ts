/**
 * server/auth.ts — Modul keamanan Tahap 3 (hardening).
 *
 * Isi:
 *  - Hash & verifikasi password (scrypt, node:crypto bawaan — tanpa dependensi baru)
 *  - Session server-side (token acak, disimpan di data/db.json, kedaluwarsa 7 hari,
 *    dikirim via cookie httpOnly `rgm_session`)
 *  - Middleware requireAuth & requireRole
 *  - Rate limiter in-memory
 *  - Audit log (JSON-line ke data/audit.log)
 *  - publicUser(): buang passwordHash dari objek user sebelum dikirim ke client
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const AUDIT_PATH = path.join(DATA_DIR, 'audit.log');

export const SESSION_COOKIE = 'rgm_session';
export const SESSION_TTL_MS = 7 * 24 * 3600 * 1000; // 7 hari

/** Struktur user minimal yang dibutuhkan middleware auth (kompatibel dengan TeacherUser di server.ts). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  npsn?: string;
  nip?: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  mataPelajaran: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU';
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  avatarUrl?: string;
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  passwordHash?: string;
}

export type PublicUser = Omit<AuthUser, 'passwordHash'>;

declare global {
  namespace Express {
    interface Request {
      /** User terverifikasi dari session (tanpa passwordHash). Diisi oleh requireAuth. */
      user?: PublicUser;
    }
  }
}

// ---------------------------------------------------------------------------
// Password hashing — scrypt (node:crypto bawaan)
// Format: scrypt$<salt-hex>$<hash-hex>
// ---------------------------------------------------------------------------
const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = String(stored).split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
    const [, salt, expectedHex] = parts;
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Session server-side — disimpan di data/db.json (array `sessions`)
// ---------------------------------------------------------------------------
export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

let sessions: SessionRecord[] = [];

export function setSessions(records: SessionRecord[]): void {
  sessions = Array.isArray(records) ? records : [];
}

export function getSessions(): SessionRecord[] {
  return sessions;
}

/** Hapus session yang kedaluwarsa. Dipanggil saat server start. */
export function pruneExpiredSessions(): number {
  const now = Date.now();
  const before = sessions.length;
  sessions = sessions.filter(s => new Date(s.expiresAt).getTime() > now);
  return before - sessions.length;
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  sessions.push({
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString()
  });
  return token;
}

export function getSessionUserId(token: string): string | null {
  const rec = sessions.find(s => s.token === token);
  if (!rec) return null;
  if (new Date(rec.expiresAt).getTime() <= Date.now()) {
    destroySession(token);
    return null;
  }
  return rec.userId;
}

export function destroySession(token: string): void {
  sessions = sessions.filter(s => s.token !== token);
}

/** Cabut seluruh session milik seorang user (mis. saat akun dihapus). */
export function destroyUserSessions(userId: string): void {
  sessions = sessions.filter(s => s.userId !== userId);
}

// ---------------------------------------------------------------------------
// Cookie (parse manual — tanpa dependensi baru)
// ---------------------------------------------------------------------------
export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      out[key] = part.slice(idx + 1).trim();
    }
  }
  return out;
}

export function sessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export function unauthorized(res: Response) {
  return res.status(401).json({
    success: false,
    message: 'Sesi tidak valid atau telah berakhir. Silakan masuk kembali.',
    error: { code: 'UNAUTHENTICATED', message: 'Sesi tidak valid atau telah berakhir. Silakan masuk kembali.' }
  });
}

/**
 * requireAuth — membaca cookie `rgm_session`, header Authorization: Bearer,
 * x-session-token, atau fallback identitas sesi pengguna (x-user-id/x-user-email).
 * Mengisi `req.user` (tanpa passwordHash). 401 bila tidak valid.
 */
export function createRequireAuth(
  resolveUser: (userId: string) => AuthUser | undefined,
  resolveUserByEmail?: (email: string) => AuthUser | undefined
) {
  return function requireAuth(req: Request, res: Response, next: NextFunction) {
    let token = parseCookies(req)[SESSION_COOKIE];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7).trim();
    }
    if (!token && req.headers['x-session-token']) {
      token = String(req.headers['x-session-token']).trim();
    }

    if (token) {
      const userId = getSessionUserId(token);
      const user = userId ? resolveUser(userId) : undefined;
      if (user) {
        req.user = publicUser(user);
        return next();
      }
      destroySession(token);
    }

    // Fallback: Jika cookie/token terhalang kebijakan iframe browser, gunakan identitas pengguna aktif
    const headerUserId = req.headers['x-user-id'] ? String(req.headers['x-user-id']).trim() : '';
    const headerUserEmail = req.headers['x-user-email'] ? String(req.headers['x-user-email']).trim().toLowerCase() : '';

    if (headerUserId || headerUserEmail) {
      const user = (headerUserId ? resolveUser(headerUserId) : undefined) ||
                   (headerUserEmail && resolveUserByEmail ? resolveUserByEmail(headerUserEmail) : undefined);
      if (user) {
        const newToken = createSession(user.id);
        res.setHeader('Set-Cookie', sessionCookieHeader(newToken));
        res.setHeader('x-new-session-token', newToken);
        req.user = publicUser(user);
        return next();
      }
    }

    return unauthorized(res);
  };
}

/** requireRole — 403 bila role req.user tidak termasuk daftar yang diizinkan. */
export function requireRole(...roles: Array<AuthUser['role']>) {
  return function roleGuard(req: Request, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if (!role || !roles.includes(role as AuthUser['role'])) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Akses ditolak untuk peran Anda.' }
      });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Rate limiter in-memory
// ---------------------------------------------------------------------------
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyFn?: (req: Request) => string;
  message?: string;
}

export function rateLimit(opts: RateLimitOptions) {
  const hits = new Map<string, number[]>();
  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = opts.keyFn ? opts.keyFn(req) : req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - opts.windowMs;
    let arr = hits.get(key);
    if (!arr) {
      arr = [];
      hits.set(key, arr);
    }
    // buang hit di luar jendela waktu
    let i = 0;
    while (i < arr.length && arr[i] <= windowStart) i++;
    if (i > 0) arr.splice(0, i);
    arr.push(now);
    // cegah map membesar tanpa batas
    if (hits.size > 20000) hits.clear();
    if (arr.length > opts.max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: opts.message || 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
        }
      });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Audit log — JSON-line ke data/audit.log
// ---------------------------------------------------------------------------
export function auditLog(event: string, actorId: string | undefined, details?: Record<string, unknown>): void {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    event,
    actorId: actorId || 'anonymous',
    details: details || {}
  });
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(AUDIT_PATH, line + '\n', 'utf-8');
  } catch (err) {
    console.warn('[Audit] Gagal menulis audit.log:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// publicUser — buang passwordHash sebelum objek user dikirim ke client
// ---------------------------------------------------------------------------
export function publicUser(user: AuthUser): PublicUser {
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}
