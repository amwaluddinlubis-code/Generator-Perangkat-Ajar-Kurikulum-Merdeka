/**
 * Kontrak data terstruktur Paket Soal — FASE 1 roadmap RGM ("Paket soal terpercaya").
 *
 * Modul MURNI: tanpa dependency node/browser/DOM. Dipakai bersama oleh:
 *  - server (tsx): validasi, normalisasi, render markdown deterministik
 *  - klien (vite): parse, render terstruktur, edit inline, preset kognitif
 *  - test (tsx): unit test fungsi-fungsi di bawah (tanpa memanggil AI)
 *
 * Penyimpanan: VersiDokumen.content tetap string. Dokumen soal TERSTRUKTUR
 * disimpan sebagai: PENANDA_SOAL_V1 + '\n' + JSON(PaketSoalTerstruktur).
 * Dokumen lama (markdown polos, tanpa penanda) tetap dirender seperti dulu.
 */

export const PENANDA_SOAL_V1 = '<!--RGM-SOAL-V1-->';
export const FORMAT_SOAL_V1 = 'rgm-soal-v1';

export type BentukSoal = 'pg_biasa' | 'pg_kompleks' | 'menjodohkan' | 'isian' | 'uraian';

export const DAFTAR_BENTUK: BentukSoal[] = ['pg_biasa', 'pg_kompleks', 'menjodohkan', 'isian', 'uraian'];

export const LABEL_BENTUK: Record<BentukSoal, string> = {
  pg_biasa: 'Pilihan Ganda',
  pg_kompleks: 'PG Kompleks (AKM)',
  menjodohkan: 'Menjodohkan',
  isian: 'Isian Singkat',
  uraian: 'Uraian HOTS',
};

export type LevelKognitif = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export const DAFTAR_KOGNITIF: LevelKognitif[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];

export const LABEL_KOGNITIF: Record<LevelKognitif, string> = {
  C1: 'C1 Mengingat',
  C2: 'C2 Memahami',
  C3: 'C3 Mengaplikasikan',
  C4: 'C4 Menganalisis',
  C5: 'C5 Mengevaluasi',
  C6: 'C6 Mencipta',
};

export interface RubrikSkor {
  skor: number;
  deskriptor: string;
}

export interface PasanganJodoh {
  kiri: string;
  kanan: string;
}

export interface ButirSoal {
  nomor: number;
  bentuk: BentukSoal;
  /** Teks/data stimulus (opsional). Boleh dipakai beberapa butir berbagi stimulus yang sama. */
  stimulus?: string;
  pertanyaan: string;
  /** pg_biasa: 4–5 opsi; pg_kompleks: daftar pernyataan. */
  opsi?: string[];
  /** menjodohkan: pasangan kiri-kanan. */
  pasangan?: PasanganJodoh[];
  /**
   * Kunci jawaban. pg_biasa: huruf opsi ("B"). pg_kompleks: mis. "1-Benar, 2-Salah".
   * menjodohkan: mis. "1-B, 2-A". isian: teks jawaban. uraian: jawaban model.
   */
  kunci: string;
  /** Pembahasan pedagogis 1–2 kalimat: mengapa kunci itu benar. */
  pembahasan: string;
  levelKognitif: LevelKognitif;
  /** Indikator soal (untuk tabel kisi-kisi). */
  indikator: string;
  /** WAJIB untuk uraian: kriteria skor. */
  rubrik?: RubrikSkor[];
}

export interface IdentitasSoal {
  satuanPendidikan: string;
  mataPelajaran: string;
  kelas: string;
  fase: string;
  topik: string;
  waktu: string;
  guru: string;
}

export interface PaketSoalTerstruktur {
  format: 'rgm-soal-v1';
  identitas: IdentitasSoal;
  /** Komposisi bentuk yang DIMINTA guru (acuan validasi F1-5). */
  komposisiBentuk: Record<BentukSoal, number>;
  /** Komposisi kognitif yang DIMINTA guru (acuan ringkasan distribusi F1-4). */
  komposisiKognitif: Record<LevelKognitif, number>;
  items: ButirSoal[];
  /** true bila ada butir yang diubah manual guru via edit inline (F1-6). */
  diubahManual?: boolean;
  modelUsed?: string;
  generatedAt: string;
}

/** State komposisi kognitif di form (C1–C6). */
export interface KomposisiKognitifState {
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
  C6: number;
}

export type PresetKognitif = 'C1-C2' | 'C1-C4' | 'HOTS' | 'LENGKAP';

