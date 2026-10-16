/**
 * Unit test modul prompt Fase 2 (server/promptFase2.ts) — F2-6 & F2-7.
 * Murni fungsi lokal — tanpa AI / network.
 * Dijalankan via: npx tsx test/prompt-fase2.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import { bagianRefleksiPengayaan, instruksiDuaKolom } from '../server/promptFase2.ts';

let passed = 0, failed = 0;
function check(nama: string, kond: boolean, extra = '') {
  if (kond) { passed++; console.log(`  PASS ${nama}`); }
  else { failed++; console.log(`  FAIL ${nama} ${extra}`); }
}

// ---------- F2-6: bagianRefleksiPengayaan ----------
{
  const sd = bagianRefleksiPengayaan('SD');
  const smp = bagianRefleksiPengayaan('SMP');

  check('SD memuat kata "refleksi" (case-insensitive)', /refleksi/i.test(sd));
  check('SD memuat penanda ceria', sd.toLowerCase().includes('ceria'));
  check('SMP menghasilkan teks BERBEDA dari versi SD', smp !== sd);
  check('SMP memuat nada dialogis', smp.toLowerCase().includes('dialogis'));
  check('memuat komponen pengayaan', /pengayaan/i.test(sd));
  check('memuat komponen remedial', /remedial/i.test(sd));
  check('memuat refleksi guru & siswa', sd.includes('GURU') && sd.includes('SISWA'));
  check('SD ringkas (< 900 karakter)', sd.length < 900, `panjang=${sd.length}`);
  check('SMP ringkas (< 900 karakter)', smp.length < 900, `panjang=${smp.length}`);
}

// ---------- F2-7: instruksiDuaKolom ----------
{
  const t = instruksiDuaKolom();
  check('memuat "Aktivitas Guru"', t.includes('Aktivitas Guru'));
  check('memuat "Aktivitas Siswa"', t.includes('Aktivitas Siswa'));
  check('memuat format tabel markdown dua kolom', t.includes('| Aktivitas Guru | Aktivitas Siswa |'));
  check('ringkas (< 400 karakter)', t.length < 400, `panjang=${t.length}`);
}

console.log(`\nHasil: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
