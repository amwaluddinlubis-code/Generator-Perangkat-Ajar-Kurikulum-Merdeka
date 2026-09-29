import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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


test('fallback mapel agama menomori daftar pustaka secara berurutan', () => {
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

  const bkpdmIndex = content.indexOf('2. Badan Kebijakan Pendidikan Dasar dan Menengah');
  const ppaIndex = content.indexOf('3. Pusat Kurikulum dan Pembelajaran');
  assert.ok(bkpdmIndex >= 0);
  assert.ok(ppaIndex > bkpdmIndex);
  assert.equal(content.includes('\n2. Pusat Kurikulum dan Pembelajaran'), false);
});

test('fallback mapel non-agama tetap memakai dua nomor daftar pustaka', () => {
  const content = generateFallbackDocument({
    docType: 'modul_ajar',
    jenjang: 'SD',
    tingkat: 'Kelas 4',
    fase: 'Fase B',
    mataPelajaran: 'Matematika',
    topik: 'Pecahan',
    authorName: 'Tes',
    schoolName: 'SD Tes'
  });

  assert.ok(content.includes('1. Badan Standar, Kurikulum, dan Asesmen Pendidikan'));
  assert.ok(content.includes('2. Pusat Kurikulum dan Pembelajaran'));
  assert.equal(content.includes('3. Pusat Kurikulum dan Pembelajaran'), false);
});

test('output fallback standar memakai terminologi Profil Lulusan', () => {
  const common = {
    jenjang: 'SD',
    tingkat: 'Kelas 4',
    fase: 'Fase B',
    mataPelajaran: 'Matematika',
    topik: 'Pecahan',
    authorName: 'Tes',
    schoolName: 'SD Tes'
  };

  for (const docType of ['modul_ajar', 'rpp', 'kktp_atp', 'default']) {
    const content = generateFallbackDocument({ ...common, docType });
    assert.ok(content.includes('Profil Lulusan'), `missing Profil Lulusan for ${docType}`);
    assert.equal(
      content.includes('Profil Pelajar Pancasila'),
      false,
      `legacy terminology remains in fallback ${docType}`
    );
  }
});

test('prompt generator memakai terminologi Profil Lulusan', () => {
  const serverSource = readFileSync(new URL('../server.ts', import.meta.url), 'utf8');
  const refsSource = readFileSync(new URL('../src/server/curriculumRefs.ts', import.meta.url), 'utf8');

  assert.ok(serverSource.includes('Profil Lulusan'));
  assert.equal(serverSource.includes('Profil Pelajar Pancasila (fokuskan pada dimensi:'), false);
  assert.equal(serverSource.includes('Dimensi Profil Pelajar Pancasila:'), false);
  assert.ok(refsSource.includes('Profil Lulusan'));
  assert.equal(
    refsSource.includes('Selaraskan dengan Profil Pelajar Pancasila dimensi'),
    false
  );
});
