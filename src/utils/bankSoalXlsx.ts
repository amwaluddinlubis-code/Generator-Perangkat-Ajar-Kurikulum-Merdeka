/**
 * bankSoalXlsx.ts — Impor/ekspor XLSX bank soal (F3-1 roadmap RGM).
 *
 * Alur impor:  sheet pertama .xlsx dibaca via ExcelJS → header dipetakan
 * secara cerdas (petakanKolom, toleran alias Bahasa Indonesia) → tiap baris
 * dikonversi + divalidasi (barisKeButir). Baris yang gagal TIDAK menggagalkan
 * seluruh impor: dilaporkan sebagai daftar error, baris valid tetap diimpor.
 *
 * Modul MURNI kecuali eksporXlsx()/templateXlsx() yang mengembalikan Blob
 * (dibangun dari workbook via writeBuffer — tanpa DOM, tetap bisa dites node).
 */

import ExcelJS from 'exceljs';
import {
  DAFTAR_BENTUK,
  DAFTAR_KOGNITIF,
  LABEL_BENTUK,
  type BentukSoal,
  type ButirSoal,
  type LevelKognitif,
  type PasanganJodoh,
  type RubrikSkor,
} from '@/shared/soalTerstruktur';

/** Kolom kanonis bank soal (urutan dipakai untuk header ekspor). */
export const KOLOM_KANONIS = [
  'Nomor', 'Bentuk', 'Stimulus', 'Pertanyaan',
  'OpsiA', 'OpsiB', 'OpsiC', 'OpsiD', 'OpsiE',
  'Pasangan', 'Kunci', 'Pembahasan', 'LevelKognitif', 'Indikator', 'Rubrik',
] as const;

export type KolomKanonis = (typeof KOLOM_KANONIS)[number];

/** Kolom wajib yang harus ada di header agar impor bisa berjalan. */
const KOLOM_WAJIB: KolomKanonis[] = [
  'Bentuk', 'Pertanyaan', 'Kunci', 'Pembahasan', 'LevelKognitif', 'Indikator',
];

const TIPE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Normalisasi header: lowercase, trim, spasi/underscore berlebih dirapikan.
 * "  Level  Kognitif " → "level kognitif".
 */
export function normalisasiHeader(h: string): string {
  return String(h ?? '')
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, ' ');
}

/** Tabel alias (sudah dinormalisasi) → kolom kanonis. 'Opsi' = kolom gabungan tunggal. */
const ALIAS_KE_KANONIS: Record<string, KolomKanonis | 'Opsi'> = {
  // Nomor
  'nomor': 'Nomor', 'no': 'Nomor', 'no.': 'Nomor', 'nomer': 'Nomor',
  // Bentuk
  'bentuk': 'Bentuk', 'bentuk soal': 'Bentuk', 'jenis soal': 'Bentuk',
  'tipe soal': 'Bentuk', 'tipe': 'Bentuk',
  // Stimulus
  'stimulus': 'Stimulus', 'bacaan': 'Stimulus', 'teks stimulus': 'Stimulus',
  'wacana': 'Stimulus', 'teks bacaan': 'Stimulus',
  // Pertanyaan
  'pertanyaan': 'Pertanyaan', 'soal': 'Pertanyaan', 'pertanyaan soal': 'Pertanyaan',
  'butir soal': 'Pertanyaan', 'isi soal': 'Pertanyaan',
  // Opsi gabungan (satu kolom, isi dipisah "|")
  'opsi': 'Opsi', 'pilihan': 'Opsi', 'pilihan jawaban': 'Opsi',
  'opsi jawaban': 'Opsi', 'daftar opsi': 'Opsi',
  // Opsi terpisah
  'opsia': 'OpsiA', 'opsi a': 'OpsiA', 'pilihan a': 'OpsiA', 'a': 'OpsiA',
  'opsib': 'OpsiB', 'opsi b': 'OpsiB', 'pilihan b': 'OpsiB', 'b': 'OpsiB',
  'opsic': 'OpsiC', 'opsi c': 'OpsiC', 'pilihan c': 'OpsiC', 'c': 'OpsiC',
  'opsid': 'OpsiD', 'opsi d': 'OpsiD', 'pilihan d': 'OpsiD', 'd': 'OpsiD',
  'opsie': 'OpsiE', 'opsi e': 'OpsiE', 'pilihan e': 'OpsiE', 'e': 'OpsiE',
  // Pasangan
  'pasangan': 'Pasangan', 'pasangan kiri-kanan': 'Pasangan', 'jodohkan': 'Pasangan',
  'pasangan jodoh': 'Pasangan',
  // Kunci
  'kunci': 'Kunci', 'kunci jawaban': 'Kunci', 'jawaban': 'Kunci',
  'jawaban benar': 'Kunci',
  // Pembahasan
  'pembahasan': 'Pembahasan', 'penjelasan': 'Pembahasan', 'alasan': 'Pembahasan',
  // Level kognitif
  'levelkognitif': 'LevelKognitif', 'level kognitif': 'LevelKognitif',
  'level': 'LevelKognitif', 'kognitif': 'LevelKognitif', 'taksonomi': 'LevelKognitif',
  'bloom': 'LevelKognitif', 'taksonomi bloom': 'LevelKognitif',
  // Indikator
  'indikator': 'Indikator', 'indikator soal': 'Indikator', 'tp': 'Indikator',
  'tujuan pembelajaran': 'Indikator',
  // Rubrik
  'rubrik': 'Rubrik', 'rubrik penskoran': 'Rubrik', 'kriteria skor': 'Rubrik',
};

