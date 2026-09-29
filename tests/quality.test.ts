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

  const varian = validateDocumentStructure(
    'soal_ujian',
    '# Soal\n\nKisi-kisi\n\nNomor 1\n\nButir 2\n\n**Nomor 3**\n\nKunci dan pedoman\n\n' + 'x'.repeat(900),
    { expectedQuestions: 3, modelUsed: 'gemini-x' }
  );
  assert.equal(varian.stats.questions, 3);
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

test('kualitas menandai konteks guru yang belum memadai', () => {
  const content = '# Modul\n## Informasi Umum\n## Capaian Pembelajaran dan Tujuan Pembelajaran\n## Kegiatan Pembelajaran Inti dan Penutup\n## Asesmen dan Rubrik KKTP\n## Lampiran\n' + 'x'.repeat(900);
  const quality = validateDocumentStructure('modul_ajar', content, {
    modelUsed: 'gemini-3.8-flash',
    classroomContext: { teacherStory: 'Singkat' }
  });
  assert.equal(quality.status, 'needs_review');
  assert.ok(quality.issues.some(issue => issue.includes('Cerita guru')));
});

test('konteks guru lengkap tidak menambah isu human-centered', () => {
  const content = '# Modul\n## Informasi Umum\n## Capaian Pembelajaran dan Tujuan Pembelajaran\n## Kegiatan Pembelajaran Inti dan Penutup\n## Asesmen dan Rubrik KKTP\n## Lampiran\n' + 'x'.repeat(900);
  const quality = validateDocumentStructure('modul_ajar', content, {
    modelUsed: 'gemini-3.8-flash',
    classroomContext: {
      teacherStory: 'Murid memakai pecahan saat berbagi bekal dan perlu alasan yang adil.',
      studentProfile: 'Kelas heterogen dan suka benda konkret.',
      learningNeeds: 'Sebagian perlu visual dan waktu berpikir.',
      teacherIntent: 'Murid berani menjelaskan strategi dengan empati.'
    }
  });
  assert.ok(!quality.issues.some(issue => issue.includes('Konteks manusiawi') || issue.includes('Cerita guru') || issue.includes('Profil/kebutuhan')));
});

test('fallback per-jenis mengikuti parameter guru', async () => {
  const { generateFallbackDocument } = await import('../serverFallback.ts');

  const base = {
    jenjang: 'SMP', tingkat: 'Kelas 8', fase: 'Fase D', mataPelajaran: 'Matematika',
    topik: 'Teorema Pythagoras', authorName: 'Tes', schoolName: 'SMP Tes'
  };

  const modul = generateFallbackDocument({ ...base, docType: 'modul_ajar', catatanTambahan: { lampiran: ['Glosarium'] } });
  assert.ok(modul.includes('GLOSARIUM'), 'glosarium terpilih ada');
  assert.ok(!modul.includes('LEMBAR KERJA PESERTA DIDIK (LKPD)'), 'LKPD tak terpilih absen');

  const modulAll = generateFallbackDocument({ ...base, docType: 'modul_ajar' });
  assert.ok(modulAll.includes('LEMBAR KERJA PESERTA DIDIK (LKPD)'), 'default memuat semua lampiran');

  const rpp = generateFallbackDocument({ ...base, docType: 'rpp', catatanTambahan: { fokusRpp: 'Asesmen' } });
  assert.ok(rpp.includes('Fokus penekanan dokumen ini: **Asesmen**'));

  const lkpd = generateFallbackDocument({ ...base, docType: 'lkpd', catatanTambahan: { jumlahAktivitas: 2, kunciLkpd: true } });
  assert.ok(lkpd.includes('AKTIVITAS 2 —'), 'aktivitas 2 ada');
  assert.ok(!lkpd.includes('AKTIVITAS 3 —'), 'aktivitas 3 absen');
  assert.ok(lkpd.includes('KUNCI JAWABAN GURU'), 'kunci guru ada');

  const lkpdDefault = generateFallbackDocument({ ...base, docType: 'lkpd' });
  assert.ok(lkpdDefault.includes('AKTIVITAS 3 —'), 'default 3 aktivitas');

  const kktp = generateFallbackDocument({ ...base, docType: 'kktp_atp', catatanTambahan: { pendekatanKktp: 'Rubrik Skala' } });
  assert.ok(kktp.includes('Pendekatan 2: Rubrik Skala Berkembang'));
  assert.ok(!kktp.includes('Pendekatan 3: Interval Nilai'), 'pendekatan lain absen');

  const prota = generateFallbackDocument({
    ...base, docType: 'prota_promes',
    catatanTambahan: { semesterProta: 'Ganjil', tahunAjaran: '2027/2028' }
  });
  assert.ok(prota.includes('2027/2028'), 'tahun ajaran dipakai');
  assert.ok(prota.includes('Semester Ganjil'), 'promes ganjil ada');
  assert.ok(!prota.includes('#### Semester Genap'), 'promes genap absen');
});
