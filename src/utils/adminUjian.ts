/**
 * adminUjian.ts — F2-3 "Paket admin ujian".
 *
 * Modul MURNI: tanpa dependency DOM/browser. Menyusun 3 dokumen administrasi
 * ujian sebagai MARKDOWN tanpa kop header (kop formal ditambahkan oleh
 * exportToDocx() via metadata.kop oleh koordinator/integrasi).
 *
 * ATURAN KERAS: tidak ada identitas dummy. Field kosong dirender lewat
 * barisIdentitas() sebagai garis kosong, TIDAK PERNAH diisi nama palsu.
 */

import { barisIdentitas, type KopPengesahan } from '@/shared/kopPengesahan.ts';

/** Data administrasi ujian yang diisi guru lewat AdminUjianModal. */
export interface DataAdminUjian {
  daftarSiswa: { nama: string; nis?: string }[];
  hariTanggal: string;
  pengawas: string;
  mapel: string;
  kelas: string;
}

/**
 * Parse daftar siswa dari textarea: satu nama per baris.
 * Format opsional: "Nama - NIS" atau "Nama | NIS".
 * Baris kosong diabaikan; nama tanpa NIS menghasilkan nis undefined.
 */
export function parseDaftarSiswa(teks: string): { nama: string; nis?: string }[] {
  return String(teks ?? '')
    .split(/\r?\n/)
    .map((baris) => baris.trim())
    .filter((baris) => baris.length > 0)
    .map((baris) => {
      const bagian = baris.split(/\s+-\s+|\s*\|\s*/);
      const nama = (bagian[0] ?? '').trim();
      const nis = bagian.length > 1 ? bagian.slice(1).join(' - ').trim() : '';
      return nis ? { nama, nis } : { nama };
    })
    .filter((s) => s.nama.length > 0);
}

/** Baris info sekolah yang dipakai bersama ketiga dokumen. */
function infoSekolah(kop: KopPengesahan): string[] {
  const b: string[] = [];
  b.push(`**Satuan Pendidikan:** ${barisIdentitas(kop.namaSekolah)}`);
  if (kop.alamatSekolah && kop.alamatSekolah.trim()) b.push(`**Alamat:** ${kop.alamatSekolah.trim()}`);
  const thn = [`**Tahun Ajaran:** ${barisIdentitas(kop.tahunAjaran)}`];
  if (kop.semester && kop.semester.trim()) thn.push(`**Semester:** ${kop.semester.trim()}`);
  b.push(thn.join(' | '));
  return b;
}

/** Amankan teks agar tidak merusak tabel markdown. */
function selAman(s: string | undefined): string {
  return String(s ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ').trim();
}

function blokTandaTangan(kop: KopPengesahan, kiri: string, kanan: string): string[] {
  return [
    '',
    `${barisIdentitas(kop.kotaTanggal)},`,
    '',
    `${kiri},${' '.repeat(24)}${kanan},`,
    '',
    '',
    '( .............................. )      ( .............................. )',
    `NIP. ${barisIdentitas(undefined)}                     NIP. ${barisIdentitas(undefined)}`,
  ];
}

/**
 * Berita Acara Pelaksanaan Ujian: kop info sekolah, judul, isi (hari/tanggal,
 * mapel, kelas, jumlah peserta, pengawas, catatan jalannya ujian dengan
 * bagian isian), tanda tangan pengawas + saksi.
 */
export function susunBeritaAcara(d: DataAdminUjian, kop: KopPengesahan): string {
  const b: string[] = [];
  b.push('# BERITA ACARA PELAKSANAAN UJIAN');
  b.push('');
  b.push(...infoSekolah(kop));
  b.push('');
  b.push('Pada hari ini telah dilaksanakan ujian sebagai berikut:');
  b.push('');
  b.push(`- **Hari/Tanggal:** ${barisIdentitas(d.hariTanggal)}`);
  b.push(`- **Mata Pelajaran:** ${barisIdentitas(d.mapel)}`);
  b.push(`- **Kelas:** ${barisIdentitas(d.kelas)}`);
  b.push(`- **Jumlah Peserta:** ${d.daftarSiswa.length} siswa`);
  b.push(`- **Pengawas:** ${barisIdentitas(d.pengawas)}`);
  b.push('');
  b.push('## JALANNYA UJIAN');
  b.push('');
  b.push(`1. Jumlah peserta hadir: ............ dari ${d.daftarSiswa.length} siswa terdaftar.`);
  b.push('2. Peserta tidak hadir: ............');
  b.push('3. Kejadian/kendala selama ujian: ............');
  b.push('4. Catatan lain: ............');
  b.push('');
  b.push('Demikian berita acara ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.');
  b.push(...blokTandaTangan(kop, 'Pengawas Ujian', 'Saksi'));
  return b.join('\n');
}

/**
 * Daftar Hadir Ujian: tabel No | Nama Siswa | NIS | Tanda Tangan (satu kolom).
 */
export function susunDaftarHadir(d: DataAdminUjian, kop: KopPengesahan): string {
  const b: string[] = [];
  b.push('# DAFTAR HADIR UJIAN');
  b.push('');
  b.push(...infoSekolah(kop));
  b.push('');
  b.push(`**Mata Pelajaran:** ${barisIdentitas(d.mapel)} | **Kelas:** ${barisIdentitas(d.kelas)}`);
  b.push(`**Hari/Tanggal:** ${barisIdentitas(d.hariTanggal)} | **Pengawas:** ${barisIdentitas(d.pengawas)}`);
  b.push('');
  b.push('| No | Nama Siswa | NIS | Tanda Tangan |');
  b.push('|----|------------|-----|--------------|');
  d.daftarSiswa.forEach((s, i) => {
    b.push(`| ${i + 1} | ${selAman(s.nama) || barisIdentitas(undefined)} | ${selAman(s.nis) || '-'} |  |`);
  });
  b.push('');
  b.push(...blokTandaTangan(kop, 'Pengawas Ujian', 'Wali Kelas'));
  return b.join('\n');
}

/**
 * Kartu Hasil Ujian: satu kartu per siswa (nama, mapel, kelas, hari/tanggal,
 * kolom nilai + paraf guru). Tiap kartu dipisahkan `---`.
 */
export function susunKartuHasil(d: DataAdminUjian, kop: KopPengesahan): string {
  const kartu: string[] = [];
  kartu.push('# KARTU HASIL UJIAN');
  kartu.push('');
  kartu.push(...infoSekolah(kop));
  kartu.push('');

  d.daftarSiswa.forEach((s, i) => {
    if (i > 0) {
      kartu.push('');
      kartu.push('---');
      kartu.push('');
    }
    kartu.push(`## Kartu ${i + 1} — ${selAman(s.nama) || barisIdentitas(undefined)}`);
    kartu.push('');
    kartu.push(`**Nama:** ${selAman(s.nama) || barisIdentitas(undefined)} | **NIS:** ${selAman(s.nis) || '-'}`);
    kartu.push(`**Mata Pelajaran:** ${barisIdentitas(d.mapel)} | **Kelas:** ${barisIdentitas(d.kelas)}`);
    kartu.push(`**Hari/Tanggal:** ${barisIdentitas(d.hariTanggal)}`);
    kartu.push('');
    kartu.push('**Nilai:** ............');
    kartu.push('');
    kartu.push('**Paraf Guru:** ............');
  });
  return kartu.join('\n');
}
