/**
 * soalPipeline.ts — Pipeline "Paket soal terpercaya" (Fase 1 roadmap).
 *
 * Diekstrak dari server.ts agar file server tetap di bawah batas push konektor.
 * Berisi: (1) perhitungan komposisi bentuk + kognitif, (2) pipeline kontrak JSON
 * terstruktur soal_ujian: parse → normalisasi → validasi → retry perbaikan (1x)
 * → lengkapi kekurangan butir (maks 2x) → bungkus terstruktur.
 *
 * JANGAN PERNAH memfabrikasi butir soal: bila AI gagal, lempar SoalPipelineError.
 */
import {
  bungkusSoalTerstruktur,
  ekstrakJsonDariTeks,
  validasiPaketSoal,
  hitungKekuranganBentuk,
  normalisasiPaketSoal,
  bagiKomposisiPreset,
  DAFTAR_BENTUK,
  DAFTAR_KOGNITIF,
  LABEL_BENTUK,
  type ButirSoal,
  type BentukSoal,
  type LevelKognitif,
  type PaketSoalTerstruktur,
  type IdentitasSoal,
  type KomposisiKognitifState,
} from '../shared/soalTerstruktur.js';

/** Error pipeline dengan status HTTP + body JSON yang siap dikirim ke klien. */
export class SoalPipelineError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message?: unknown }).message)
      : 'Pipeline soal gagal');
    this.status = status;
    this.body = body;
  }
}

export type PanggilAI = (prompt: string) => Promise<{ text: string; modelUsed: string }>;

const KOMPOSISI_BENTUK_DEFAULT: Record<BentukSoal, number> = {
  pg_biasa: 5, pg_kompleks: 3, menjodohkan: 2, isian: 2, uraian: 3,
};

export interface HasilKomposisi {
  komposisiBentuk: Record<BentukSoal, number>;
  komposisiKognitif: KomposisiKognitifState;
  teksKomposisiJson: string;
  teksKognitif: string;
}

/**
 * Hitung komposisi bentuk + kognitif dari soalConfig.
 * Jumlah C1–C6 WAJIB sama dengan total butir (400 bila tidak).
 */
export function hitungKomposisiSoal(
  soalConfig: Record<string, unknown> | undefined,
  komposisiSoal: Record<string, unknown> | null,
  totalKomposisi: number,
  jumlahSoalFinal: number,
): HasilKomposisi {
  const nBentuk = (k: string) => Math.max(0, Math.round(Number((komposisiSoal as Record<string, unknown> | null)?.[k]) || 0));
  const komposisiBentuk: Record<BentukSoal, number> = totalKomposisi > 0
    ? { pg_biasa: nBentuk('pg_biasa'), pg_kompleks: nBentuk('pg_kompleks'), menjodohkan: nBentuk('menjodohkan'), isian: nBentuk('isian'), uraian: nBentuk('uraian') }
    : { ...KOMPOSISI_BENTUK_DEFAULT };

  const kogInput = (soalConfig?.komposisiKognitif && typeof soalConfig.komposisiKognitif === 'object')
    ? soalConfig.komposisiKognitif as Record<string, unknown>
    : null;
  let komposisiKognitif: KomposisiKognitifState;
  if (kogInput) {
    const nKog = (lv: string) => Math.max(0, Math.round(Number(kogInput[lv]) || 0));
    komposisiKognitif = { C1: nKog('C1'), C2: nKog('C2'), C3: nKog('C3'), C4: nKog('C4'), C5: nKog('C5'), C6: nKog('C6') };
    const totalKog = DAFTAR_KOGNITIF.reduce((a, lv) => a + komposisiKognitif[lv], 0);
    if (totalKog !== jumlahSoalFinal) {
      throw new SoalPipelineError(400, {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Jumlah komposisi kognitif (C1–C6) harus sama dengan total butir soal.' },
      });
    }
  } else {
    komposisiKognitif = bagiKomposisiPreset('LENGKAP', jumlahSoalFinal);
  }

  const teksKomposisiJson = DAFTAR_BENTUK
    .map(b => `- ${b}: **${komposisiBentuk[b]} butir** (${LABEL_BENTUK[b]})`)
    .join('\n');
  const teksKognitif = DAFTAR_KOGNITIF.map(lv => `${lv}: ${komposisiKognitif[lv]}`).join(', ');
  return { komposisiBentuk, komposisiKognitif, teksKomposisiJson, teksKognitif };
}

