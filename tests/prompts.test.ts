import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildGeneratorPrompt,
  buildSectionPrompt,
  getPromptSpec,
  PROMPT_VERSION,
  validateBuiltPrompt
} from '../src/server/prompts/index.ts';
import type { PromptContext } from '../src/server/prompts/types.ts';

const BASE_CTX: PromptContext = {
  docType: 'modul_ajar',
  jenjang: 'SMP',
  tingkat: 'Kelas 8',
  fase: 'Fase D',
  mataPelajaran: 'Matematika',
  topik: 'Teorema Pythagoras',
  alokasiWaktu: '2 JP (2 x 40 Menit) - 1 Pertemuan',
  modelPembelajaran: 'Problem Based Learning (PBL)',
  targetPeserta: 'Reguler',
  dimensiP5: ['Bernalar Kritis'],
  authorName: 'Guru Tes',
  schoolName: 'SMP Tes'
};

const ALL_TYPES = [
  'modul_ajar',
  'rpp',
  'soal_ujian',
  'kktp_atp',
  'lkpd',
  'prota_promes',
  'modul_p5'
];

test('versi prompt tercatat dengan format tanggal', () => {
  assert.match(PROMPT_VERSION, /^\d{4}-\d{2}-\d{2}$/);
});

test('tipe tak dikenal jatuh ke modul_ajar', () => {
  assert.equal(getPromptSpec('tidak_ada').docType, 'modul_ajar');
});

for (const docType of ALL_TYPES) {
  test(`prompt ${docType}: lengkap, bersitasi, tanpa interpolasi tersisa`, () => {
    const ctx: PromptContext = {
      ...BASE_CTX,
      docType,
      soalConfig: { jumlahSoal: 12, bentukSoal: ['Pilihan Ganda'], komposisi: { mudah: 25, sedang: 50, sukar: 25 } },
      catatanTambahan: { temaP5: 'Kewirausahaan', lampiran: ['LKPD siap pakai'], fokusRpp: 'Asesmen' }
    };
    const prompt = buildGeneratorPrompt(ctx);

    assert.ok(prompt.length > 1500 && prompt.length < 20000, `panjang wajar (${prompt.length})`);
    assert.ok(!/\$\{[^}]+\}/.test(prompt), 'tidak ada ${...} tersisa');
    assert.ok(prompt.includes('<USER_DATA>'), 'blok USER_DATA ada');
    assert.ok(prompt.includes('PANDUAN PENULISAN'), 'panduan ada');
    assert.ok(prompt.includes('TANPA SAPAAN'), 'aturan anti-sapaan ada');
    assert.ok(prompt.includes('SECURITY BOUNDARY'), 'boundary ada');
    assert.ok(prompt.includes('Teorema Pythagoras'), 'topik guru masuk');
    assert.ok(prompt.includes('Matematika'), 'mapel guru masuk');
    assert.ok(prompt.includes('046/H/KR/2025'), 'sitasi CP 046 ada');

    assert.deepEqual(validateBuiltPrompt(prompt, ctx), [], `prompt ${docType} valid`);
  });
}

test('prompt mapel agama memuat ketentuan 020/2026', () => {
  const prompt = buildGeneratorPrompt({
    ...BASE_CTX,
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Asmaul Husna'
  });
  assert.ok(prompt.includes('020 Tahun 2026'), 'sitasi revisi agama ada');
  assert.ok(prompt.includes('PENGAMALAN'), 'penekanan pengamalan ada');
});

test('prompt soal memakai konfigurasi guru', () => {
  const prompt = buildGeneratorPrompt({
    ...BASE_CTX,
    docType: 'soal_ujian',
    soalConfig: { jumlahSoal: 12, bentukSoal: ['Pilihan Ganda', 'Uraian HOTS'], komposisi: { mudah: 25, sedang: 50, sukar: 25 } }
  });
  assert.ok(prompt.includes('12 butir'), 'jumlah soal dipakai');
  assert.ok(prompt.includes('Uraian HOTS'), 'bentuk soal dipakai');
  assert.ok(prompt.includes('25%'), 'komposisi dipakai');
});

test('validator prompt menangkap kerusakan', () => {
  const ctx = { ...BASE_CTX };
  assert.ok(validateBuiltPrompt('', ctx).length > 0, 'prompt kosong ditolak');
  assert.ok(validateBuiltPrompt('ada ${sisa} interpolasi ' + 'x'.repeat(600), ctx).length > 0);
});

test('prompt regenerasi bagian mempertahankan heading', () => {
  const prompt = buildSectionPrompt({
    docType: 'rpp',
    jenjang: 'SD',
    tingkat: 'Kelas 4',
    fase: 'Fase B',
    mataPelajaran: 'IPAS',
    topik: 'Siklus Air',
    sectionTitle: 'Tujuan Pembelajaran',
    content: '# RPP\n\n## Tujuan Pembelajaran\n\nIsi lama'
  });
  assert.ok(prompt.includes('"Tujuan Pembelajaran"'), 'judul bagian dikutip persis');
  assert.ok(prompt.includes('Baris pertama HARUS heading asli'), 'aturan heading ada');
  assert.ok(prompt.length < 8000, 'konteks dibatasi');
});
