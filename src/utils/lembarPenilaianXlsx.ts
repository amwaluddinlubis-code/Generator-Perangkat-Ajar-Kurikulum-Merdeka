// ============================================================
// 🧾 lembarPenilaianXlsx.ts — Ekspor Lembar Penilaian KKTP ke .xlsx
//
// Dibangun 100% client-side: exceljs menulis workbook di memori,
// lalu browser mengunduhnya via <a download>. Tanpa server, tanpa DOM
// untuk pembuatan workbook — sehingga bisa dites pakai node murni.
//
// Dipakai oleh:
//   - DocumentViewer.tsx  → tombol "📊 Unduh Lembar Penilaian (.xlsx)"
//     (hanya untuk dokumen bertipe KKTP / ATP)
//   - PaketWorkspace.tsx  → kartu dokumen KKTP (opsional, koordinator yang pasang)
//
// Rumus otomatis di kolom "Interval Ketercapaian" & "Rekomendasi":
//   Interval    = IF(Skor="","",IF(Skor<61,"Baru Berkembang",IF(Skor<=75,"Layak",IF(Skor<=85,"Cakap","Mahir"))))
//   Rekomendasi = IF(Skor="","",IF(Skor<61,"Remedial — bimbingan intensif",
//                   IF(Skor<=75,"Remedial sebagian — latihan tambahan",
//                   IF(Skor<=85,"Tuntas — lanjut materi berikutnya","Tuntas — beri pengayaan"))))
//
// Sesuai pendekatan Interval Nilai KKTP di server.ts (prompt KKTP/ATP):
//   0–60: perlu bimbingan/remedial · 61–75: belum tuntas sebagian/remedial
//   76–85: tuntas · 86–100: melampaui/pengayaan
// ============================================================

import ExcelJS from 'exceljs';

/** Opsi pembuatan lembar penilaian KKTP. */
export interface LembarPenilaianOpts {
  /** Judul dokumen, dipakai di judul sheet & nama file. */
  judulDokumen: string;
  /** Nama mata pelajaran (mis. "Matematika"). */
  mataPelajaran: string;
  /** Kelas (mis. "VII-A"). */
  kelas: string;
  /** Nama sekolah — opsional. */
  sekolah?: string;
  /**
   * Matriks rubrik kustom: tiap baris = [aspek, baruBerkembang, layak, cakap, mahir].
   * Bila tidak diberikan, dipakai deskriptor generik yang masuk akal.
   */
  rubrik?: string[][];
}

const WARNA_HEADER = 'FF2E74B5'; // biru dinas
const WARNA_JUDUL = 'FF1F3864'; // biru tua
const BORDER_TIPIS: ExcelJS.Borders = {
  top: { style: 'thin', color: { argb: 'FF9AA0A6' } },
  bottom: { style: 'thin', color: { argb: 'FF9AA0A6' } },
  left: { style: 'thin', color: { argb: 'FF9AA0A6' } },
  right: { style: 'thin', color: { argb: 'FF9AA0A6' } },
  diagonal: {}
};

const FONT_SANS = 'Calibri';

/** Sanitasi nama file — pola yang sama dengan exportUtils.ts. */
function bersihkanNamaFile(judul: string): string {
  return (judul.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'Lembar_Nilai_KKTP').slice(0, 80);
}

/** Deskriptor rubrik generik 4 tingkat (dipakai bila opts.rubrik tak diisi). */
function rubrikGenerik(): string[][] {
  return [
    [
      'Pengetahuan (Kognitif)',
      'Menunjukkan pemahaman awal yang masih parsial; perlu dibantu guru untuk menjelaskan kembali konsep pokok.',
      'Memahami sebagian besar konsep; masih ada kekeliruan kecil yang bisa diperbaiki dengan latihan.',
      'Memahami konsep secara utuh dan mampu menjelaskan ulang dengan bahasa sendiri secara benar.',
      'Menguasai konsep secara mendalam dan mampu menerapkannya pada konteks atau masalah baru.'
    ],
    [
      'Keterampilan (Psikomotor)',
      'Melaksanakan langkah kerja dengan banyak bantuan; hasil belum sesuai prosedur yang benar.',
      'Melaksanakan langkah kerja dengan sedikit bantuan; sebagian hasil sesuai prosedur.',
      'Melaksanakan langkah kerja secara mandiri sesuai prosedur dengan hasil yang tepat.',
      'Melaksanakan langkah kerja secara mandiri, tepat, dan efisien; mampu memperbaiki kesalahan sendiri.'
    ],
    [
      'Sikap (Afektif)',
      'Jarang menunjukkan perilaku yang diharapkan (mis. tanggung jawab, kerja sama); perlu pendampingan khusus.',
      'Kadang-kadang menunjukkan perilaku yang diharapkan; belum konsisten.',
      'Konsisten menunjukkan perilaku yang diharapkan dalam berbagai situasi pembelajaran.',
      'Menjadi teladan bagi teman; menunjukkan inisiatif dan kepedulian tanpa diminta.'
    ]
  ];
}