/**
 * Pemetaan cerdas header → indeks kolom kanonis.
 * Case-insensitive + toleran alias Bahasa Indonesia (lihat ALIAS_KE_KANONIS).
 *
 * Nilai balik: map kolom kanonis → indeks kolom (0-based). Bila ditemukan
 * kolom tunggal "Opsi", nilainya disimpan dengan kunci 'Opsi' — saat
 * membangun baris, isinya dipisah '|' menjadi OpsiA..E.
 * Header tak dikenal diabaikan; kolom duplikat: yang pertama menang.
 */
export function petakanKolom(headers: string[]): Record<string, number> {
  const hasil: Record<string, number> = {};
  headers.forEach((h, idx) => {
    const kanonis = ALIAS_KE_KANONIS[normalisasiHeader(h)];
    if (kanonis && hasil[kanonis] === undefined) hasil[kanonis] = idx;
  });
  return hasil;
}

/** Alias bentuk (dinormalisasi) → kode BentukSoal. */
const ALIAS_BENTUK: Record<string, BentukSoal> = {
  'pg_biasa': 'pg_biasa', 'pg biasa': 'pg_biasa', 'pilihan ganda': 'pg_biasa',
  'pg': 'pg_biasa', 'pilihan ganda biasa': 'pg_biasa', 'multiple choice': 'pg_biasa',
  'pg_kompleks': 'pg_kompleks', 'pg kompleks': 'pg_kompleks',
  'pg kompleks (akm)': 'pg_kompleks', 'akm': 'pg_kompleks', 'kompleks': 'pg_kompleks',
  'menjodohkan': 'menjodohkan', 'menjodoh': 'menjodohkan', 'jodohkan': 'menjodohkan',
  'isian': 'isian', 'isian singkat': 'isian', 'isinan': 'isian', 'short answer': 'isian',
  'uraian': 'uraian', 'uraian hots': 'uraian', 'esai': 'uraian', 'essay': 'uraian',
};

/** Alias level kognitif (dinormalisasi) → kode LevelKognitif. */
const ALIAS_KOGNITIF: Record<string, LevelKognitif> = {};
for (const lv of DAFTAR_KOGNITIF) {
  ALIAS_KOGNITIF[lv.toLowerCase()] = lv;
  ALIAS_KOGNITIF[lv.slice(1)] = lv; // "3" → "C3"
}

const rapi = (s: unknown) => String(s ?? '').trim();

