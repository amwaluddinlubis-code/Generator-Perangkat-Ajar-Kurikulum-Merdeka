/**
 * templateForm.ts — Template Form (F3-3 roadmap RGM, "Template form JSON").
 *
 * Level TEMPLATE FORM = isi form generator (GeneratorForm) yang bisa disimpan,
 * dimuat, diekspor, dan diimpor sebagai JSON. BERBEDA dari "Perpustakaan
 * Sekolah" (dokumen JADI yang sudah digenerate) — jangan dicampur.
 *
 * Modul MURNI: tanpa dependency node/browser/DOM. Dipakai bersama oleh:
 *  - klien (vite): serialisasi state form, validasi impor, template contoh
 *  - test (tsx): unit test fungsi-fungsi di bawah (tanpa memanggil AI)
 *
 * Penyimpanan template milik guru: localStorage browser dengan kunci
 * `rgm-template-form` (array TemplateForm). Template contoh (TEMPLATE_CONTOH)
 * selalu tersedia tanpa perlu disimpan.
 */

import type { DocType } from '@/src/types/index.ts';

/** Versi skema template form yang didukung saat ini. */
export const SKEMA_TEMPLATE_V1 = 'rgm-template-v1';

/** Daftar skema yang dikenal — versi tak dikenal DITOLAK dengan pesan jelas. */
export const SKEMA_TEMPLATE_DIKENAL: string[] = [SKEMA_TEMPLATE_V1];

/** DocType yang sah untuk sebuah template form. */
export const DOCTYPE_TEMPLATE_VALID: DocType[] = [
  'modul_ajar',
  'rpp',
  'soal_ujian',
  'kktp_atp',
  'lkpd',
  'prota_promes',
  'modul_p5',
];

/**
 * Satu template form: nama + deskripsi + seluruh isi form generator
 * (state) yang terserialisasi. Identitas (schoolName/authorName/nip) boleh
 * kosong — TIDAK PERNAH diisi identitas dummy.
 */
export interface TemplateForm {
  skemaVersi: string;
  docType: DocType;
  nama: string;
  deskripsi?: string;
  state: Record<string, unknown>;
  dibuatPada: string; // ISO 8601, mis. 2026-10-17T02:00:00.000Z
}

/**
 * Kunci state form GeneratorForm yang boleh diserialisasi. Kunci di luar
 * daftar ini (mis. fungsi, data internal UI) dibuang oleh serialisasiState.
 */
export const KUNCI_FORM_DIKENAL = [
  'docType',
  'jenjang',
  'fase',
  'tingkat',
  'mataPelajaran',
  'customMapel',
  'topik',
  'alokasiWaktu',
  'modelPembelajaran',
  'targetPeserta',
  'dimensiProfilLulusan',
  'komposisiSoal',
  'levelKognitif',
  'komposisiKognitif',
  'lkpdTiered',
  'temaP5',
  'isuKontekstual',
  'bentukAksi',
  'sistemWaktu',
  'mitraProjek',
  'schoolName',
  'authorName',
  'nip',
] as const;

/**
 * Serialisasi state form menjadi objek JSON murni: hanya kunci yang dikenal,
 * tanpa fungsi dan tanpa undefined. Hasilnya aman untuk JSON.stringify /
 * localStorage / unduh file.
 */
export function serialisasiState(s: Record<string, unknown>): Record<string, unknown> {
  const hasil: Record<string, unknown> = {};
  for (const k of KUNCI_FORM_DIKENAL) {
    if (!(k in s)) continue;
    const v = s[k];
    if (v === undefined || typeof v === 'function') continue;
    hasil[k] = v;
  }
  // Putaran JSON memastikan tidak ada referensi bersama & hanya nilai JSON murni.
  return JSON.parse(JSON.stringify(hasil)) as Record<string, unknown>;
}

const KUNCI_KOMPOSISI_SOAL = ['pg_biasa', 'pg_kompleks', 'menjodohkan', 'isian', 'uraian'] as const;
const KUNCI_KOGNITIF = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] as const;

