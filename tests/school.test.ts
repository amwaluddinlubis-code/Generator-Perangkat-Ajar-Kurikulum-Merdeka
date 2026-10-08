import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { app } from '../server.ts';
import { validateLogoPayload, validateSchoolPayload } from '../src/server/validation.ts';

let server: ReturnType<typeof app.listen>;
let baseUrl = '';

test.before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server address unavailable');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function request(path: string, init: RequestInit = {}, cookie?: string) {
  const headers = new Headers(init.headers);
  if (cookie) headers.set('Cookie', cookie);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Connection', 'close');

  const response = await fetch(baseUrl + path, { ...init, headers });
  const setCookie = response.headers.get('set-cookie');
  const body = await response.json().catch(() => null);
  return {
    response,
    body,
    cookie: setCookie ? setCookie.split(';', 1)[0] : undefined
  };
}

async function login(email: string) {
  const result = await request('/api/auth/login-belajar-id', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  assert.equal(result.response.ok, true, JSON.stringify(result.body));
  assert.ok(result.cookie);
  return result.cookie!;
}

test('school payload validation', () => {
  assert.equal(validateSchoolPayload({}).ok, false);
  assert.equal(
    validateSchoolPayload({ name: 'SMP Negeri 1', city: 'Padang', accreditation: 'A', principalNip: '123' }).ok,
    true
  );
  assert.equal(validateSchoolPayload({ accreditation: 'Z' }).ok, false);
  assert.equal(validateSchoolPayload({ name: 'x'.repeat(201) }).ok, false);
});

test('logo payload validation', () => {
  const tiny = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  assert.equal(validateLogoPayload({ imageData: tiny }).ok, true);
  assert.equal(validateLogoPayload({ imageData: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }).ok, false);
  assert.equal(validateLogoPayload({ imageData: 'https://contoh.id/logo.png' }).ok, false);
  assert.equal(validateLogoPayload({}).ok, false);
});

test('school config requires authentication', { timeout: 10000 }, async () => {
  const mine = await request('/api/admin/schools/mine');
  assert.equal(mine.response.status, 401);
});

test('admin reads and updates own school identity', { timeout: 10000 }, async () => {
  const adminCookie = await login('admin@guru.belajar.id');

  const mine = await request('/api/admin/schools/mine', {}, adminCookie);
  assert.equal(mine.response.ok, true, JSON.stringify(mine.body));
  assert.ok(mine.body.school?.id);

  const bad = await request('/api/admin/schools/' + mine.body.school.id, {
    method: 'PUT',
    body: JSON.stringify({ accreditation: 'Z' })
  }, adminCookie);
  assert.equal(bad.response.status, 400);

  const good = await request('/api/admin/schools/' + mine.body.school.id, {
    method: 'PUT',
    body: JSON.stringify({
      city: 'Padang',
      accreditation: 'A',
      principalName: 'Dra. Uji Coba, M.Pd.',
      principalNip: '19700101 200001 2 001'
    })
  }, adminCookie);
  assert.equal(good.response.ok, true, JSON.stringify(good.body));
  assert.equal(good.body.school.city, 'Padang');
  assert.equal(good.body.school.principalName, 'Dra. Uji Coba, M.Pd.');
});

test('guru cannot update school identity', { timeout: 10000 }, async () => {
  const adminCookie = await login('admin@guru.belajar.id');
  const mine = await request('/api/admin/schools/mine', {}, adminCookie);
  const schoolId = mine.body.school.id;

  const guruCookie = await login('siti.nurhaliza@guru.sd.belajar.id');
  const denied = await request(`/api/admin/schools/${schoolId}`, {
    method: 'PUT',
    body: JSON.stringify({ city: 'X' })
  }, guruCookie);
  assert.equal(denied.response.status, 403);
});

test('admin uploads school logo', { timeout: 10000 }, async () => {
  const adminCookie = await login('admin@guru.belajar.id');
  const mine = await request('/api/admin/schools/mine', {}, adminCookie);
  const schoolId = mine.body.school.id;

  const bad = await request(`/api/admin/schools/${schoolId}/logo`, {
    method: 'POST',
    body: JSON.stringify({ imageData: 'bukan-data-url' })
  }, adminCookie);
  assert.equal(bad.response.status, 400);

  const tiny = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const good = await request(`/api/admin/schools/${schoolId}/logo`, {
    method: 'POST',
    body: JSON.stringify({ imageData: tiny })
  }, adminCookie);
  assert.equal(good.response.ok, true, JSON.stringify(good.body));
  assert.match(good.body.school.logoUrl, /^\/uploads\/school-[A-Za-z0-9_-]+\.png$/);

  // Bersihkan artefak upload agar tidak mengotori data/uploads
  const uploaded = path.join(process.cwd(), 'data', 'uploads', path.basename(good.body.school.logoUrl));
  fs.rmSync(uploaded, { force: true });
});

test('super admin lists schools', { timeout: 10000 }, async () => {
  const superCookie = await login('amwaluddin.lubis@gmail.com');
  const list = await request('/api/admin/schools', {}, superCookie);
  assert.equal(list.response.ok, true, JSON.stringify(list.body));
  assert.ok(Array.isArray(list.body.schools) && list.body.schools.length > 0);
});
