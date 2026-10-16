/**
 * Unit test F2-2 (naskah ujian) & F2-3 (paket admin ujian).
 * Murni fungsi lokal — tanpa AI / network.
 * Dijalankan via: npx tsx test/naskah-admin-ujian.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import {
  susunNaskahUjian,
  hitungGarisUraian,
  PETUNJUK_PENGERJAAN_DEFAULT,
  type OpsiNaskahUjian,
} from '../src/utils/naskahUjian.ts';
import {
  parseDaftarSiswa,
  susunBeritaAcara,
  susunDaftarHadir,
  susunKartuHasil,
  type DataAdminUjian,
} from '../src/utils/adminUjian.ts';
import {
  FORMAT_SOAL_V1,
  type PaketSoalTerstruktur,
  type IdentitasSoal,
  type ButirSoal,
} from '../shared/soalTerstruktur.ts';
import type { KopPengesahan } from '../shared/kopPengesahan.ts';

let passed = 0, failed = 0;
function check(nama: string, kond: boolean, extra = '') {
  if (kond) { passed++; console.log(`  PASS ${nama}`); }
  else { failed++; console.log(`  FAIL ${nama} ${extra}`); }
}

// ---------- Fixture ----------
function identitas(over: Partial<IdentitasSoal> = {}): IdentitasSoal {
  return {
    satuanPendidikan: 'SMP Negeri 3 Sinunukan',
    mataPelajaran: 'Informatika',
    kelas: 'VIII',
    fase: 'D',
    topik: 'Algoritma',
    waktu: '60 menit',
    guru: 'Amwaluddin',
    ...over,
  };
}

const GARIS = '________________________________________________________';

function butirPg(nomor: number, over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor,
    bentuk: 'pg_biasa',
    pertanyaan: 'Manakah yang termasuk langkah algoritma yang benar?',
    opsi: ['Acak dan tidak berurutan', 'Logis dan berurutan', 'Hanya untuk komputer', 'Tanpa tujuan jelas'],
    kunci: 'B',
    pembahasan: 'PEMBAHASAN_RAHASIA_PG: algoritma harus logis dan berurutan.',
    levelKognitif: 'C2',
    indikator: 'Siswa dapat mengidentifikasi ciri algoritma.',
    ...over,
  };
}

function butirJodoh(nomor: number, over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor,
    bentuk: 'menjodohkan',
    pertanyaan: 'Jodohkan istilah dengan pengertiannya!',
    pasangan: [
      { kiri: 'Input', kanan: 'Data yang dimasukkan' },
      { kiri: 'Output', kanan: 'Hasil keluaran proses' },
    ],
    kunci: 'KUNCI_RAHASIA_JODOH: 1-A, 2-B',
    pembahasan: 'PEMBAHASAN_RAHASIA_JODOH: input adalah masukan, output adalah keluaran.',
    levelKognitif: 'C1',
    indikator: 'Siswa dapat mengenali istilah algoritma.',
    ...over,
  };
}

function butirIsian(nomor: number, over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor,
    bentuk: 'isian',
    pertanyaan: 'Langkah pertama dalam membuat algoritma adalah ....',
    kunci: 'KUNCI_RAHASIA_ISIAN: analisis masalah',
    pembahasan: 'PEMBAHASAN_RAHASIA_ISIAN: masalah harus dianalisis sebelum dirancang.',
    levelKognitif: 'C1',
    indikator: 'Siswa dapat menyebutkan langkah awal algoritma.',
    ...over,
  };
}

function butirUraian(nomor: number, over: Partial<ButirSoal> = {}): ButirSoal {
  return {
    nomor,
    bentuk: 'uraian',
    stimulus: 'Perhatikan studi kasus warung makan berikut.',
    pertanyaan: 'Rancang algoritma sederhana untuk menghitung total belanja pelanggan!',
    kunci: 'KUNCI_RAHASIA_URAIAN: input harga & jumlah, hitung, tampilkan total.',
    pembahasan: 'PEMBAHASAN_RAHASIA_URAIAN: algoritma memuat input, proses, output.',
    levelKognitif: 'C5',
    indikator: 'Siswa dapat merancang algoritma sederhana.',
    rubrik: [
      { skor: 2, deskriptor: 'Langkah lengkap dan logis' },
      { skor: 4, deskriptor: 'Ada input-proses-output dengan contoh hitungan benar' },
    ],
    ...over,
  };
}

function paket(): PaketSoalTerstruktur {
  return {
    format: FORMAT_SOAL_V1,
    identitas: identitas(),
    komposisiBentuk: { pg_biasa: 1, pg_kompleks: 0, menjodohkan: 1, isian: 1, uraian: 1 },
    komposisiKognitif: { C1: 2, C2: 1, C3: 0, C4: 0, C5: 1, C6: 0 },
    items: [butirPg(1), butirJodoh(2), butirIsian(3), butirUraian(4)],
    generatedAt: '2026-10-17T00:00:00.000Z',
  };
}

function kop(): KopPengesahan {
  return {
    namaSekolah: 'SMP Negeri 3 Sinunukan',
    alamatSekolah: 'Jl. Pendidikan No. 1',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    namaGuru: 'Amwaluddin',
    namaKepsek: 'H. Kepala Sekolah',
    kotaTanggal: 'Sinunukan, 20 Oktober 2026',
  };
}

function dataAdmin(over: Partial<DataAdminUjian> = {}): DataAdminUjian {
  return {
    daftarSiswa: [
      { nama: 'Ahmad Fauzi', nis: '12345' },
      { nama: 'Siti Aminah', nis: '12346' },
      { nama: 'Budi Santoso' },
    ],
    hariTanggal: 'Senin, 20 Oktober 2026',
    pengawas: 'Dewi Sartika',
    mapel: 'Informatika',
    kelas: 'VIII-1',
    ...over,
  };
}

function hitungBarisGaris(md: string): number {
  return md.split('\n').filter((l) => l.includes(GARIS)).length;
}

console.log('1. parseDaftarSiswa\n');
{
  const r1 = parseDaftarSiswa('Ahmad Fauzi - 12345\nSiti Aminah - 12346');
  check('format "Nama - NIS" terparse',
    r1.length === 2 && r1[0].nama === 'Ahmad Fauzi' && r1[0].nis === '12345' &&
    r1[1].nama === 'Siti Aminah' && r1[1].nis === '12346', JSON.stringify(r1));

  const r2 = parseDaftarSiswa('Ahmad Fauzi | 12345');
  check('format "Nama | NIS" terparse',
    r2.length === 1 && r2[0].nama === 'Ahmad Fauzi' && r2[0].nis === '12345', JSON.stringify(r2));

  const r3 = parseDaftarSiswa('Ahmad Fauzi\n\n   \nSiti Aminah\n');
  check('baris kosong diabaikan', r3.length === 2, JSON.stringify(r3));

  const r4 = parseDaftarSiswa('Budi Santoso');
  check('nama tanpa NIS -> nis undefined',
    r4.length === 1 && r4[0].nama === 'Budi Santoso' && r4[0].nis === undefined, JSON.stringify(r4));

  check('teks kosong -> []', parseDaftarSiswa('').length === 0);
  check('hanya baris kosong -> []', parseDaftarSiswa('\n  \n\n').length === 0);
}

console.log('\n2. susunNaskahUjian — naskah (tanpa bocor kunci)\n');
{
  const p = paket();
  const { naskahMarkdown, kunciMarkdown } = susunNaskahUjian(p);

  check('judul "NASKAH UJIAN" ada', naskahMarkdown.includes('# NASKAH UJIAN'));
  check('info mapel/kelas/topik/waktu ada',
    naskahMarkdown.includes('Informatika') && naskahMarkdown.includes('VIII') &&
    naskahMarkdown.includes('Algoritma') && naskahMarkdown.includes('60 menit'));
  check('blok identitas siswa ada (Nama/Kelas/No. Absen/Hari-Tanggal)',
    naskahMarkdown.includes('Nama : ............') &&
    naskahMarkdown.includes('Kelas : ............') &&
    naskahMarkdown.includes('No. Absen : ............') &&
    naskahMarkdown.includes('Hari/Tanggal : ............'));
  check('petunjuk default dipakai bila opts kosong',
    naskahMarkdown.includes(PETUNJUK_PENGERJAAN_DEFAULT.split('\n')[0]));

  const custom: OpsiNaskahUjian = { petunjuk: 'PETUNJUK_KUSTOM_UNIK' };
  check('petunjuk kustom dipakai bila diberikan',
    susunNaskahUjian(p, custom).naskahMarkdown.includes('PETUNJUK_KUSTOM_UNIK'));

  check('stimulus dirender di naskah', naskahMarkdown.includes('Perhatikan studi kasus warung makan berikut.'));
  check('opsi A–D dirender', naskahMarkdown.includes('A. Acak dan tidak berurutan'));
  check('pasangan kiri-kanan dirender',
    naskahMarkdown.includes('1. Input') && naskahMarkdown.includes('A. Data yang dimasukkan'));

  // --- kunci TIDAK BOLEH bocor ---
  const rahasia = [
    'PEMBAHASAN_RAHASIA_PG', 'PEMBAHASAN_RAHASIA_JODOH',
    'PEMBAHASAN_RAHASIA_ISIAN', 'PEMBAHASAN_RAHASIA_URAIAN',
    'KUNCI_RAHASIA_JODOH', 'KUNCI_RAHASIA_ISIAN', 'KUNCI_RAHASIA_URAIAN',
    'Ada input-proses-output', // deskriptor rubrik
  ];
  check('kunci & pembahasan & rubrik TIDAK bocor ke naskah',
    rahasia.every((s) => !naskahMarkdown.includes(s)),
    rahasia.filter((s) => naskahMarkdown.includes(s)).join(', '));
  check('tidak ada baris "Kunci:" di naskah', !/kunci\s*:/i.test(naskahMarkdown));
}

console.log('\n3. susunNaskahUjian — garis jawaban dinamis\n');
{
  const p = paket();
  const { naskahMarkdown } = susunNaskahUjian(p);

  // uraian: skorMaks rubrik = 4 -> N = clamp(2*4,4,12) = 8
  check('hitungGarisUraian skorMaks 4 -> 8 garis', hitungGarisUraian(butirUraian(1)) === 8);
  check('hitungGarisUraian clamp atas: skorMaks 10 -> 12',
    hitungGarisUraian(butirUraian(1, { rubrik: [{ skor: 10, deskriptor: 'x' }] })) === 12);
  check('hitungGarisUraian clamp bawah: tanpa rubrik -> 4',
    hitungGarisUraian({ ...butirUraian(1), rubrik: undefined }) === 4);

  // total garis di naskah: uraian 8 + isian 1 = 9; pg & menjodohkan 0
  check('total garis = 8 (uraian) + 1 (isian)', hitungBarisGaris(naskahMarkdown) === 9,
    `dapat ${hitungBarisGaris(naskahMarkdown)}`);

  // garis isian tepat 1: cek segmen soal isian (soal 3) hanya memuat 1 garis
  const segmenIsian = naskahMarkdown.split('## 3.')[1]?.split('## 4.')[0] ?? '';
  check('soal isian tepat 1 garis', hitungBarisGaris(segmenIsian) === 1);

  // soal PG (soal 1) tanpa garis
  const segmenPg = naskahMarkdown.split('## 1.')[1]?.split('## 2.')[0] ?? '';
  check('soal PG tanpa garis jawaban', hitungBarisGaris(segmenPg) === 0);

  // soal menjodohkan (soal 2) tanpa garis
  const segmenJodoh = naskahMarkdown.split('## 2.')[1]?.split('## 3.')[0] ?? '';
  check('soal menjodohkan tanpa garis jawaban', hitungBarisGaris(segmenJodoh) === 0);
}

console.log('\n4. susunNaskahUjian — kunciMarkdown\n');
{
  const { kunciMarkdown } = susunNaskahUjian(paket());
  check('diawali header "🔒 RAHASIA GURU"',
    kunciMarkdown.includes('🔒 RAHASIA GURU — jangan dibagikan ke siswa'));
  check('memuat kunci per butir',
    kunciMarkdown.includes('Kunci: B') && kunciMarkdown.includes('KUNCI_RAHASIA_ISIAN'));
  check('memuat pembahasan', kunciMarkdown.includes('PEMBAHASAN_RAHASIA_PG'));
  check('rubrik uraian sebagai tabel',
    kunciMarkdown.includes('| Skor | Deskriptor |') && kunciMarkdown.includes('Ada input-proses-output'));
}

console.log('\n5. susunDaftarHadir\n');
{
  const md = susunDaftarHadir(dataAdmin(), kop());
  check('judul ada', md.includes('# DAFTAR HADIR UJIAN'));
  check('header tabel ada', md.includes('| No | Nama Siswa | NIS | Tanda Tangan |'));
  const barisData = md.split('\n').filter((l) => /^\| \d+ \|/.test(l));
  check('jumlah baris data = jumlah siswa (3)', barisData.length === 3, JSON.stringify(barisData));
  check('nama siswa muncul di tabel', md.includes('Ahmad Fauzi') && md.includes('Siti Aminah') && md.includes('Budi Santoso'));
  check('NIS kosong dirender "-"', md.includes('| Budi Santoso | - |') || md.includes('Budi Santoso | -'));
}

console.log('\n6. susunBeritaAcara\n');
{
  const md = susunBeritaAcara(dataAdmin(), kop());
  check('judul ada', md.includes('# BERITA ACARA PELAKSANAAN UJIAN'));
  check('info sekolah ada', md.includes('SMP Negeri 3 Sinunukan') && md.includes('2026/2027'));
  check('hari/tanggal, mapel, kelas, pengawas ada',
    md.includes('Senin, 20 Oktober 2026') && md.includes('Informatika') &&
    md.includes('VIII-1') && md.includes('Dewi Sartika'));
  check('jumlah peserta = 3 siswa', md.includes('3 siswa'));
  check('bagian isian jalannya ujian ada', md.includes('Peserta tidak hadir: ............'));
  check('tanda tangan pengawas + saksi ada', md.includes('Pengawas Ujian') && md.includes('Saksi'));
}

console.log('\n7. susunKartuHasil\n');
{
  const md = susunKartuHasil(dataAdmin(), kop());
  check('judul ada', md.includes('# KARTU HASIL UJIAN'));
  const kartu = md.split('\n').filter((l) => l.startsWith('## Kartu'));
  check('satu kartu per siswa (3 kartu)', kartu.length === 3, kartu.join(' | '));
  check('kartu dipisahkan ---', (md.match(/^---$/gm) ?? []).length === 2);
  check('kartu memuat mapel/kelas/hari-tanggal',
    md.includes('Informatika') && md.includes('VIII-1') && md.includes('Senin, 20 Oktober 2026'));
  check('kolom nilai + paraf guru ada', md.includes('**Nilai:** ............') && md.includes('**Paraf Guru:** ............'));
}

console.log('\n8. tanpa identitas dummy\n');
{
  const dKosong = dataAdmin({ hariTanggal: '', pengawas: '', mapel: '', kelas: '' });
  const gabung = susunBeritaAcara(dKosong, kop()) + susunDaftarHadir(dKosong, kop()) + susunKartuHasil(dKosong, kop());
  check('field kosong dirender sebagai garis kosong', gabung.includes('....................'));
  check('tidak ada placeholder nama palsu',
    !gabung.includes('Bapak/Ibu Guru') && !gabung.includes('Nama Lengkap'));
}

console.log(`\nHasil: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