function adalahAngkaNonNegatif(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

function validasiKomposisiSoal(v: unknown, errors: string[]): void {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    errors.push(
      'Template soal_ujian wajib menyertakan "komposisiSoal" berupa objek ' +
        '{ pg_biasa, pg_kompleks, menjodohkan, isian, uraian }.'
    );
    return;
  }
  const o = v as Record<string, unknown>;
  let total = 0;
  for (const k of KUNCI_KOMPOSISI_SOAL) {
    if (!adalahAngkaNonNegatif(o[k])) {
      errors.push(`komposisiSoal.${k} harus berupa angka ≥ 0.`);
    } else {
      total += o[k] as number;
    }
  }
  if (total < 1) errors.push('komposisiSoal: total butir soal minimal 1.');
}

function validasiOpsional(s: Record<string, unknown>, errors: string[]): void {
  const kk = s.komposisiKognitif;
  if (kk !== undefined) {
    if (typeof kk !== 'object' || kk === null || Array.isArray(kk)) {
      errors.push('komposisiKognitif harus berupa objek { C1..C6 }.');
    } else {
      for (const k of KUNCI_KOGNITIF) {
        if (!adalahAngkaNonNegatif((kk as Record<string, unknown>)[k])) {
          errors.push(`komposisiKognitif.${k} harus berupa angka ≥ 0.`);
        }
      }
    }
  }
  const dpl = s.dimensiProfilLulusan;
  if (dpl !== undefined) {
    if (!Array.isArray(dpl) || !dpl.every((x) => typeof x === 'string')) {
      errors.push('dimensiProfilLulusan harus berupa array string.');
    }
  }
  const lt = s.lkpdTiered;
  if (lt !== undefined && typeof lt !== 'boolean') {
    errors.push('lkpdTiered harus berupa boolean (true/false).');
  }
  const j = s.jenjang;
  if (j !== undefined && j !== 'SD' && j !== 'SMP' && j !== 'SMA' && j !== 'SMK') {
    errors.push('jenjang harus salah satu dari: SD, SMP, SMA, SMK.');
  }
}

function wajibTeks(s: Record<string, unknown>, kunci: string, label: string, errors: string[]): void {
  const v = s[kunci];
  if (typeof v !== 'string' || !v.trim()) {
    errors.push(`Field "${label}" wajib diisi (tidak boleh kosong).`);
  }
}

function validasiStatePerDocType(docType: DocType, s: Record<string, unknown>, errors: string[]): void {
  switch (docType) {
    case 'soal_ujian':
      validasiKomposisiSoal(s.komposisiSoal, errors);
      wajibTeks(s, 'topik', 'topik', errors);
      wajibTeks(s, 'mataPelajaran', 'mataPelajaran', errors);
      break;
    case 'modul_p5':
      wajibTeks(s, 'topik', 'topik (judul projek)', errors);
      wajibTeks(s, 'temaP5', 'temaP5', errors);
      break;
    case 'modul_ajar':
    case 'rpp':
    case 'lkpd':
    case 'kktp_atp':
    case 'prota_promes':
      wajibTeks(s, 'topik', 'topik', errors);
      wajibTeks(s, 'mataPelajaran', 'mataPelajaran', errors);
      break;
  }
  validasiOpsional(s, errors);
}

/**
 * Validasi sebuah objek template (hasil impor JSON / dari localStorage).
 * Mengembalikan { valid, errors } dengan pesan Bahasa Indonesia yang jelas.
 */
