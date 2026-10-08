import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveDistribusiSoal,
  totalSoalDiminta
} from '../src/server/prompts/soal_ujian.ts';
import { buildGeneratorPrompt } from '../src/server/prompts/index.ts';
import { validateGeneratorPayload } from '../src/server/validation.ts';

const PER_BENTUK = {
  jumlahPG: 15,
  jumlahMenjodohkan: 10,
  jumlahIsianSingkat: 5,
  jumlahUraian: 5
};

test('distribusi per bentuk: total dan rentang nomor berurutan', () => {
  const d = resolveDistribusiSoal(PER_BENTUK as any);
  assert.equal(d.mode, 'perBentuk');
  assert.equal(d.total, 35);
  assert.deepEqual(d.items.map(i => [i.label, i.count, i.start, i.end]), [
    ['Pilihan Ganda', 15, 1, 15],
    ['Menjodohkan', 10, 16, 25],
    ['Isian Singkat', 5, 26, 30],
    ['Uraian HOTS', 5, 31, 35]
  ]);
  assert.equal(totalSoalDiminta(PER_BENTUK as any), 35);
});

test('bentuk bernilai 0 tidak dipakai dan tidak memakan nomor', () => {
  const d = resolveDistribusiSoal({ jumlahPG: 5, jumlahPGKompleks: 0, jumlahUraian: 2 } as any);
  assert.equal(d.total, 7);
  assert.deepEqual(d.items.map(i => i.label), ['Pilihan Ganda', 'Uraian HOTS']);
  assert.deepEqual([d.items[1].start, d.items[1].end], [6, 7]);
});

test('tanpa kunci per bentuk: mode legacy tetap jalan', () => {
  const d = resolveDistribusiSoal({ jumlahSoal: 12, bentukSoal: ['Pilihan Ganda'] } as any);
  assert.equal(d.mode, 'legacy');
  assert.equal(d.total, 12);
  assert.equal(totalSoalDiminta({ jumlahSoal: 12 } as any), 12);
  assert.equal(totalSoalDiminta(undefined), 0);
});

test('prompt per bentuk memuat hitungan dan nomor tiap bentuk', () => {
  const prompt = buildGeneratorPrompt({
    docType: 'soal_ujian',
    jenjang: 'SMP',
    tingkat: 'Kelas 8',
    fase: 'Fase D',
    mataPelajaran: 'PJOK',
    topik: 'Sepak Bola',
    alokasiWaktu: '3 JP',
    modelPembelajaran: 'PBL',
    targetPeserta: 'Reguler',
    dimensiP5: [],
    authorName: 'Guru',
    schoolName: 'SMP Tes',
    soalConfig: { ...PER_BENTUK, jumlahOpsiPilihanGanda: 5 }
  } as any);
  assert.ok(prompt.includes('Pilihan Ganda: 15 butir (Nomor 1–15)'), 'rentang PG ada');
  assert.ok(prompt.includes('Uraian HOTS: 5 butir (Nomor 31–35)'), 'rentang uraian ada');
  assert.ok(prompt.includes('TOTAL: 35 butir'), 'total ada');
  assert.ok(prompt.includes('tepat 5 opsi'), 'opsi PG dipakai');
  assert.ok(!prompt.includes('dibagi seimbang'), 'tidak ada pembagian otomatis');
});

test('validasi per bentuk: sah, nol semua ditolak, >50 ditolak', () => {
  const base = { docType: 'soal_ujian', mataPelajaran: 'PJOK', topik: 'Sepak Bola' };
  assert.equal(validateGeneratorPayload({ ...base, soalConfig: { ...PER_BENTUK } }).ok, true);
  assert.equal(validateGeneratorPayload({
    ...base,
    soalConfig: { jumlahPG: 0, jumlahPGKompleks: 0, jumlahMenjodohkan: 0, jumlahIsianSingkat: 0, jumlahUraian: 0 }
  }).ok, false);
  assert.equal(validateGeneratorPayload({ ...base, soalConfig: { jumlahPG: 51 } }).ok, false);
  assert.equal(validateGeneratorPayload({ ...base, soalConfig: { jumlahPG: 2.5 } }).ok, false);
  // Kunci per bentuk diabaikan untuk non-soal (konsisten dengan legacy)
  assert.equal(validateGeneratorPayload({
    docType: 'modul_ajar', mataPelajaran: 'IPAS', topik: 'Air',
    soalConfig: { jumlahPG: 0 }
  }).ok, true);
});
