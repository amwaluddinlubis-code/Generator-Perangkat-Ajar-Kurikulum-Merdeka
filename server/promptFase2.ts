/**
 * promptFase2.ts — Potongan prompt Fase 2 roadmap RGM (F2-6 & F2-7).
 *
 * Dipisah dari server.ts agar server.ts tetap di bawah batas push konektor.
 * Fungsi-fungsi di sini mengembalikan TEKS PROMPT (instruksi untuk AI),
 * bukan hasil generate. Disisipkan via interpolasi ${...} di promptInstructions.
 */

/** Nada refleksi mengikuti pola kondisional jenjang yang sudah dipakai di prompt lain. */
function nadaRefleksi(jenjang: string): string {
  return jenjang === 'SD'
    ? 'ceria, kalimat pendek dan konkret (contoh: "Yuk ingat-ingat, bagian mana yang paling kamu suka hari ini?")'
    : jenjang === 'SMP'
      ? 'dialogis dan memancing diskusi (contoh: "Coba diskusikan dengan teman sebangkumu, strategi mana yang paling membantumu paham?")'
      : 'reflektif, bernalar mendalam, dan kontekstual dengan isu nyata';
}

/**
 * F2-6: seksi "REFLEKSI, PENGAYAAN & REMEDIAL".
 * Target < 900 karakter.
 */
export function bagianRefleksiPengayaan(jenjang: string): string {
  return (
    '**REFLEKSI, PENGAYAAN & REMEDIAL**: Setelah asesmen, tuliskan seksi "Refleksi, Pengayaan & Remedial" berisi: ' +
    '(a) 2-3 pertanyaan refleksi untuk GURU (apa yang berjalan baik, apa yang perlu diperbaiki besok); ' +
    '(b) 2-3 pertanyaan refleksi untuk SISWA tentang pengalaman belajarnya hari ini; ' +
    '(c) 1 kegiatan pengayaan konkret yang menantang bagi murid yang sudah tuntas; ' +
    '(d) 1 kegiatan remedial konkret yang manusiawi dan tidak menghukum bagi murid yang belum tuntas. ' +
    `Nada: ${nadaRefleksi(jenjang)}.`
  );
}

/**
 * F2-7: instruksi tabel markdown dua kolom untuk Kegiatan Inti.
 * Target < 400 karakter.
 */
export function instruksiDuaKolom(): string {
  return 'Sajikan setiap tahap sintaks model pembelajaran pada Kegiatan Inti sebagai TABEL MARKDOWN dua kolom persis ini — | Aktivitas Guru | Aktivitas Siswa | — dengan satu baris per tahap, tanpa kolom tambahan.';
}