export function validasiTemplate(obj: unknown): { valid: boolean; errors: string[] } {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return { valid: false, errors: ['Template harus berupa objek JSON (bukan array/teks/angka).'] };
  }
  const o = obj as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof o.skemaVersi !== 'string' || !SKEMA_TEMPLATE_DIKENAL.includes(o.skemaVersi)) {
    errors.push(
      `skemaVersi tidak dikenal: ${JSON.stringify(o.skemaVersi ?? null)}. ` +
        `Versi yang didukung aplikasi ini: ${SKEMA_TEMPLATE_DIKENAL.join(', ')}. ` +
        `File ini mungkin dibuat oleh versi RGM yang lebih baru — perbarui aplikasi lalu coba lagi.`
    );
  }
  if (typeof o.nama !== 'string' || !o.nama.trim()) {
    errors.push('nama template wajib diisi (string tidak kosong).');
  }
  if (typeof o.docType !== 'string' || !DOCTYPE_TEMPLATE_VALID.includes(o.docType as DocType)) {
    errors.push(
      `docType tidak valid: ${JSON.stringify(o.docType ?? null)}. ` +
        `Nilai yang sah: ${DOCTYPE_TEMPLATE_VALID.join(', ')}.`
    );
  }
  if (typeof o.dibuatPada !== 'string' || !o.dibuatPada.trim()) {
    errors.push('dibuatPada wajib berupa string tanggal ISO (mis. 2026-10-17T02:00:00.000Z).');
  }
  const st = o.state;
  if (typeof st !== 'object' || st === null || Array.isArray(st)) {
    errors.push('state wajib berupa objek berisi field-field form generator.');
  } else if (typeof o.docType === 'string' && DOCTYPE_TEMPLATE_VALID.includes(o.docType as DocType)) {
    validasiStatePerDocType(o.docType as DocType, st as Record<string, unknown>, errors);
  }

  return { valid: errors.length === 0, errors };
}

/** Bungkus state contoh menjadi TemplateForm yang sudah tervalidasi. */
function buatContoh(
  nama: string,
  deskripsi: string,
  docType: DocType,
  state: Record<string, unknown>
): TemplateForm {
  const t: TemplateForm = {
    skemaVersi: SKEMA_TEMPLATE_V1,
    docType,
    nama,
    deskripsi,
    state: serialisasiState(state),
    dibuatPada: '2026-10-17T00:00:00.000Z',
  };
  const hasil = validasiTemplate(t);
  if (!hasil.valid) {
    throw new Error(`Template contoh "${nama}" tidak valid: ${hasil.errors.join(' | ')}`);
  }
  return t;
}

/**
 * 4 template contoh terisi penuh & realistis. Semuanya lolos validasiTemplate.
 * Identitas sekolah/guru sengaja dikosongkan (aturan keras: tanpa identitas dummy).
 */
