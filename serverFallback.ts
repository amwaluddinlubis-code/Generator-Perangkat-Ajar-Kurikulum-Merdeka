/**
 * Fallback Generator for Kurikulum Merdeka Documents
 * Used when upstream AI models experience transient 503 High Demand spikes
 * to ensure teachers are NEVER blocked from generating complete, exportable documents.
 *
 * Rujukan CP: BSKAP 046/H/KR/2025; mapel Agama & Budi Pekerti memakai
 * revisi BKPDM 020 Tahun 2026 (lihat src/server/curriculumRefs.ts).
 */
import { cpReference, isAgamaMapel } from './src/server/curriculumRefs.js';
import { resolveDistribusiSoal } from './src/server/prompts/soal_ujian.js';

export interface FallbackParams {
  docType: string;
  jenjang: string;
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  alokasiWaktu?: string;
  modelPembelajaran?: string;
  targetPeserta?: string;
  dimensiP5?: string[];
  soalConfig?: {
    jumlahSoal?: number;
    bentukSoal?: string[];
    jumlahPG?: number;
    jumlahPGKompleks?: number;
    jumlahMenjodohkan?: number;
    jumlahIsianSingkat?: number;
    jumlahUraian?: number;
    jumlahOpsiPilihanGanda?: number;
  };
  authorName?: string;
  schoolName?: string;
  catatanTambahan?: any;
}

