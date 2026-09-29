import assert from 'node:assert/strict';
import test from 'node:test';
import { validateDocumentStructure } from '../src/server/validation.ts';
import { generateFallbackDocument } from '../serverFallback.ts';

const BASE = {
  jenjang: 'SMP',
  tingkat: 'Kelas 8',
  fase: 'Fase D',
  mataPelajaran: 'Matematika',
  topik: 'Teorema Pythagoras',
  authorName: 'Tes',
  schoolName: 'SMP Tes'
};

const TYPES = ['modul_ajar', 'rpp', 'soal_ujian', 'lkpd', 'kktp_atp', 'prota_promes', 'modul_p5'];

for (const docType of TYPES) {
  test(`template cadangan ${docType} lolos penanda struktur`, () => {
    const content = generateFallbackDocument({ docType, ...BASE });
    const quality = validateDocumentStructure(docType, content, { modelUsed: 'kurikulum-merdeka-verified-engine' });
    assert.equal(quality.status, 'fallback');
    assert.deepEqual(quality.issues, [], `Isu pada ${docType}: ${quality.issues.join(' | ')}`);
    assert.ok(quality.stats.tables > 0, `${docType} harus memuat tabel`);
  });
}

test('validator menandai dokumen pendek dan placeholder', () => {
  const short = validateDocumentStructure('modul_ajar', '# Hampir kosong', { modelUsed: 'gemini-3.8-flash' });
  assert.equal(short.status, 'needs_review');
  assert.ok(short.issues.length > 0);

  const withPlaceholder = validateDocumentStructure(
    'rpp',
    '# RPP\n\nTujuan Pembelajaran\n\nLangkah-langkah\n\nAsesmen dan penilaian\n\n' + 'x'.repeat(900) + '\n\n[isi bagian ini]',
    { modelUsed: 'gemini-3.8-flash' }
  );
  assert.equal(withPlaceholder.status, 'needs_review');
  assert.ok(withPlaceholder.issues.some(i => i.includes('placeholder')));
});

test('validator menghitung soal dan membandingkan permintaan', () => {
  const content = '# Soal\n\nKisi-kisi\n\n**Soal 1**\n\n**Soal 2**\n\nKunci jawaban dan pedoman penskoran\n\n' + 'x'.repeat(900);
  const kurang = validateDocumentStructure('soal_ujian', content, { expectedQuestions: 15, modelUsed: 'gemini-x' });
  assert.equal(kurang.stats.questions, 2);
  assert.equal(kurang.status, 'needs_review');
  assert.ok(kurang.issues.some(i => i.includes('15')));

  const cukup = validateDocumentStructure('soal_ujian', content, { expectedQuestions: 2, modelUsed: 'gemini-x' });
  assert.ok(!cukup.issues.some(i => i.includes('permintaan')));
});

test('dokumen AI lengkap berstatus AI', () => {
  const content = [
    '# Modul',
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
  const quality = validateDocumentStructure('modul_ajar', content, { modelUsed: 'gemini-3.8-flash' });
  assert.equal(quality.status, 'AI');
  assert.deepEqual(quality.issues, []);
});
