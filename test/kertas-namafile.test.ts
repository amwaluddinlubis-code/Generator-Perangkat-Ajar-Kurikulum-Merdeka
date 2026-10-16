/**
 * Unit test F2-4 + F2-5 (Fase 2): penamaan file & ukuran kertas cetak.
 * Murni fungsi lokal — tanpa AI / network / DOM.
 * Dijalankan via: npx tsx test/kertas-namafile.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import {
  cssAturanKertas,
  bacaUkuranKertas,
  simpanUkuranKertas,
  UKURAN_KERTAS_KEY,
} from '../src/utils/kertasCetak.ts';
import {
  sanitasiNamaFile,
  namaFileCerdas,
} from '../shared/kopPengesahan.ts';

let passed = 0, failed = 0;
function check(nama: string, kond: boolean, extra = '') {
  if (kond) { passed++; console.log(`  PASS ${nama}`); }
  else { failed++; console.log(`  FAIL ${nama} ${extra}`); }
}

// ---------- F2-5: ukuran kertas ----------
{
  const a4 = cssAturanKertas('A4');
  check('A4: memuat "size: A4"', a4.includes('size: A4'), a4);
  check('A4: tetap punya margin 20mm 18mm', a4.includes('margin: 20mm 18mm'), a4);

  const f4 = cssAturanKertas('F4');
  check('F4: memuat "215mm 330mm"', f4.includes('215mm 330mm'), f4);
  check('F4: tetap punya margin 20mm 18mm', f4.includes('margin: 20mm 18mm'), f4);
  check('F4: tidak memuat size: A4', !f4.includes('size: A4'), f4);
}

// bacaUkuranKertas aman dipanggil di node (tanpa localStorage) → default 'A4'.
check('bacaUkuranKertas default "A4" di node', bacaUkuranKertas() === 'A4');

// simpanUkuranKertas tidak boleh throw di node.
let simpanAman = true;
try {
  simpanUkuranKertas('F4');
  check('simpanUkuranKertas tidak throw di node', true);
} catch {
  simpanAman = false;
  check('simpanUkuranKertas tidak throw di node', false);
}

// Simulasi localStorage sederhana untuk memastikan round-trip baca/simpan.
{
  const store: Record<string, string> = {};
  const fake = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
  };
  (globalThis as any).localStorage = fake;
  try {
    check('round-trip: simpan F4 lalu baca = F4', (simpanUkuranKertas('F4'), bacaUkuranKertas() === 'F4'));
    check('round-trip: simpan A4 lalu baca = A4', (simpanUkuranKertas('A4'), bacaUkuranKertas() === 'A4'));
    store[UKURAN_KERTAS_KEY] = 'ngaco';
    check('nilai invalid di localStorage → default A4', bacaUkuranKertas() === 'A4');
  } finally {
    delete (globalThis as any).localStorage;
  }
}
void simpanAman;

// ---------- F2-4: penamaan file cerdas ----------
check('sanitasi: karakter ilegal diganti "-"', sanitasiNamaFile('Soal: Ujian/Tengah*Semester?') === 'Soal- Ujian-Tengah-Semester-');
check('sanitasi: spasi ganda dirapatkan', sanitasiNamaFile('a   b') === 'a b');
check('sanitasi: nama kosong → kosong', sanitasiNamaFile('   ') === '');
check('namaFileCerdas: modul_ajar + judul', namaFileCerdas('Bilangan Bulat', 'modul_ajar') === 'Modul_Ajar_Bilangan_Bulat');
check('namaFileCerdas: soal_ujian label Paket_Soal', namaFileCerdas('PTS Ganjil', 'soal_ujian') === 'Paket_Soal_PTS_Ganjil');
check('namaFileCerdas: judul kosong → fallback _RGM', namaFileCerdas('', 'lkpd') === 'LKPD_RGM');
check('namaFileCerdas: maks 80 karakter', namaFileCerdas('x'.repeat(200), 'modul_ajar').length <= 80);
check('namaFileCerdas: tak pernah string kosong', namaFileCerdas('', 'modul_ajar') !== '');

// ---------- Ringkasan ----------
console.log(`\n${passed} lulus, ${failed} gagal`);
if (failed > 0) process.exit(1);