/** Parse "kiri=kanan; kiri=kanan" → daftar pasangan. Potongan rusak → error. */
function parsePasangan(mentah: string, noBaris: number): { pasangan: PasanganJodoh[]; errors: string[] } {
  const pasangan: PasanganJodoh[] = [];
  const errors: string[] = [];
  const potongan = rapi(mentah).split(';').map(rapi).filter(Boolean);
  potongan.forEach((p, i) => {
    const pisah = p.indexOf('=');
    if (pisah < 0) {
      errors.push(`Baris ${noBaris}: pasangan ke-${i + 1} "${p}" tidak valid (format: "kiri=kanan").`);
      return;
    }
    const kiri = rapi(p.slice(0, pisah));
    const kanan = rapi(p.slice(pisah + 1));
    if (!kiri || !kanan) {
      errors.push(`Baris ${noBaris}: pasangan ke-${i + 1} "${p}" kosong di kiri/kanan.`);
      return;
    }
    pasangan.push({ kiri, kanan });
  });
  return { pasangan, errors };
}

/** Parse "skor:deskriptor; skor:deskriptor" → daftar rubrik. Potongan rusak → error. */
function parseRubrik(mentah: string, noBaris: number): { rubrik: RubrikSkor[]; errors: string[] } {
  const rubrik: RubrikSkor[] = [];
  const errors: string[] = [];
  const potongan = rapi(mentah).split(';').map(rapi).filter(Boolean);
  potongan.forEach((p, i) => {
    const pisah = p.indexOf(':');
    if (pisah < 0) {
      errors.push(`Baris ${noBaris}: rubrik ke-${i + 1} "${p}" tidak valid (format: "skor:deskriptor").`);
      return;
    }
    const skor = Number(rapi(p.slice(0, pisah)).replace(',', '.'));
    const deskriptor = rapi(p.slice(pisah + 1));
    if (!Number.isFinite(skor) || skor <= 0) {
      errors.push(`Baris ${noBaris}: rubrik ke-${i + 1} "${p}" skornya bukan angka positif.`);
      return;
    }
    if (!deskriptor) {
      errors.push(`Baris ${noBaris}: rubrik ke-${i + 1} "${p}" deskriptornya kosong.`);
      return;
    }
    rubrik.push({ skor, deskriptor });
  });
  return { rubrik, errors };
}

export interface HasilBaris {
  butir?: ButirSoal;
  errors: string[];
}

/**
 * Konversi satu baris (map kolom kanonis → string) menjadi ButirSoal + validasi.
 * Gagal pada baris ini menghasilkan errors (dengan nomor baris), bukan throw.
 */
