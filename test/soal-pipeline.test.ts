/**
 * Unit test modul pipeline soal terstruktur Fase 1 (server/soalPipeline.ts).
 * Murni fungsi lokal — panggilAI di-mock, tanpa network.
 * Dijalankan via: npx tsx test/soal-pipeline.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import {
  hitungKomposisiSoal,
  jalankanPipelineSoalTerstruktur,
  SoalPipelineError,
  type PipelineInput,
} from '../server/soalPipeline.ts';
import type { IdentitasSoal, ButirSoal } from '../shared/soalTerstruktur.ts';

let passed = 0, failed = 0;
function check(nama: string, kond: boolean, extra = '') {
  if (kond) { passed++; console.log(`  PASS ${nama}`); }
  else { failed++; console.log(`  FAIL ${nama} ${extra}`); }
}

function identitas(): IdentitasSoal {
  return {
    satuanPendidikan: 'SMP Negeri 3 Sinunukan',
    mataPelajaran: 'Informatika',
    kelas: 'Kelas 8',
    fase: 'Fase D',
    topik: 'Algoritma',
    waktu: '90 Menit',
    guru: 'Amwaluddin Lubis',
  };
}

function butirPG(over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor: 1,
    bentuk: 'pg_biasa',
    pertanyaan: 'Apa ibu kota Indonesia?',
    opsi: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'],
    kunci: 'A',
    pembahasan: 'Jakarta adalah ibu kota negara.',
    levelKognitif: 'C1',
    indikator: 'Menyebutkan ibu kota negara Indonesia.',
    ...over,
  } as ButirSoal;
}

function inputPipeline(over: Partial<PipelineInput> = {}): PipelineInput {
  return {
    komposisiBentuk: { pg_biasa: 1, pg_kompleks: 0, menjodohkan: 0, isian: 0, uraian: 0 },
    komposisiKognitif: { C1: 1, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 },
    mataPelajaran: 'Informatika',
    tingkat: 'Kelas 8',
    calculatedFase: 'Fase D',
    topik: 'Algoritma',
    jumlahSoalFinal: 1,
    modelUsed: 'model-uji',
    generatedText: JSON.stringify({ items: [butirPG()] }),
    identitas: identitas(),
    panggilAI: async () => ({ text: '', modelUsed: 'model-uji' }),
    ...over,
  };
}

console.log('1. hitungKomposisiSoal');
{
  const h = hitungKomposisiSoal(undefined, null, 0, 15);
  check('default bentuk = 5/3/2/2/3', h.komposisiBentuk.pg_biasa === 5 && h.komposisiBentuk.uraian === 3);
  const totalKog = Object.values(h.komposisiKognitif).reduce((a, b) => a + b, 0);
  check('default kognitif preset LENGKAP sejumlah total', totalKog === 15, `dapat ${totalKog}`);
  check('teksKomposisiJson memuat label bentuk', h.teksKomposisiJson.includes('pg_biasa'));

  const h2 = hitungKomposisiSoal(
    { komposisi: { pg_biasa: 4, uraian: 1 }, komposisiKognitif: { C1: 2, C2: 2, C3: 1, C4: 0, C5: 0, C6: 0 } },
    { pg_biasa: 4, uraian: 1 }, 5, 5,
  );
  check('komposisi bentuk kustom dipakai', h2.komposisiBentuk.pg_biasa === 4 && h2.komposisiBentuk.uraian === 1);
  check('komposisi kognitif kustom dipakai', h2.komposisiKognitif.C1 === 2 && h2.komposisiKognitif.C3 === 1);

  let err400: unknown = null;
  try {
    hitungKomposisiSoal(
      { komposisiKognitif: { C1: 2, C2: 2, C3: 0, C4: 0, C5: 0, C6: 0 } },
      null, 0, 10,
    );
  } catch (e) { err400 = e; }
  check('kognitif ≠ total butir → error 400', err400 instanceof SoalPipelineError && err400.status === 400);
}

console.log('2. jalankanPipelineSoalTerstruktur');
{
  const ok = await jalankanPipelineSoalTerstruktur(inputPipeline());
  check('paket valid → teks terbungkus penanda v1', ok.generatedText.includes('RGM-SOAL-V1'));
  check('modelUsed dipertahankan', ok.modelUsed === 'model-uji');

  let err500: unknown = null;
  try {
    await jalankanPipelineSoalTerstruktur(inputPipeline({ generatedText: 'maaf, saya tidak bisa membuat soal' }));
  } catch (e) { err500 = e; }
  check('JSON invalid → error 500 eksplisit', err500 instanceof SoalPipelineError && err500.status === 500);

  let errKurang: unknown = null;
  try {
    await jalankanPipelineSoalTerstruktur(inputPipeline({
      komposisiBentuk: { pg_biasa: 2, pg_kompleks: 0, menjodohkan: 0, isian: 0, uraian: 0 },
      komposisiKognitif: { C1: 2, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 },
      jumlahSoalFinal: 2,
      panggilAI: async () => ({ text: '{"items":[]}', modelUsed: 'model-uji' }),
    }));
  } catch (e) { errKurang = e; }
  check(
    'butir kurang & retry gagal → 500 tanpa fabrikasi',
    errKurang instanceof SoalPipelineError && errKurang.status === 500 &&
      String((errKurang as SoalPipelineError).body && (errKurang as { body: { message: string } }).body.message).includes('1 dari 2'),
  );
}

console.log(`\nHasil: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
