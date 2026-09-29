import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agamaCpGuidance,
  cpReference,
  cpShortReference,
  isAgamaMapel
} from '../src/server/curriculumRefs.ts';
import { validateDocumentStructure } from '../src/server/validation.ts';
import { generateFallbackDocument } from '../serverFallback.ts';

test('deteksi mapel agama & budi pekerti', () => {
  assert.equal(isAgamaMapel('Pendidikan Agama Islam dan Budi Pekerti'), true);
  assert.equal(isAgamaMapel('Pendidikan Agama Kristen dan Budi Pekerti'), true);
  assert.equal(isAgamaMapel('Matematika'), false);
  assert.equal(isAgamaMapel('IPAS (Ilmu Pengetahuan Alam & Sosial)'), false);
  assert.equal(isAgamaMapel(undefined), false);
});

test('sitasi CP benar per mapel', () => {
  assert.equal(cpReference('Matematika'), 'Keputusan Kepala BSKAP No. 046/H/KR/2025');
  assert.ok(cpReference('Pendidikan Agama Islam dan Budi Pekerti').includes('020 Tahun 2026'));
  assert.ok(cpReference('Fisika').includes('046/H/KR/2025'));
  assert.ok(!cpReference('Fisika').includes('032'));
  assert.equal(cpShortReference('Biologi'), 'BSKAP 046/H/KR/2025');
});

test('panduan agama memuat tiga ranah dan pengamalan', () => {
  const guidance = agamaCpGuidance('Pendidikan Agama Islam dan Budi Pekerti', 'Fase B');
  assert.ok(guidance.includes('PENGAMALAN'));
  assert.ok(guidance.includes('sikap'));
  assert.ok(guidance.includes('020 Tahun 2026'));
});

test('dokumen agama tanpa pengamalan ditandai needs_review', () => {
  const content = [
    '# Modul PAI',
    '## Informasi Umum',
    '## Capaian Pembelajaran dan Tujuan Pembelajaran',
    '## Kegiatan Pembelajaran Inti dan Penutup',
    '## Asesmen dan Rubrik KKTP',
    '## Lampiran LKPD dan Glosarium',
    '| A | B |',
    '|---|---|',
    '| 1 | 2 |',
    'x'.repeat(900)
  ].join('\n');
  const quality = validateDocumentStructure('modul_ajar', content, {
    modelUsed: 'gemini-3.8-flash',
    mapel: 'Pendidikan Agama Islam dan Budi Pekerti'
  });
  assert.equal(quality.status, 'needs_review');
  assert.ok(quality.issues.some(i => i.includes('020 Tahun 2026')));
});

test('template cadangan mapel agama memuat dimensi pengamalan', () => {
  const content = generateFallbackDocument({
    docType: 'modul_ajar',
    jenjang: 'SD',
    tingkat: 'Kelas 4',
    fase: 'Fase B',
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Asmaul Husna',
    authorName: 'Tes',
    schoolName: 'SD Tes'
  });
  assert.ok(content.includes('BKPDM 020 Tahun 2026'));
  const quality = validateDocumentStructure('modul_ajar', content, {
    modelUsed: 'fallback-engine',
    mapel: 'Pendidikan Agama Islam dan Budi Pekerti'
  });
  assert.equal(quality.status, 'fallback');
  assert.deepEqual(quality.issues, []);
});