export const TEMPLATE_CONTOH: TemplateForm[] = [
  buatContoh(
    'Soal Ujian Informatika Kelas 8 — Berpikir Komputasional',
    'Paket soal 15 butir (PG, PG Kompleks AKM, Menjodohkan, Isian, Uraian) dengan sebaran kognitif C1–C6 untuk asesmen sumatif Informatika SMP kelas 8.',
    'soal_ujian',
    {
      docType: 'soal_ujian',
      jenjang: 'SMP',
      fase: 'Fase D',
      tingkat: 'Kelas 8',
      mataPelajaran: 'Informatika',
      customMapel: '',
      topik: 'Berpikir Komputasional: Algoritma, Struktur Data Sederhana, dan Pemrograman Blok',
      alokasiWaktu: '2 JP (2 x 40 Menit) - 1 Pertemuan',
      modelPembelajaran: 'Problem Based Learning (PBL)',
      targetPeserta: 'Peserta didik reguler kelas 8 yang sudah mengenal dasar pemrograman blok (Scratch)',
      dimensiProfilLulusan: ['Penalaran Kritis', 'Kemandirian', 'Kreativitas'],
      komposisiSoal: { pg_biasa: 5, pg_kompleks: 3, menjodohkan: 2, isian: 2, uraian: 3 },
      levelKognitif: 'Kombinasi MOTS & HOTS (C3-C5)',
      komposisiKognitif: { C1: 1, C2: 2, C3: 3, C4: 3, C5: 4, C6: 2 },
      lkpdTiered: false,
      temaP5: 'Gaya Hidup Berkelanjutan',
      isuKontekstual: '',
      bentukAksi: 'Gelar Karya & Pameran Projek Komunitas Sekolah',
      sistemWaktu: 'Sistem Terjadwal Berkala (1 Hari per Minggu)',
      mitraProjek: '',
      schoolName: '',
      authorName: '',
      nip: '',
    }
  ),
  buatContoh(
    'Modul Ajar IPAS Kelas 4 — Siklus Air',
    'Modul ajar PBL tentang siklus air dan pengaruhnya bagi kehidupan untuk IPAS SD kelas 4 (Fase B).',
    'modul_ajar',
    {
      docType: 'modul_ajar',
      jenjang: 'SD',
      fase: 'Fase B',
      tingkat: 'Kelas 4',
      mataPelajaran: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
      customMapel: '',
      topik: 'Siklus Air dan Pengaruhnya bagi Kehidupan',
      alokasiWaktu: '2 JP (2 x 35 Menit) - 1 Pertemuan',
      modelPembelajaran: 'Problem Based Learning (PBL)',
      targetPeserta: 'Peserta didik reguler kelas 4 dengan diferensiasi gaya belajar visual, auditori, dan kinestetik',
      dimensiProfilLulusan: ['Penalaran Kritis', 'Kolaborasi', 'Komunikasi'],
      levelKognitif: 'Kombinasi MOTS & HOTS (C3-C5)',
      lkpdTiered: false,
      temaP5: 'Gaya Hidup Berkelanjutan',
      isuKontekstual: '',
      bentukAksi: 'Gelar Karya & Pameran Projek Komunitas Sekolah',
      sistemWaktu: 'Sistem Terjadwal Berkala (1 Hari per Minggu)',
      mitraProjek: '',
      schoolName: '',
      authorName: '',
      nip: '',
    }
  ),
  buatContoh(
    'RPP Matematika Kelas 7 — Bilangan Bulat',
    'RPP ringkas 1–2 lembar tentang operasi hitung bilangan bulat untuk Matematika SMP kelas 7 (Fase D).',
    'rpp',
    {
      docType: 'rpp',
      jenjang: 'SMP',
      fase: 'Fase D',
      tingkat: 'Kelas 7',
      mataPelajaran: 'Matematika',
      customMapel: '',
      topik: 'Bilangan Bulat: Operasi Hitung dan Sifat-sifatnya',
      alokasiWaktu: '2 JP (2 x 40 Menit) - 1 Pertemuan',
      modelPembelajaran: 'Problem Based Learning (PBL)',
      targetPeserta: 'Peserta didik reguler kelas 7, sebagian masih perlu penguatan konsep bilangan negatif',
      dimensiProfilLulusan: ['Penalaran Kritis', 'Kemandirian', 'Kolaborasi'],
      levelKognitif: 'Kombinasi MOTS & HOTS (C3-C5)',
      lkpdTiered: false,
      temaP5: 'Gaya Hidup Berkelanjutan',
      isuKontekstual: '',
      bentukAksi: 'Gelar Karya & Pameran Projek Komunitas Sekolah',
      sistemWaktu: 'Sistem Terjadwal Berkala (1 Hari per Minggu)',
      mitraProjek: '',
      schoolName: '',
      authorName: '',
      nip: '',
    }
  ),
  buatContoh(
    'LKPD Bahasa Indonesia Kelas 5 — Teks Deskripsi (3 Tingkat)',
    'LKPD diferensiasi 3 tingkat (Perintis, Reguler, Mahir) untuk menulis teks deskripsi tentang lingkungan sekolah, Bahasa Indonesia SD kelas 5.',
    'lkpd',
    {
      docType: 'lkpd',
      jenjang: 'SD',
      fase: 'Fase C',
      tingkat: 'Kelas 5',
      mataPelajaran: 'Bahasa Indonesia',
      customMapel: '',
      topik: 'Menulis Teks Deskripsi tentang Lingkungan Sekolah',
      alokasiWaktu: '2 JP (2 x 35 Menit) - 1 Pertemuan',
      modelPembelajaran: 'Discovery Learning (DL)',
      targetPeserta: 'Peserta didik kelas 5 dengan kemampuan menulis beragam — perlu diferensiasi 3 tingkat',
      dimensiProfilLulusan: ['Kreativitas', 'Komunikasi', 'Kemandirian'],
      levelKognitif: 'Kombinasi MOTS & HOTS (C3-C5)',
      lkpdTiered: true,
      temaP5: 'Gaya Hidup Berkelanjutan',
      isuKontekstual: '',
      bentukAksi: 'Gelar Karya & Pameran Projek Komunitas Sekolah',
      sistemWaktu: 'Sistem Terjadwal Berkala (1 Hari per Minggu)',
      mitraProjek: '',
      schoolName: '',
      authorName: '',
      nip: '',
    }
  ),
];