export function generateFallbackDocument(params: FallbackParams): string {
  const {
    docType,
    jenjang,
    tingkat,
    fase,
    mataPelajaran,
    topik,
    alokasiWaktu = '2 JP (2 x 40 Menit) - 1 Pertemuan',
    modelPembelajaran = 'Problem Based Learning (PBL)',
    targetPeserta = 'Peserta Didik Reguler / Tipikal dengan Diferensiasi Gaya Belajar',
    dimensiP5 = ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
    authorName = 'Bapak/Ibu Guru Mata Pelajaran',
    schoolName = 'Satuan Pendidikan Pelaksana Kurikulum Merdeka'
  } = params;

  const dimensiList = Array.isArray(dimensiP5) && dimensiP5.length
    ? dimensiP5.join(', ')
    : 'Bernalar Kritis, Gotong Royong, Mandiri';

  const cpRef = cpReference(mataPelajaran);
  const agamaNote = isAgamaMapel(mataPelajaran)
    ? ' Pembelajaran diarahkan pada pengamalan nilai ajaran agama dalam sikap, pengetahuan, dan keterampilan sehari-hari sesuai CP revisi BKPDM 020 Tahun 2026.'
    : '';
  const distribusiFallback = resolveDistribusiSoal(params.soalConfig as any);
  const selectedQuestionForms = distribusiFallback.mode === 'perBentuk' && distribusiFallback.items.length > 0
    ? distribusiFallback.items.map(item => `${item.label} (${item.count} butir, Nomor ${item.start}–${item.end})`).join(', ')
    : Array.isArray(params.soalConfig?.bentukSoal) && params.soalConfig.bentukSoal.length
      ? params.soalConfig.bentukSoal.join(', ')
      : 'Pilihan Ganda, Pilihan Ganda Kompleks (AKM), Menjodohkan, Isian Singkat, dan Uraian HOTS';
  const pgOptionCount = Math.min(6, Math.max(2, Number(params.soalConfig?.jumlahOpsiPilihanGanda) || 4));
  const pgOptionLetters = 'ABCDEF'.slice(0, pgOptionCount).split('');
  const pgOptionLines = pgOptionLetters.map((letter, index) => `${letter}. ${[
    'Mengintegrasikan pemahaman konsep untuk menyelesaikan tantangan nyata di lingkungan sekitar',
    'Mengidentifikasi variabel penyebab dan mengumpulkan data lapangan',
    'Menghafal definisi tanpa mengaitkannya dengan fenomena aktual',
    'Mengandalkan metode konvensional tanpa mempertimbangkan efisiensi',
    'Menyerahkan pemecahan masalah kepada pihak lain tanpa analisis',
    'Menguji kembali solusi melalui bukti dan refleksi'
  ][index]}`).join('\n');

  /** Susun lampiran modul ajar sesuai pilihan guru (default: semua). */
  const buildLampiranSection = (): string => {
    const all = ['LKPD siap pakai', 'Bahan bacaan', 'Glosarium', 'Remedial–Pengayaan'];
    const requested = Array.isArray((params.catatanTambahan as any)?.lampiran) && (params.catatanTambahan as any).lampiran.length > 0
      ? (params.catatanTambahan as any).lampiran.filter((x: any) => all.includes(x))
      : all;
    const blocks: Record<string, string> = {
      'LKPD siap pakai': `#### LEMBAR KERJA PESERTA DIDIK (LKPD)
* **Mata Pelajaran**: ${mataPelajaran}
* **Topik**: ${topik}
* **Kelompok / Anggota**: ....................................................
* **Petunjuk Pengerjaan**:
  1. Cermati wacana kasus kontekstual yang disajikan pada lembar kerja.
  2. Diskusikan bersama rekan sekelompok mengenai faktor penyebab dan dampak terkait **${topik}**.
  3. Rumuskan 3 kesimpulan utama dan buatlah diagram alur solusinya.`,
      'Bahan bacaan': `#### BAHAN BACAAN GURU DAN PESERTA DIDIK
Ringkasan materi esensial **${topik}** (${mataPelajaran}, ${tingkat}): pahami konsep inti, keterkaitan antar-konsep, dan contoh penerapan kontekstual sebelum dan sesudah pembelajaran.`,
      'Glosarium': `#### GLOSARIUM ISTILAH PENTING
* **${topik}**: Materi pokok pembelajaran yang memuat konsep inti dan aplikasi terapan.
* **Diferensiasi Pembelajaran**: Penyesuaian konten, proses, atau produk belajar demi mengakomodasi kebutuhan unik peserta didik.
* **KKTP**: Kriteria Ketercapaian Tujuan Pembelajaran sebagai pedoman evaluasi ketuntasan belajar siswa.`,
      'Remedial–Pengayaan': `#### PROGRAM REMEDIAL DAN PENGAYAAN
* **Remedial**: pembelajaran ulang terfokus bagi peserta didik di bawah KKTP dengan bentuk tugas setara berbeda.
* **Pengayaan**: proyek mini/infografis **${topik}** bagi peserta didik melampaui ketuntasan.`
    };
    return requested.map((item: string) => blocks[item]).join('\n\n');
  };

  const ppaBibliographyNumber = isAgamaMapel(mataPelajaran) ? 3 : 2;

  if (docType === 'modul_ajar') {
    return `# MODUL AJAR KURIKULUM MERDEKA (STANDAR PPA 2024)
## Satuan Pendidikan: ${schoolName}
**Tahun Pelajaran 2026/2027 • Berpedoman pada Permendikbudristek No. 12 Tahun 2024 & ${cpRef}**

---

### I. INFORMASI UMUM
* **Nama Guru Penyusun**: ${authorName}
* **Satuan Pendidikan**: ${schoolName}
* **Jenjang / Tingkat**: ${jenjang} / ${tingkat}
* **Fase Capaian**: ${fase}
* **Mata Pelajaran**: ${mataPelajaran}
* **Materi Pokok / Topik**: ${topik}
* **Alokasi Waktu**: ${alokasiWaktu}
* **Model Pembelajaran**: ${modelPembelajaran}
* **Target Peserta Didik**: ${targetPeserta}
* **Profil Lulusan**: ${dimensiList}
* **Sarana & Prasarana**: Modul pegangan guru, LKPD terstruktur, media visual/video pembelajaran kontekstual, perangkat proyektor/papan tulis, dan benda konkret di lingkungan sekitar.

---

### II. KOMPONEN INTI

#### 1. Capaian Pembelajaran (CP)
Peserta didik mampu memahami konsep esensial, menganalisis keterkaitan fenomena nyata, serta menerapkan penalaran kritis dalam menyelesaikan permasalahan kontekstual terkait **${topik}** sesuai ${cpRef}.${agamaNote}

#### 2. Tujuan Pembelajaran (TP)
1. Melalui pengamatan stimulus masalah kontekstual, peserta didik mampu mengidentifikasi karakteristik dan konsep dasar **${topik}** dengan teliti dan mandiri.
2. Melalui diskusi kelompok berbasis **${modelPembelajaran}**, peserta didik dapat menganalisis dan mendiskusikan pemecahan masalah terkait **${topik}** dengan bernalar kritis dan bergotong royong.
3. Melalui penugasan berdiferensiasi, peserta didik mampu menyajikan hasil karya pemahaman konsep **${topik}** dalam bentuk laporan, mind map, atau presentasi visual secara terstruktur.

#### 3. Pemahaman Bermakna
Pemahaman terhadap **${topik}** memberikan bekal kepada peserta didik untuk menganalisis fenomena kehidupan sehari-hari secara rasional, bijaksana dalam mengambil keputusan, serta mampu memberikan solusi nyata di lingkungan keluarga maupun masyarakat.

#### 4. Pertanyaan Pemantik
1. *Mengapa konsep **${topik}** sangat penting dan sering kita jumpai dalam kehidupan sehari-hari di sekitar kita?*
2. *Apa yang akan terjadi jika kita tidak memahami prinsip dasar dari **${topik}** dalam memecahkan masalah kontekstual?*
3. *Bagaimana langkah terbaik yang dapat kita lakukan bersama teman sekelompok untuk mendalami **${topik}** ini secara efektif?*

---

### III. LANGKAH-LANGKAH PEMBELAJARAN BERDIFERENSIASI

#### A. Kegiatan Pendahuluan (10 - 15 Menit)
1. **Orientasi & Religiositas**: Guru membuka kelas dengan salam hangat, berdoa bersama dipimpin ketua kelas, dan memeriksa kehadiran siswa.
2. **Apersepsi & Motivasi**: Guru menampilkan gambar/pertanyaan pemantik terkait **${topik}** untuk mengaitkan materi dengan pengalaman nyata siswa sebelumnya.
3. **Penyampaian Tujuan & Asesmen Awal**: Guru menyampaikan tujuan pembelajaran, alur kegiatan, dan melakukan asesmen diagnostik singkat (tanya-jawab cepat).

#### B. Kegiatan Inti Berdiferensiasi (50 - 60 Menit) - Sintaks ${modelPembelajaran}
* **Tahap 1: Orientasi Siswa pada Masalah (Diferensiasi Konten)**:
  - Guru menyajikan stimulus masalah kontekstual tentang **${topik}**.
  - Peserta didik mengamati materi melalui beragam media (bacaan teks ringkas, diagram visual, atau tayangan video pendek sesuai gaya belajar audio-visual/kinestetik).
* **Tahap 2: Mengorganisasi Peserta Didik Belajar (Diferensiasi Proses)**:
  - Siswa dibagi ke dalam kelompok heterogen beranggotakan 4-5 orang.
  - Guru membagikan LKPD terstruktur dan menjelaskan petunjuk kerja kelompok.
* **Tahap 3: Membimbing Penyelidikan Mandiri & Kelompok**:
  - Siswa berdiskusi mengumpulkan data, menguji gagasan, dan berkolaborasi memecahkan tantangan **${topik}**.
  - Guru berkeliling memberikan *scaffolding* (bimbingan terarah) bagi kelompok yang memerlukan bantuan lebih, serta tantangan lanjutan bagi kelompok yang telah mahir.
* **Tahap 4: Mengembangkan & Menyajikan Hasil Karya (Diferensiasi Produk)**:
  - Kelompok menyusun laporan hasil penyelidikan dalam bentuk yang disepakati (peta pikiran, diagram, poin rangkuman, atau infografis sederhana).
  - Setiap kelompok mempresentasikan temuan mereka di depan kelas atau melalui model *gallery walk*.
* **Tahap 5: Analisis & Evaluasi Proses Pemecahan Masalah**:
  - Guru bersama peserta didik memverifikasi hasil diskusi, memberikan penguatan konsep inti, dan meluruskan miskonsepsi.

#### C. Kegiatan Penutup (10 - 15 Menit)
1. **Refleksi Bersama**: Guru memfasilitasi siswa melakukan refleksi belajar dengan pertanyaan: *"Apa hal terpenting yang kalian pelajari hari ini tentang ${topik}?"*
2. **Asesmen Formatif Akhir**: Peserta didik mengisi *Exit Ticket* atau kuis formatif singkat 2 soal pemahaman konsep.
3. **Tindak Lanjut**: Guru memberikan apresiasi atas kerja sama tim, memberikan informasi materi pertemuan berikutnya, serta menutup dengan doa bersama.

---

### IV. ASESMEN DAN KRITERIA KETERCAPAIAN (KKTP)

#### 1. Jenis Asesmen
* **Asesmen Awal (Diagnostik)**: Tanya jawab lisan di awal pembelajaran untuk memetakan kesiapan belajar.
* **Asesmen Formatif**: Observasi keaktifan diskusi kelompok, lembar observasi dimensi Profil Lulusan, dan penilaian kinerja LKPD.
* **Asesmen Sumatif**: Tes tertulis lingkup materi **${topik}** pada akhir bab/unit.

#### 2. Tabel Rubrik Penilaian KKTP (4 Kategori Pencapaian)

| Kriteria / Indikator Penilaian | Baru Berkembang (BB) | Layak (L) | Cakap (C) | Mahir (M) |
| :--- | :--- | :--- | :--- | :--- |
| **Pemahaman Konsep ${topik}** | Mampu menyebutkan sebagian kecil konsep dasar dengan bimbingan penuh guru. | Mampu menjelaskan konsep dasar **${topik}** secara umum namun belum lengkap. | Mampu menjelaskan dan menganalisis konsep **${topik}** secara tepat dan runtut. | Mampu menguraikan konsep **${topik}** secara komprehensif serta menghubungkan ke konteks nyata baru. |
| **Penyelidikan & Analisis Masalah** | Kesulitan mengidentifikasi masalah tanpa arahan langsung. | Mampu menemukan solusi dengan bantuan sebagian dari teman atau guru. | Mampu menganalisis dan merumuskan solusi masalah secara mandiri dalam kelompok. | Mampu merancang solusi inovatif, kritis, dan memimpin diskusi kelompok secara solutif. |
| **Keterampilan Presentasi & Produk** | Laporan belum terstruktur dan belum percaya diri saat presentasi. | Laporan cukup rapi, presentasi terbata-bata namun pesan tersampaikan. | Laporan terstruktur rapi, menyajikan hasil diskusi dengan bahasa komunikatif. | Laporan sangat kreatif, presentasi sistematis, percaya diri, dan mampu menjawab pertanyaan kritis. |

---

### V. LAMPIRAN MODUL AJAR
${buildLampiranSection()}

#### 3. Sumber & Daftar Pustaka
1. Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP). (2025). *Keputusan Kepala BSKAP No. 046/H/KR/2025 tentang Capaian Pembelajaran*. Kemendikdasmen RI.${isAgamaMapel(mataPelajaran) ? '\n2. Badan Kebijakan Pendidikan Dasar dan Menengah (BKPDM). (2026). *Keputusan Kepala BKPDM No. 020 Tahun 2026 tentang Perubahan CP Pendidikan Agama dan Budi Pekerti*. Kemendikdasmen RI.' : ''}
${ppaBibliographyNumber}. Pusat Kurikulum dan Pembelajaran. (2024). *Panduan Pembelajaran dan Asesmen Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Pendidikan Menengah*. BSKAP Kemendikbudristek RI.`;
  }

  if (docType === 'soal_ujian') {
    return `# PAKET SOAL ASESMEN SUMATIF (AKM & HOTS)
## Standar Asesmen Nasional Kemendikbudristek 2024
**Satuan Pendidikan: ${schoolName} • Mata Pelajaran: ${mataPelajaran} • Tingkat: ${tingkat} (${fase})**

---

### I. KISI-KISI PENULISAN SOAL
* **Topik / Lingkup Materi**: ${topik}
* **Alokasi Waktu Ujian**: 60 - 90 Menit
* **Komposisi Level Kognitif**: C3 (Aplikasi), C4 (Analisis), C5 (Evaluasi), C6 (Kreasi)
* **Bentuk Soal**: ${selectedQuestionForms}.

| No | Materi / Indikator | Level Kognitif | Bentuk Soal | No. Butir |
| :--- | :--- | :---: | :---: | :---: |
| 1 | Konsep dasar ${topik} | C3 - Aplikasi | Pilihan Ganda | 1 |
| 2 | Analisis masalah ${topik} | C4 - Analisis | PG Kompleks (AKM) | 2 - 3 |
| 3 | Keterkaitan konsep ${topik} | C3 - Aplikasi | Menjodohkan | 4 |
| 4 | Studi kasus ${topik} | C5/C6 - Evaluasi & Kreasi | Uraian HOTS | 5 |

---

### II. BUTIR SOAL UJIAN BERBASIS STIMULUS DATA & WACANA

#### BAGIAN A: PILIHAN GANDA BIASA (Stimulus Wacana 1)
*Cermatilah wacana kontekstual berikut untuk menjawab soal nomor 1 sampai 3:*
> *"Dalam era transformasi sains dan teknologi modern, pemahaman mengenai ${topik} menjadi pilar utama dalam pemecahan masalah lingkungan dan industri. Berbagai penelitian terkini menunjukkan bahwa penerapan konsep ini secara tepat mampu meningkatkan efisiensi dan menjaga keberlanjutan sumber daya secara optimal."*

**Soal 1 (Level Kognitif C3 - Aplikasi)**
Berdasarkan wacana di atas, penerapan prinsip utama dari **${topik}** dalam kehidupan sehari-hari paling tepat ditunjukkan oleh contoh...
${pgOptionLines}
*(Kunci Jawaban: B)*

**Soal 2 (Level Kognitif C4 - Analisis)**
Apabila terjadi kendala pada implementasi **${topik}**, langkah analisis kritis awal yang harus dilakukan peserta didik adalah...
A. Menghentikan seluruh proses tanpa mencari akar penyebab masalah
B. Mengidentifikasi variabel penyebab, mengumpulkan data lapangan, dan merumuskan hipotesis perbaikan
C. Mengganti seluruh sistem tanpa evaluasi bertahap
D. Menunggu instruksi tanpa melakukan inisiatif penyelidikan
*(Kunci Jawaban: B)*

---

#### BAGIAN B: PILIHAN GANDA KOMPLEKS (MODEL ASESMEN KOMPETENSI MINIMUM / AKM)
**Soal 3 (Level Kognitif C4 - AKM Multikunci)**
Tentukan Benar (B) atau Salah (S) untuk setiap pernyataan berikut terkait **${topik}**!
1. [B / S] Penerapan konsep **${topik}** berkontribusi langsung pada penguatan nalar kritis siswa. *(Benar)*
2. [B / S] Pengambilan keputusan dalam **${topik}** hanya boleh didasarkan pada perkiraan tanpa bukti data empiris. *(Salah)*
3. [B / S] Kolaborasi tim mempercepat penemuan solusi alternatif yang efektif pada persoalan **${topik}**. *(Benar)*

---

#### BAGIAN C: SOAL MENJODOHKAN (MATCHING)
**Soal 4 (Level Kognitif C3)**
Jodohkan istilah pada Kolom Kiri dengan deskripsi yang paling tepat pada Kolom Kanan:
* (1) Konsep Dasar ${topik}  -----> [  ] A. Evaluasi hasil dan tindak lanjut perbaikan
* (2) Analisis Masalah       -----> [  ] B. Fondasi teori dan pemahaman awal yang kuat
* (3) Solusi & Refleksi      -----> [  ] C. Penguraian komponen tantangan secara objektif
*(Kunci: 1-B, 2-C, 3-A)*

---

#### BAGIAN D: SOAL URAIAN HOTS & STUDI KASUS NYATA
**Soal 5 (Level Kognitif C5/C6 - Evaluasi & Kreasi)**
Di suatu lingkungan satuan pendidikan, ditemukan permasalahan nyata terkait **${topik}** yang berdampak pada kegiatan warga sekolah.
**Pertanyaan**:
1. Analisislah 2 (dua) faktor penyebab utama timbulnya persoalan tersebut!
2. Rancanglah sebuah gagasan aksi nyata atau solusi inovatif yang dapat diterapkan bersama teman sekelas dengan memanfaatkan prinsip kerja **${topik}**!

---

### III. KUNCI JAWABAN

| Nomor | Bentuk | Jawaban |
| :---: | :--- | :--- |
| 1 | Pilihan Ganda | B |
| 2 | Pilihan Ganda | B |
| 3 | Pilihan Ganda Kompleks | B, S, B |
| 4 | Menjodohkan | 1-B, 2-C, 3-A |
| 5 | Uraian HOTS | Jawaban terbuka sesuai rubrik |

### IV. PEMBAHASAN

1. **Nomor 1:** Pilihan B paling tepat karena menghubungkan konsep dengan tantangan nyata.
2. **Nomor 2:** Pilihan B menunjukkan analisis berbasis variabel, data, dan hipotesis.
3. **Nomor 3:** Pernyataan dinilai berdasarkan bukti dan prinsip **${topik}**.
4. **Nomor 4:** Pasangan mencocokkan konsep dasar, analisis masalah, dan tindak lanjut.
5. **Nomor 5:** Jawaban dinilai dari ketepatan analisis, kelayakan solusi, dan alasan berbasis konsep.

### V. PEDOMAN PENSKORAN & RUBRIK ASESMEN
* **Pilihan Ganda Biasa**: Bobot 2 poin per butir benar.
* **Pilihan Ganda Kompleks**: Bobot 3 poin jika seluruh opsi tepat.
* **Menjodohkan**: Bobot 3 poin.
* **Soal Uraian HOTS**: Bobot maksimum 10 poin dengan kriteria:
  - Jawaban tepat, analisis logis, dan solusi kreatif: Skor 8 - 10
  - Jawaban cukup tepat dengan analisis mendasar: Skor 5 - 7
  - Jawaban kurang relevan: Skor 1 - 4
* **Nilai Akhir**: (Total Skor Perolehan / Total Skor Maksimum) x 100.`;
  }

  if (docType === 'rpp') {
    return `# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) RINGKAS
## Format Efisien Supervisi Kepala Sekolah (1-2 Halaman)
**Satuan Pendidikan: ${schoolName} • Mata Pelajaran: ${mataPelajaran} • Tingkat: ${tingkat} (${fase})**

---

### I. IDENTITAS PEMBELAJARAN
* **Nama Guru**: ${authorName}
* **Mata Pelajaran**: ${mataPelajaran}
* **Fase / Kelas**: ${fase} / ${tingkat}
* **Materi Pokok**: ${topik}
* **Alokasi Waktu**: ${alokasiWaktu}
* **Model Pembelajaran**: ${modelPembelajaran}

---

### II. TIGA KOMPONEN INTI RPP
${(params.catatanTambahan as any)?.fokusRpp && (params.catatanTambahan as any).fokusRpp !== 'Seimbang' ? `*Fokus penekanan dokumen ini: **${(params.catatanTambahan as any).fokusRpp}**.*\n` : ''}
#### 1. Tujuan Pembelajaran
Melalui model pembelajaran **${modelPembelajaran}**, peserta didik dapat:
- Memahami konsep esensial **${topik}** secara mandiri dan bernalar kritis.
- Menganalisis studi kasus kontekstual terkait **${topik}** melalui diskusi kolaboratif.
- Menyajikan ringkasan solusi atau simpulan bermakna tentang **${topik}** secara komunikatif.

#### 2. Langkah-Langkah Pembelajaran Efisien
* **Pendahuluan (10 Menit)**:
  - Salam, doa, presensi, dan apersepsi singkat mengaitkan **${topik}** dengan kehidupan siswa.
  - Guru menyampaikan tujuan pembelajaran dan pertanyaan pemantik utama.
* **Inti (60 Menit)**:
  - Orientasi stimulus masalah kontekstual materi **${topik}**.
  - Diskusi kelompok heterogen dengan pembagian lembar kerja panduan.
  - Diferensiasi bimbingan (*scaffolding*) bagi kelompok yang membutuhkan dukungan.
  - Presentasi singkat perwakilan kelompok dan penguatan konsep oleh guru.
* **Penutup (10 Menit)**:
  - Siswa dan guru merangkum poin penting pembelajaran hari ini.
  - Refleksi cepat (*1 hal yang dipahami, 1 hal yang ingin didalami*).
  - Doa penutup dan penyampaian rencana topik pertemuan selanjutnya.

#### 3. Asesmen Pembelajaran
* **Sikap**: Observasi keaktifan dan gotong royong selama kerja kelompok.
* **Pengetahuan**: Tanya jawab lisan dan kuis cepat exit-ticket 2 butir soal.
* **Keterampilan**: Penilaian unjuk kerja laporan hasil analisis kelompok.

| Aspek | Teknik | Instrumen |
| :--- | :--- | :--- |
| Sikap | Observasi | Lembar observasi dimensi Profil Lulusan |
| Pengetahuan | Tes lisan & tulis singkat | Exit ticket 2 butir + tanya jawab |
| Keterampilan | Unjuk kerja | Rubrik laporan kelompok |

---

### III. PENGESAHAN DOKUMEN

Mengetahui,  
**Kepala Satuan Pendidikan**  
${schoolName}  

*( ............................................................ )*  
NIP. ....................................................  

Guru Mata Pelajaran,  

**${authorName}**  
NIP. ....................................................`;
  }

  const temaP5 = (params.catatanTambahan && params.catatanTambahan.temaP5) || 'Gaya Hidup Berkelanjutan';

  /** Susun blok aktivitas LKPD sesuai jumlah pilihan guru + kunci opsional. */
  const buildLkpdActivities = (): string => {
    const all = [
      { title: 'EKSPLORASI & PENGAMATAN (Diferensiasi Konten)', body: `Lengkapi tabel pengamatan berikut berdasarkan hasil penyelidikan kelompokmu:

| No | Aspek yang Diamati | Hasil Pengamatan / Data | Keterangan |
| :--- | :--- | :--- | :--- |
| 1 | .................................................... | .................................................... | .................................................... |
| 2 | .................................................... | .................................................... | .................................................... |
| 3 | .................................................... | .................................................... | .................................................... |` },
      { title: 'ANALISIS & KOLABORASI (Diferensiasi Proses)', body: `1. Berdasarkan data pada tabel di atas, pola atau keteraturan apa yang ditemukan kelompokmu terkait **${topik}**?
   Jawab: ...................................................................................................................................
2. Hubungkan temuanmu dengan konsep **${mataPelajaran}** yang telah dipelajari. Jelaskan dengan bahasamu sendiri!
   Jawab: ...................................................................................................................................
3. Rumuskan satu pertanyaan kritis lanjutan yang ingin kalian selidiki lebih dalam:
   Jawab: ...................................................................................................................................` },
      { title: 'APLIKASI & KREASI PRODUK', body: `Wujudkan pemahamanmu dalam satu produk pilihan: poster/infografis, model sederhana, atau demonstrasi singkat terkait **${topik}**. Tuliskan langkah pembuatan dan bahan yang digunakan di bawah ini.
   Rencana produk kami: ...................................................................................................................................` },
      { title: 'KESIMPULAN & REFLEKSI MANDIRI (Diferensiasi Produk)', body: `* **Kesimpulan kelompok**: ...................................................................................................................................
* **Refleksi individu** — *Satu hal yang kupahami hari ini*: ............................ *Satu hal yang ingin kupelajari lagi*: ............................` }
    ];
    const requested = Number((params.catatanTambahan as any)?.jumlahAktivitas);
    const n = Number.isFinite(requested) ? Math.min(Math.max(Math.floor(requested), 1), 4) : 3;
    const blocks = all.slice(0, n).map((a, i) => `### AKTIVITAS ${i + 1} — ${a.title}\n${a.body}`);
    if ((params.catatanTambahan as any)?.kunciLkpd) {
      blocks.push(`### KUNCI JAWABAN GURU (tidak dibagikan ke siswa)\n* Eksplorasi: pastikan tabel terisi data hasil pengamatan nyata, bukan salinan.\n* Analisis: terima jawaban yang menunjukkan pola keterkaitan **${topik}** dengan alasan logis.\n* Produk & refleksi: nilai kelengkapan, kreativitas, dan kejujuran sesuai rubrik.`);
    }
    return blocks.join('\n\n');
  };

  if (docType === 'lkpd') {
    return `# LEMBAR KERJA PESERTA DIDIK (LKPD) KURIKULUM MERDEKA
## ${mataPelajaran} • ${tingkat} (${fase}) — Siap Cetak
**Satuan Pendidikan: ${schoolName} • Topik: ${topik}**

---

### KOP ISIAN KELOMPOK
* **Nama Kelompok**: ....................................................  **Kelas**: ${tingkat}
* **Anggota**: 1. ............................ 2. ............................ 3. ............................ 4. ............................
* **Hari / Tanggal**: ....................................................

---

### I. JUDUL AKTIVITAS
**Menjelajahi ${topik} melalui Pengamatan dan Penyelidikan Kelompok**

### II. PETUNJUK BELAJAR & KESELAMATAN
1. Baca setiap instruksi dengan saksama sebelum memulai kegiatan.
2. Gunakan alat dan bahan sesuai fungsinya; dahulukan keselamatan selama praktik/pengamatan.
3. Catat seluruh hasil pengamatan langsung pada tabel yang tersedia — dilarang menyalin hasil kelompok lain.
4. Mintalah bimbingan guru apabila menemui kendala atau hasil yang meragukan.

### III. STIMULUS MASALAH NYATA
> *Di lingkungan sekitar kita (sekolah, rumah, dan masyarakat) terdapat berbagai fenomena yang berkaitan erat dengan **${topik}**. Amati, kumpulkan fakta, dan diskusikan bersama kelompokmu: mengapa fenomena tersebut terjadi dan bagaimana prinsip **${mataPelajaran}** menjelaskannya?*

${buildLkpdActivities()}

### RUBRIK PENILAIAN DIRI & ANTAR-TEMAN
| Aspek | Ya, Mandiri (3) | Dengan Bantuan (2) | Belum (1) |
| :--- | :---: | :---: | :---: |
| Aku aktif berkontribusi dalam kelompok | ☐ | ☐ | ☐ |
| Aku mencatat data pengamatan dengan jujur dan teliti | ☐ | ☐ | ☐ |
| Aku menghargai pendapat teman sekelompok | ☐ | ☐ | ☐ |

*Disusun oleh ${authorName} • ${schoolName} • Model: ${modelPembelajaran} • Alokasi: ${alokasiWaktu}*`;
  }

  if (docType === 'kktp_atp') {
    const pendekatan = (params.catatanTambahan as any)?.pendekatanKktp || 'Ketiganya';
    const showDeskripsi = pendekatan === 'Ketiganya' || pendekatan === 'Deskripsi Kriteria';
    const showRubrik = pendekatan === 'Ketiganya' || pendekatan === 'Rubrik Skala';
    const showInterval = pendekatan === 'Ketiganya' || pendekatan === 'Interval Nilai';
    const pendekatanSections = [
      showDeskripsi ? `#### Pendekatan 1: Deskripsi Kriteria
Peserta didik dinyatakan tuntas apabila mampu: (a) menjelaskan konsep inti **${topik}** tanpa miskonsepsi berarti; (b) menerapkan konsep dalam tugas/asesmen kontekstual; (c) menunjukkan partisipasi aktif dan tanggung jawab belajar.` : '',
      showRubrik ? `#### Pendekatan 2: Rubrik Skala Berkembang
| Level | Deskripsi Operasional |
| :--- | :--- |
| Baru Berkembang (BB) | Membutuhkan bimbingan penuh untuk memahami dan menerapkan **${topik}**. |
| Layak (L) | Memahami sebagian konsep; mampu menyelesaikan tugas rutin dengan bantuan minimal. |
| Cakap (C) | Memahami konsep secara utuh dan menerapkannya secara mandiri dan runtut. |
| Mahir (M) | Menganalisis, menghubungkan ke konteks baru, dan mengomunikasikan gagasan secara kreatif. |` : '',
      showInterval ? `#### Pendekatan 3: Interval Nilai
| Interval | Kategori | Tindak Lanjut |
| :--- | :--- | :--- |
| 0 – 60 | Belum mencapai ketuntasan | Remedial: pembelajaran ulang terfokus + tugas perbaikan |
| 61 – 75 | Mencapai sebagian | Penguatan: latihan tambahan dan pendampingan kelompok |
| 76 – 90 | Tuntas | Lanjut ke materi berikutnya |
| 91 – 100 | Melampaui ketuntasan | Pengayaan: proyek mini / soal HOTS lanjutan |` : ''
    ].filter(Boolean).join('\n\n');
    return `# ALUR TUJUAN PEMBELAJARAN (ATP) & KRITERIA KETERCAPAIAN (KKTP)
## ${mataPelajaran} • ${tingkat} (${fase}) — PPA 2024
**Satuan Pendidikan: ${schoolName} • Penyusun: ${authorName}**

---

### I. RASIONAL & CAPAIAN PEMBELAJARAN (CP)
Pembelajaran **${mataPelajaran}** pada **${fase}** diarahkan agar peserta didik menguasai konsep esensial **${topik}** dan mampu menerapkannya dalam konteks nyata. Dokumen ini disusun berdasarkan ${cpRef} sebagai pijakan perencanaan, pelaksanaan, dan evaluasi pembelajaran selama satu tahun ajaran.${agamaNote}

### II. MATRIKS ALUR TUJUAN PEMBELAJARAN (ATP)

| No | Elemen / Materi | Capaian Pembelajaran | Tujuan Pembelajaran (TP) | Alur & Alokasi (JP) | Profil Lulusan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Pengenalan **${topik}** | Peserta didik memahami konsep dasar dan karakteristik utama materi. | Melalui pengamatan dan diskusi, siswa mampu mengidentifikasi konsep dasar **${topik}** dengan tepat. | Pertemuan 1–2 (4 JP) | ${dimensiList} |
| 2 | Pendalaman **${topik}** | Peserta didik menganalisis keterkaitan konsep dengan fenomena nyata. | Melalui penyelidikan kelompok (**${modelPembelajaran}**), siswa mampu menganalisis persoalan kontekstual **${topik}**. | Pertemuan 3–5 (6 JP) | ${dimensiList} |
| 3 | Penerapan & Kreasi | Peserta didik menyajikan solusi/karya berbasis pemahaman konsep. | Melalui proyek mini, siswa mampu menyajikan karya dan merefleksikan pemahaman **${topik}**. | Pertemuan 6–7 (4 JP) + Asesmen Sumatif (2 JP) | ${dimensiList} |

### III. PENETAPAN KKTP — PENDEKATAN RESMI PPA 2024 (dipakai: ${pendekatan})

${pendekatanSections}

### IV. INTERVENSI REMEDIAL & PENGAYAAN
* **Remedial**: diagnosis miskonsepsi, pembelajaran ulang dengan media konkret, asesmen ulang setara dengan bentuk berbeda.
* **Pengayaan**: eksplorasi mandiri, membuat infografis/poster edukasi **${topik}**, atau menjadi tutor sebaya bagi teman yang remedial.`;
  }

  if (docType === 'prota_promes') {
    const semester = (params.catatanTambahan as any)?.semesterProta || '';
    const tahun = (params.catatanTambahan as any)?.tahunAjaran?.trim() || '2026/2027';
    const onlyGanjil = semester === 'Ganjil';
    const onlyGenap = semester === 'Genap';
    const scopeNote = semester && semester !== 'Keduanya'
      ? `\n* **Cakupan dokumen ini**: Semester ${semester} Tahun Ajaran ${tahun} (sesuai pilihan guru).`
      : `\n* **Cakupan dokumen ini**: Semester Ganjil dan Genap Tahun Ajaran ${tahun}.`;
    const protaRows = [
      '| 1 | Pengenalan konsep dasar **${topik}** | 8 | Ganjil |',
      '| 2 | Pendalaman & penyelidikan **${topik}** (model ${modelPembelajaran}) | 12 | Ganjil |',
      '| 3 | Asesmen Sumatif Lingkup Materi + Tengah Semester Ganjil | 4 | Ganjil |',
      '| 4 | Penerapan lanjutan & proyek mini **${topik}** | 10 | Genap |',
      '| 5 | Penguatan, remedial–pengayaan, & persiapan sumatif akhir | 6 | Genap |',
      '| 6 | Asesmen Sumatif Akhir Semester Genap | 4 | Genap |'
    ].filter(row => !onlyGanjil || row.endsWith('| Ganjil |')).filter(row => !onlyGenap || row.endsWith('| Genap |'));
    const promesGanjil = `#### Semester Ganjil (16 Minggu Efektif)
| Minggu | Kegiatan | Keterangan |
| :--- | :--- | :--- |
| 1 – 2 | Pengenalan **${topik}** + asesmen diagnostik | 4 JP |
| 3 – 7 | Pendalaman materi & diskusi kelompok | 10 JP |
| 8 | Asesmen Sumatif Lingkup Materi 1 | 2 JP |
| 9 – 11 | Lanjutan pendalaman + LKPD terstruktur | 6 JP |
| 12 | Sumatif Tengah Semester (STS) | 2 JP |
| 13 – 15 | Penguatan & remedial–pengayaan | 6 JP |
| 16 | Cadangan / kalender pendidikan (jeda tengah semester) | — |`;
    const promesGenap = `#### Semester Genap (16 Minggu Efektif)
| Minggu | Kegiatan | Keterangan |
| :--- | :--- | :--- |
| 1 – 4 | Penerapan lanjutan **${topik}** + proyek mini | 8 JP |
| 5 – 6 | Asesmen Sumatif Lingkup Materi 2 | 4 JP |
| 7 – 10 | Penguatan konsep & diferensiasi lanjutan | 8 JP |
| 11 | Sumatif Tengah Semester (STS) Genap | 2 JP |
| 12 – 14 | Remedial–pengayaan & persiapan akhir | 6 JP |
| 15 | Sumatif Akhir Semester (SAS) | 2 JP |
| 16 | Refleksi tahunan & pembagian rapor | — |`;
    const promesSection = `### III. PROGRAM SEMESTER (PROMES)

${!onlyGenap ? promesGanjil + '\n\n' : ''}${!onlyGanjil ? promesGenap : ''}`.trim();
    return `# PROGRAM TAHUNAN (PROTA) & PROGRAM SEMESTER (PROMES)
## ${mataPelajaran} • ${tingkat} (${fase}) — Kurikulum Merdeka
**Satuan Pendidikan: ${schoolName} • Penyusun: ${authorName} • Tahun Ajaran ${tahun}**

---

### I. IDENTITAS & ALOKASI WAKTU
* **Alokasi intrakurikuler**: ${alokasiWaktu} per pertemuan; total ± 32 minggu efektif per tahun.
* **Cakupan materi tahun ini**: konsep esensial **${topik}** beserta materi prasyarat dan pengembangannya sesuai CP **${fase}**.${scopeNote}

### II. PROGRAM TAHUNAN (PROTA)

| No | Capaian / Lingkup Materi | Alokasi (JP) | Semester |
| :--- | :--- | :---: | :---: |
${protaRows.join('\n')}

${promesSection}

### IV. CATATAN KALENDER PENDIDIKAN
Sesuaikan distribusi di atas dengan kalender pendidikan daerah: hari efektif, jeda tengah semester, libur akhir semester, dan kegiatan kokurikuler P5 agar tidak tumpang tindih dengan jam intrakurikuler **${mataPelajaran}**.`;
  }

  if (docType === 'modul_p5') {
    return `# MODUL PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)
## Tema: ${temaP5} • Topik: ${topik}
**Jenjang / Fase: ${jenjang} / ${fase} • Satuan Pendidikan: ${schoolName} • Penyusun: ${authorName}**

---

### I. PROFIL MODUL
* **Tema resmi**: ${temaP5}
* **Topik projek**: ${topik}
* **Fase / Kelas**: ${fase} / ${tingkat}
* **Alokasi waktu**: ${alokasiWaktu} (dapat direntang beberapa pertemuan)
* **Model fasilitasi**: ${modelPembelajaran}

### II. DIMENSI, ELEMEN & SUBELEMEN PROFIL PELAJAR PANCASILA

| Dimensi | Elemen yang Dikembangkan | Target Akhir Fase |
| :--- | :--- | :--- |
| ${dimensiList} | Bernalar kritis: menganalisis masalah nyata di sekitar sekolah | Berkembang Sesuai Harapan |
| ${dimensiList} | Gotong royong: kolaborasi dan berbagi peran dalam tim projek | Berkembang Sesuai Harapan |
| ${dimensiList} | Mandiri: mengatur diri, waktu, dan tanggung jawab tugas | Mulai Berkembang → BSH |

### III. ALUR AKTIVITAS PROJEK

#### Tahap 1 — Pengenalan (Asesmen Diagnostik + Apersepsi Tema)
* Fasilitator membuka wawasan tentang **${temaP5}** melalui video, kunjungan lingkungan sekolah, atau cerita inspiratif.
* Siswa menggali pengalaman awal terkait **${topik}** dan menyepakati pertanyaan utama projek.

#### Tahap 2 — Kontekstualisasi (Riset & Perencanaan Aksi)
* Kelompok melakukan audit/observasi nyata (misal: sampah, energi, kearifan lokal, sesuai tema) dan mencatat data sederhana.
* Kelompok menyusun rencana aksi: tujuan, pembagian peran, jadwal, dan kebutuhan alat/bahan.

#### Tahap 3 — Aksi Nyata (Eksekusi & Pendampingan Formatif)
* Siswa melaksanakan aksi (misal: bank sampah mini, kampanye hemat energi, pameran budaya lokal) dengan pendampingan formatif fasilitator.
* Setiap kelompok mendokumentasikan proses dalam jurnal foto/catatan harian projek.

#### Tahap 4 — Refleksi & Gelar Karya (Sumatif + Tindak Lanjut)
* Pameran hasil karya (gelar karya) di tingkat kelas/sekolah; setiap kelompok mempresentasikan dampak aksinya.
* Refleksi individu dan umpan balik antar-kelompok; rencana tindak lanjut keberlanjutan projek.

### IV. ASESMEN PROJEK (Rubrik Perkembangan Subelemen)

| Subelemen | Belum Berkembang | Mulai Berkembang | Berkembang Sesuai Harapan | Sangat Berkembang |
| :--- | :--- | :--- | :--- | :--- |
| Kolaborasi tim | Pasif, menunggu perintah | Berkontribusi bila diminta | Aktif berbagi peran dan menuntaskan tugas | Memimpin, memediasi konflik, memastikan semua terlibat |
| Nalar kritis aksi | Solusi meniru contoh | Menganalisis sebagian masalah | Menganalisis utuh dan solusi tepat guna | Solusi inovatif berdampak nyata terukur |
| Refleksi diri | Belum mampu menilai diri | Menilai diri secara umum | Jujur menilai kekuatan–kelemahan + rencana perbaikan | Konsisten menindaklanjuti rencana perbaikan |

### V. LAMPIRAN
* **Jurnal refleksi siswa**: *Hari ini aku belajar ... / Tantangan terbesarku ... / Besok aku akan ...*
* **Panduan gelar karya**: susunan acara pameran, pembagian stan per kelompok, rubrik presentasi, dan dokumentasi kegiatan untuk portofolio sekolah.`;
  }

  // Default Fallback
  return `# DOKUMEN PERANGKAT AJAR KURIKULUM MERDEKA
## Satuan Pendidikan: ${schoolName} • Mata Pelajaran: ${mataPelajaran}
**Tingkat / Fase: ${tingkat} (${fase}) • Topik: ${topik}**

---

### I. IDENTITAS PERANGKAT AJAR
* **Penyusun**: ${authorName}
* **Satuan Pendidikan**: ${schoolName}
* **Mata Pelajaran**: ${mataPelajaran}
* **Fase / Kelas**: ${fase} / ${tingkat}
* **Alokasi Waktu**: ${alokasiWaktu}
* **Model Pembelajaran**: ${modelPembelajaran}
* **Profil Lulusan**: ${dimensiList}

---

### II. URAIAN CAPAIAN & TUJUAN PEMBELAJARAN
Berdasarkan ${cpRef} dan PPA 2024, pembelajaran materi **${topik}** diarahkan untuk mengembangkan kompetensi esensial, kemampuan memecahkan masalah kontekstual, serta pembiasaan karakter bernalar kritis dan kreatif pada peserta didik.${agamaNote}

### III. SINTAKS & AKTIVITAS PEMBELAJARAN
1. **Kegiatan Awal**: Apersepsi, pengenalan tujuan, dan asesmen awal kesiapan siswa.
2. **Kegiatan Inti**: Eksplorasi materi **${topik}**, diskusi kelompok berbasis studi kasus nyata, dan penyajian hasil pemahaman konsep.
3. **Kegiatan Akhir**: Verifikasi konsep oleh guru, refleksi peserta didik, dan penilaian formatif ringkas.

### IV. RUBRIK PENILAIAN KKTP
Penilaian ketuntasan tujuan pembelajaran dilakukan menggunakan rubrik deskripsi kriteria berjenjang (*Baru Berkembang, Layak, Cakap, Mahir*) dengan fokus pada pemahaman konsep dan kemampuan penalaran aplikatif peserta didik.`;
}
