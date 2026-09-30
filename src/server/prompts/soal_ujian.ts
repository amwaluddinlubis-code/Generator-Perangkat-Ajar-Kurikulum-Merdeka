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

export const soalUjianSpec: PromptSpec = {
  docType: 'soal_ujian',
  render(ctx: PromptContext): string {
    const jumlah = ctx.soalConfig?.jumlahSoal || 15;
    const bentuk = Array.isArray(ctx.soalConfig?.bentukSoal) && ctx.soalConfig.bentukSoal.length
      ? ctx.soalConfig.bentukSoal.join('; ')
      : 'Pilihan Ganda; Pilihan Ganda Kompleks; Menjodohkan; Isian Singkat; Uraian HOTS';
    const komp = resolveKomposisi((ctx.soalConfig as any)?.komposisi);
    const opsi = Math.min(6, Math.max(2, Number(ctx.soalConfig?.jumlahOpsiPilihanGanda) || 4));
    const letters = 'ABCDEF'.slice(0, opsi).split('').join(', ');
    return `TUGAS: Susunlah **PAKET SOAL UJIAN & ASESMEN SUMATIF KOMPREHENSIF** berstandar **Asesmen Nasional (AKM) dan HOTS (Higher Order Thinking Skills)** sesuai Permendikbudristek No 12 Tahun 2024.

ATURAN TAMBAHAN WAJIB:
- Setiap nomor pilihan ganda wajib memiliki tepat ${opsi} opsi (${letters}).
- Jika beberapa bentuk soal dipilih, distribusikan ${jumlah} butir secara seimbang dan beri label bentuk soal pada setiap nomor.
- Pisahkan secara jelas tabel kisi-kisi, kunci jawaban, pembahasan, dan pedoman penskoran.

KONFIGURASI SOAL (patuhi tepat, jangan tambah/kurangi):
- Jumlah Soal: ${jumlah} butir.
- Bentuk Soal: ${bentuk}.
- Komposisi: Mudah ${komp.mudah}% (C1–C2), Sedang ${komp.sedang}% (C3–C4), Sukar ${komp.sukar}% (C5–C6 HOTS).

PANDUAN GAYA PENULISAN (CRITICAL):
1. SOAL HOTS WAJIB MEMILIKI STIMULUS! Awali soal dengan cerita pendek, grafik/tabel imajiner, percakapan, atau kasus nyata. Jangan membuat soal yang hanya menanyakan definisi murni.
2. Pilihan jawaban (distraktor) pada pilihan ganda harus logis dan menjebak siswa yang mengalami miskonsepsi, jangan buat pilihan ganda yang tidak masuk akal.

STRUKTUR RESMI:
1. **KOP UJIAN**: Satuan Pendidikan, Mata Pelajaran (${ctx.mataPelajaran}), Kelas (${ctx.tingkat} / ${ctx.fase}), Alokasi Waktu (${ctx.alokasiWaktu || '90 Menit'}).
2. **KISI-KISI SOAL (TABEL)**: No, TP, Materi, Indikator Soal, Level Kognitif, Bentuk Soal.
3. **NASKAH SOAL LENGKAP**: Tuliskan stimulus dan butir soalnya secara utuh.
4. **KUNCI JAWABAN & PEMBAHASAN MENDALAM**: Berikan alasan mengapa jawaban benar dan mengapa distraktor lain salah.
5. **PEDOMAN PENSKORAN**: Rubrik penilaian detail.`;
  }
};
