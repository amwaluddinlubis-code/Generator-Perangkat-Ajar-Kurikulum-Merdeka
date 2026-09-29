import { randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'rgm_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

interface SessionRecord {
  userId: string;
  createdAt: number;
  expiresAt: number;
}

interface RateLimitRecord {
  windowStartedAt: number;
  count: number;
}

const sessions = new Map<string, SessionRecord>();
const rateLimits = new Map<string, RateLimitRecord>();

function pruneExpiredSessions(now = Date.now()) {
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function pruneExpiredRateLimits(now = Date.now()) {
  for (const [key, record] of rateLimits) {
    if (record.windowStartedAt + 60 * 60 * 1000 <= now) {
      rateLimits.delete(key);
    }
  }
}

export function createSession(userId: string, now = Date.now()): string {
  pruneExpiredSessions(now);

  const token = randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });

  return token;
}

export function getSessionUserIdFromToken(token: string | undefined, now = Date.now()): string | null {
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= now) {
    sessions.delete(token);
    return null;
  }

  return session.userId;
}

export function revokeSessionToken(token: string | undefined): void {
  if (token) sessions.delete(token);
}

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator <= 0) return cookies;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }

    return cookies;
  }, {});
}

export function getSessionUserIdFromCookieHeader(header: string | undefined, now = Date.now()): string | null {
  const cookies = parseCookies(header);
  return getSessionUserIdFromToken(cookies[SESSION_COOKIE_NAME], now);
}

export function buildSessionCookie(token: string, secure = process.env.NODE_ENV === 'production'): string {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];

  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

export function buildExpiredSessionCookie(secure = process.env.NODE_ENV === 'production'): string {
  const attributes = [
    `${SESSION_COOKIE_NAME}=;`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];

  if (secure) attributes.push('Secure');
  return attributes.join(' ');
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  pruneExpiredRateLimits(now);

  const existing = rateLimits.get(key);
  if (!existing || existing.windowStartedAt + windowMs <= now) {
    rateLimits.set(key, { windowStartedAt: now, count: 1 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count <= maxRequests) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.windowStartedAt + windowMs - now) / 1000))
  };
}

export function resetRateLimit(key: string): void {
  rateLimits.delete(key);
}

export function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

export function exceedsLength(value: unknown, maxLength: number): boolean {
  return typeof value === 'string' && value.length > maxLength;
}

export const LIMITS = {
  email: 254,
  name: 160,
  schoolName: 200,
  subject: 160,
  topic: 500,
  generatorField: 2_000,
  generatorPromptTotal: 12_000,
  documentContent: 500_000,
  imagePrompt: 2_000
} as const;