export function barisKeButir(baris: Record<string, string>, noBaris: number): HasilBaris {
  const errors: string[] = [];
  const ambil = (k: string) => rapi(baris[k]);

  // --- Bentuk ---
  const bentukMentah = ambil('Bentuk');
  const bentuk = ALIAS_BENTUK[normalisasiHeader(bentukMentah)];
  if (!bentuk) {
    errors.push(
      `Baris ${noBaris}: bentuk "${bentukMentah || '(kosong)'}" tidak dikenal. ` +
      `Isi salah satu: Pilihan Ganda, PG Kompleks (AKM), Menjodohkan, Isian Singkat, Uraian/Esai.`
    );
  }

  // --- Level kognitif ---
  const levelMentah = ambil('LevelKognitif');
  const levelKognitif = ALIAS_KOGNITIF[normalisasiHeader(levelMentah)];
  if (!levelKognitif) {
    errors.push(`Baris ${noBaris}: level kognitif "${levelMentah || '(kosong)'}" tidak valid (harus C1–C6 atau angka 1–6).`);
  }

  // --- Wajib isi ---
  const pertanyaan = ambil('Pertanyaan');
  if (!pertanyaan) errors.push(`Baris ${noBaris}: kolom Pertanyaan kosong.`);
  const kunci = ambil('Kunci');
  if (!kunci) errors.push(`Baris ${noBaris}: kolom Kunci kosong.`);
  const pembahasan = ambil('Pembahasan');
  if (!pembahasan) errors.push(`Baris ${noBaris}: kolom Pembahasan kosong.`);
  const indikator = ambil('Indikator');
  if (!indikator) errors.push(`Baris ${noBaris}: kolom Indikator kosong.`);

  // --- Opsi ---
  const opsi = (['OpsiA', 'OpsiB', 'OpsiC', 'OpsiD', 'OpsiE'] as const)
    .map(k => ambil(k))
    .filter(Boolean);
  if (bentuk && (bentuk === 'pg_biasa' || bentuk === 'pg_kompleks') && opsi.length < 2) {
    errors.push(`Baris ${noBaris}: ${LABEL_BENTUK[bentuk]} butuh minimal 2 opsi, ditemukan ${opsi.length}.`);
  }

  // --- Pasangan ---
  let pasangan: PasanganJodoh[] | undefined;
  if (bentuk === 'menjodohkan') {
    const { pasangan: ps, errors: e } = parsePasangan(ambil('Pasangan'), noBaris);
    errors.push(...e);
    pasangan = ps;
    if (ps.length < 2) {
      errors.push(`Baris ${noBaris}: menjodohkan butuh minimal 2 pasangan, ditemukan ${ps.length}.`);
    }
  }

  // --- Rubrik (wajib untuk uraian) ---
  let rubrik: RubrikSkor[] | undefined;
  const rubrikMentah = ambil('Rubrik');
  if (rubrikMentah) {
    const { rubrik: rb, errors: e } = parseRubrik(rubrikMentah, noBaris);
    errors.push(...e);
    rubrik = rb;
  }
  if (bentuk === 'uraian' && (!rubrik || rubrik.length < 2)) {
    errors.push(
      `Baris ${noBaris}: soal uraian wajib memiliki rubrik minimal 2 kriteria skor ` +
      `(format kolom Rubrik: "skor:deskriptor; skor:deskriptor").`
    );
  }

  if (errors.length > 0 || !bentuk || !levelKognitif) return { errors };

  const nomor = parseInt(ambil('Nomor'), 10);
  const butir: ButirSoal = {
    nomor: Number.isFinite(nomor) && nomor > 0 ? nomor : noBaris,
    bentuk,
    pertanyaan,
    kunci,
    pembahasan,
    levelKognitif,
    indikator,
  };
  const stimulus = ambil('Stimulus');
  if (stimulus) butir.stimulus = stimulus;
  if (opsi.length > 0) butir.opsi = opsi;
  if (pasangan && pasangan.length > 0) butir.pasangan = pasangan;
  if (rubrik && rubrik.length > 0) butir.rubrik = rubrik;
  return { butir, errors };
}

/**
 * Konversi ButirSoal → satu baris (map kolom kanonis → string) untuk ekspor.
 * Bentuk ditulis dengan LABEL_BENTUK (lebih manusiawi) — barisKeButir
 * mengenali labelnya kembali lewat alias.
 */
export function butirKeBaris(b: ButirSoal): Record<string, string> {
  const hasil: Record<string, string> = {};
  hasil['Nomor'] = String(b.nomor);
  hasil['Bentuk'] = LABEL_BENTUK[b.bentuk] ?? b.bentuk;
  hasil['Stimulus'] = b.stimulus ?? '';
  hasil['Pertanyaan'] = b.pertanyaan;
  (['OpsiA', 'OpsiB', 'OpsiC', 'OpsiD', 'OpsiE'] as const).forEach((k, i) => {
    hasil[k] = b.opsi?.[i] ?? '';
  });
  hasil['Pasangan'] = (b.pasangan ?? []).map(p => `${p.kiri}=${p.kanan}`).join('; ');
  hasil['Kunci'] = b.kunci;
  hasil['Pembahasan'] = b.pembahasan;
  hasil['LevelKognitif'] = b.levelKognitif;
  hasil['Indikator'] = b.indikator;
  hasil['Rubrik'] = (b.rubrik ?? []).map(r => `${r.skor}:${r.deskriptor}`).join('; ');
  return hasil;
}

/** Ambil teks sel (toleran terhadap angka/tanggal Excel). */
function teksSel(sel: ExcelJS.Cell): string {
  const v = sel.value;
  if (v === null || v === undefined) return '';
  if (typeof sel.text === 'string' && sel.text.trim()) return sel.text.trim();
  if (typeof v === 'object' && 'richText' in v) return '';
  return String(v).trim();
}