export interface PipelineInput {
  komposisiBentuk: Record<BentukSoal, number>;
  komposisiKognitif: KomposisiKognitifState;
  mataPelajaran: string;
  tingkat: string;
  calculatedFase: string;
  topik: string;
  jumlahSoalFinal: number;
  modelUsed: string;
  generatedText: string;
  identitas: IdentitasSoal;
  panggilAI: PanggilAI;
}

/** Parser toleran untuk retry (menerima {"items":[...]} maupun array telanjang). */
function ambilArrayItems(teks: string): ButirSoal[] | null {
  const p = ekstrakJsonDariTeks(teks) as { items?: unknown } | unknown[] | null;
  if (Array.isArray(p)) return p as ButirSoal[];
  if (p && typeof p === 'object' && Array.isArray((p as { items?: unknown }).items)) {
    return (p as { items: ButirSoal[] }).items;
  }
  return null;
}

/**
 * Jalankan pipeline kontrak JSON terstruktur untuk soal_ujian.
 * Alur: parse → normalisasi → validasi → 1x retry perbaikan → lengkapi
 * kekurangan (maks 2x) → bungkus. Melempar SoalPipelineError bila gagal.
 */
export async function jalankanPipelineSoalTerstruktur(
  p: PipelineInput,
): Promise<{ generatedText: string; modelUsed: string }> {
  let modelUsed = p.modelUsed;

  const rakitPaket = (items: ButirSoal[]): PaketSoalTerstruktur =>
    normalisasiPaketSoal({
      format: 'rgm-soal-v1',
      identitas: p.identitas,
      komposisiBentuk: { ...p.komposisiBentuk },
      komposisiKognitif: { ...p.komposisiKognitif },
      items,
      generatedAt: new Date().toISOString(),
      modelUsed,
    }, p.identitas);

  const parsedAwal = ekstrakJsonDariTeks(p.generatedText) as { items?: unknown } | null;
  if (!parsedAwal || typeof parsedAwal !== 'object' || !Array.isArray((parsedAwal as { items?: unknown }).items)) {
    throw new SoalPipelineError(500, { success: false, message: 'AI gagal menghasilkan format soal yang valid. Silakan coba lagi.' });
  }
  const itemsAwal = (parsedAwal as { items: ButirSoal[] }).items;

  let paket = rakitPaket(itemsAwal);
  let hasil = validasiPaketSoal(paket);

  if (!hasil.valid) {
    console.warn('[SoalTerstruktur] Validasi gagal, retry perbaikan ke AI:', hasil.errors.slice(0, 3));
    const promptPerbaiki = `Anda adalah asisten penyusun soal yang teliti. Paket soal JSON berikut GAGAL validasi dengan kesalahan ini:\n${hasil.errors.slice(0, 10).map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nKonteks: ${p.mataPelajaran} ${p.tingkat} (${p.calculatedFase}), topik: ${p.topik}.\n\nTUGAS: Perbaiki SEMUA butir di bawah ini agar lolos validasi — pertanyaan/indikator/kunci/pembahasan wajib terisi; pg_biasa & pg_kompleks wajib punya >= 2 opsi; menjodohkan >= 2 pasangan {kiri,kanan}; uraian wajib punya rubrik >= 2 kriteria {skor, deskriptor}; levelKognitif tepat satu dari C1-C6; bentuk tepat satu dari pg_biasa, pg_kompleks, menjodohkan, isian, uraian. JANGAN mengubah isi pedagogis soal — hanya perbaiki struktur yang rusak. JANGAN menulis identitas/kop.\n\nKembalikan HANYA JSON array (tanpa code fence, tanpa prosa):\n${JSON.stringify(paket.items)}`;
    try {
      const r = await p.panggilAI(promptPerbaiki);
      const itemsBaru = r.text ? ambilArrayItems(r.text) : null;
      if (itemsBaru && itemsBaru.length > 0) {
        if (r.modelUsed) modelUsed = r.modelUsed;
        paket = rakitPaket(itemsBaru);
        hasil = validasiPaketSoal(paket);
      }
    } catch (e) { console.warn('[SoalTerstruktur] Retry perbaikan gagal:', (e as Error)?.message); }
  }
  if (!hasil.valid) {
    throw new SoalPipelineError(500, {
      success: false,
      message: 'AI gagal menghasilkan paket soal yang valid: ' + hasil.errors.slice(0, 3).join(' | '),
    });
  }

  const teksAlokasiKurang = (kurang: Partial<Record<BentukSoal, number>>): string => {
    const aktualKog = validasiPaketSoal(paket).perKognitif;
    const sisa: Record<LevelKognitif, number> = {} as Record<LevelKognitif, number>;
    for (const lv of DAFTAR_KOGNITIF) sisa[lv] = Math.max(0, p.komposisiKognitif[lv] - aktualKog[lv]);
    const bagian: string[] = [];
    for (const b of DAFTAR_BENTUK) {
      const n = kurang[b] || 0;
      if (n <= 0) continue;
      const levels: string[] = [];
      for (let i = 0; i < n; i++) {
        let pilih: LevelKognitif = 'C3';
        let maks = 0;
        for (const lv of DAFTAR_KOGNITIF) {
          if (sisa[lv] > maks) { maks = sisa[lv]; pilih = lv; }
        }
        levels.push(pilih);
        sisa[pilih] = Math.max(0, sisa[pilih] - 1);
      }
      bagian.push(`${b}: ${n} butir (level: ${levels.join(', ')})`);
    }
    return bagian.join('; ');
  };

  for (let ronde = 0; ronde < 2; ronde++) {
    const kurang = hitungKekuranganBentuk(paket.items, p.komposisiBentuk);
    if (Object.keys(kurang).length === 0) break;
    const promptKurang = `Anda adalah asisten penyusun soal untuk ${p.mataPelajaran} ${p.tingkat} (${p.calculatedFase}), topik: ${p.topik}.\n\nBuatkan KEKURANGAN butir berikut sebagai JSON array (hanya array, tanpa code fence, tanpa prosa):\n${teksAlokasiKurang(kurang)}\n\nAturan tiap butir: "bentuk" tepat satu dari pg_biasa, pg_kompleks, menjodohkan, isian, uraian; sertakan "stimulus" singkat yang relevan; "pertanyaan" jelas; "opsi" untuk pg_biasa = 4-5 teks opsi TANPA huruf di depan dan "kunci" = huruf opsi yang benar (sebar kunci merata, jangan selalu "B"); pg_kompleks = daftar pernyataan + kunci mis. "1-Benar, 2-Salah"; "pasangan" untuk menjodohkan = minimal 3 {kiri,kanan}; "kunci" dan "pembahasan" (1-2 kalimat) wajib terisi; "levelKognitif" sesuai level yang diminta untuk butir itu; "indikator" memakai kata kerja operasional yang terukur; "rubrik" WAJIB untuk uraian (minimal 2 {skor, deskriptor}). Materi TEPAT pada topik "${p.topik}" — jangan menggeser topik. JANGAN menulis identitas/kop.`;
    try {
      const r = await p.panggilAI(promptKurang);
      const tambahan = r.text ? ambilArrayItems(r.text) : null;
      if (tambahan && tambahan.length > 0) {
        if (r.modelUsed) modelUsed = r.modelUsed;
        const kandidat = rakitPaket([...paket.items, ...tambahan]);
        if (validasiPaketSoal(kandidat).valid) paket = kandidat;
        else console.warn('[SoalTerstruktur] Butir tambahan tidak valid, dibuang.');
      }
    } catch (e) { console.warn('[SoalTerstruktur] Retry kekurangan gagal:', (e as Error)?.message); }
  }

  const kurangAkhir = hitungKekuranganBentuk(paket.items, p.komposisiBentuk);
  const daftarKurang = Object.keys(kurangAkhir) as BentukSoal[];
  if (daftarKurang.length > 0) {
    const rincian = daftarKurang.map(b => `${b} ${kurangAkhir[b]}`).join(', ');
    throw new SoalPipelineError(500, {
      success: false,
      message: `AI hanya menghasilkan ${paket.items.length} dari ${p.jumlahSoalFinal} butir yang diminta (kurang: ${rincian}). Silakan coba lagi.`,
    });
  }

  return { generatedText: bungkusSoalTerstruktur(paket), modelUsed };
}
