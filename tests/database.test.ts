import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  backupDatabase,
  createDocument,
  createUser,
  deleteDocument,
  deleteUser,
  getDocumentById,
  getUserById,
  getUserByEmail,
  getUserPasswordHash,
  setUserPasswordHash,
  updateUser
} from '../src/server/database.ts';
import { hashPassword, verifyPassword } from '../src/server/security.ts';

function userFixture(suffix: string) {
  return {
    id: `db-test-${suffix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'Database Test User',
    email: `db-test-${suffix}-${Date.now()}@guru.smp.belajar.id`,
    schoolName: `Database Test School ${suffix}`,
    schoolId: '',
    jenjang: 'SMP' as const,
    mataPelajaran: 'Bahasa Indonesia',
    role: 'GURU' as const,
    status: 'VERIFIED' as const,
    registeredAt: new Date().toISOString()
  };
}

test('SQLite persists users, tenant identity and soft deletion safely', () => {
  const created = createUser(userFixture('A'));
  assert.ok(created.schoolId);
  assert.equal(getUserById(created.id)?.schoolId, created.schoolId);
  assert.equal(getUserByEmail(created.email)?.id, created.id);

  const updated = updateUser({ ...created, name: 'Updated Database Test User' });
  assert.equal(updated.name, 'Updated Database Test User');
  assert.equal(updated.schoolId, created.schoolId);

  deleteUser(created.id);
  assert.equal(getUserById(created.id), null);
});

test('SQLite document persistence keeps author and tenant references', () => {
  const user = createUser(userFixture('B'));
  const document = createDocument({
    id: `db-doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: 'Dokumen Database Test',
    docType: 'modul_ajar',
    jenjang: user.jenjang,
    tingkat: 'Kelas 8',
    fase: 'Fase D',
    mataPelajaran: user.mataPelajaran,
    topik: 'Pengujian',
    content: '# Pengujian\nKonten aman.',
    createdAt: new Date().toISOString(),
    authorId: user.id,
    authorName: user.name,
    schoolName: user.schoolName,
    schoolId: user.schoolId,
    isPublic: false
  });

  assert.equal(getDocumentById(document.id)?.schoolId, user.schoolId);
  assert.equal(getDocumentById(document.id)?.authorId, user.id);

  deleteDocument(document.id);
  assert.equal(getDocumentById(document.id), null);
});

test('SQLite backup creates a restorable artifact', async () => {
  const destination = path.join(os.tmpdir(), `rgm-test-backup-${Date.now()}.sqlite`);
  const result = await backupDatabase(destination);
  assert.equal(result, destination);
  assert.equal(fs.existsSync(destination), true);
  assert.ok(fs.statSync(destination).size > 0);
  fs.rmSync(destination, { force: true });
});

test('update profil tidak menghapus hash kata sandi (regresi)', () => {
  const created = createUser(userFixture('PW'));
  setUserPasswordHash(created.id, hashPassword('Kata-Sandi-Awal-123'));
  assert.ok(getUserPasswordHash(created.id));

  const updated = updateUser({ ...created, name: 'Nama Baru', schoolName: 'Sekolah Baru' });
  assert.equal(updated.name, 'Nama Baru');
  const kept = getUserPasswordHash(created.id);
  assert.ok(kept, 'hash harus tetap ada setelah update profil');
  assert.equal(verifyPassword('Kata-Sandi-Awal-123', kept!), true);

  deleteUser(created.id);
  assert.equal(getUserById(created.id), null);
});