export interface HasilImpor {
  items: ButirSoal[];
  errors: string[];
}

/**
 * Impor bank soal dari buffer .xlsx. Baris valid tetap diimpor, baris yang
 * gagal dikonversi/dalidasi dilaporkan di errors (tidak menggagalkan total).
 */
export async function imporXlsx(buffer: ArrayBuffer): Promise<HasilImpor> {
  const items: ButirSoal[] = [];
  const errors: string[] = [];

  const wb = new ExcelJS.Workbook();
  try {
    // Konversi ArrayBuffer → Buffer node agar cocok dengan signature exceljs
    // (cast via never: exceljs mengetik ulang Buffer dengan generic lama).
    await wb.xlsx.load(Buffer.from(buffer) as never);
  } catch {
    return { items, errors: ['Berkas tidak dapat dibaca sebagai .xlsx. Pastikan file berformat Excel (.xlsx).'] };
  }
  const ws = wb.worksheets[0];
  if (!ws) return { items, errors: ['Berkas XLSX tidak memiliki sheet.'] };

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (sel, col) => {
    headers[col - 1] = teksSel(sel);
  });
  if (headers.filter(h => h).length === 0) {
    return { items, errors: ['Baris pertama (header) kosong — tidak ada kolom yang dikenali.'] };
  }

  const pemetaan = petakanKolom(headers);
  const hilang = KOLOM_WAJIB.filter(k => pemetaan[k] === undefined);
  if (hilang.length > 0) {
    return {
      items,
      errors: [`Kolom wajib tidak ditemukan di baris header: ${hilang.join(', ')}. Gunakan "Unduh Template" untuk format yang benar.`],
    };
  }

  const idxOpsiGabung = pemetaan['Opsi'];

  ws.eachRow((row, noBaris) => {
    if (noBaris === 1) return;
    const baris: Record<string, string> = {};
    for (const k of KOLOM_KANONIS) {
      const idx = pemetaan[k];
      if (idx !== undefined) baris[k] = teksSel(row.getCell(idx + 1));
    }
    if (idxOpsiGabung !== undefined) {
      const isi = teksSel(row.getCell(idxOpsiGabung + 1));
      isi.split('|').map(rapi).forEach((v, i) => {
        baris[`Opsi${'ABCDE'[i]}`] = v;
      });
    }
    // Lewati baris yang seluruhnya kosong.
    if (Object.values(baris).every(v => !v)) return;

    const { butir, errors: e } = barisKeButir(baris, noBaris);
    if (butir) {
      butir.nomor = items.length + 1; // nomor urut hasil impor
      items.push(butir);
    }
    errors.push(...e);
  });

  if (items.length === 0 && errors.length === 0) {
    errors.push('Tidak ada baris data yang bisa diimpor (selain header).');
  }
  return { items, errors };
}

/** Lebar kolom ekspor (sesuai kolom kanonis). */
const LEBAR_KOLOM: Record<string, number> = {
  Nomor: 7, Bentuk: 20, Stimulus: 40, Pertanyaan: 55,
  OpsiA: 30, OpsiB: 30, OpsiC: 30, OpsiD: 30, OpsiE: 30,
  Pasangan: 40, Kunci: 18, Pembahasan: 55, LevelKognitif: 10, Indikator: 40, Rubrik: 55,
};

const FONT_SANS = 'Calibri';

