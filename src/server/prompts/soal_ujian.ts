import type { PromptContext, PromptSpec } from './types.js';

export function resolveKomposisi(komposisi?: { mudah?: number; sedang?: number; sukar?: number }): {
  mudah: number;
  sedang: number;
  sukar: number;
} {
  const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
  return {
    mudah: num(komposisi?.mudah, 30),
    sedang: num(komposisi?.sedang, 40),
    sukar: num(komposisi?.sukar, 30)
  };
}

/** Urutan kanonis bentuk soal untuk penomoran berurutan. */
export const BENTUK_SOAL_ORDER = [
  { key: 'jumlahPG', label: 'Pilihan Ganda' },
  { key: 'jumlahPGKompleks', label: 'Pilihan Ganda Kompleks' },
  { key: 'jumlahMenjodohkan', label: 'Menjodohkan' },
  { key: 'jumlahIsianSingkat', label: 'Isian Singkat' },
  { key: 'jumlahUraian', label: 'Uraian HOTS' }
] as const;

export interface DistribusiBentuk {
  key: string;
  label: string;
  count: number;
  start: number;
  end: number;
}

export interface DistribusiSoal {
  /** 'perBentuk' bila salah satu kunci jumlah* hadir; selain itu 'legacy'. */
  mode: 'perBentuk' | 'legacy';
  /** Hanya bentuk dengan count > 0, bernomor urut mulai 1. */
  items: DistribusiBentuk[];
  total: number;
  legacyJumlah?: number;
  legacyBentuk: string[];
}

/**
 * Menyelesaikan konfigurasi soal menjadi distribusi eksplisit per bentuk.
 * Kontrak untuk panel kartu per bentuk: kirim jumlahPG, jumlahPGKompleks,
 * jumlahMenjodohkan, jumlahIsianSingkat, jumlahUraian (0 = tidak dipakai).
 */
export function resolveDistribusiSoal(
  soalConfig?: PromptContext['soalConfig'] | null
): DistribusiSoal {
  const cfg = (soalConfig || {}) as Record<string, unknown>;
  const keys = BENTUK_SOAL_ORDER.map(b => b.key);
  const hasPerBentuk = keys.some(key => cfg[key] !== undefined);
  if (!hasPerBentuk) {
    return {
      mode: 'legacy',
      items: [],
      total: Number(cfg.jumlahSoal) || 0,
      legacyJumlah: typeof cfg.jumlahSoal === 'number' ? cfg.jumlahSoal : undefined,
      legacyBentuk: Array.isArray(cfg.bentukSoal) ? (cfg.bentukSoal as string[]) : []
    };
  }
  const items: DistribusiBentuk[] = [];
  let nomor = 1;
  for (const bentuk of BENTUK_SOAL_ORDER) {
    const raw = cfg[bentuk.key];
    const count = raw === undefined || raw === null ? 0 : Math.max(0, Math.floor(Number(raw) || 0));
    if (count > 0) {
      items.push({ key: bentuk.key, label: bentuk.label, count, start: nomor, end: nomor + count - 1 });
      nomor += count;
    }
  }
  return { mode: 'perBentuk', items, total: nomor - 1, legacyBentuk: [] };
}

/** Total soal yang diminta (untuk validator kualitas & ekspektasi jumlah). */
export function totalSoalDiminta(soalConfig?: PromptContext['soalConfig'] | null): number {
  return resolveDistribusiSoal(soalConfig).total;
}

