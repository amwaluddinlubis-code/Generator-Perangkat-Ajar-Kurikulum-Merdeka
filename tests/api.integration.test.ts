import assert from 'node:assert/strict';
import test from 'node:test';
import { app } from '../server.ts';

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

test('API rejects protected document access without a session', { timeout: 10000 }, async () => {
  const result = await request('/api/documents');
  assert.equal(result.response.status, 401);
  assert.equal(result.body?.error?.code, 'AUTH_REQUIRED');
});

test('school admin cannot see or modify users from another school', { timeout: 10000 }, async () => {
  const adminCookie = await login('admin@guru.belajar.id');

  const list = await request('/api/users', {}, adminCookie);
  assert.equal(list.response.ok, true);
  assert.ok(list.body.users.every((user: any) => user.schoolId === list.body.users[0].schoolId));

  const verify = await request('/api/users/verify', {
    method: 'POST',
    body: JSON.stringify({ userId: 'user-guru-1', status: 'VERIFIED' })
  }, adminCookie);
  assert.equal(verify.response.status, 403);

  const update = await request('/api/users/user-guru-1', {
    method: 'PUT',
    body: JSON.stringify({ name: 'Attempted Cross Tenant Update' })
  }, adminCookie);
  assert.equal(update.response.status, 403);
});

test('Super Admin can inspect users across tenants', { timeout: 10000 }, async () => {
  const cookie = await login('amwaluddin.lubis@gmail.com');
  const result = await request('/api/users', {}, cookie);
  assert.equal(result.response.ok, true);
  assert.ok(result.body.users.some((user: any) => user.id === 'user-guru-1'));
  assert.ok(result.body.users.some((user: any) => user.id === 'user-guru-2'));
});

test('teacher document creation derives author and tenant from the session', { timeout: 10000 }, async () => {
  const cookie = await login('siti.nurhaliza@guru.sd.belajar.id');

  const result = await request('/api/documents', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Integration Security Test',
      docType: 'modul_ajar',
      jenjang: 'SMA',
      tingkat: 'Kelas 12',
      fase: 'Fase F',
      mataPelajaran: 'Bahasa Indonesia',
      topik: 'Pengujian tenant',
      content: '# Dokumen Aman',
      authorId: 'user-admin-1',
      authorName: 'Attacker',
      schoolName: 'Sekolah Lain',
      schoolId: 'school-attacker',
      isPublic: true
    })
  }, cookie);

  assert.equal(result.response.ok, true, JSON.stringify(result.body));
  assert.equal(result.body.document.authorId, 'user-guru-1');
  assert.equal(result.body.document.authorName, 'Siti Nurhaliza, S.Pd.SD');
  assert.notEqual(result.body.document.schoolId, 'school-attacker');
  assert.equal(result.body.document.isPublic, false);

  const docs = await request('/api/documents', {}, cookie);
  assert.equal(docs.response.ok, true);
  assert.ok(docs.body.documents.some((doc: any) => doc.id === result.body.document.id));
});

test('another school admin cannot delete a teacher document', { timeout: 10000 }, async () => {
  const teacherCookie = await login('siti.nurhaliza@guru.sd.belajar.id');
  const created = await request('/api/documents', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Cross Tenant Delete Test',
      docType: 'rpp',
      jenjang: 'SD',
      tingkat: 'Kelas 4',
      fase: 'Fase B',
      mataPelajaran: 'IPAS',
      topik: 'Pengujian akses',
      content: '# RPP'
    })
  }, teacherCookie);
  assert.equal(created.response.ok, true);

  const adminCookie = await login('admin@guru.belajar.id');
  const deleted = await request('/api/documents/' + created.body.document.id, { method: 'DELETE' }, adminCookie);
  assert.equal(deleted.response.status, 403);
});