export const LABEL_PRESET_KOGNITIF: Record<PresetKognitif, string> = {
  'C1-C2': 'C1–C2 (Pemahaman dasar)',
  'C1-C4': 'C1–C4 (Sedang)',
  'HOTS': 'HOTS (C4–C6)',
  'LENGKAP': 'Lengkap (C1–C6)',
};

const LEVEL_PER_PRESET: Record<PresetKognitif, LevelKognitif[]> = {
  'C1-C2': ['C1', 'C2'],
  'C1-C4': ['C1', 'C2', 'C3', 'C4'],
  'HOTS': ['C4', 'C5', 'C6'],
  'LENGKAP': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
};

/**
 * Bagi total butir ke level kognitif sesuai preset. Pembagian sedatar mungkin;
 * sisa pembagian diberikan ke level TERTINGGI dulu (mengutamakan HOTS).
 * Total hasil SELALU = total (atau semua 0 bila total <= 0).
 */
export function bagiKomposisiPreset(preset: PresetKognitif, total: number): KomposisiKognitifState {
  const hasil: KomposisiKognitifState = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 };
  const levels = LEVEL_PER_PRESET[preset];
  const n = Math.max(0, Math.round(total) || 0);
  if (n === 0 || levels.length === 0) return hasil;
  const dasar = Math.floor(n / levels.length);
  let sisa = n % levels.length;
  for (const lv of levels) hasil[lv] = dasar;
  // Sisa ke level tertinggi dulu.
  for (let i = levels.length - 1; i >= 0 && sisa > 0; i--, sisa--) {
    hasil[levels[i]] += 1;
  }
  return hasil;
}

export function totalKognitif(k: KomposisiKognitifState): number {
  return DAFTAR_KOGNITIF.reduce((a, lv) => a + (Math.max(0, Math.round(Number(k[lv]) || 0))), 0);
}

/** Bungkus paket terstruktur menjadi string content VersiDokumen. */
export function bungkusSoalTerstruktur(p: PaketSoalTerstruktur): string {
  return `${PENANDA_SOAL_V1}\n${JSON.stringify(p)}`;
}

/** true bila content adalah dokumen soal terstruktur v1. */
export function adalahSoalTerstruktur(content: string): boolean {
  return typeof content === 'string' && content.startsWith(PENANDA_SOAL_V1);
}

/** Parse content menjadi PaketSoalTerstruktur; null bila bukan format valid. */
export function parseSoalTerstruktur(content: string): PaketSoalTerstruktur | null {
  if (!adalahSoalTerstruktur(content)) return null;
  try {
    const json = content.slice(PENANDA_SOAL_V1.length).trim();
    const p = JSON.parse(json) as PaketSoalTerstruktur;
    if (!p || p.format !== FORMAT_SOAL_V1 || !Array.isArray(p.items) || !p.identitas) return null;
    return p;
  } catch {
    return null;
  }
}

/**
 * Ambil objek JSON dari teks balasan AI (toleran terhadap code fence ```json
 * dan teks pengantar/penutup di sekitar JSON).
 */
export function ekstrakJsonDariTeks(teks: string): unknown {
  const bersih = String(teks || '').replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(bersih);
  } catch { /* lanjut ke strategi substring */ }
  const awal = bersih.indexOf('{');
  const akhir = bersih.lastIndexOf('}');
  if (awal >= 0 && akhir > awal) {
    try {
      return JSON.parse(bersih.slice(awal, akhir + 1));
    } catch { /* null di bawah */ }
  }
  return null;
}

export interface HasilValidasi {
  valid: boolean;
  errors: string[];
  perBentuk: Record<BentukSoal, number>;
  perKognitif: Record<LevelKognitif, number>;
}

function hitungDistribusi(items: ButirSoal[]): { perBentuk: Record<BentukSoal, number>; perKognitif: Record<LevelKognitif, number> } {
  const perBentuk = { pg_biasa: 0, pg_kompleks: 0, menjodohkan: 0, isian: 0, uraian: 0 } as Record<BentukSoal, number>;
  const perKognitif = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 } as Record<LevelKognitif, number>;
  for (const it of items) {
    if ((DAFTAR_BENTUK as string[]).includes(it.bentuk)) perBentuk[it.bentuk] += 1;
    if ((DAFTAR_KOGNITIF as string[]).includes(it.levelKognitif)) perKognitif[it.levelKognitif] += 1;
  }
  return { perBentuk, perKognitif };
}

