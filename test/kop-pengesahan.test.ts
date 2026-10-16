/**
 * Unit test kontrak kop & pengesahan F2-1 (shared/kopPengesahan.ts).
 * Murni fungsi lokal — tanpa AI / network / DOM.
 * Dijalankan via: npx tsx test/kop-pengesahan.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import {
  KOP_FIELD_WAJIB,
  LOGO_MAX_BYTES,
  barisIdentitas,
  kopDefaultDariUser,
  kopLengkap,
  namaFileCerdas,
  sanitasiNamaFile,
  validasiKop,
  type KopPengesahan,
} from '../shared/kopPengesahan.ts';
import type { DocType } from '../src/types/index.ts';

let passed = 0, failed = 0;
function check(nama: string, kond: boolean, extra = '') {
  if (kond) { passed++; console.log(`  PASS ${nama}`); }
  else { failed++; console.log(`  FAIL ${nama} ${extra}`); }
}

// ---------- Fixture ----------
function kopValid(over: Partial<KopPengesahan> = {}): KopPengesahan {
  return {
    namaSekolah: 'SMP Negeri 3 Sinunukan',
    alamatSekolah: 'Jl. Pendidikan No. 12, Sinunukan',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    namaGuru: 'Amwaluddin Lubis, S.Pd.',
    nipGuru: '19890412 201402 2 003',
    namaKepsek: 'H. Ahmad Siregar, M.Pd.',
    nipKepsek: '19710318 199702 1 002',
    kotaTanggal: 'Sinunukan, 17 Oktober 2026',
    ...over,
  };
}

// ---------- sanitasiNamaFile ----------
{
  check('karakter ilegal Windows diganti -', sanitasiNamaFile('Soal <Ujian>: 1/2') === 'Soal -Ujian-- 1-2');
  check('semua ilegal: \\ / : * ? " < > |', sanitasiNamaFile('a\\b/c:d*e?f"g<h>i|j') === 'a-b-c-d-e-f-g-h-i-j');
  check('spasi ganda diringkas', sanitasiNamaFile('Modul   Ajar') === 'Modul Ajar');
  check('titik & spasi di ujung dibuang', sanitasiNamaFile('Laporan...  ') === 'Laporan');
  check('string kosong tetap kosong', sanitasiNamaFile('   ') === '');
  check('nama normal tidak berubah', sanitasiNamaFile('Modul Ajar Informatika') === 'Modul Ajar Informatika');
}

// ---------- namaFileCerdas ----------
{
  check('prefix Modul_Ajar + underscore', namaFileCerdas('Informatika Kelas 7', 'modul_ajar') === 'Modul_Ajar_Informatika_Kelas_7');
  const prefixPerTipe: Array<[DocType, string]> = [
    ['rpp', 'RPP_'],
    ['soal_ujian', 'Paket_Soal_'],
    ['kktp_atp', 'ATP_KKTP_'],
    ['lkpd', 'LKPD_'],
    ['prota_promes', 'Prota_Promes_'],
    ['modul_p5', 'Modul_P5_'],
  ];
  for (const [tipe, awalan] of prefixPerTipe) {
    check(`prefix ${tipe} = ${awalan}`, namaFileCerdas('Tes', tipe).startsWith(awalan));
  }
  const panjang = namaFileCerdas('x'.repeat(200), 'soal_ujian');
  check('maks 80 karakter', panjang.length <= 80, `dapat ${panjang.length}`);
  check('judul kosong tidak pernah kosong', namaFileCerdas('   ', 'modul_ajar') === 'Modul_Ajar_RGM');
  check('judul penuh ilegal tetap valid', namaFileCerdas('///', 'rpp') === 'RPP_---');
}

// ---------- validasiKop ----------
{
  const kosong = validasiKop({});
  check('kop kosong: 5 field wajib dilaporkan', kosong.length === 5 && KOP_FIELD_WAJIB.every((f) => kosong.includes(f)), JSON.stringify(kosong));
  check('kop valid: tidak ada yang kosong', validasiKop(kopValid()).length === 0);
  const sebagian = validasiKop({ namaSekolah: 'SMPN 3', namaGuru: '  ' });
  check('namaGuru spasi saja dianggap kosong', sebagian.includes('namaGuru') && !sebagian.includes('namaSekolah'), JSON.stringify(sebagian));
}

// ---------- kopLengkap ----------
{
  check('null → false', kopLengkap(null) === false);
  check('undefined → false', kopLengkap(undefined) === false);
  check('sebagian → false', kopLengkap({ namaSekolah: 'SMPN 3' }) === false);
  check('lengkap → true', kopLengkap(kopValid()) === true);
}

// ---------- barisIdentitas ----------
{
  check('nilai asli dikembalikan', barisIdentitas('Amwaluddin Lubis') === 'Amwaluddin Lubis');
  check('undefined → garis kosong', barisIdentitas(undefined) === '....................');
  check('string kosong → garis kosong', barisIdentitas('') === '....................');
  check('spasi saja → garis kosong', barisIdentitas('   ') === '....................');
  check('parameter kosong kustom dipakai', barisIdentitas(undefined, '___') === '___');
  check('nilai ter-trim', barisIdentitas('  Drs. X  ') === 'Drs. X');
}

// ---------- kopDefaultDariUser ----------
{
  const d = new Date();
  const th = d.getFullYear();
  const bl = d.getMonth(); // 0-based
  const expTahun = bl >= 6 ? `${th}/${th + 1}` : `${th - 1}/${th}`;

  const def = kopDefaultDariUser({ schoolName: 'SMPN 3 Sinunukan', name: 'Amwaluddin', nip: '19890412 201402 2 003' });
  check('namaSekolah dari user.schoolName', def.namaSekolah === 'SMPN 3 Sinunukan');
  check('namaGuru dari user.name', def.namaGuru === 'Amwaluddin');
  check('nipGuru dari user.nip', def.nipGuru === '19890412 201402 2 003');
  check('tahunAjaran sesuai bulan berjalan', def.tahunAjaran === expTahun, `dapat ${def.tahunAjaran}, harap ${expTahun}`);

  const defKosong = kopDefaultDariUser({});
  check('user kosong: field teks kosong (bukan dummy)', defKosong.namaSekolah === '' && defKosong.namaGuru === '' && defKosong.nipGuru === '');
  check('user kosong: tahun ajaran tetap terisi', defKosong.tahunAjaran === expTahun);
}

// ---------- konstanta ----------
{
  check('LOGO_MAX_BYTES = 500KB', LOGO_MAX_BYTES === 500 * 1024);
  check('5 field wajib', KOP_FIELD_WAJIB.length === 5);
}

console.log(`\nHasil: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