const TABEL_INTERVAL: string[][] = [
  ['0 – 60', 'Baru Berkembang', 'Remedial menyeluruh — bimbingan intensif'],
  ['61 – 75', 'Layak', 'Remedial sebagian — latihan tambahan'],
  ['76 – 85', 'Cakap', 'Tuntas — lanjut ke materi berikutnya'],
  ['86 – 100', 'Mahir', 'Tuntas — beri tantangan pengayaan']
];

/**
 * Membangun workbook exceljs (tanpa DOM) — titik masuk untuk pengujian node.
 * Mengembalikan workbook yang siap di-writeBuffer().
 */
export async function buildWorkbook(opts: LembarPenilaianOpts): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Ruang Guru Merdeka';
  wb.created = new Date();

  // ================= SHEET 1: Lembar Nilai =================
  const ws = wb.addWorksheet('Lembar Nilai', {
    properties: { tabColor: { argb: WARNA_HEADER } }
  });

  // --- Judul + info identitas ---
  ws.mergeCells('A1:E1');
  const judulCell = ws.getCell('A1');
  judulCell.value = 'LEMBAR PENILAIAN — KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)';
  judulCell.font = { name: FONT_SANS, size: 13, bold: true, color: { argb: WARNA_JUDUL } };
  judulCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  const infoBaris: Array<[string, string]> = [
    ['Judul Dokumen', opts.judulDokumen || '—'],
    ['Mata Pelajaran', opts.mataPelajaran || '—'],
    ['Kelas', opts.kelas || '—'],
    ['Sekolah', opts.sekolah || '—']
  ];
  infoBaris.forEach(([label, nilai], idx) => {
    const r = idx + 2;
    ws.getCell(`A${r}`).value = label;
    ws.getCell(`A${r}`).font = { name: FONT_SANS, size: 10, bold: true };
    ws.getCell(`B${r}`).value = `: ${nilai}`;
    ws.getCell(`B${r}`).font = { name: FONT_SANS, size: 10 };
    ws.mergeCells(`B${r}:E${r}`);
  });
  ws.getRow(6).height = 8; // pemisah

  // --- Header tabel ---
  const HEADER_ROW = 7;
  const headers = ['No', 'Nama Peserta Didik', 'Skor (0–100)', 'Interval Ketercapaian', 'Rekomendasi Tindak Lanjut'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(HEADER_ROW, i + 1);
    cell.value = h;
    cell.font = { name: FONT_SANS, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA_HEADER } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = BORDER_TIPIS;
  });
  ws.getRow(HEADER_ROW).height = 30;

  // --- 30 baris nama siap isi ---
  const JUMLAH_SISWA = 30;
  for (let n = 1; n <= JUMLAH_SISWA; n++) {
    const r = HEADER_ROW + n;
    const refSkor = `C${r}`;

    const cNo = ws.getCell(r, 1);
    cNo.value = n;
    cNo.font = { name: FONT_SANS, size: 10 };
    cNo.alignment = { horizontal: 'center', vertical: 'middle' };
    cNo.border = BORDER_TIPIS;

    const cNama = ws.getCell(r, 2);
    cNama.font = { name: FONT_SANS, size: 10 };
    cNama.alignment = { vertical: 'middle' };
    cNama.border = BORDER_TIPIS;

    const cSkor = ws.getCell(r, 3);
    cSkor.numFmt = '0';
    cSkor.font = { name: FONT_SANS, size: 10, bold: true, color: { argb: WARNA_JUDUL } };
    cSkor.alignment = { horizontal: 'center', vertical: 'middle' };
    cSkor.border = BORDER_TIPIS;

    const cInterval = ws.getCell(r, 4);
    cInterval.value = {
      formula: `IF(${refSkor}="","",IF(${refSkor}<61,"Baru Berkembang",IF(${refSkor}<=75,"Layak",IF(${refSkor}<=85,"Cakap","Mahir"))))`
    };
    cInterval.font = { name: FONT_SANS, size: 10 };
    cInterval.alignment = { horizontal: 'center', vertical: 'middle' };
    cInterval.border = BORDER_TIPIS;

    const cRekom = ws.getCell(r, 5);
    cRekom.value = {
      formula: `IF(${refSkor}="","",IF(${refSkor}<61,"Remedial — bimbingan intensif",IF(${refSkor}<=75,"Remedial sebagian — latihan tambahan",IF(${refSkor}<=85,"Tuntas — lanjut materi berikutnya","Tuntas — beri pengayaan"))))`
    };
    cRekom.font = { name: FONT_SANS, size: 10 };
    cRekom.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cRekom.border = BORDER_TIPIS;

    ws.getRow(r).height = 20;
  }

  // --- Validasi input: skor harus bilangan bulat 0–100 ---
  // (API dataValidations tidak ada di typing exceljs 4.4.0, tapi didukung runtime)
  const wsAny = ws as unknown as {
    dataValidations: { add: (addr: string, v: Record<string, unknown>) => void };
  };
  wsAny.dataValidations.add(`C${HEADER_ROW + 1}:C${HEADER_ROW + JUMLAH_SISWA}`, {
    type: 'whole',
    operator: 'between',
    formulae: [0, 100],
    showInputMessage: true,
    promptTitle: 'Skor KKTP',
    prompt: 'Isi skor antara 0 sampai 100. Kolom Interval & Rekomendasi terisi otomatis.',
    showErrorMessage: true,
    errorTitle: 'Skor tidak valid',
    error: 'Skor harus bilangan bulat antara 0 dan 100.'
  });

  // --- Lebar kolom, freeze header, setup cetak ---
  ws.columns = [
    { width: 5 }, // A: No
    { width: 32 }, // B: Nama — cukup lebar buat nama panjang ✨
    { width: 14 }, // C: Skor
    { width: 20 }, // D: Interval
    { width: 36 } // E: Rekomendasi
  ];
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: HEADER_ROW }];
  ws.pageSetup.orientation = 'landscape';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;
  ws.pageSetup.margins = {
    left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3
  };

  // ================= SHEET 2: Rubrik KKTP =================
  const wr = wb.addWorksheet('Rubrik KKTP', {
    properties: { tabColor: { argb: 'FF70AD47' } }
  });

  wr.mergeCells('A1:E1');
  const jRubrik = wr.getCell('A1');
  jRubrik.value = 'RUBRIK PENILAIAN KKTP — 4 SKALA PERKEMBANGAN';
  jRubrik.font = { name: FONT_SANS, size: 13, bold: true, color: { argb: WARNA_JUDUL } };
  jRubrik.alignment = { horizontal: 'center', vertical: 'middle' };
  wr.getRow(1).height = 28;

  const rubrikHeaders = ['Aspek yang Dinilai', 'Baru Berkembang', 'Layak', 'Cakap', 'Mahir'];
  const RUBRIK_HEADER_ROW = 3;
  rubrikHeaders.forEach((h, i) => {
    const cell = wr.getCell(RUBRIK_HEADER_ROW, i + 1);
    cell.value = h;
    cell.font = { name: FONT_SANS, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = BORDER_TIPIS;
  });
  wr.getRow(RUBRIK_HEADER_ROW).height = 32;

  const rubrikRows = opts.rubrik && opts.rubrik.length > 0 ? opts.rubrik : rubrikGenerik();
  rubrikRows.forEach((row, idx) => {
    const r = RUBRIK_HEADER_ROW + 1 + idx;
    for (let i = 0; i < 5; i++) {
      const cell = wr.getCell(r, i + 1);
      cell.value = row[i] ?? '';
      cell.font = {
        name: FONT_SANS,
        size: 10,
        bold: i === 0
      };
      cell.alignment = { vertical: 'top', wrapText: true, horizontal: 'left' };
      cell.border = BORDER_TIPIS;
    }
    wr.getRow(r).height = 60;
  });

  // --- Tabel interval nilai (acuan cepat) ---
  const afterRubrik = RUBRIK_HEADER_ROW + 2 + rubrikRows.length;
  wr.mergeCells(`A${afterRubrik}:E${afterRubrik}`);
  const jInterval = wr.getCell(`A${afterRubrik}`);
  jInterval.value = 'TABEL INTERVAL NILAI & TINDAK LANJUT';
  jInterval.font = { name: FONT_SANS, size: 11, bold: true, color: { argb: WARNA_JUDUL } };
  jInterval.alignment = { horizontal: 'center', vertical: 'middle' };

  const intervalHeaderRow = afterRubrik + 1;
  ['Rentang Skor', 'Interval Ketercapaian', 'Tindak Lanjut'].forEach((h, i) => {
    const cell = wr.getCell(intervalHeaderRow, i + 1);
    cell.value = h;
    cell.font = { name: FONT_SANS, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA_HEADER } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_TIPIS;
  });
  TABEL_INTERVAL.forEach((row, idx) => {
    const r = intervalHeaderRow + 1 + idx;
    row.forEach((val, i) => {
      const cell = wr.getCell(r, i + 1);
      cell.value = val;
      cell.font = { name: FONT_SANS, size: 10, bold: i === 1 };
      cell.alignment = { horizontal: i === 0 ? 'center' : 'left', vertical: 'middle' };
      cell.border = BORDER_TIPIS;
    });
    wr.getRow(r).height = 22;
  });

  wr.columns = [{ width: 24 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }];
  wr.views = [{ state: 'frozen', xSplit: 0, ySplit: RUBRIK_HEADER_ROW }];
  wr.pageSetup.orientation = 'landscape';
  wr.pageSetup.fitToPage = true;
  wr.pageSetup.fitToWidth = 1;
  wr.pageSetup.fitToHeight = 0;

  return wb;
}

/**
 * Mengunduh lembar penilaian KKTP sebagai berkas .xlsx.
 * 100% client-side: writeBuffer() → Blob → <a download>.
 */
export async function unduhLembarPenilaianXlsx(opts: LembarPenilaianOpts): Promise<void> {
  const workbook = await buildWorkbook(opts);
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const cleanTitle = bersihkanNamaFile(opts.judulDokumen);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanTitle} - Lembar Nilai KKTP.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
