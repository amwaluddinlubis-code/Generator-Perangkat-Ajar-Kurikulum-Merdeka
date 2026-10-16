/**
 * naskahUjian.ts — F2-2 "Naskah ujian siap cetak".
 *
 * Modul MURNI: tanpa dependency DOM/browser. Menerima PaketSoalTerstruktur
 * yang SUDAH JADI (hasil pipeline Fase 1) — tidak ada parsing JSON di sini.
 *
 * Output MARKDOWN tanpa kop header: kop formal ditambahkan oleh
 * exportToDocx() via metadata.kop (tugas koordinator/integrasi).
 *
 * ATURAN KERAS: naskahMarkdown TIDAK BOLEH memuat kunci jawaban,
 * pembahasan, atau rubrik penskoran — hanya kunciMarkdown yang memuatnya.
 */

import { LABEL_BENTUK, type ButirSoal, type PaketSoalTerstruktur } from '@/shared/soalTerstruktur.ts';

export interface OpsiNaskahUjian {
  /** Petunjuk pengerjaan kustom. Bila kosong, dipakai PETUNJUK_PENGERJAAN_DEFAULT. */
  petunjuk?: string;
}

export const PETUNJUK_PENGERJAAN_DEFAULT = [
  '1. Tuliskan nama, kelas, dan nomor absen pada kolom identitas yang tersedia.',
  '2. Berdoalah sebelum mengerjakan soal.',
  '3. Bacalah setiap soal dengan saksama sebelum menjawab.',
  '4. Kerjakan terlebih dahulu soal yang dianggap paling mudah.',
  '5. Untuk soal pilihan ganda, pilihlah satu jawaban yang paling tepat.',
  '6. Untuk soal menjodohkan, tuliskan huruf jawaban yang tepat di samping nomor soal.',
  '7. Untuk soal isian singkat, tuliskan jawaban singkat pada tempat yang tersedia.',
  '8. Untuk soal uraian, tuliskan jawaban selengkap dan sejelas mungkin pada garis yang tersedia.',
  '9. Periksa kembali seluruh jawaban sebelum naskah dikumpulkan.',
].join('\n');

const HURUF_OPSI = ['A', 'B', 'C', 'D', 'E', 'F'];
const GARIS_JAWABAN = '________________________________________________________';

/** clamp(v, min, max) untuk jumlah garis jawaban. */
function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Jumlah garis jawaban uraian: N = clamp(2 × skorMaksRubrik, 4, 12).
 * skorMaksRubrik = skor tertinggi pada rubrik butir (0 bila tanpa rubrik).
 */
export function hitungGarisUraian(it: ButirSoal): number {
  const skorMaks = (it.rubrik ?? []).reduce((m, r) => Math.max(m, Number(r.skor) || 0), 0);
  return clamp(2 * skorMaks, 4, 12);
}