/**
 * Validasi struktur paket soal (F1-1, F1-3, F1-5). TIDAK memeriksa kesesuaian
 * jumlah vs komposisi yang diminta — itu tugas hitungKekuranganBentuk().
 */
export function validasiPaketSoal(p: PaketSoalTerstruktur): HasilValidasi {
  const errors: string[] = [];
  if (!p || !Array.isArray(p.items) || p.items.length === 0) {
    return { valid: false, errors: ['Paket soal tidak memiliki butir soal.'], perBentuk: hitungDistribusi([]).perBentuk, perKognitif: hitungDistribusi([]).perKognitif };
  }
  p.items.forEach((it, i) => {
    const ctx = `Butir ${i + 1}`;
    if (!(DAFTAR_BENTUK as string[]).includes(it.bentuk)) {
      errors.push(`${ctx}: bentuk "${(it as { bentuk: unknown }).bentuk}" tidak dikenal.`);
      return;
    }
    if (!it.pertanyaan || !String(it.pertanyaan).trim()) errors.push(`${ctx}: pertanyaan kosong.`);
    if (!(DAFTAR_KOGNITIF as string[]).includes(it.levelKognitif)) {
      errors.push(`${ctx}: level kognitif "${(it as { levelKognitif: unknown }).levelKognitif}" tidak valid (harus C1–C6).`);
    }
    if (!it.indikator || !String(it.indikator).trim()) errors.push(`${ctx}: indikator kosong.`);
    if (!it.kunci || !String(it.kunci).trim()) errors.push(`${ctx}: kunci jawaban kosong.`);
    if (!it.pembahasan || !String(it.pembahasan).trim()) errors.push(`${ctx}: pembahasan kosong.`);
    if (it.bentuk === 'pg_biasa' || it.bentuk === 'pg_kompleks') {
      const opsi = (it.opsi || []).filter(o => o && String(o).trim());
      if (opsi.length < 2) errors.push(`${ctx}: opsi ${LABEL_BENTUK[it.bentuk]} kurang dari 2.`);
    }
    if (it.bentuk === 'menjodohkan') {
      const pas = (it.pasangan || []).filter(x => x && String(x.kiri).trim() && String(x.kanan).trim());
      if (pas.length < 2) errors.push(`${ctx}: pasangan menjodohkan kurang dari 2.`);
    }
    if (it.bentuk === 'uraian') {
      const rub = (it.rubrik || []).filter(r => r && Number(r.skor) > 0 && String(r.deskriptor).trim());
      if (rub.length < 2) errors.push(`${ctx}: rubrik uraian wajib minimal 2 kriteria skor.`);
    }
  });
  const { perBentuk, perKognitif } = hitungDistribusi(p.items);
  return { valid: errors.length === 0, errors, perBentuk, perKognitif };
}

/**
 * Hitung kekurangan butir per bentuk vs komposisi yang diminta (F1-5).
 * Mengembalikan map bentuk -> jumlah butir yang MASIH KURANG (hanya yang > 0).
 */
export function hitungKekuranganBentuk(
  items: ButirSoal[],
  diminta: Record<BentukSoal, number>
): Partial<Record<BentukSoal, number>> {
  const { perBentuk } = hitungDistribusi(items);
  const kurang: Partial<Record<BentukSoal, number>> = {};
  for (const b of DAFTAR_BENTUK) {
    const butuh = Math.max(0, Math.round(Number(diminta[b]) || 0));
    const selisih = butuh - perBentuk[b];
    if (selisih > 0) kurang[b] = selisih;
  }
  return kurang;
}

/**
 * Normalisasi pasca-generate (F1-5, F1-7):
 * - nomor urut 1..N (AI sering salah nomor)
 * - trim semua string
 * - TIMPA identitas faktual dengan nilai dari form (anti-halusinasi topik/identitas)
 */
export function normalisasiPaketSoal(p: PaketSoalTerstruktur, identitas: IdentitasSoal): PaketSoalTerstruktur {
  const rapi = (s: unknown) => String(s ?? '').trim();
  const items = p.items.map((it, i) => ({
    ...it,
    nomor: i + 1,
    stimulus: it.stimulus ? rapi(it.stimulus) : undefined,
    pertanyaan: rapi(it.pertanyaan),
    opsi: it.opsi?.map(rapi).filter(Boolean),
    pasangan: it.pasangan?.map(x => ({ kiri: rapi(x.kiri), kanan: rapi(x.kanan) })).filter(x => x.kiri && x.kanan),
    kunci: rapi(it.kunci),
    pembahasan: rapi(it.pembahasan),
    indikator: rapi(it.indikator),
    rubrik: it.rubrik?.map(r => ({ skor: Number(r.skor) || 0, deskriptor: rapi(r.deskriptor) })).filter(r => r.skor > 0 && r.deskriptor),
  }));
  return {
    ...p,
    format: FORMAT_SOAL_V1,
    identitas: {
      satuanPendidikan: rapi(identitas.satuanPendidikan),
      mataPelajaran: rapi(identitas.mataPelajaran),
      kelas: rapi(identitas.kelas),
      fase: rapi(identitas.fase),
      topik: rapi(identitas.topik),
      waktu: rapi(identitas.waktu),
      guru: rapi(identitas.guru),
    },
    items,
  };
}

