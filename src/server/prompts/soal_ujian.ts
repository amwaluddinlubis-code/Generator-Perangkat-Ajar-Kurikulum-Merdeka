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