/** Amankan teks agar tidak merusak tabel markdown. */
function selAman(s: string): string {
  return String(s ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ').trim();
}

function renderButirNaskah(it: ButirSoal): string[] {
  const b: string[] = [];
  b.push(`## ${it.nomor}. ${LABEL_BENTUK[it.bentuk]}`);
  b.push('');
  if (it.stimulus && it.stimulus.trim()) {
    b.push(`> **Stimulus:** ${it.stimulus.trim()}`);
    b.push('');
  }
  b.push(it.pertanyaan);
  b.push('');

  if (it.bentuk === 'pg_biasa' && it.opsi) {
    it.opsi.forEach((o, i) => b.push(`${HURUF_OPSI[i] ?? `O${i + 1}`}. ${o}`));
    b.push('');
  } else if (it.bentuk === 'pg_kompleks' && it.opsi) {
    b.push('*Tuliskan "Benar" atau "Salah" untuk setiap pernyataan berikut:*');
    b.push('');
    it.opsi.forEach((o, i) => b.push(`${i + 1}. ${o}`));
    b.push('');
  } else if (it.bentuk === 'menjodohkan' && it.pasangan) {
    b.push('**Kolom kiri:**');
    b.push('');
    it.pasangan.forEach((p, i) => b.push(`${i + 1}. ${p.kiri}`));
    b.push('');
    b.push('**Kolom kanan** — *tuliskan huruf yang tepat di samping nomor kolom kiri:*');
    b.push('');
    it.pasangan.forEach((p, i) => b.push(`${HURUF_OPSI[i] ?? `O${i + 1}`}. ${p.kanan}`));
    b.push('');
  } else if (it.bentuk === 'isian') {
    b.push(`Jawaban: ${GARIS_JAWABAN}`);
    b.push('');
  } else if (it.bentuk === 'uraian') {
    const n = hitungGarisUraian(it);
    for (let i = 0; i < n; i++) b.push(GARIS_JAWABAN);
    b.push('');
  }
  return b;
}

function renderButirKunci(it: ButirSoal): string[] {
  const b: string[] = [];
  b.push(`## Soal ${it.nomor} — Kunci: ${it.kunci}`);
  b.push('');
  b.push(`**Pembahasan:** ${it.pembahasan}`);
  b.push('');
  if (it.bentuk === 'uraian' && it.rubrik && it.rubrik.length > 0) {
    b.push('**Rubrik penskoran:**');
    b.push('');
    b.push('| Skor | Deskriptor |');
    b.push('|------|------------|');
    for (const r of it.rubrik) b.push(`| ${r.skor} | ${selAman(r.deskriptor)} |`);
    b.push('');
  }
  return b;
}

/**
 * Susun naskah ujian (untuk siswa) + kunci jawaban (rahasia guru).
 *
 * naskahMarkdown: judul "NASKAH UJIAN", info mapel/kelas/topik/waktu,
 * blok identitas siswa, petunjuk pengerjaan, naskah soal per butir
 * (stimulus, pertanyaan, opsi/pernyataan/pasangan, garis jawaban dinamis).
 *
 * kunciMarkdown: diawali header "🔒 RAHASIA GURU", lalu per butir:
 * nomor, kunci, pembahasan 1–2 kalimat, dan rubrik uraian sebagai tabel.
 */
export function susunNaskahUjian(
  paket: PaketSoalTerstruktur,
  opts: OpsiNaskahUjian = {}
): { naskahMarkdown: string; kunciMarkdown: string } {
  const id = paket.identitas;
  const petunjuk = (opts.petunjuk ?? '').trim() || PETUNJUK_PENGERJAAN_DEFAULT;

  const naskah: string[] = [];
  naskah.push('# NASKAH UJIAN');
  naskah.push('');
  naskah.push(`**Mata Pelajaran:** ${id.mataPelajaran || '-'}`);
  naskah.push(`**Kelas:** ${id.kelas || '-'}`);
  naskah.push(`**Topik:** ${id.topik || '-'}`);
  naskah.push(`**Waktu:** ${id.waktu || '-'}`);
  naskah.push('');
  naskah.push('## IDENTITAS PESERTA');
  naskah.push('');
  naskah.push('Nama : ............');
  naskah.push('Kelas : ............');
  naskah.push('No. Absen : ............');
  naskah.push('Hari/Tanggal : ............');
  naskah.push('');
  naskah.push('## PETUNJUK PENGERJAAN');
  naskah.push('');
  naskah.push(petunjuk);
  naskah.push('');
  naskah.push('## SOAL');
  naskah.push('');
  for (const it of paket.items) {
    naskah.push(...renderButirNaskah(it));
  }

  const kunci: string[] = [];
  kunci.push('# KUNCI JAWABAN DAN PEDOMAN PENSKORAN');
  kunci.push('');
  kunci.push('🔒 RAHASIA GURU — jangan dibagikan ke siswa');
  kunci.push('');
  kunci.push(`**Mata Pelajaran:** ${id.mataPelajaran || '-'} | **Kelas:** ${id.kelas || '-'} | **Topik:** ${id.topik || '-'}`);
  kunci.push('');
  for (const it of paket.items) {
    kunci.push(...renderButirKunci(it));
  }

  return { naskahMarkdown: naskah.join('\n'), kunciMarkdown: kunci.join('\n') };
}