/** Ringkasan distribusi kognitif aktual vs diminta (F1-4, untuk viewer). */
export function ringkasanDistribusiKognitif(
  p: PaketSoalTerstruktur
): Array<{ level: LevelKognitif; diminta: number; aktual: number }> {
  const { perKognitif } = hitungDistribusi(p.items);
  return DAFTAR_KOGNITIF.map(level => ({
    level,
    diminta: Math.max(0, Math.round(Number(p.komposisiKognitif?.[level]) || 0)),
    aktual: perKognitif[level],
  }));
}

const NAMA_OPSI = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Render markdown deterministik dari paket terstruktur (dipakai viewer-ekspor
 * dan bundle .docx server-side). Format stabil apa pun "mood" AI.
 */
export function renderPaketSoalMarkdown(p: PaketSoalTerstruktur): string {
  const id = p.identitas;
  const baris: string[] = [];
  baris.push(`# PAKET SOAL & ASESMEN SUMATIF`);
  baris.push(`**Satuan Pendidikan:** ${id.satuanPendidikan || '-'} | **Mata Pelajaran:** ${id.mataPelajaran || '-'} | **Kelas:** ${id.kelas || '-'} (${id.fase || '-'})`);
  baris.push(`**Topik:** ${id.topik || '-'} | **Waktu:** ${id.waktu || '-'} | **Guru:** ${id.guru || '-'}`);
  baris.push('');
  baris.push('## KISI-KISI SOAL');
  baris.push('| No | Indikator | Level Kognitif | Bentuk Soal |');
  baris.push('|----|-----------|----------------|-------------|');
  for (const it of p.items) {
    baris.push(`| ${it.nomor} | ${it.indikator} | ${it.levelKognitif} | ${LABEL_BENTUK[it.bentuk]} |`);
  }
  baris.push('');
  baris.push('## NASKAH SOAL');
  for (const it of p.items) {
    baris.push(`### Soal ${it.nomor} — ${LABEL_BENTUK[it.bentuk]} (${it.levelKognitif})`);
    if (it.stimulus) baris.push(`> **Stimulus:** ${it.stimulus}`);
    baris.push(it.pertanyaan);
    if ((it.bentuk === 'pg_biasa' || it.bentuk === 'pg_kompleks') && it.opsi) {
      it.opsi.forEach((o, i) => baris.push(`${NAMA_OPSI[i] ?? `O${i + 1}`}. ${o}`));
    }
    if (it.bentuk === 'menjodohkan' && it.pasangan) {
      baris.push('| Kiri | Kanan |');
      baris.push('|------|-------|');
      it.pasangan.forEach((x, i) => baris.push(`| (${i + 1}) ${x.kiri} | [ ] ${String.fromCharCode(65 + i)}. ${x.kanan} |`));
    }
    if (it.bentuk === 'isian') baris.push('_Jawaban:_ ............................');
    baris.push('');
  }
  baris.push('## KUNCI JAWABAN & PEMBAHASAN');
  baris.push('> ⚠️ *Periksa kembali kunci & pembahasan sebelum digunakan di kelas.*');
  for (const it of p.items) {
    baris.push(`**${it.nomor}. Kunci: ${it.kunci}** — ${it.pembahasan}`);
  }
  baris.push('');
  const uraian = p.items.filter(it => it.bentuk === 'uraian' && it.rubrik && it.rubrik.length > 0);
  if (uraian.length > 0) {
    baris.push('## RUBRIK PENSKORAN URAIAN');
    for (const it of uraian) {
      baris.push(`### Soal ${it.nomor}`);
      baris.push('| Skor | Deskriptor |');
      baris.push('|------|------------|');
      for (const r of it.rubrik!) baris.push(`| ${r.skor} | ${r.deskriptor} |`);
      baris.push('');
    }
  }
  return baris.join('\n');
}