export const soalUjianSpec: PromptSpec = {
  docType: 'soal_ujian',
  render(ctx: PromptContext): string {
    const distribusi = resolveDistribusiSoal(ctx.soalConfig);
    const jumlah = distribusi.mode === 'perBentuk' ? distribusi.total : (ctx.soalConfig?.jumlahSoal || 15);
    const bentuk = distribusi.mode === 'perBentuk'
      ? distribusi.items.map(item => `${item.label} (${item.count} butir)`).join('; ')
      : Array.isArray(ctx.soalConfig?.bentukSoal) && ctx.soalConfig.bentukSoal.length
        ? ctx.soalConfig.bentukSoal.join('; ')
        : 'Pilihan Ganda; Pilihan Ganda Kompleks; Menjodohkan; Isian Singkat; Uraian HOTS';
    const distribusiText = distribusi.mode === 'perBentuk'
      ? distribusi.items.map(item => `- ${item.label}: ${item.count} butir (Nomor ${item.start}–${item.end}).`).join('\n') + `\n- TOTAL: ${distribusi.total} butir.`
      : `- ${jumlah} butir dibagi seimbang ke semua bentuk terpilih.`;
    const komp = resolveKomposisi((ctx.soalConfig as any)?.komposisi);
    const opsi = Math.min(6, Math.max(2, Number(ctx.soalConfig?.jumlahOpsiPilihanGanda) || 4));
    const letters = 'ABCDEF'.slice(0, opsi).split('').join(', ');
    return `TUGAS: Susunlah **PAKET SOAL UJIAN & ASESMEN SUMATIF KOMPREHENSIF** berstandar **Asesmen Nasional (AKM) dan HOTS (Higher Order Thinking Skills)** sesuai Permendikbudristek No 12 Tahun 2024.

ATURAN TAMBAHAN WAJIB:
- Setiap nomor pilihan ganda wajib memiliki tepat ${opsi} opsi (${letters}).
- Gunakan distribusi per bentuk TEPAT seperti di bawah — JANGAN membagi ulang total dan JANGAN mengubah nomor tiap bentuk.
- Pisahkan secara jelas tabel kisi-kisi, kunci jawaban, pembahasan, dan pedoman penskoran.

DISTRIBUSI SOAL PER BENTUK (patuhi tepat):
${distribusiText}

ATURAN KELENGKAPAN (HARD RULE — DILARANG MELANGGAR):
- Tulis SEMUA ${jumlah} butir soal secara LENGKAP, bernomor urut 1 sampai ${jumlah}. Setiap nomor wajib ada stimulus (bila sesuai bentuknya), redaksi butir, dan opsi/petunjuk yang utuh.
- DILARANG KERAS menulis singkatan seperti "Dan seterusnya...", "Contoh untuk nomor...", "(Nomor X-Y: ...)" atau kalimat sejenis SEBAGAI PENGGANTI butir soal. Frasa semacam itu membuat dokumen DITOLAK.
- Kunci jawaban + pembahasan wajib mencakup SEMUA nomor 1 sampai ${jumlah} satu per satu (atau dalam rentang eksplisit seperti "No 3-5:"), bukan hanya contoh.
- DILARANG mengarang identitas: jangan membuat nama sekolah, nama orang, NPSN, atau kota yang tidak diberikan. Tulis persis data identitas yang tersedia; bila kosong, tulis "........".
- Kisi-kisi memakai SATU level kognitif per baris (mis. C4), bukan rentang seperti "C2/C3".

ATURAN PER BENTUK SOAL:
- Pilihan Ganda Kompleks: nyatakan JUMLAH jawaban benar yang diminta (mis. "Pilihlah 3 jawaban yang benar!") dan cantumkan penskoran parsialnya di pedoman penskoran.
- Isian Singkat: jawaban yang diharapkan 1–3 kata/frasa/angka. DILARANG memakai kata perintah "jelaskan", "uraikan", atau "deskripsikan" pada isian singkat — itu masuk Uraian.
- Uraian HOTS: selalu sertakan stimulus kasus dan pedoman penskoran per level (penuh/sebagian/kurang).

KEWAJARAN WAKTU:
- Estimasi pengerjaan: Pilihan Ganda ±2 menit/butir, PG Kompleks ±3 menit, Menjodohkan ±2 menit, Isian Singkat ±3 menit, Uraian HOTS ±10–15 menit.
- Jumlahkan estimasi seluruh ${jumlah} butir dan pastikan TIDAK melebihi alokasi waktu. Bila melebihi, tulis catatan penyesuaian eksplisit (mis. "disarankan 2 pertemuan" atau "kurangi menjadi ... butir").

KONFIGURASI SOAL (patuhi tepat, jangan tambah/kurangi):
- Jumlah Soal: ${jumlah} butir.
- Bentuk Soal: ${bentuk}.
- Komposisi: Mudah ${komp.mudah}% (C1–C2), Sedang ${komp.sedang}% (C3–C4), Sukar ${komp.sukar}% (C5–C6 HOTS).

PANDUAN GAYA PENULISAN (CRITICAL):
1. SOAL HOTS WAJIB MEMILIKI STIMULUS! Awali soal dengan cerita pendek, grafik/tabel imajiner, percakapan, atau kasus nyata. Jangan membuat soal yang hanya menanyakan definisi murni.
2. Pilihan jawaban (distraktor) pada pilihan ganda harus logis dan menjebak siswa yang mengalami miskonsepsi, jangan buat pilihan ganda yang tidak masuk akal.

STRUKTUR RESMI (gunakan heading persis seperti di bawah):
1. **KOP UJIAN**: Satuan Pendidikan, Mata Pelajaran (${ctx.mataPelajaran}), Kelas (${ctx.tingkat} / ${ctx.fase}), Alokasi Waktu (${ctx.alokasiWaktu || '90 Menit'}).
2. **KISI-KISI (TABEL)**: No, TP, Materi, Indikator Soal, Level Kognitif (satu level), Bentuk Soal. Setiap butir 1 sampai ${jumlah} terpetakan.
3. **NASKAH SOAL LENGKAP**: Tuliskan stimulus dan butir soalnya secara utuh, bernomor 1 sampai ${jumlah}.
4. **KUNCI JAWABAN (TABEL TERPISAH)**: Tabel bernomor 1 sampai ${jumlah} — setiap nomor ada jawabannya.
5. **PEMBAHASAN (SEKSI TERPISAH)**: Berikan alasan mengapa jawaban benar dan mengapa distraktor lain salah, untuk setiap nomor.
6. **PEDOMAN PENSKORAN (TABEL TERPISAH)**: Rubrik penilaian detail per bentuk soal + TAMPILKAN PERHITUNGAN (skor per butir × jumlah butir = subtotal; total harus 100).`;
  }
};