/** Terapkan gaya header + lebar kolom pada sheet bank soal. */
function gayaSheet(ws: ExcelJS.Worksheet): void {
  const header = ws.getRow(1);
  header.eachCell(cell => {
    cell.font = { name: FONT_SANS, size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E74B5' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  header.height = 26;
  ws.columns = KOLOM_KANONIS.map(k => ({ header: k, width: LEBAR_KOLOM[k] ?? 25 }));
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  ws.autoFilter = { from: 'A1', to: 'O1' };
}

/**
 * Bangun workbook bank soal dari daftar butir (tanpa DOM) — titik masuk
 * untuk pengujian node maupun ekspor browser.
 */
export async function bangunWorkbookBankSoal(items: ButirSoal[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Ruang Guru Merdeka';
  wb.created = new Date();
  const ws = wb.addWorksheet('Bank Soal', { properties: { tabColor: { argb: 'FF2E74B5' } } });

  ws.addRow([...KOLOM_KANONIS]);
  for (const b of items) {
    const baris = butirKeBaris(b);
    ws.addRow(KOLOM_KANONIS.map(k => baris[k] ?? ''));
  }
  gayaSheet(ws);

  // Bungkus teks kolom panjang agar terbaca.
  ws.eachRow((row, no) => {
    if (no === 1) return;
    row.eachCell(cell => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.font = { name: FONT_SANS, size: 10 };
    });
  });
  return wb;
}

/** Ekspor daftar butir sebagai Blob .xlsx (client-side, via writeBuffer). */
export async function eksporXlsx(items: ButirSoal[]): Promise<Blob> {
  const wb = await bangunWorkbookBankSoal(items);
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: TIPE_XLSX });
}

/** Dua baris contoh untuk template: 1 PG biasa + 1 uraian berubrik. */
function contohTemplate(): ButirSoal[] {
  return [
    {
      nomor: 1,
      bentuk: 'pg_biasa',
      pertanyaan: 'Perangkat lunak yang berfungsi menerjemahkan perintah pengguna menjadi bahasa mesin disebut...',
      opsi: ['Aplikasi', 'Sistem operasi', 'Driver', 'Antivirus'],
      kunci: 'B',
      pembahasan: 'Sistem operasi menjembatani pengguna dan perangkat keras dengan menerjemahkan perintah ke bahasa mesin.',
      levelKognitif: 'C2',
      indikator: 'Menjelaskan fungsi sistem operasi pada komputer.',
    },
    {
      nomor: 2,
      bentuk: 'uraian',
      pertanyaan: 'Jelaskan perbedaan antara memori RAM dan ROM beserta contoh penggunaannya dalam kehidupan sehari-hari!',
      kunci: 'RAM bersifat sementara (volatile) untuk data yang sedang diproses; ROM bersifat permanen untuk firmware/perintah dasar perangkat.',
      pembahasan: 'Jawaban dinilai dari ketepatan konsep volatile vs non-volatile dan relevansi contohnya.',
      levelKognitif: 'C4',
      indikator: 'Menganalisis perbedaan jenis memori komputer.',
      rubrik: [
        { skor: 1, deskriptor: 'Menyebutkan satu jenis memori dengan benar tetapi tanpa penjelasan.' },
        { skor: 2, deskriptor: 'Menjelaskan perbedaan RAM dan ROM dengan benar tetapi contoh kurang tepat.' },
        { skor: 3, deskriptor: 'Menjelaskan perbedaan dengan tepat disertai contoh penggunaan yang relevan.' },
      ],
    },
  ];
}

/** Bangun workbook template (header + 2 baris contoh). */
export async function bangunWorkbookTemplate(): Promise<ExcelJS.Workbook> {
  return bangunWorkbookBankSoal(contohTemplate());
}

/** Unduh template .xlsx sebagai Blob (client-side). */
export async function templateXlsx(): Promise<Blob> {
  const wb = await bangunWorkbookTemplate();
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: TIPE_XLSX });
}

/** Ringkasan distribusi bentuk untuk tampilan hasil impor. */
export function hitungDistribusiBentuk(items: ButirSoal[]): Record<BentukSoal, number> {
  const hasil = { pg_biasa: 0, pg_kompleks: 0, menjodohkan: 0, isian: 0, uraian: 0 } as Record<BentukSoal, number>;
  for (const it of items) {
    if ((DAFTAR_BENTUK as string[]).includes(it.bentuk)) hasil[it.bentuk] += 1;
  }
  return hasil;
}

/** Daftar level valid untuk pesan bantuan UI. */
export function daftarLevelValid(): string {
  return DAFTAR_KOGNITIF.join(', ');
}
