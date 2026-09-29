import { createHash, randomBytes } from 'node:crypto';
import {
  checkRateLimitRecord,
  createSessionRecord,
  getSessionUserId as getPersistedSessionUserId,
  resetRateLimitRecord,
  revokeSession
} from './database.js';

export const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production'
  ? '__Host-rgm_session'
  : 'rgm_session';

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const SESSION_IDLE_TTL_MS = 2 * 60 * 60 * 1000;

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(userId: string, now = Date.now()): string {
  const token = randomBytes(32).toString('hex');
  createSessionRecord(hashSessionToken(token), userId, now, now + SESSION_TTL_MS);
  return token;
}

export function getSessionUserIdFromToken(token: string | undefined, now = Date.now()): string | null {
  if (!token) return null;
  return getPersistedSessionUserId(hashSessionToken(token), now, SESSION_IDLE_TTL_MS);
}

export function revokeSessionToken(token: string | undefined): void {
  if (token) revokeSession(hashSessionToken(token));
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

export function getSessionTokenFromCookieHeader(header: string | undefined): string | null {
  const cookies = parseCookies(header);
  return cookies[SESSION_COOKIE_NAME] || cookies.rgm_session || cookies['__Host-rgm_session'] || null;
}

export function getSessionUserIdFromCookieHeader(header: string | undefined, now = Date.now()): string | null {
  return getSessionUserIdFromToken(getSessionTokenFromCookieHeader(header) || undefined, now);
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

export function buildExpiredSessionCookie(secure = process.env.NODE_ENV === 'production'): string[] {
  const names = process.env.NODE_ENV === 'production'
    ? ['__Host-rgm_session', 'rgm_session']
    : ['rgm_session', '__Host-rgm_session'];

  return names.map(name => [
    `${name}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(secure ? ['Secure'] : [])
  ].join('; '));
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  return checkRateLimitRecord(key, maxRequests, windowMs, now);
}

export function resetRateLimit(key: string): void {
  resetRateLimitRecord(key);
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
