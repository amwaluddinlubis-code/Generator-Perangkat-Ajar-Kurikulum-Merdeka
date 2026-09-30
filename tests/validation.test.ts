import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateDocumentPayload,
  validateGeneratedDocument,
  validateGeneratorPayload,
  validateImagePayload,
  validateLoginPayload,
  validateUserPatch
} from '../src/server/validation.ts';

test('login validation rejects malformed and oversized input', () => {
  assert.equal(validateLoginPayload({ email: 'not-an-email' }).ok, false);
  assert.equal(validateLoginPayload({ email: 'guru@guru.smp.belajar.id' }).ok, true);
  assert.equal(validateLoginPayload({ email: 'guru@guru.smp.belajar.id', name: 'x'.repeat(161) }).ok, false);
});

test('user validation allowlists role and jenjang', () => {
  assert.equal(validateUserPatch({ role: 'SUPER_ADMIN' }).ok, false);
  assert.equal(validateUserPatch({ role: 'ADMIN', jenjang: 'SMP' }).ok, true);
  assert.equal(validateUserPatch({ jenjang: 'UNSUPPORTED' }).ok, false);
});

test('document validation rejects unknown document types and invalid durations', () => {
  const valid = {
    title: 'Modul Ajar Bahasa Indonesia',
    docType: 'modul_ajar',
    content: '# Tujuan Pembelajaran',
    durationMinutes: 90
  };
  assert.equal(validateDocumentPayload(valid).ok, true);
  assert.equal(validateDocumentPayload({ ...valid, docType: 'unknown' }).ok, false);
  assert.equal(validateDocumentPayload({ ...valid, durationMinutes: 5000 }).ok, false);
});

test('generator validation rejects oversized and malformed structured input', () => {
  assert.equal(validateGeneratorPayload({
    docType: 'modul_ajar',
    mataPelajaran: 'Bahasa Indonesia',
    topik: 'Teks Eksplanasi',
    dimensiP5: ['Bernalar Kritis']
  }).ok, true);

  assert.equal(validateGeneratorPayload({
    docType: 'modul_ajar',
    mataPelajaran: 'Bahasa Indonesia',
    topik: 'Teks Eksplanasi',
    soalConfig: { jumlahSoal: 201 }
  }).ok, true);

  assert.equal(validateGeneratorPayload({
    docType: 'soal_ujian',
    mataPelajaran: 'Bahasa Indonesia',
    topik: 'Teks Eksplanasi',
    soalConfig: { jumlahSoal: 201 }
  }).ok, false);

  assert.equal(validateGeneratorPayload({
    docType: 'modul_ajar',
    mataPelajaran: 'Bahasa Indonesia',
    topik: 'x'.repeat(501)
  }).ok, false);
});

test('generator validation menerima beberapa bentuk dan membatasi opsi pilihan ganda', () => {
  const base = { docType: 'soal_ujian', mataPelajaran: 'Matematika', topik: 'Pecahan' };
  assert.equal(validateGeneratorPayload({ ...base, soalConfig: { jumlahSoal: 10, bentukSoal: ['Pilihan Ganda', 'Uraian HOTS'], jumlahOpsiPilihanGanda: 6 } }).ok, true);
  assert.equal(validateGeneratorPayload({ ...base, soalConfig: { jumlahSoal: 10, bentukSoal: ['Pilihan Ganda'], jumlahOpsiPilihanGanda: 7 } }).ok, false);
});

test('image validation allowlists supported aspect ratios', () => {
  assert.equal(validateImagePayload({ prompt: 'Ilustrasi kelas', aspectRatio: '16:9' }).ok, true);
  assert.equal(validateImagePayload({ prompt: 'Ilustrasi kelas', aspectRatio: '2:1' }).ok, false);
});

test('soal custom: komposisi harus total 100% dan bentuk valid', () => {
  const base = {
    docType: 'soal_ujian',
    mataPelajaran: 'Matematika',
    topik: 'Pecahan',
    soalConfig: {
      jumlahSoal: 30,
      bentukSoal: ['Pilihan Ganda', 'Uraian HOTS'],
      komposisi: { mudah: 30, sedang: 40, sukar: 30 }
    }
  };
  assert.equal(validateGeneratorPayload(base).ok, true);

  assert.equal(validateGeneratorPayload({
    ...base,
    soalConfig: { ...base.soalConfig, komposisi: { mudah: 30, sedang: 30, sukar: 30 } }
  }).ok, false);

  assert.equal(validateGeneratorPayload({
    ...base,
    soalConfig: { ...base.soalConfig, komposisi: { mudah: -5, sedang: 50, sukar: 55 } }
  }).ok, false);

  assert.equal(validateGeneratorPayload({
    ...base,
    soalConfig: { ...base.soalConfig, jumlahSoal: 0 }
  }).ok, false);
});

test('soalConfig asing diabaikan untuk non-soal (regresi)', () => {
  assert.equal(validateGeneratorPayload({
    docType: 'modul_ajar',
    mataPelajaran: 'IPAS',
    topik: 'Siklus Air',
    soalConfig: { jumlahSoal: 0, bentukSoal: [], komposisi: { mudah: 0, sedang: 0, sukar: 0 } }
  }).ok, true);

  assert.equal(validateGeneratorPayload({
    docType: 'prota_promes',
    mataPelajaran: 'Matematika',
    topik: 'Pecahan',
    soalConfig: { jumlahSoal: 0 }
  }).ok, true);
});

test('catatan tambahan per-jenis divalidasi batasnya', () => {
  const base = { docType: 'lkpd', mataPelajaran: 'IPAS', topik: 'Siklus Air' };
  assert.equal(validateGeneratorPayload({
    ...base,
    catatanTambahan: { jumlahAktivitas: 3, kunciLkpd: true, pendekatanKktp: 'Rubrik Skala' }
  }).ok, true);

  assert.equal(validateGeneratorPayload({
    ...base,
    catatanTambahan: { jumlahAktivitas: 99 }
  }).ok, false);

  assert.equal(validateGeneratorPayload({
    ...base,
    catatanTambahan: { lampiran: ['A', 1] }
  }).ok, false);
});

test('generated document validation rejects credential-like output', () => {
  assert.equal(validateGeneratedDocument('Judul', '# Aman\nIsi dokumen').ok, true);
  assert.equal(validateGeneratedDocument('Judul', 'AIzaSyExampleKeyThatShouldNeverPass123456789').ok, false);
  assert.equal(validateGeneratedDocument('Judul', '-----BEGIN PRIVATE KEY-----').ok, false);
});
