import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildGoogleAuthUrl,
  detectJenjangFromEmail,
  getGoogleOAuthConfig,
  isAllowedBelajarIdEmail
} from '../src/server/googleAuth.ts';

test('email belajar.id yang diizinkan lolos, email umum ditolak', () => {
  assert.equal(isAllowedBelajarIdEmail('guru@guru.smp.belajar.id'), true);
  assert.equal(isAllowedBelajarIdEmail('GURU@GURU.SD.BELAJAR.ID'), true);
  assert.equal(isAllowedBelajarIdEmail('admin@admin.belajar.id'), true);
  assert.equal(isAllowedBelajarIdEmail('murid@belajar.id'), true);
  assert.equal(isAllowedBelajarIdEmail('guru@gmail.com'), false);
  assert.equal(isAllowedBelajarIdEmail('guru@sekolah.sch.id'), false);
  assert.equal(isAllowedBelajarIdEmail(''), false);
});

test('jenjang terdeteksi dari subdomain email', () => {
  assert.equal(detectJenjangFromEmail('guru@guru.sd.belajar.id'), 'SD');
  assert.equal(detectJenjangFromEmail('guru@guru.smp.belajar.id'), 'SMP');
  assert.equal(detectJenjangFromEmail('guru@guru.sma.belajar.id'), 'SMA');
  assert.equal(detectJenjangFromEmail('guru@guru.smk.belajar.id'), 'SMK');
  assert.equal(detectJenjangFromEmail('guru@belajar.id'), 'SMP');
});

test('tanpa env google, konfigurasi null (mode simulasi tetap jalan)', () => {
  const saved = {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: process.env.GOOGLE_REDIRECT_URI,
    appUrl: process.env.APP_URL
  };
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
  delete process.env.APP_URL;
  assert.equal(getGoogleOAuthConfig('http://localhost:3000/x'), null);
  Object.assign(process.env, {
    ...(saved.id !== undefined ? { GOOGLE_CLIENT_ID: saved.id } : {}),
    ...(saved.secret !== undefined ? { GOOGLE_CLIENT_SECRET: saved.secret } : {}),
    ...(saved.redirect !== undefined ? { GOOGLE_REDIRECT_URI: saved.redirect } : {}),
    ...(saved.appUrl !== undefined ? { APP_URL: saved.appUrl } : {})
  });
});

test('url otorisasi google memuat parameter wajib + state anti-CSRF', () => {
  const url = buildGoogleAuthUrl(
    { clientId: 'cid', clientSecret: 'cs', redirectUri: 'http://localhost:3000/api/auth/google/callback' },
    'state123'
  );
  const parsed = new URL(url);
  assert.equal(parsed.hostname, 'accounts.google.com');
  assert.equal(parsed.searchParams.get('client_id'), 'cid');
  assert.equal(parsed.searchParams.get('redirect_uri'), 'http://localhost:3000/api/auth/google/callback');
  assert.equal(parsed.searchParams.get('response_type'), 'code');
  assert.equal(parsed.searchParams.get('state'), 'state123');
  assert.ok((parsed.searchParams.get('scope') || '').includes('openid'));
  assert.ok((parsed.searchParams.get('scope') || '').includes('email'));
});
