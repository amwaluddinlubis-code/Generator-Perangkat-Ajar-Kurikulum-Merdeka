import assert from 'node:assert/strict';
import test from 'node:test';
import { createUser } from '../src/server/database.ts';
import {
  LIMITS,
  buildExpiredSessionCookie,
  buildSessionCookie,
  checkRateLimit,
  createSession,
  getSessionUserIdFromCookieHeader,
  getSessionUserIdFromToken,
  revokeSessionToken
} from '../src/server/security.ts';

function createTestUser() {
  const id = 'test-user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  return createUser({
    id,
    name: 'Automated Security Test',
    email: `${id}@guru.smp.belajar.id`,
    schoolName: 'Automated Security Test School',
    schoolId: '',
    jenjang: 'SMP',
    mataPelajaran: 'Bahasa Indonesia',
    role: 'GURU',
    status: 'VERIFIED',
    registeredAt: new Date().toISOString()
  });
}

test('server session tokens are opaque and resolve to the owning user', () => {
  const user = createTestUser();
  const token = createSession(user.id, 1_000);
  assert.equal(token.length, 64);
  assert.equal(getSessionUserIdFromToken(token, 2_000), user.id);
  assert.equal(getSessionUserIdFromToken('not-a-session', 2_000), null);

  const cookieHeader = `other=value; rgm_session=${encodeURIComponent(token)}`;
  assert.equal(getSessionUserIdFromCookieHeader(cookieHeader, 2_000), user.id);

  revokeSessionToken(token);
  assert.equal(getSessionUserIdFromToken(token, 2_000), null);
});

test('session cookies are HttpOnly and SameSite=Lax', () => {
  const cookie = buildSessionCookie('abc123', false);
  assert.match(cookie, /rgm_session=abc123/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=28800/);
  assert.doesNotMatch(cookie, /Secure/);

  const expired = buildExpiredSessionCookie(false).join('\n');
  assert.match(expired, /Max-Age=0/);
  assert.match(expired, /HttpOnly/);
});

test('rate limiter blocks after the configured window quota', () => {
  assert.equal(checkRateLimit('test-key-' + Date.now(), 2, 60_000, 1_000).allowed, true);
  assert.equal(checkRateLimit('test-key', 2, 60_000, 2_000).allowed, true);
  const key = 'test-key-' + Date.now();
  checkRateLimit(key, 2, 60_000, 1_000);
  checkRateLimit(key, 2, 60_000, 2_000);
  const blocked = checkRateLimit(key, 2, 60_000, 3_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);

  assert.equal(checkRateLimit(key, 2, 60_000, 61_001).allowed, true);
});

test('security limits keep large user-controlled fields bounded', () => {
  assert.equal(LIMITS.email, 254);
  assert.equal(LIMITS.documentContent, 500_000);
  assert.equal(LIMITS.generatorPromptTotal, 12_000);
});

test('sessions expire after the server-side idle timeout', () => {
  const user = createTestUser();
  const token = createSession(user.id, 1_000);
  assert.equal(getSessionUserIdFromToken(token, 1_000 + 60_000), user.id);
  assert.equal(getSessionUserIdFromToken(token, 1_000 + (2 * 60 * 60 * 1000) + 1), null);
});
