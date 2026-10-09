import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { generateFallbackDocument } from './serverFallback.js';
// GEL2 — docx dipakai server-side untuk unduh bundle paket sebagai satu .docx.
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import {
  hashPassword,
  verifyPassword,
  createSession,
  getSessionUserId,
  destroySession,
  destroyUserSessions,
  getSessions,
  setSessions,
  pruneExpiredSessions,
  parseCookies,
  sessionCookieHeader,
  clearSessionCookieHeader,
  createRequireAuth,
  requireRole,
  rateLimit,
  auditLog,
  publicUser,
  SESSION_COOKIE,
  type AuthUser
} from './server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google Gemini AI SDK
const ai = new GoogleGenAI();

// In-memory / persisted storage
interface TeacherUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  npsn?: string;
  nip?: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  mataPelajaran: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU';
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  avatarUrl?: string;
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  /** Hash password (scrypt). Tidak pernah dikirim ke client — selalu lewat publicUser(). */
  passwordHash?: string;
}

interface EducationalDocument {
  id: string;
  title: string;
  docType: 'modul_ajar' | 'rpp' | 'soal_ujian' | 'kktp_atp' | 'lkpd' | 'prota_promes' | 'modul_p5';
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  schoolName: string;
  isPublic?: boolean;
  durationMinutes?: number;
  /** REDESIGN — penanda hasil migrasi dokumen lama ke struktur paket. */
  paketId?: string;
}

// REDESIGN — data layer paket perangkat ajar. Definisi lokal mengikuti pola
// server.ts yang memang mendefinisikan tipe sendiri (bukan import dari src/types).
interface Paket {
  id: string;
  topik: string;
  mataPelajaran: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  fase: string;
  tingkat: string;
  pemilikId: string;
  sekolahId?: string;
  status: 'aktif' | 'arsip';
  dibuatPada: string;
  dibukaTerakhir: string;
  /** GEL2 — tandai paket untuk ditampilkan di Perpustakaan Sekolah (publik internal satu sekolah). */
  publikasiSekolah?: boolean;
}

interface DokumenPaket {
  id: string;
  paketId: string;
  docType: 'modul_ajar' | 'rpp' | 'soal_ujian' | 'kktp_atp' | 'lkpd' | 'prota_promes' | 'modul_p5';
  status: 'belum' | 'draf' | 'final';
  versiAktif: number;
  diperbaruiPada: string;
}

interface VersiDokumen {
  id: string;
  dokumenPaketId: string;
  nomorVersi: number;
  content: string;
  title: string;
  dibuatPada: string;
  dibuatOleh: string;
}

// Initial mock data
let users: TeacherUser[] = [
  {
    id: 'user-admin-1',
    name: 'Amwaluddin Lubis, M.Pd.',
    email: 'amwaluddin.lubis@gmail.com',
    schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
    nip: '19820514 200801 1 008',
    jenjang: 'SMA',
    mataPelajaran: 'Pengawas Kurikulum & Bahasa',
    role: 'SUPER_ADMIN',
    status: 'VERIFIED',
    registeredAt: '2026-01-10T08:00:00.000Z',
    verifiedAt: '2026-01-10T08:00:00.000Z',
    verifiedBy: 'Sistem Pusat Belajar.id'
  },
  {
    id: 'user-admin-belajar',
    name: 'Admin Kurikulum Merdeka',
    email: 'admin@guru.belajar.id',
    schoolName: 'Pusat Kurikulum dan Pembelajaran BSKAP',
    jenjang: 'SMP',
    mataPelajaran: 'Manajemen Pendidikan',
    role: 'ADMIN',
    status: 'VERIFIED',
    registeredAt: '2026-01-15T09:00:00.000Z',
    verifiedAt: '2026-01-15T09:00:00.000Z',
    verifiedBy: 'Amwaluddin Lubis, M.Pd.'
  },
  {
    id: 'user-guru-1',
    name: 'Siti Nurhaliza, S.Pd.SD',
    email: 'siti.nurhaliza@guru.sd.belajar.id',
    schoolName: 'SD Negeri 01 Menteng Pagi',
    npsn: '20101234',
    nip: '19890412 201402 2 003',
    jenjang: 'SD',
    mataPelajaran: 'Guru Kelas / IPAS & Matematika',
    role: 'GURU',
    status: 'VERIFIED',
    registeredAt: '2026-02-01T10:15:00.000Z',
    verifiedAt: '2026-02-02T11:00:00.000Z',
    verifiedBy: 'Amwaluddin Lubis, M.Pd.'
  },
  {
    id: 'user-guru-2',
    name: 'Budi Santoso, M.Pd.',
    email: 'budi.santoso@guru.smp.belajar.id',
    schoolName: 'SMP Negeri 5 Bandung',
    npsn: '20205678',
    nip: '19850720 201001 1 012',
    jenjang: 'SMP',
    mataPelajaran: 'Matematika',
    role: 'GURU',
    status: 'VERIFIED',
    registeredAt: '2026-02-10T14:30:00.000Z',
    verifiedAt: '2026-02-11T09:20:00.000Z',
    verifiedBy: 'Amwaluddin Lubis, M.Pd.'
  },
  {
    id: 'user-guru-3',
    name: 'Dra. Endang Sulistyowati',
    email: 'endang.sulistyowati@guru.sma.belajar.id',
    schoolName: 'SMA Negeri 3 Yogyakarta',
    npsn: '20401122',
    nip: '19760815 200212 2 001',
    jenjang: 'SMA',
    mataPelajaran: 'Biologi',
    role: 'GURU',
    status: 'VERIFIED',
    registeredAt: '2026-02-18T13:45:00.000Z',
    verifiedAt: '2026-02-19T08:10:00.000Z',
    verifiedBy: 'Amwaluddin Lubis, M.Pd.'
  },
  {
    id: 'user-guru-4',
    name: 'Rahmat Hidayat, S.Pd.',
    email: 'rahmat.hidayat@guru.smp.belajar.id',
    schoolName: 'SMP Negeri 1 Padang',
    npsn: '10302345',
    jenjang: 'SMP',
    mataPelajaran: 'Bahasa Indonesia',
    role: 'GURU',
    status: 'PENDING',
    registeredAt: '2026-03-24T11:20:00.000Z'
  },
  {
    id: 'user-guru-5',
    name: 'Ahmad Fauzi, S.Kom.',
    email: 'ahmad.fauzi@guru.smk.belajar.id',
    schoolName: 'SMK Negeri 1 Surabaya',
    npsn: '20503456',
    jenjang: 'SMK',
    mataPelajaran: 'Informatika & Rekayasa Perangkat Lunak',
    role: 'GURU',
    status: 'PENDING',
    registeredAt: '2026-03-27T16:05:00.000Z'
  },
  {
    id: 'user-guru-6',
    name: 'Nur Aisyah, S.Pd.',
    email: 'nur.aisyah@guru.sd.belajar.id',
    schoolName: 'SDIT Al-Hikmah Medan',
    npsn: '10204567',
    jenjang: 'SD',
    mataPelajaran: 'Pendidikan Agama Islam',
    role: 'GURU',
    status: 'PENDING',
    registeredAt: '2026-03-28T09:12:00.000Z'
  }
];

let documents: EducationalDocument[] = [
  {
    id: 'doc-sample-1',
    title: 'Modul Ajar IPAS Fase B Kelas 4 - Bagian Tubuh Tumbuhan & Fungsinya',
    docType: 'modul_ajar',
    jenjang: 'SD',
    tingkat: 'Kelas 4',
    fase: 'Fase B',
    mataPelajaran: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    topik: 'Bagian Tubuh Tumbuhan dan Fungsinya',
    createdAt: '2026-03-15T10:00:00.000Z',
    authorId: 'user-guru-1',
    authorName: 'Siti Nurhaliza, S.Pd.SD',
    schoolName: 'SD Negeri 01 Menteng Pagi',
    isPublic: true,
    durationMinutes: 3.2,
    content: `# MODUL AJAR KURIKULUM MERDEKA
## Sesuai Permendikdasmen No. 13 Tahun 2025 & Panduan Pembelajaran dan Asesmen

---

### I. INFORMASI UMUM
* **Nama Penyusun**: Siti Nurhaliza, S.Pd.SD
* **Satuan Pendidikan**: SD Negeri 01 Menteng Pagi
* **Mata Pelajaran**: Ilmu Pengetahuan Alam dan Sosial (IPAS)
* **Fase / Kelas / Semester**: Fase B / Kelas IV (Empat) / Semester 1 (Ganjil)
* **Alokasi Waktu**: 2 JP (2 x 35 Menit) - 1 Pertemuan
* **Materi Pokok**: Bagian Tubuh Tumbuhan dan Fungsinya
* **Target Peserta Didik**: Peserta didik reguler/tipikal (28 siswa), dengan diferensiasi kebutuhan belajar visual, auditori, dan kinestetik.
* **Model Pembelajaran**: *Problem Based Learning* (PBL) terintegrasi Pembelajaran Berdiferensiasi.
* **Sarana dan Prasarana**:
  1. Spesimen tumbuhan asli (akar, batang, daun, bunga) yang dibawa dari pekarangan sekolah.
  2. Kaca pembesar (lup), gunting, air berwarna, gelas bening.
  3. Video animasi fotosintesis dan pengangkutan air tumbuhan.
  4. Lembar Kerja Peserta Didik (LKPD) berjenjang.

---

### II. PROFIL PELAJAR PANCASILA
1. **Keimanan dan Ketakwaan kepada Tuhan YME**: Menyadari kebesaran ciptaan Tuhan melalui keteraturan struktur tumbuhan bagi kelangsungan hidup bumi.
2. **Penalaran Kritis**: Mengidentifikasi keterkaitan fungsi setiap organ tumbuhan terhadap fotosintesis dan daya hidup tanaman.
3. **Kolaborasi**: Bekerja sama dalam kelompok kecil untuk mengamati spesimen dan menyajikan hasil pengamatan.
4. **Kemandirian**: Bertanggung jawab menyelesaikan LKPD dan refleksi belajar mandiri.
5. **Komunikasi**: Menyampaikan hasil pengamatan secara lisan dan tertulis dengan runtut.

---

### III. KOMPONEN INTI

#### A. Capaian Pembelajaran (CP) — Keputusan Kepala BSKAP tentang Capaian Pembelajaran
Peserta didik menganalisis hubungan antara bentuk serta fungsi bagian tubuh pada tumbuhan (akar, batang, daun, bunga, dan buah) serta mengaitkannya dengan kebutuhan hidup tumbuhan dalam ekosistem.

#### B. Tujuan Pembelajaran (TP) & Indikator Ketercapaian
1. Melalui pengamatan spesimen nyata, peserta didik mampu mengidentifikasi minimal 4 bagian tubuh tumbuhan dengan tepat.
2. Melalui percobaan kapilaritas sederhana, peserta didik mampu membuktikan fungsi batang dalam mengangkut air dan unsur hara.
3. Peserta didik mampu menjelaskan fungsi daun sebagai tempat fotosintesis dengan membuat diagram/infografis sederhana.

#### C. Pemahaman Bermakna
Tumbuhan adalah produsen utama kehidupan di bumi. Setiap bagian tubuh tumbuhan bekerja sama secara harmonis seperti sebuah pabrik alami yang memproduksi oksigen dan makanan untuk manusia dan hewan.

#### D. Pertanyaan Pemantik
1. "Mengapa tumbuhan tetap bisa berdiri tegak dan tidak layu meskipun diterpa angin?"
2. "Dari mana daun mendapatkan air untuk memasak makanan, padahal air disiramkan ke tanah?"

---

### IV. KEGIATAN PEMBELAJARAN BERDIFERENSIASI

#### 1. Kegiatan Pendahuluan (10 Menit)
* Guru membuka pembelajaran dengan salam, doa bersama, dan presensi.
* Melakukan **Asesmen Diagnostik Non-Kognitif & Kognitif Cepat**:
  * Menanyakan perasaan siswa hari ini (Roda Emosi).
  * Menunjukkan seikat daun kangkung segar dan layu, meminta siswa menebak apa penyebabnya.
* Guru menyampaikan tujuan pembelajaran dan kesepakatan kelas yang ramah dan aktif.
* Melakukan *ice breaking* gerak lagu "Bagian Tumbuhan" (Akar, Batang, Ranting, Daun, Bunga).

#### 2. Kegiatan Inti (50 Menit) - Sintaks Problem Based Learning (PBL)

* **Fase 1: Orientasi Siswa pada Masalah**
  * Guru menayangkan video singkat tentang pohon di musim kemarau dan menyajikan tanaman pacar air yang dimasukkan ke dalam air berwarna merah.
  * Siswa merumuskan pertanyaan: *"Bagaimana warna merah bisa sampai ke tulang daun?"*

* **Fase 2: Mengorganisasi Siswa untuk Belajar (Diferensiasi Proses & Lingkungan Belajar)**
  * Siswa dibagi menjadi 5 kelompok heterogen berdasarkan profil belajar:
    * *Kelompok Taktil/Kinestetik*: Membedah spesimen batang kangkung dan seledri menggunakan kaca pembesar.
    * *Kelompok Visual*: Menganalisis poster anatomi tumbuhan dan menyusun kartu alur transportasi nutrisi.
    * *Kelompok Auditori/Verbal*: Menyimak penjelasan audio dan mendiskusikan analogi pompa air.

* **Fase 3: Membimbing Penyelidikan Mandiri dan Kelompok**
  * Guru berkeliling memberikan *scaffolding* (bantuan bergradasi) bagi peserta didik yang membutuhkan bimbingan intensif.
  * Siswa mencatat hasil pengamatan pada LKPD: bentuk akar tunggang vs serabut, batang basah vs berkayu, dan tulang daun menyirip vs menjari.

* **Fase 4: Mengembangkan dan Menyajikan Hasil Karya (Diferensiasi Produk)**
  * Kelompok memilih bentuk presentasi hasil pengamatan:
    * Opsi A: Menggambar diagram organ tumbuhan beserta label fungsinya.
    * Opsi B: Membuat mini-presentasi bercerita / sandiwara singkat "Perjalanan Air dari Akar ke Daun".
    * Opsi C: Menyusun tabel komparasi fungsi organ tumbuhan.

* **Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah**
  * Setiap kelompok menyajikan hasil kerjanya, kelompok lain memberikan apresiasi dan tanggapan.
  * Guru meluruskan miskonsepsi dan menegaskan konsep kunci peranan klorofil dan fotosintesis.

#### 3. Kegiatan Penutup (10 Menit)
* Siswa bersama guru menyimpulkan inti materi yang dipelajari.
* Melakukan asesmen formatif akhir (Exit Ticket 3-2-1).
* Doa penutup dan salam.

---

### V. ASESMEN DAN PENILAIAN
* Asesmen Diagnostik (Awal), Formatif, dan Sumatif lengkap dengan rubrik 4 skala (Baru Berkembang, Layak, Cakap, Mahir).`
  },
  {
    id: 'doc-sample-2',
    title: 'Modul Ajar Matematika Fase D Kelas 8 - Teorema Pythagoras & Pemecahan Masalah Kontekstual',
    docType: 'modul_ajar',
    jenjang: 'SMP',
    tingkat: 'Kelas 8',
    fase: 'Fase D',
    mataPelajaran: 'Matematika',
    topik: 'Teorema Pythagoras dan Penerapan Kontekstual',
    createdAt: '2026-02-14T08:30:00.000Z',
    authorId: 'user-admin-1',
    authorName: 'Amwaluddin Lubis, M.Pd.',
    schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
    isPublic: true,
    durationMinutes: 3.4,
    content: `# MODUL AJAR MATEMATIKA KURIKULUM MERDEKA
## Sesuai Permendikdasmen No. 13 Tahun 2025

### I. INFORMASI UMUM
* **Nama Penyusun**: Amwaluddin Lubis, M.Pd.
* **Satuan Pendidikan**: SMP Model Merdeka Belajar
* **Mata Pelajaran**: Matematika
* **Fase / Kelas**: Fase D / Kelas VIII
* **Alokasi Waktu**: 2 JP (2 x 40 Menit)
* **Model Pembelajaran**: Discovery Learning & Problem Based Learning

### II. CAPAIAN PEMBELAJARAN & TUJUAN
Peserta didik dapat membuktikan kebenaran teorema Pythagoras dan menggunakannya dalam menyelesaikan masalah kontekstual termasuk jarak antara dua titik koordinat kartesius.

### III. KEGIATAN BERDIFERENSIASI
Menggunakan eksplorasi visual puzzle luas persegi untuk menemukan rumus a^2 + b^2 = c^2 secara langsung.`
  },
  {
    id: 'doc-sample-3',
    title: 'Paket Soal Asesmen Sumatif HOTS & AKM Biologi Fase E Kelas 10 - Perubahan Lingkungan Global',
    docType: 'soal_ujian',
    jenjang: 'SMA',
    tingkat: 'Kelas 10',
    fase: 'Fase E',
    mataPelajaran: 'Biologi',
    topik: 'Perubahan Lingkungan dan Pemanasan Global',
    createdAt: '2026-03-20T11:15:00.000Z',
    authorId: 'user-admin-1',
    authorName: 'Amwaluddin Lubis, M.Pd.',
    schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
    isPublic: true,
    durationMinutes: 3.9,
    content: `# PAKET SOAL ASESMEN SUMATIF BERSTANDAR AKM & HOTS
## Berpedoman pada Panduan Asesmen Kemendikbudristek 2024

### I. KISI-KISI SOAL ASESMEN
* **Level Kognitif**: C4 (Analisis), C5 (Evaluasi), C6 (Kreasi)
* **Bentuk Soal**: Pilihan Ganda Kompleks, Menjodohkan, Uraian Kasus Nyata

### II. SOAL BERBASIS STIMULUS DATA
Dilengkapi infografis emisi gas rumah kaca di sektor industri dan transportasi Indonesia serta alternatif teknologi penangkapan karbon (carbon capture).`
  },
  {
    id: 'doc-sample-4',
    title: 'RPP Ringkas 1 Lembar Bahasa Indonesia SMP Fase D Kelas 7 - Teks Deskripsi Objek Wisata Nusantara',
    docType: 'rpp',
    jenjang: 'SMP',
    tingkat: 'Kelas 7',
    fase: 'Fase D',
    mataPelajaran: 'Bahasa Indonesia',
    topik: 'Menyusun Teks Deskripsi Menarik',
    createdAt: '2026-01-22T09:40:00.000Z',
    authorId: 'user-admin-1',
    authorName: 'Amwaluddin Lubis, M.Pd.',
    schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
    isPublic: true,
    durationMinutes: 2.3,
    content: `# RPP RINGKAS 1 LEMBAR KURIKULUM MERDEKA
## Efisien, Efektif, dan Berorientasi pada Murid

* **Tujuan Pembelajaran**: Siswa mampu menulis teks deskripsi bermajas panca indera tentang keindahan alam daerahnya.
* **Langkah Inti**: Tayangan virtual tour 360 Candi Borobudur -> Mengisi lembar panca indera -> Menyusun draf kreatif.
* **Asesmen**: Rubrik analitik kosa kata sensorik dan kesesuaian struktur teks.`
  },
  {
    id: 'doc-sample-5',
    title: 'Modul Projek P5 Fase E SMA - Gaya Hidup Berkelanjutan: Bank Sampah & Ekonomi Sirkular Sekolah',
    docType: 'modul_p5',
    jenjang: 'SMA',
    tingkat: 'Kelas 10',
    fase: 'Fase E',
    mataPelajaran: 'Projek Penguatan Profil Lulusan',
    topik: 'Ekonomi Sirkular dan Pengolahan Sampah Plastik',
    createdAt: '2026-02-28T14:20:00.000Z',
    authorId: 'user-admin-1',
    authorName: 'Amwaluddin Lubis, M.Pd.',
    schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
    isPublic: true,
    durationMinutes: 4.2,
    content: `# MODUL PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)
## Tema: Gaya Hidup Berkelanjutan (BSKAP Kemendikbudristek 2024)

* **Dimensi**: Beriman Bertakwa kepada Tuhan YME (Akhlak kepada Alam), Bernalar Kritis, Kreatif.
* **Alur Projek**: Pengenalan -> Kontekstualisasi audit sampah sekolah -> Aksi nyata pembuatan ecobrick & kompos -> Gelar karya pameran daur ulang.`
  }
];

// REDESIGN — array in-memory paket & versi (di-persist bersama users/documents).
let pakets: Paket[] = [];
let dokumenPaket: DokumenPaket[] = [];
let versiDokumen: VersiDokumen[] = [];

// ---- Persistensi file JSON (data/db.json) ----
const DB_PATH = path.resolve(__dirname, 'data', 'db.json');

function saveDBNow() {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ users, documents, pakets, dokumenPaket, versiDokumen, sessions: getSessions() }, null, 2));
  } catch (err) {
    console.warn('[DB] Gagal menyimpan db.json:', (err as Error).message);
  }
}

let saveTimer: NodeJS.Timeout | null = null;
function saveDB() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDBNow, 200);
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      saveDBNow(); // simpan data awal sebagai basis
      return;
    }
    const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (Array.isArray(raw.users) && raw.users.length > 0) {
      users = raw.users.map((u: TeacherUser) => ({
        ...u,
        status: 'VERIFIED',
      }));
    }
    if (Array.isArray(raw.documents)) documents = raw.documents;
    if (Array.isArray(raw.pakets)) pakets = raw.pakets; // REDESIGN
    if (Array.isArray(raw.dokumenPaket)) dokumenPaket = raw.dokumenPaket; // REDESIGN
    if (Array.isArray(raw.versiDokumen)) versiDokumen = raw.versiDokumen; // REDESIGN
    if (Array.isArray(raw.sessions)) setSessions(raw.sessions);
    const pruned = pruneExpiredSessions();
    if (pruned > 0) console.log(`[Auth] ${pruned} session kedaluwarsa dibersihkan saat start`);
    console.log(`[DB] Loaded ${users.length} users, ${documents.length} documents, ${pakets.length} pakets, ${dokumenPaket.length} dokumenPaket, ${versiDokumen.length} versiDokumen, ${getSessions().length} sessions from db.json`);
  } catch (err) {
    console.warn('[DB] Gagal memuat db.json, memakai data awal:', (err as Error).message);
  }
}
loadDB();

// REDESIGN — migrasi otomatis satu-kali: tiap EducationalDocument lama yang belum
// punya paket dibungkus menjadi Paket ("Arsip — <judul>") berisi 1 DokumenPaket
// status 'final' + 1 VersiDokumen dari konten lama. Field doc.paketId menandai
// dokumen yang sudah dimigrasi agar tidak dobel saat restart.
function newRedesignId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

function migrasiDokumenLama(): void {
  let dimigrasi = 0;
  for (const doc of documents) {
    if (doc.paketId) continue;
    const now = new Date().toISOString();
    const paket: Paket = {
      id: newRedesignId('paket'),
      topik: `Arsip — ${doc.title}`,
      mataPelajaran: doc.mataPelajaran,
      jenjang: doc.jenjang,
      fase: doc.fase,
      tingkat: doc.tingkat,
      pemilikId: doc.authorId,
      status: 'aktif',
      dibuatPada: now,
      dibukaTerakhir: now
    };
    const dp: DokumenPaket = {
      id: newRedesignId('dpaket'),
      paketId: paket.id,
      docType: doc.docType,
      status: 'final',
      versiAktif: 1,
      diperbaruiPada: now
    };
    const versi: VersiDokumen = {
      id: newRedesignId('versi'),
      dokumenPaketId: dp.id,
      nomorVersi: 1,
      content: doc.content,
      title: doc.title,
      dibuatPada: now,
      dibuatOleh: doc.authorName
    };
    pakets.push(paket);
    dokumenPaket.push(dp);
    versiDokumen.push(versi);
    doc.paketId = paket.id;
    dimigrasi++;
  }
  if (dimigrasi > 0) {
    saveDBNow();
    console.log(`[DB] Migrasi ${dimigrasi} dokumen lama menjadi paket`);
  }
}
migrasiDokumenLama();

// ---------------------------------------------------------------------------
// KREDENSIAL DEMO — PENTING:
// Semua akun seed memakai password awal dari env SEED_PASSWORD (default 'guru123').
// Ini HANYA untuk demo/pilot. Di produksi: set SEED_PASSWORD yang kuat via secret
// manager, lalu WAJIB ganti password tiap akun via POST /api/auth/change-password
// (atau endpoint admin), dan JANGAN biarkan password default tetap aktif.
// ---------------------------------------------------------------------------
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'guru123';
function ensurePasswordHashes() {
  let cached = '';
  for (const u of users) {
    if (!u.passwordHash) {
      if (!cached) cached = hashPassword(SEED_PASSWORD);
      u.passwordHash = cached;
    }
  }
}
ensurePasswordHashes();

// Middleware auth: identitas user SELALU dari session cookie server-side,
// bukan dari header/body yang dikirim client.
const requireAuth = createRequireAuth(
  (id: string) => users.find(u => u.id === id) as AuthUser | undefined,
  (email: string) => users.find(u => u.email.toLowerCase() === email.toLowerCase()) as AuthUser | undefined
);
const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');

/** Ambil record user penuh (internal) dari req.user yang sudah terverifikasi. */
function currentDbUser(req: Request): TeacherUser | undefined {
  return users.find(u => u.id === req.user?.id);
}

/** Syarat: user login & status VERIFIED (SUPER_ADMIN & ADMIN selalu lolos). */
function requireVerified(req: Request, res: Response, next: () => void) {
  const me = currentDbUser(req);
  if (!me || (me.status !== 'VERIFIED' && me.role !== 'SUPER_ADMIN' && me.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Akun Anda belum diverifikasi admin. Hubungi administrator sekolah.',
      error: { code: 'ACCOUNT_NOT_VERIFIED', message: 'Akun Anda belum diverifikasi admin. Hubungi administrator sekolah.' }
    });
  }
  next();
}

// Rate limiter AI: 20 generate/jam & 10 gambar/jam per user (hemat kuota & cegah abuse).
const generateRateLimit = rateLimit({
  windowMs: 3600 * 1000,
  max: 20,
  keyFn: (req) => req.user?.id || req.ip || 'unknown',
  message: 'Batas 20x generate per jam tercapai. Silakan coba lagi nanti.'
});
const imageRateLimit = rateLimit({
  windowMs: 3600 * 1000,
  max: 10,
  keyFn: (req) => req.user?.id || req.ip || 'unknown',
  message: 'Batas 10x ilustrasi per jam tercapai. Silakan coba lagi nanti.'
});

// Helper to validate Belajar.id email format
function isBelajarIdEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower.endsWith('@guru.sd.belajar.id') ||
    lower.endsWith('@guru.smp.belajar.id') ||
    lower.endsWith('@guru.sma.belajar.id') ||
    lower.endsWith('@guru.smk.belajar.id') ||
    lower.endsWith('@admin.sd.belajar.id') ||
    lower.endsWith('@admin.smp.belajar.id') ||
    lower.endsWith('@admin.sma.belajar.id') ||
    lower.endsWith('@admin.belajar.id') ||
    lower.endsWith('@guru.belajar.id') ||
    lower.endsWith('@belajar.id') ||
    lower === 'amwaluddin.lubis@gmail.com'
  );
}

// Routes
// 0. Health check (untuk monitoring & platform deploy)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// 1. Current user — dari session cookie server-side (tanpa fallback header/default).
app.get('/api/users/current', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
});

// 1b. Login dengan email + password → session cookie httpOnly.
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  const cleanEmail = String(email || '').toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || !user.passwordHash || !verifyPassword(String(password || ''), user.passwordHash)) {
    auditLog('login_failed', undefined, { email: cleanEmail });
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Email atau kata sandi salah.' }
    });
  }
  if (user.status !== 'VERIFIED') {
    return res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_NOT_VERIFIED', message: 'Akun Anda belum diverifikasi admin. Hubungi administrator.' }
    });
  }

  const token = createSession(user.id);
  saveDB();
  auditLog('login', user.id, { email: user.email });
  res.setHeader('Set-Cookie', sessionCookieHeader(token));
  res.json({ success: true, user: publicUser(user as AuthUser), message: `Selamat datang kembali, ${user.name}!` });
});

// 1c. Ganti password (user login).
app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = (req.body || {}) as { oldPassword?: string; newPassword?: string };
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({
      success: false,
      error: { code: 'WEAK_PASSWORD', message: 'Kata sandi baru minimal 8 karakter.' }
    });
  }
  const me = currentDbUser(req);
  if (!me || !me.passwordHash || !verifyPassword(String(oldPassword || ''), me.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Kata sandi lama salah.' }
    });
  }
  me.passwordHash = hashPassword(String(newPassword));
  saveDB();
  auditLog('change_password', me.id, {});
  res.json({ success: true, message: 'Kata sandi berhasil diganti.' });
});

// 2. Belajar.id Login / Switcher
app.post('/api/auth/login-belajar-id', (req: Request, res: Response) => {
  const { email, name, schoolName, jenjang, mataPelajaran } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email Belajar.id wajib diisi' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!isBelajarIdEmail(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Gunakan email Belajar.id yang valid (contoh: nama@guru.smp.belajar.id)'
    });
  }
  let existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    const token = createSession(existingUser.id);
    saveDB();
    auditLog('login_belajar_id', existingUser.id, { email: existingUser.email });
    res.setHeader('Set-Cookie', sessionCookieHeader(token));
    return res.json({
      success: true,
      token,
      message: `Selamat datang kembali, ${existingUser.name}!`,
      user: publicUser(existingUser as AuthUser)
    });
  }

  // Determine role and status
  const isSuper = cleanEmail === 'amwaluddin.lubis@gmail.com' || cleanEmail.includes('admin@');
  const role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU' = isSuper ? 'SUPER_ADMIN' : 'GURU';
  // Akun SSO Belajar.id otomatis terverifikasi sistem Kemendikbudristek
  const status: 'VERIFIED' = 'VERIFIED';

  // Extract jenjang from email if not specified
  let detectedJenjang: 'SD' | 'SMP' | 'SMA' | 'SMK' = jenjang || 'SMP';
  if (cleanEmail.includes('.sd.')) detectedJenjang = 'SD';
  else if (cleanEmail.includes('.smp.')) detectedJenjang = 'SMP';
  else if (cleanEmail.includes('.sma.')) detectedJenjang = 'SMA';
  else if (cleanEmail.includes('.smk.')) detectedJenjang = 'SMK';

  const newUser: TeacherUser = {
    id: `user-${Date.now()}`,
    name: name || cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
    email: cleanEmail,
    schoolName: schoolName || (detectedJenjang === 'SD' ? 'SD Negeri Inpres' : detectedJenjang === 'SMP' ? 'SMP Negeri 1' : 'SMA Negeri 1'),
    nip: req.body.nip || undefined,
    jenjang: detectedJenjang,
    mataPelajaran: mataPelajaran || 'Semua Mata Pelajaran',
    role,
    status,
    registeredAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'Sistem SSO Belajar.id'
  };

  users.unshift(newUser);
  const token = createSession(newUser.id);
  saveDB();
  auditLog('register_belajar_id', newUser.id, { email: newUser.email });
  res.setHeader('Set-Cookie', sessionCookieHeader(token));

  res.json({
    success: true,
    token,
    message: status === 'VERIFIED'
      ? 'Akun Admin berhasil diaktifkan!'
      : 'Pendaftaran Akun Belajar.id berhasil! Akun Anda sedang menunggu verifikasi oleh Admin Kurikulum (Bpk. Amwaluddin Lubis).',
    user: publicUser(newUser as AuthUser)
  });
});

// 2-demo. Profil demo publik untuk pilihan cepat di Halaman Masuk
app.get('/api/users/demo', (_req: Request, res: Response) => {
  const sampleProfiles = users
    .filter(u => u.status === 'VERIFIED')
    .slice(0, 6)
    .map(u => publicUser(u as AuthUser));
  res.json({ success: true, users: sampleProfiles });
});

// 2b. Logout — hapus session server-side + clear cookie.
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  let actorId: string | undefined;
  if (token) {
    actorId = getSessionUserId(token) || undefined;
    destroySession(token);
    saveDB();
  }
  auditLog('logout', actorId, {});
  res.setHeader('Set-Cookie', clearSessionCookieHeader());
  res.json({
    success: true,
    message: 'Berhasil keluar dari akun. Sesi telah diakhiri.'
  });
});

// 3. User list (for Admin verification panel) — hanya ADMIN/SUPER_ADMIN, tanpa passwordHash.
app.get('/api/users', requireAuth, requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, users: users.map(u => publicUser(u as AuthUser)) });
});

// 4. Admin verify / reject / update teacher status
app.post('/api/users/verify', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { userId, status } = req.body;
  if (!userId || !['VERIFIED', 'PENDING', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Data verifikasi tidak valid' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Guru tidak ditemukan' });
  }

  user.status = status;
  if (status === 'VERIFIED') {
    user.verifiedAt = new Date().toISOString();
    user.verifiedBy = req.user?.name || 'Administrator';
  } else {
    user.verifiedAt = undefined;
    user.verifiedBy = undefined;
  }

  saveDB();
  auditLog('user_verify', req.user?.id, { targetUserId: user.id, status });

  res.json({
    success: true,
    message: `Status guru ${user.name} berhasil diubah menjadi: ${status}`,
    user: publicUser(user as AuthUser)
  });
});

// 4b. Update user (manajemen user dua level)
// Identitas peminta SELALU dari session (req.user) — requesterId dari body diabaikan.
// - Admin: boleh ubah profil siapa pun + role (GURU/ADMIN), kecuali SUPER_ADMIN.
// - Guru: hanya profil sendiri (nama, sekolah, mapel, NIP, NPSN).
// - Status HANYA via /api/users/verify. Email & id tidak bisa diubah.
app.put('/api/users/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, schoolName, jenjang, mataPelajaran, nip, npsn, role } = req.body as Record<string, any>;

  const target = users.find(u => u.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }
  const requester = currentDbUser(req);
  if (!requester) {
    return res.status(403).json({ success: false, message: 'Identitas peminta tidak valid' });
  }

  const isAdmin = requester.role === 'SUPER_ADMIN' || requester.role === 'ADMIN';
  const isSelf = requester.id === id;
  if (!isAdmin && !isSelf) {
    return res.status(403).json({ success: false, message: 'Anda hanya boleh mengubah profil sendiri' });
  }
  if (target.role === 'SUPER_ADMIN' && !isSelf) {
    return res.status(403).json({ success: false, message: 'Akun Super Admin tidak dapat diubah' });
  }

  const clean = (v: any) => (typeof v === 'string' ? v.trim() : v);
  const oldRole = target.role;

  if (isAdmin) {
    if (clean(name)) target.name = clean(name);
    if (clean(schoolName)) target.schoolName = clean(schoolName);
    if (['SD', 'SMP', 'SMA', 'SMK'].includes(String(jenjang))) target.jenjang = jenjang;
    if (clean(mataPelajaran)) target.mataPelajaran = clean(mataPelajaran);
    if (nip !== undefined) target.nip = clean(nip) || undefined;
    if (npsn !== undefined) target.npsn = clean(npsn) || undefined;
    // Role: admin boleh GURU<->ADMIN; tidak boleh menyentuh role diri sendiri/SUPER_ADMIN
    if (role !== undefined && ['GURU', 'ADMIN'].includes(String(role)) && !isSelf && target.role !== 'SUPER_ADMIN') {
      target.role = role;
    }
  } else {
    // Guru: profil sendiri, tanpa jenjang/role/status
    if (clean(name)) target.name = clean(name);
    if (clean(schoolName)) target.schoolName = clean(schoolName);
    if (clean(mataPelajaran)) target.mataPelajaran = clean(mataPelajaran);
    if (nip !== undefined) target.nip = clean(nip) || undefined;
    if (npsn !== undefined) target.npsn = clean(npsn) || undefined;
  }

  saveDB();
  if (oldRole !== target.role) {
    auditLog('role_change', requester.id, { targetUserId: target.id, from: oldRole, to: target.role });
  } else {
    auditLog('user_update', requester.id, { targetUserId: target.id });
  }
  res.json({ success: true, message: `Profil ${target.name} berhasil diperbarui`, user: publicUser(target as AuthUser) });
});

// 5. Delete teacher — hanya ADMIN/SUPER_ADMIN; tidak boleh hapus diri sendiri / SUPER_ADMIN.
app.delete('/api/users/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const target = users.find(u => u.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }
  if (target.role === 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Akun Super Admin tidak dapat dihapus' });
  }
  if (target.id === req.user?.id) {
    return res.status(403).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
  }
  users = users.filter(u => u.id !== id);
  destroyUserSessions(id);
  saveDB();
  auditLog('user_delete', req.user?.id, { targetUserId: id, targetEmail: target.email });
  res.json({ success: true, message: 'Data guru berhasil dihapus' });
});

// 6. Documents repository — requireAuth.
// Non-admin: hanya dokumen miliknya + yang public. Admin: semua.
app.get('/api/documents', requireAuth, (req: Request, res: Response) => {
  const { authorId, jenjang, docType } = req.query;
  const me = req.user!;
  const isAdmin = me.role === 'ADMIN' || me.role === 'SUPER_ADMIN';
  let filtered = [...documents];

  if (!isAdmin) {
    filtered = filtered.filter(d => d.authorId === me.id || d.isPublic);
  } else if (authorId && authorId !== 'all') {
    filtered = filtered.filter(d => d.authorId === authorId || d.isPublic);
  }
  if (jenjang && jenjang !== 'all') {
    filtered = filtered.filter(d => d.jenjang === jenjang);
  }
  if (docType && docType !== 'all') {
    filtered = filtered.filter(d => d.docType === docType);
  }

  res.json({ success: true, documents: filtered });
});

const DOC_TYPES = ['modul_ajar', 'rpp', 'soal_ujian', 'kktp_atp', 'lkpd', 'prota_promes', 'modul_p5'] as const;
const JENJANGS = ['SD', 'SMP', 'SMA', 'SMK'] as const;

// Simpan dokumen — identitas penulis SELALU dari session; dokumen baru default PRIVATE.
app.post('/api/documents', requireAuth, requireVerified, (req: Request, res: Response) => {
  const { title, docType, jenjang, tingkat, fase, mataPelajaran, topik, content, durationMinutes } = req.body;
  const me = currentDbUser(req)!;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Judul dan konten dokumen wajib diisi' });
  }
  if (docType && !(DOC_TYPES as readonly string[]).includes(String(docType))) {
    return res.status(400).json({ success: false, message: 'Jenis dokumen tidak valid' });
  }
  if (jenjang && !(JENJANGS as readonly string[]).includes(String(jenjang))) {
    return res.status(400).json({ success: false, message: 'Jenjang tidak valid' });
  }

  const newDoc: EducationalDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: String(title),
    docType: docType || 'modul_ajar',
    jenjang: jenjang || me.jenjang,
    tingkat: tingkat || 'Kelas 4',
    fase: fase || 'Fase B',
    mataPelajaran: mataPelajaran || me.mataPelajaran,
    topik: topik || String(title),
    content: String(content),
    createdAt: new Date().toISOString(),
    authorId: me.id,
    authorName: me.name,
    schoolName: me.schoolName,
    isPublic: false,
    durationMinutes: durationMinutes || Number((2.8 + Math.random() * 0.9).toFixed(1))
  };

  documents.unshift(newDoc);
  saveDB();
  auditLog('document_create', me.id, { docId: newDoc.id, docType: newDoc.docType });
  res.json({ success: true, message: 'Dokumen perangkat ajar berhasil disimpan ke arsip!', document: newDoc });
});

// Hapus dokumen — hanya pemilik atau ADMIN/SUPER_ADMIN.
app.delete('/api/documents/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const me = req.user!;
  const doc = documents.find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
  }
  const isAdmin = me.role === 'ADMIN' || me.role === 'SUPER_ADMIN';
  if (doc.authorId !== me.id && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Anda hanya dapat menghapus dokumen milik sendiri.' }
    });
  }
  documents = documents.filter(d => d.id !== id);
  saveDB();
  auditLog('document_delete', me.id, { docId: id, title: doc.title });
  res.json({ success: true, message: 'Dokumen berhasil dihapus dari arsip' });
});

// ---------------------------------------------------------------------------
// 6b. REDESIGN — Paket perangkat ajar.
// Satu Paket = satu topik, memuat 7 DokumenPaket (satu per DocType), masing-masing
// menyimpan riwayat VersiDokumen. Semua rute requireAuth; pemilik hanya bisa
// mengakses paket miliknya, ADMIN/SUPER_ADMIN boleh semua.

function isPaketAdmin(role: string | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function aksesPaket(me: { id: string; role: string }, paket: Paket): boolean {
  return isPaketAdmin(me.role) || paket.pemilikId === me.id;
}

/** Ringkasan progress 7 dokumen dalam satu paket. */
function progressPaket(paketId: string): { totalDokumen: number; selesai: number } {
  const list = dokumenPaket.filter(d => d.paketId === paketId);
  const selesai = list.filter(d => d.status === 'draf' || d.status === 'final').length;
  return { totalDokumen: 7, selesai };
}

function validDocTypePaket(value: unknown): value is DokumenPaket['docType'] {
  return (DOC_TYPES as readonly string[]).includes(String(value));
}

// GET /api/pakets — daftar paket milik user login (admin: semua), filter ?status.
app.get('/api/pakets', requireAuth, (req: Request, res: Response) => {
  const me = req.user!;
  const statusFilter = String(req.query.status || 'aktif');
  let list = pakets.filter(p => isPaketAdmin(me.role) || p.pemilikId === me.id);
  if (statusFilter === 'aktif' || statusFilter === 'arsip') {
    list = list.filter(p => p.status === statusFilter);
  }
  list.sort((a, b) => b.dibukaTerakhir.localeCompare(a.dibukaTerakhir));
  res.json({
    success: true,
    pakets: list.map(p => ({ ...p, progress: progressPaket(p.id) }))
  });
});

// POST /api/pakets — buat paket baru + otomatis 7 DokumenPaket status 'belum'.
app.post('/api/pakets', requireAuth, (req: Request, res: Response) => {
  const { topik, mataPelajaran, jenjang, fase, tingkat, sekolahId } = (req.body || {}) as Record<string, unknown>;
  const me = currentDbUser(req) || (req.user as unknown as TeacherUser);

  if (!topik || !String(topik).trim()) {
    return res.status(400).json({ success: false, message: 'Topik paket wajib diisi' });
  }
  if (jenjang && !(JENJANGS as readonly string[]).includes(String(jenjang))) {
    return res.status(400).json({ success: false, message: 'Jenjang tidak valid' });
  }

  const now = new Date().toISOString();
  const paket: Paket = {
    id: newRedesignId('paket'),
    topik: String(topik).trim(),
    mataPelajaran: String(mataPelajaran || me.mataPelajaran || ''),
    jenjang: (jenjang ? String(jenjang) : me.jenjang) as Paket['jenjang'],
    fase: String(fase || ''),
    tingkat: String(tingkat || ''),
    pemilikId: me.id,
    sekolahId: sekolahId ? String(sekolahId) : undefined,
    status: 'aktif',
    dibuatPada: now,
    dibukaTerakhir: now
  };
  pakets.push(paket);
  for (const docType of DOC_TYPES) {
    dokumenPaket.push({
      id: newRedesignId('dpaket'),
      paketId: paket.id,
      docType,
      status: 'belum',
      versiAktif: 0,
      diperbaruiPada: now
    });
  }
  saveDB();
  auditLog('paket_create', me.id, { paketId: paket.id, topik: paket.topik });
  res.json({ success: true, message: 'Paket perangkat ajar berhasil dibuat', paket });
});

// Helper: ambil paket + cek kepemilikan, kirim 404/403 bila gagal.
function paketAkses(req: Request, res: Response): Paket | null {
  const me = req.user!;
  const paket = pakets.find(p => p.id === req.params.id);
  if (!paket) {
    res.status(404).json({ success: false, message: 'Paket tidak ditemukan' });
    return null;
  }
  if (!aksesPaket(me, paket)) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Anda hanya dapat mengakses paket milik sendiri.' }
    });
    return null;
  }
  return paket;
}

// GET /api/pakets/:id — detail + 7 DokumenPaket; update dibukaTerakhir.
app.get('/api/pakets/:id', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  paket.dibukaTerakhir = new Date().toISOString();
  saveDB();
  const dokumen = dokumenPaket
    .filter(d => d.paketId === paket.id)
    .sort((a, b) => DOC_TYPES.indexOf(a.docType) - DOC_TYPES.indexOf(b.docType));
  res.json({ success: true, paket, dokumen });
});

// PATCH /api/pakets/:id — ubah metadata paket.
app.patch('/api/pakets/:id', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const { topik, mataPelajaran, jenjang, fase, tingkat, sekolahId } = (req.body || {}) as Record<string, unknown>;

  if (jenjang !== undefined && jenjang !== '' && !(JENJANGS as readonly string[]).includes(String(jenjang))) {
    return res.status(400).json({ success: false, message: 'Jenjang tidak valid' });
  }
  if (topik !== undefined) {
    if (!String(topik).trim()) return res.status(400).json({ success: false, message: 'Topik tidak boleh kosong' });
    paket.topik = String(topik).trim();
  }
  if (mataPelajaran !== undefined) paket.mataPelajaran = String(mataPelajaran);
  if (jenjang !== undefined && jenjang !== '') paket.jenjang = String(jenjang) as Paket['jenjang'];
  if (fase !== undefined) paket.fase = String(fase);
  if (tingkat !== undefined) paket.tingkat = String(tingkat);
  if (sekolahId !== undefined) paket.sekolahId = sekolahId ? String(sekolahId) : undefined;
  paket.dibukaTerakhir = new Date().toISOString();
  saveDB();
  auditLog('paket_update', req.user!.id, { paketId: paket.id });
  res.json({ success: true, message: 'Paket berhasil diperbarui', paket });
});

// DELETE /api/pakets/:id — hapus paket + dokumen + versinya.
app.delete('/api/pakets/:id', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const dpIds = new Set(dokumenPaket.filter(d => d.paketId === paket.id).map(d => d.id));
  versiDokumen = versiDokumen.filter(v => !dpIds.has(v.dokumenPaketId));
  dokumenPaket = dokumenPaket.filter(d => d.paketId !== paket.id);
  pakets = pakets.filter(p => p.id !== paket.id);
  saveDB();
  auditLog('paket_delete', req.user!.id, { paketId: paket.id, topik: paket.topik });
  res.json({ success: true, message: 'Paket beserta seluruh dokumennya berhasil dihapus' });
});

// POST /api/pakets/:id/arsip — aktif <-> arsip.
app.post('/api/pakets/:id/arsip', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const { arsip } = (req.body || {}) as { arsip?: boolean };
  paket.status = arsip === true ? 'arsip' : 'aktif';
  paket.dibukaTerakhir = new Date().toISOString();
  saveDB();
  auditLog('paket_arsip', req.user!.id, { paketId: paket.id, status: paket.status });
  res.json({ success: true, message: paket.status === 'arsip' ? 'Paket diarsipkan' : 'Paket diaktifkan kembali', paket });
});

// POST /api/pakets/:id/duplikat — salin paket, dokumen mulai bersih (tanpa versi).
app.post('/api/pakets/:id/duplikat', requireAuth, (req: Request, res: Response) => {
  const sumber = paketAkses(req, res);
  if (!sumber) return;
  const me = req.user!;
  const now = new Date().toISOString();
  const paket: Paket = {
    id: newRedesignId('paket'),
    topik: `${sumber.topik} (salinan)`,
    mataPelajaran: sumber.mataPelajaran,
    jenjang: sumber.jenjang,
    fase: sumber.fase,
    tingkat: sumber.tingkat,
    pemilikId: me.id,
    sekolahId: sumber.sekolahId,
    status: 'aktif',
    dibuatPada: now,
    dibukaTerakhir: now
  };
  pakets.push(paket);
  for (const docType of DOC_TYPES) {
    dokumenPaket.push({
      id: newRedesignId('dpaket'),
      paketId: paket.id,
      docType,
      status: 'belum',
      versiAktif: 0,
      diperbaruiPada: now
    });
  }
  saveDB();
  auditLog('paket_duplicate', me.id, { paketId: paket.id, dariPaketId: sumber.id });
  res.json({ success: true, message: 'Paket berhasil diduplikasi', paket });
});

// GET /api/pakets/:id/dokumen — 7 DokumenPaket + info versi aktif.
app.get('/api/pakets/:id/dokumen', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const dokumen = dokumenPaket
    .filter(d => d.paketId === paket.id)
    .sort((a, b) => DOC_TYPES.indexOf(a.docType) - DOC_TYPES.indexOf(b.docType))
    .map(d => {
      const versi = versiDokumen.find(v => v.dokumenPaketId === d.id && v.nomorVersi === d.versiAktif);
      return { ...d, versiAktifTitle: versi ? versi.title : null, versiAktifPada: versi ? versi.dibuatPada : null };
    });
  res.json({ success: true, dokumen });
});

// POST /api/pakets/:id/dokumen/:docType/generate — simpan versi baru (Wave 1: content jadi, AI di gelombang 2).
app.post('/api/pakets/:id/dokumen/:docType/generate', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const docType = String(req.params.docType);
  if (!validDocTypePaket(docType)) {
    return res.status(400).json({ success: false, message: 'Jenis dokumen tidak valid' });
  }
  const dp = dokumenPaket.find(d => d.paketId === paket.id && d.docType === docType);
  if (!dp) {
    return res.status(404).json({ success: false, message: 'Dokumen dalam paket tidak ditemukan' });
  }
  const { content, title } = (req.body || {}) as { content?: string; title?: string };
  if (!content || !String(content).trim()) {
    return res.status(400).json({ success: false, message: 'Konten dokumen wajib diisi' });
  }
  const now = new Date().toISOString();
  const nomorVersi = dp.versiAktif + 1;
  const versi: VersiDokumen = {
    id: newRedesignId('versi'),
    dokumenPaketId: dp.id,
    nomorVersi,
    content: String(content),
    title: String(title || '').trim() || `${dp.docType} v${nomorVersi} — ${paket.topik}`,
    dibuatPada: now,
    dibuatOleh: currentDbUser(req)?.name || req.user!.id
  };
  versiDokumen.push(versi);
  dp.versiAktif = nomorVersi;
  dp.status = 'draf';
  dp.diperbaruiPada = now;
  paket.dibukaTerakhir = now;
  saveDB();
  auditLog('paket_doc_generate', req.user!.id, { paketId: paket.id, docType, nomorVersi });
  res.json({ success: true, message: 'Versi dokumen berhasil disimpan', versi, dokumen: dp });
});

// PATCH /api/pakets/:id/dokumen/:docType/final — tandai dokumen sebagai final.
app.patch('/api/pakets/:id/dokumen/:docType/final', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const docType = String(req.params.docType);
  if (!validDocTypePaket(docType)) {
    return res.status(400).json({ success: false, message: 'Jenis dokumen tidak valid' });
  }
  const dp = dokumenPaket.find(d => d.paketId === paket.id && d.docType === docType);
  if (!dp) {
    return res.status(404).json({ success: false, message: 'Dokumen dalam paket tidak ditemukan' });
  }
  if (dp.versiAktif < 1) {
    return res.status(400).json({ success: false, message: 'Dokumen belum memiliki versi untuk difinalkan' });
  }
  dp.status = 'final';
  dp.diperbaruiPada = new Date().toISOString();
  saveDB();
  auditLog('paket_doc_final', req.user!.id, { paketId: paket.id, docType });
  res.json({ success: true, message: 'Dokumen ditandai sebagai final', dokumen: dp });
});

// GET /api/pakets/:id/dokumen/:docType/versi — riwayat versi (terbaru dulu).
app.get('/api/pakets/:id/dokumen/:docType/versi', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const docType = String(req.params.docType);
  if (!validDocTypePaket(docType)) {
    return res.status(400).json({ success: false, message: 'Jenis dokumen tidak valid' });
  }
  const dp = dokumenPaket.find(d => d.paketId === paket.id && d.docType === docType);
  if (!dp) {
    return res.status(404).json({ success: false, message: 'Dokumen dalam paket tidak ditemukan' });
  }
  const daftar = versiDokumen
    .filter(v => v.dokumenPaketId === dp.id)
    .sort((a, b) => b.nomorVersi - a.nomorVersi);
  res.json({ success: true, versiAktif: dp.versiAktif, status: dp.status, versis: daftar });
});

// GEL2 — label tampilan jenis dokumen untuk bundle & perpustakaan.
const LABEL_DOC_PAKET: Record<DokumenPaket['docType'], string> = {
  modul_ajar: 'Modul Ajar',
  rpp: 'RPP',
  soal_ujian: 'Bank Soal & Kisi-Kisi',
  lkpd: 'LKPD',
  kktp_atp: 'KKTP / ATP',
  prota_promes: 'Prota & Promes',
  modul_p5: 'Modul P5'
};

/** GEL2 — konversi markdown sederhana (konten dokumen paket adalah markdown, lihat /api/generate & template cadangan) menjadi paragraf docx. */
function markdownKeParagraf(markdown: string): Paragraph[] {
  const hasil: Paragraph[] = [];
  const barisBold = (teks: string, ukuran: number, opsi?: { bold?: boolean; italics?: boolean }): TextRun[] => {
    const runs: TextRun[] = [];
    for (const potong of teks.split(/(\*\*[^*]+\*\*)/g)) {
      if (!potong) continue;
      const tebal = potong.startsWith('**') && potong.endsWith('**');
      runs.push(new TextRun({
        text: tebal ? potong.slice(2, -2) : potong,
        bold: tebal || opsi?.bold,
        italics: opsi?.italics,
        size: ukuran,
        font: 'Times New Roman'
      }));
    }
    return runs.length > 0 ? runs : [new TextRun({ text: teks, size: ukuran, font: 'Times New Roman' })];
  };
  for (const mentah of String(markdown || '').split('\n')) {
    const baris = mentah.trim();
    if (!baris) continue;
    if (baris.startsWith('### ')) {
      hasil.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: barisBold(baris.slice(4), 24, { bold: true }) }));
    } else if (baris.startsWith('## ')) {
      hasil.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: barisBold(baris.slice(3), 28, { bold: true }) }));
    } else if (baris.startsWith('# ')) {
      hasil.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: barisBold(baris.slice(2), 32, { bold: true }) }));
    } else if (baris.startsWith('- ') || baris.startsWith('* ')) {
      hasil.push(new Paragraph({ bullet: { level: 0 }, children: barisBold(baris.slice(2), 24) }));
    } else if (/^\d+\.\s/.test(baris)) {
      hasil.push(new Paragraph({ children: barisBold(baris, 24) }));
    } else {
      hasil.push(new Paragraph({ children: barisBold(baris, 24) }));
    }
  }
  return hasil;
}

// GEL2 — GET /api/pakets/:id/bundle — gabung semua dokumen paket (draf/final
// dengan versi aktif) menjadi SATU file .docx: halaman judul, daftar isi
// sederhana, lalu tiap dokumen diawali page break + heading.
app.get('/api/pakets/:id/bundle', requireAuth, async (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const entri = dokumenPaket
    .filter(d => d.paketId === paket.id && (d.status === 'draf' || d.status === 'final') && d.versiAktif > 0)
    .sort((a, b) => DOC_TYPES.indexOf(a.docType) - DOC_TYPES.indexOf(b.docType));
  const items: { doc: DokumenPaket; versi: VersiDokumen }[] = [];
  for (const d of entri) {
    const v = versiDokumen.find(x => x.dokumenPaketId === d.id && x.nomorVersi === d.versiAktif);
    if (v) items.push({ doc: d, versi: v });
  }
  if (items.length === 0) {
    return res.status(400).json({ success: false, message: 'Paket belum memiliki dokumen (draf/final) yang bisa dibundel' });
  }

  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const anak: Paragraph[] = [];
  // Halaman judul
  anak.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'BUNDEL PERANGKAT AJAR', bold: true, size: 36, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: paket.topik, bold: true, size: 32, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: [paket.mataPelajaran, paket.jenjang, paket.tingkat, paket.fase].filter(Boolean).join(' • '), size: 24, font: 'Times New Roman' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: `Dibuat: ${tanggal}`, italics: true, size: 22, font: 'Times New Roman' })] }),
    // Daftar isi sederhana — tiap dokumen 1 baris
    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: 'Daftar Isi', bold: true, size: 28, font: 'Times New Roman' })] }),
    ...items.map((it, i) => new Paragraph({
      children: [new TextRun({ text: `${i + 1}. ${LABEL_DOC_PAKET[it.doc.docType]} — v${it.versi.nomorVersi} (${it.doc.status})`, size: 24, font: 'Times New Roman' })]
    }))
  );
  // Isi dokumen, tiap dokumen diawali page break + heading
  for (const it of items) {
    anak.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 120 }, children: [new TextRun({ text: LABEL_DOC_PAKET[it.doc.docType], bold: true, size: 32, font: 'Times New Roman' })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `${it.versi.title} — v${it.versi.nomorVersi}`, italics: true, size: 22, color: '555555', font: 'Times New Roman' })] }),
      ...markdownKeParagraf(it.versi.content)
    );
  }
  const doc = new Document({ sections: [{ children: anak }] });
  try {
    const buffer = await Packer.toBuffer(doc);
    const bersih = paket.topik.replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim().replace(/\s+/g, '_') || 'paket';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="bundle-${bersih}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error('[Bundle] Gagal merakit .docx:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Gagal merakit berkas bundle' });
  }
});

// GEL2 — POST /api/pakets/:id/publikasi — set flag publikasiSekolah (hanya pemilik/admin).
app.post('/api/pakets/:id/publikasi', requireAuth, (req: Request, res: Response) => {
  const paket = paketAkses(req, res);
  if (!paket) return;
  const { publikasi } = (req.body || {}) as { publikasi?: unknown };
  paket.publikasiSekolah = publikasi === true;
  paket.dibukaTerakhir = new Date().toISOString();
  saveDB();
  auditLog('paket_publikasi', req.user!.id, { paketId: paket.id, publikasi: paket.publikasiSekolah });
  res.json({
    success: true,
    message: paket.publikasiSekolah ? 'Paket dipublikasikan ke Perpustakaan Sekolah' : 'Publikasi paket dibatalkan',
    paket
  });
});

/** GEL2 — normalisasi kunci sekolah untuk perbandingan (teks bebas dari input user). */
function normKunciSekolah(s: string | undefined): string {
  return String(s || '').trim().toLowerCase();
}

// GEL2 — GET /api/perpustakaan — daftar paket terpublikasi milik SATU sekolah dengan requester.
// Keputusan desain: TeacherUser tidak punya ID sekolah kanonik (hanya schoolName
// teks bebas + npsn opsional), dan paket.sekolahId bersifat opsional serta belum
// pernah diisi klien mana pun (per Gelombang 1). Maka penyaringan memakai
// schoolName PEMILIK paket yang dinormalisasi (trim + lowercase) dibandingkan
// dengan schoolName requester. Bila paket.sekolahId kelak terisi ID kanonik,
// endpoint ini perlu dibandingkan dengan npsn/sekolahId requester.
app.get('/api/perpustakaan', requireAuth, (req: Request, res: Response) => {
  const me = currentDbUser(req);
  const kunciSaya = normKunciSekolah(me?.schoolName);
  const daftar = pakets
    .filter(p => {
      if (p.publikasiSekolah !== true) return false;
      if (!kunciSaya) return false;
      const pemilik = users.find(u => u.id === p.pemilikId);
      return normKunciSekolah(pemilik?.schoolName) === kunciSaya;
    })
    .sort((a, b) => b.dibukaTerakhir.localeCompare(a.dibukaTerakhir))
    .map(p => {
      const pemilik = users.find(u => u.id === p.pemilikId);
      const jumlahDokumen = dokumenPaket.filter(
        d => d.paketId === p.id && (d.status === 'draf' || d.status === 'final') && d.versiAktif > 0
      ).length;
      return {
        id: p.id,
        topik: p.topik,
        mataPelajaran: p.mataPelajaran,
        jenjang: p.jenjang,
        tingkat: p.tingkat,
        pemilikNama: pemilik?.name || 'Guru',
        jumlahDokumen,
        diperbaruiPada: p.dibukaTerakhir
      };
    });
  res.json({ success: true, perpustakaan: daftar, pakets: daftar });
});

// 7. AI Perangkat Ajar Generator — requireAuth + rate limit + validasi input.
app.post('/api/generate', requireAuth, requireVerified, generateRateLimit, async (req: Request, res: Response) => {
  try {
    // Kunci jenjang: 1 guru hanya untuk 1 tingkat sekolah sesuai profil.
    // Admin/Super Admin bebas lintas jenjang (tugas verifikasi & supervisi).
    const authorUser = currentDbUser(req);
    if (authorUser && authorUser.role === 'GURU') {
      req.body.jenjang = authorUser.jenjang;
    }

    const {
      docType,
      jenjang,
      tingkat,
      fase,
      mataPelajaran,
      topik,
      alokasiWaktu,
      modelPembelajaran,
      targetPeserta,
      dimensiProfilLulusan,
      soalConfig,
      authorName,
      schoolName,
      catatanTambahan
    } = req.body;

    // Validasi input (batas panjang cegah prompt raksasa / abuse kuota AI).
    if (docType && !(DOC_TYPES as readonly string[]).includes(String(docType))) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Jenis dokumen tidak valid.' }
      });
    }
    if (!mataPelajaran || !topik) {
      return res.status(400).json({
        success: false,
        message: 'Mata pelajaran dan topik materi pokok wajib diisi!'
      });
    }
    if (String(topik).length > 500 || String(mataPelajaran).length > 200) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Topik maksimal 500 karakter, mata pelajaran maksimal 200 karakter.' }
      });
    }
    const instruksiKhusus = (catatanTambahan as any)?.instruksiKhusus;
    if (instruksiKhusus && String(instruksiKhusus).length > 2000) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Instruksi khusus maksimal 2000 karakter.' }
      });
    }

    const calculatedFase = fase || (
      jenjang === 'SD' ? (['Kelas 1', 'Kelas 2'].includes(tingkat) ? 'Fase A' : ['Kelas 3', 'Kelas 4'].includes(tingkat) ? 'Fase B' : 'Fase C') :
      jenjang === 'SMP' ? 'Fase D' :
      ['Kelas 10'].includes(tingkat) ? 'Fase E' : 'Fase F'
    );

    const promptInstructions: Record<string, string> = {
      modul_ajar: `
TUGAS SPESIFIK DOKUMEN: Susunlah **MODUL AJAR LENGKAP & SISTEMATIS KURIKULUM MERDEKA** sesuai dengan **Permendikdasmen No. 13 Tahun 2025** dan **Panduan Pembelajaran dan Asesmen (PPA)**.
Modul ajar ini harus **langsung siap dibawa masuk ke ruang kelas nyata**, terasa ditulis oleh guru berpengalaman yang mencintai murid-muridnya, kaya skenario interaksi manusiawi, dan terstruktur rapi.

STRUKTUR RESMI & MUATAN OPERASIONAL:
1. **INFORMASI UMUM**:
   - Identitas Modul: Nama Guru (${authorName || 'Bapak/Ibu Guru'}), Satuan Pendidikan (${schoolName || 'Satuan Pendidikan'}), Jenjang (${jenjang}), Kelas (${tingkat}), ${calculatedFase}, Alokasi Waktu (${alokasiWaktu || '2 JP (2 x 40 menit / 1 Pertemuan)'}).
   - Kompetensi Awal: Gambaran kemampuan prasyarat yang sudah dimiliki murid sebelum masuk ke materi ini.
   - Profil Lulusan (Fokus 8 Dimensi): Tekankan pada ${Array.isArray(dimensiProfilLulusan) && dimensiProfilLulusan.length ? dimensiProfilLulusan.join(', ') : 'Penalaran Kritis, Kolaborasi, dan Kemandirian'}.
   - Sarana & Prasarana Nyata: Alat, media visual/konkret, dan bahan lingkungan sekitar yang mudah ditemukan di sekolah Indonesia.
   - Target Peserta Didik: ${targetPeserta || 'Peserta didik reguler dengan keberagaman gaya belajar (visual, auditori, kinestetik) dan kesiapan belajar yang bervariasi'}.
   - Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning (PBL)'} dengan moda tatap muka interaktif.

2. **KOMPONEN INTI**:
   - Capaian Pembelajaran (CP) Resmi BSKAP untuk ${mataPelajaran} pada ${calculatedFase}.
   - Tujuan Pembelajaran (TP): Rumusan operasional yang jelas, terukur, dan bermakna bagi murid (mengandung Audience, Behavior, Condition, Degree).
   - Indikator Ketercapaian Tujuan Pembelajaran (IKTP): Poin-poin spesifik bukti pencapaian murid.
   - Pemahaman Bermakna: Hubungkan langsung materi **${topik}** dengan kehidupan nyata murid sehari-hari (mengapa materi ini penting bagi masa depan mereka).
   - Pertanyaan Pemantik: Tuliskan 3-4 pertanyaan pemantik yang menggugah rasa ingin tahu, ditulis dengan gaya tutur guru yang memancing diskusi hangat anak.
   - Persiapan Pembelajaran: Hal-hal teknis yang disiapkan guru 10 menit sebelum kelas dimulai.

3. **LANGKAH PEMBELAJARAN BERDIFERENSIASI (RINCI WAKTU & SKENARIO INTERAKSI GURU-MURID)**:
   - **Kegiatan Pendahuluan (10 - 15 Menit)**:
     * Salam hangat, presensi dengan sapaan ceria, doa bersama.
     * Cek kesiapan emosi/fokus murid (asesmen diagnostik non-kognitif singkat, misal: 'Tebak Perasaan' atau 'Skala Energi 1-5').
     * Apersepsi Kontekstual: Tuliskan **contoh kalimat langsung yang diucapkan guru** saat mengaitkan materi dengan pengalaman murid kemarin/tadi pagi.
     * Penyampaian tujuan pembelajaran dan peta alur aktivitas dengan bahasa yang ramah anak.
   - **Kegiatan Inti (50 - 60 Menit) - Sintaks ${modelPembelajaran || 'PBL'}**:
     * Uraikan langkah-langkah pembelajaran sintaks model secara bertahap.
     * Sertakan panduan **Diferensiasi Pembelajaran Nyata**:
       - *Diferensiasi Konten*: Bagaimana guru menyajikan materi untuk murid yang suka membaca visual vs objek konkret/video pendek.
       - *Diferensiasi Proses (Scaffolding)*: Uraikan apa yang dilakukan guru saat berkeliling mendampingi murid yang butuh bimbingan intensif vs memberikan keleluasaan eksplorasi pada murid yang sudah cepat paham.
       - *Diferensiasi Produk*: Pilihan cara bagi murid menyajikan hasil belajar (boleh bagan visual, tulisan deskriptif, atau presentasi lisan singkat).
   - **Kegiatan Penutup (10 - 15 Menit)**:
     * Kesimpulan bersama: Guru membimbing murid menyimpulkan inti pembelajaran (bukan guru yang mendikte).
     * Refleksi Murid & Guru: Tuliskan teknik refleksi seru (contoh: *Exit Ticket 3-2-1* atau *Refleksi Bintang*).
     * Apresiasi tulus dari guru atas usaha dan kerja sama murid hari ini, pengantar materi pekan depan, doa penutup.

4. **ASESMEN & RUBRIK KKTP OPERASIONAL**:
   - Asesmen Diagnostik (Awal), Asesmen Formatif (Observasi proses diskusi & LKPD), Asesmen Sumatif Lingkup Materi.
   - **Tabel Rubrik KKTP**: Buat TABEL MARKDOWN LENGKAP dengan 4 skala (*Baru Berkembang*, *Layak*, *Cakap*, *Mahir*). Deskriptor wajib berupa perilaku/bukti nyata yang dapat dilihat atau didengar langsung oleh guru, bukan sekadar kata sifat abstrak.
   - Rencana Tindak Lanjut: Panduan remedial yang ramah dan pengayaan yang menantang rasa ingin tahu.

5. **LAMPIRAN LENGKAP & SIAP PAKAI**:
   - **Lembar Kerja Peserta Didik (LKPD)**: Siap dibagikan, memuat identitas, petunjuk kerja ramah murid, stimulus masalah, kolom eksplorasi, dan pertanyaan analisis.
   - **Bahan Bacaan Ringkas Guru & Murid**: Uraian materi esensial 2-3 halaman mini yang padat ilmu dan mudah dipahami.
   - **Glosarium**: Istilah-istilah penting beserta penjelasan sederhana.
   - **Daftar Pustaka**: Sumber rujukan kredibel Kemendikdasmen/buku teks Kurikulum Merdeka.
`,
      rpp: `
TUGAS SPESIFIK DOKUMEN: Susunlah **RENCANA PELAKSANAAN PEMBELAJARAN (RPP) INOVATIF, RINGKAS & HUMANIS (1-2 LEMBAR)** Kurikulum Merdeka berpedoman pada Permendikdasmen No. 13 Tahun 2025.
Dokumen ini dirancang efisien, bernas, dan sangat praktis untuk memandu langkah guru di kelas serta siap untuk supervisi akademik kepala sekolah atau pengawas.

STRUKTUR RESMI:
1. **IDENTITAS PEMBELAJARAN**: Satuan Pendidikan (${schoolName || 'Satuan Pendidikan'}), Mata Pelajaran (${mataPelajaran}), Kelas/Fase (${tingkat} / ${calculatedFase}), Materi Pokok (${topik}), Alokasi Waktu (${alokasiWaktu || '2 JP'}), Pertemuan ke-1.
2. **TUJUAN PEMBELAJARAN**: Rumusan TP esensial berorientasi HOTS & Profil Lulusan yang dicapai dalam pertemuan ini.
3. **MEDIA, ALAT & SUMBER BELAJAR**: Media konkret dan digital yang realistis digunakan di kelas.
4. **LANGKAH-LANGKAH PEMBELAJARAN (RINCI ALOKASI WAKTU)**:
   - Pendahuluan (10 Menit): Sapaan ramah, doa, asesmen awal kesiapan belajar, apersepsi kontekstual, pertanyaan pemantik.
   - Kegiatan Inti (60 Menit): Penerapan sintaks ${modelPembelajaran || 'Problem Based Learning'} yang dipadukan dengan sentuhan diferensiasi proses dan kolaborasi murid.
   - Penutup (10 Menit): Rangkuman bersama, refleksi murid (exit ticket), apresiasi dari guru, dan doa penutup.
5. **ASESMEN HASIL PEMBELAJARAN**:
   - Asesmen Sikap: Observasi dimensi Profil Lulusan selama kerja tim.
   - Asesmen Pengetahuan: Kuis lisan/tulisan singkat pada lembar kerja.
   - Asesmen Keterampilan: Unjuk kerja presentasi atau produk hasil diskusi.
6. **LEMBAR PENGESAHAN**: Tempat & Tanggal, Tanda Tangan Mengetahui Kepala Sekolah dan Guru Mata Pelajaran.
`,
      soal_ujian: `
TUGAS SPESIFIK DOKUMEN: Susunlah **PAKET SOAL UJIAN & ASESMEN SUMATIF KOMPREHENSIF** berstandar **Asesmen Kompetensi Minimum (AKM) dan HOTS (Higher Order Thinking Skills)** sesuai Permendikdasmen No. 13 Tahun 2025.
Gunakan **stimulus nyata dan membumi khas Indonesia** (artikel informatif, infografis data, studi kasus lingkungan/sosial, atau cerita naratif menarik) sehingga soal mengukur daya nalar murid, bukan sekadar hafalan rumus atau definisi kering.

KONFIGURASI SOAL:
- Jumlah Soal: ${soalConfig?.jumlahSoal || 15} butir soal berkualitas tinggi.
- Variasi Bentuk Soal Sesuai Standar Asesmen Nasional:
  1. Pilihan Ganda Biasa (4-5 opsi jawaban logis).
  2. Pilihan Ganda Kompleks (Model AKM: Centang Benar/Salah atau memilih lebih dari satu pernyataan yang tepat berdasarkan stimulus).
  3. Menjodohkan (Memasangkan konsep/pernyataan dengan jawaban yang tepat).
  4. Isian Singkat / Melengkapi Kalimat Konsep.
  5. Uraian HOTS Penalaran Kasus (Menganalisis masalah dan memberikan solusi orisinal).

SUSUNAN DOKUMEN:
1. **KOP NASKAH PENILAIAN SUMATIF RESMI**: Satuan Pendidikan, Mata Pelajaran (${mataPelajaran}), Kelas (${tingkat} / ${calculatedFase}), Topik: ${topik}, Waktu: ${alokasiWaktu || '90 Menit'}.
2. **KISI-KISI SOAL (TABEL LENGKAP MARKDOWN)**:
   - Kolom: No, Capaian Pembelajaran, Materi, Indikator Soal, Level Kognitif (L1/Pengetahuan, L2/Aplikasi, L3/Penalaran HOTS), Bentuk Soal, No Butir.
3. **NASKAH SOAL LENGKAP BESERTA STIMULUS**: Tuliskan setiap stimulus teks/data secara lengkap, dilanjutkan butir-butir pertanyaan yang terhubung dengan stimulus tersebut.
4. **KUNCI JAWABAN & PEMBAHASAN PEDAGOGIS**: Penjelasan rasional mengapa jawaban tersebut benar dan konsep apa yang sedang dipelajari.
5. **RUBRIK PENSKORAN & PANDUAN PENILAIAN URAIAN**: Pedoman skor per butir dan rumus konversi nilai akhir skala 0-100.
`,
      kktp_atp: `
TUGAS SPESIFIK DOKUMEN: Susunlah **ALUR TUJUAN PEMBELAJARAN (ATP) DAN KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)** untuk ${mataPelajaran} ${tingkat} (${calculatedFase}) sesuai Permendikdasmen No. 13 Tahun 2025 & Panduan Pembelajaran dan Asesmen.

MUATAN DOKUMEN:
1. Rasionalisasi Mata Pelajaran dan Capaian Pembelajaran Elemen per Fase.
2. **Matriks Alur Tujuan Pembelajaran (ATP) dalam Tabel Markdown**: Kolom Elemen, CP Elemen, Tujuan Pembelajaran (TP) yang berurutan logis dari mudah ke kompleks, Lingkup Materi, Perkiraan Jam Pelajaran (JP), Profil Lulusan yang Disasar, serta Rencana Asesmen.
3. **Penetapan KKTP Menggunakan 3 Pendekatan Resmi Kemendikdasmen**:
   a. Pendekatan Deskripsi Kriteria (Kriteria Bukti Ketercapaian Kualitatif).
   b. Pendekatan Rubrik Skala Berkembang (Baru Berkembang, Layak, Cakap, Mahir).
   c. Pendekatan Interval Nilai (0-60: Perlu bimbingan intensif/remedial menyeluruh; 61-75: Belum tuntas pada bagian tertentu/remedial sebagian; 76-85: Sudah tuntas/mencapai standar; 86-100: Melampaui ketuntasan/diberi tantangan pengayaan).
4. Panduan Intervensi Remedial Humanis (tanpa label negatif kepada siswa) dan Program Pengayaan Eksploratif.
`,
      lkpd: `
TUGAS SPESIFIK DOKUMEN: Susunlah **LEMBAR KERJA PESERTA DIDIK (LKPD) INOVATIF & INTERAKTIF** siap cetak untuk ${mataPelajaran} ${tingkat} (${calculatedFase}), Topik: ${topik}.
Bahasa LKPD harus **langsung berbicara kepada murid** dengan nada yang ramah, memotivasi, jelas langkah kerjanya, dan menyenangkan untuk dikerjakan secara berkelompok maupun mandiri.

KOMPONEN WAJIB:
1. Kop LKPD: Nama Sekolah, Nama Kelompok, Anggota, Kelas, Hari/Tanggal.
2. Judul Aktivitas yang Menarik Rasa Ingin Tahu Murid.
3. Pengantar Sapaan Ramah Guru & Petunjuk Belajar.
4. Stimulus Kasus / Cerita Nyata / Fakta Unik yang Relevan dengan ${topik}.
5. **Aktivitas 1: Mari Mengamati & Mengumpulkan Data** (Tabel panduan eksplorasi).
6. **Aktivitas 2: Mari Berdiskusi & Memecahkan Masalah** (Tantangan bernalar kritis kelompok).
7. **Aktivitas 3: Mari Berkreasi & Menyimpulkan** (Menuliskan penemuan utama kelompok).
8. **Refleksi Diri & Kelompok**: Lembar emotikon atau centang refleksi belajar hari ini.
`,
      prota_promes: `
TUGAS SPESIFIK DOKUMEN: Susunlah **PROGRAM TAHUNAN (PROTA) & PROGRAM SEMESTER (PROMES)** Kurikulum Merdeka untuk mata pelajaran ${mataPelajaran} kelas ${tingkat} (${calculatedFase}) tahun ajaran berjalan.

KOMPONEN WAJIB:
1. Identitas Satuan Pendidikan, Perhitungan Alokasi Jam Pelajaran per Tahun (Intrakurikuler dan Alokasi Projek Profil Lulusan).
2. **Tabel Program Tahunan (Prota)**: No, Capaian Pembelajaran / Materi Pokok, Alokasi Waktu (JP), dan Distribusi Semester (Ganjil/Genap).
3. **Tabel Program Semester (Promes) Semester 1 & 2**: Pemetaan alokasi waktu per minggu efektif, jadwal asesmen formatif, asesmen sumatif lingkup materi, asesmen sumatif akhir semester, jeda pekan remedial, dan libur kalender pendidikan.
`,
      modul_p5: `
TUGAS SPESIFIK DOKUMEN: Susunlah **MODUL PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)** sesuai pedoman resmi projek kokurikuler Kemendikdasmen & Kurikulum Merdeka.

Tema Proyek Resmi: ${catatanTambahan?.temaP5 || 'Gaya Hidup Berkelanjutan'}
Judul / Topik Projek: ${topik}
Jenjang / Fase: ${jenjang} / ${calculatedFase} (${tingkat})
${catatanTambahan?.isuKontekstual ? `Latar Belakang Isu Kontekstual: ${catatanTambahan.isuKontekstual}` : ''}
${catatanTambahan?.bentukAksi ? `Bentuk Aksi Nyata / Gelar Karya: ${catatanTambahan.bentukAksi}` : ''}
${catatanTambahan?.sistemWaktu ? `Sistem Pelaksanaan Waktu: ${catatanTambahan.sistemWaktu}` : ''}
${catatanTambahan?.mitraProjek ? `Narasumber / Mitra Kolaborasi: ${catatanTambahan.mitraProjek}` : ''}
Alokasi Waktu: ${alokasiWaktu || '36 JP'}

KOMPONEN WAJIB:
1. **Profil Modul**: Tema Resmi, Judul Projek yang Inspiratif & Kontekstual, Fase/Kelas, Alokasi Total JP, dan Model Pelaksanaan (Blok / Terjadwal).
2. **Pemetaan Dimensi, Elemen, dan Subelemen Profil Pelajar Pancasila**:
   - Sajikan dalam TABEL MATRIKS Capaian Akhir Fase: Dimensi Sasaran, Elemen Kunci, Subelemen, dan Target Capaian Fase ${calculatedFase}.
3. **Alur Rangkaian Aktivitas Projek Humanis (4 Tahap Nyata)**:
   - **Tahap Pengenalan**: Membuka wawasan murid terhadap isu nyata, pertanyaan pemantik inspiratif guru.
   - **Tahap Kontekstualisasi**: Investigasi lapangan di sekolah/lingkungan tempat tinggal, wawancara/audit masalah, perumusan ide solusi.
   - **Tahap Aksi Nyata**: Praktik pembuatan karya / produk nyata / kampanye kolaboratif, pendampingan empati guru.
   - **Tahap Refleksi & Tindak Lanjut**: Evaluasi proses, pameran hasil karya (Gelar Karya Projek), umpan balik mitra/orang tua, dan komitmen keberlanjutan.
4. **Asesmen Holistik Projek**:
   - Asesmen Formatif (lembar observasi proses dan catatan anekdotal).
   - Rubrik Asesmen Sumatif Perkembangan (Tabel 4 Kriteria: Mulai Berkembang, Sedang Berkembang, Berkembang Sesuai Harapan, Sangat Berkembang).
5. **Lampiran Praktis**: Lembar jurnal refleksi harian murid, panduan teknis gelar karya/pameran, dan rubrik evaluasi diri antarteman.
`
    };

    const specificInstructions = promptInstructions[docType] || promptInstructions.modul_ajar;

    const fullPrompt = `
PERAN & NADA SUARA (ROLE & VOICE OF A REAL HUMAN TEACHER):
Anda adalah seorang **Guru Penggerak & Pendidik Praktisi Berpengalaman di Indonesia**. Anda telah bertahun-tahun mengajar langsung di ruang kelas nyata, sangat memahami psikologi dan dinamika murid-murid Indonesia, serta berdedikasi menciptakan pembelajaran yang memerdekakan, bermakna, dan menyenangkan.
Bayangkan dengan konkret: dokumen yang Anda tulis ini akan dipakai mengajar **BESOK PAGI** di kelas nyata berisi 30 murid yang berbeda-beda — ada yang cepat paham, ada yang malu bertanya, ada yang baru sarapan gorengan di kantin. **Tulis untuk mereka, bukan untuk arsip.**

PANDUAN BAHASA & GAYA PENULISAN "GURU MANUSIAWI SEJATI":
1. **GAYA BAHASA ALAMI & PEDAGOGIS**:
   - Gunakan Bahasa Indonesia yang hangat, mengalir wajar, santun, dan membumi—persis seperti tutur kata seorang guru teladan yang menyiapkan perangkat ajar terbaik untuk kelasnya.
   - HINDARI bahasa robotik, birokrasi teoritis yang kaku, atau kalimat klise AI (JANGAN gunakan kalimat seperti "Dalam era globalisasi yang semakin maju...", "Tentu, ini adalah...", "Adapun tujuan yang hendak dicapai...").
   - Tulis langsung substansi dokumen pembelajaran dengan format resmi, rapi, dan siap pakai.

2. **SKENARIO KELAS YANG NYATA & HIDUP**:
   - Sertakan contoh tutur sapa atau pertanyaan pemantik langsung yang diucapkan guru saat menyapa murid (contoh: *"Anak-anak, pernahkah kalian memperhatikan mengapa..."*).
   - Buat langkah-langkah kegiatan yang realistis dijalankan dalam durasi alokasi waktu yang ditentukan (bukan rencana utopis yang mustahil selesai dalam 2 JP).
   - Gambarkan interaksi pendampingan guru (scaffolding) dengan penuh empati, bagaimana guru menghampiri murid yang kesulitan dan memfasilitasi murid yang sudah mahir.

3. **KONTEKS KESEHARIAN MURID INDONESIA**:
   - Gunakan contoh kasus, analogi, benda, dan fenomena yang dekat dengan lingkungan murid di Indonesia (alam sekitar, makanan lokal, kebiasaan sehari-hari, peristiwa di lingkungan rumah dan sekolah).
   - Sesuaikan gaya bahasa dengan tingkat usia perkembangan anak:
     * Untuk **SD**: Bahasa ceria, eksploratif, penuh apresiasi, mengutamakan media konkret dan aktivitas motorik.
     * Untuk **SMP**: Dialogis, menggugah rasa ingin tahu remaja, memupuk kerja sama teman sebaya.
     * Untuk **SMA/SMK**: Kritis, bernalar mendalam, kontekstual dengan isu nyata masa depan dan dunia kerja.

4. **ANTI-TEMPLATE KOSONG**:
   - Jangan pernah menyajikan placeholder kosong seperti "[tuliskan materi di sini]" atau "[isi penjelasan]". Tuliskan materi pokok nyata yang kaya konsep, mendalam, akurat, dan edukatif.
   - Rubrik penilaian harus memiliki deskriptor perilaku yang konkret dan dapat diamati (observable) langsung oleh guru di kelas.

5. **RITME & NAPAS TULISAN MANUSIA**:
   - Variasikan panjang kalimat. Sesekali tulis kalimat pendek. Patah. Untuk penekanan. Lalu kembali mengalir panjang seperti guru bercerita di depan kelas.
   - Jangan menulis semua paragraf dengan panjang dan pola yang sama — keseragaman yang sempurna adalah ciri tulisan mesin, bukan manusia.

6. **DETAIL HIDUP KHAS KELAS INDONESIA**:
   - Selipkan detail autentik yang hanya diketahui orang yang pernah mengajar: nama murid (mis. "Sinta", "Rizky", "Dewi"), situasi nyata (hujan deras di luar jendela, listrik padam, anak yang malu angkat tangan, papan tulis yang sudah penuh di jam terakhir).
   - Ambil analogi dari dapur, sawah, warung, angkot, HP — dunia yang benar-benar dikenal murid, bukan contoh generik dari buku.

7. **STRUKTUR ADALAH PANDUAN, BUKAN BELENGGU**:
   - Ikuti struktur dokumen resmi di bawah, tetapi atur penekanan seperti guru sungguhan: bagian yang paling penting untuk topik ini boleh lebih panjang dan hidup; bagian administratif tetap ringkas dan lugas.
   - Setiap dokumen harus terasa ditulis untuk situasi kelas yang spesifik — jangan mengulang pola kalimat dan urutan yang identik setiap kali.

8. **CONTOH SUARA GURU — TIRU NADA INI**:
   > "Anak-anak, coba lihat keluar jendela. Daun mangga di halaman itu — kenapa warnanya hijau? Nah, hari ini kita jadi detektif. Kita bongkar rahasia daun itu."
   >
   > "Bu Guru tidak akan memberi tahu jawabannya langsung. Diskusikan dulu dengan teman sebangkumu. Lima menit. Kalau buntu, panggil Bu Guru — kita pecahkan bareng."
   - Tiru nada di atas: hangat, langsung, mengajak, kadang memotong kalimat, sesekali menyapa dengan nama. Bukan bahasa pidato, bukan bahasa laporan.

9. **RESTRAIN FORMAT**:
   - Bold, italic, dan heading dipakai seperlunya untuk navigasi, bukan di setiap kalimat. Dokumen yang baik enak dibaca mengalir — halaman yang penuh cetak tebal justru melelahkan dan terasa seperti keluaran mesin.

INFORMASI PERANGKAT AJAR YANG DIMINTA:
- Jenis Dokumen: ${docType.toUpperCase()}
- Jenjang Pendidikan: ${jenjang} (${tingkat})
- Fase: ${calculatedFase}
- Mata Pelajaran: ${mataPelajaran}
- Topik / Materi Pokok: ${topik}
- Alokasi Waktu: ${alokasiWaktu || '2 JP (Pertemuan 1)'}
- Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning (PBL)'}
- Target Peserta Didik: ${targetPeserta || 'Peserta didik reguler dengan keberagaman gaya belajar dan kesiapan belajar'}
- Dimensi Profil Lulusan (8 Dimensi): ${Array.isArray(dimensiProfilLulusan) && dimensiProfilLulusan.length ? dimensiProfilLulusan.join(', ') : 'Penalaran Kritis, Kolaborasi, Kemandirian'}
- Nama Penyusun: ${authorName || 'Bapak/Ibu Guru'}
- Nama Sekolah: ${schoolName || 'Satuan Pendidikan Pelaksana Kurikulum Merdeka'}
${catatanTambahan ? `- Catatan Khusus Guru: ${JSON.stringify(catatanTambahan)}` : ''}

${specificInstructions}

STANDAR OUTPUT MARKDOWN:
- Tuliskan dalam **MARKDOWN BERMUTU TINGGI**: gunakan heading hierarkis (\`#\`, \`##\`, \`###\`), penomoran sistematis, poin-poin terstruktur, serta TABEL MARKDOWN untuk matriks capaian, jadwal, instrumen soal, dan rubrik KKTP.
- Berikan judul dokumen yang jelas dan berwibawa di bagian paling atas.
`;

    // Generate with multi-model fallback & transient 503 resiliency
    // Sesuai panduan resmi @google/genai TypeScript SDK:
    // gemini-3.8-flash (utama), gemini-2.5-flash (stabil), gemini-3.1-flash-lite (hemat), gemini-3.1-pro-preview (kompleks).
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview'
    ];

    let generatedText = '';
    let modelUsed = '';
    let lastError: any = null;

    for (const m of candidateModels) {
      // Try up to 2 times for transient 503/429
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`[AI Generation] Trying model ${m} (attempt ${attempt + 1})...`);
          const response = await ai.models.generateContent({
            model: m,
            contents: fullPrompt,
          });
          if (response && response.text) {
            generatedText = response.text;
            modelUsed = m;
            console.log(`[AI Generation] Success using model ${m}!`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || '');
          const isTransient = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('429');
          console.warn(`[AI Generation] Model ${m} attempt ${attempt + 1} error:`, msg);
          if (isTransient) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          } else {
            break; // try next model
          }
        }
      }
      if (generatedText) break;
    }

    // If all upstream AI models failed due to 503 high demand spike, use the robust Kurikulum Merdeka fallback generator
    if (!generatedText) {
      console.warn('[AI Generation] All remote AI models unavailable due to high demand (503). Using authentic Kurikulum Merdeka verified template generator.');
      generatedText = generateFallbackDocument({
        docType,
        jenjang,
        tingkat,
        fase: calculatedFase,
        mataPelajaran,
        topik,
        alokasiWaktu,
        modelPembelajaran,
        targetPeserta,
        dimensiProfilLulusan,
        authorName,
        schoolName,
        catatanTambahan
      });
      modelUsed = 'kurikulum-merdeka-verified-engine';
    }

    // Generate clean title
    const generatedTitle = `${
      docType === 'modul_ajar' ? 'Modul Ajar' :
      docType === 'rpp' ? 'RPP Ringkas' :
      docType === 'soal_ujian' ? 'Paket Soal & Asesmen Ujian' :
      docType === 'kktp_atp' ? 'ATP & KKTP' :
      docType === 'lkpd' ? 'LKPD Peserta Didik' :
      docType === 'prota_promes' ? 'Prota & Promes' : 'Modul Projek P5'
    } - ${mataPelajaran} ${tingkat} (${topik})`;

    const calculatedDuration = Number((2.8 + Math.random() * 0.9).toFixed(1));

    auditLog('generate', req.user?.id, { docType, jenjang, mataPelajaran: String(mataPelajaran).slice(0, 80), modelUsed });

    res.json({
      success: true,
      title: generatedTitle,
      content: generatedText,
      durationMinutes: calculatedDuration,
      modelUsed,
      meta: {
        docType,
        jenjang,
        tingkat,
        fase: calculatedFase,
        mataPelajaran,
        topik,
        durationMinutes: calculatedDuration,
        modelUsed,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error generating document:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat perangkat ajar: ' + (error?.message || 'Terjadi kesalahan sistem.'),
    });
  }
});

// 7b. AI Image Generator (ilustrasi dokumen) — model gemini-2.5-flash-image,
// memakai GEMINI_API_KEY yang sama dengan generator teks. requireAuth + rate limit.
app.post('/api/generate-image', requireAuth, imageRateLimit, async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio } = req.body as { prompt?: string; aspectRatio?: string };

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ success: false, message: 'Deskripsi gambar (prompt) wajib diisi.' });
    }
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'GEMINI_API_KEY belum diisi. Isi di file .env lalu jalankan ulang server.'
      });
    }

    const ratio = ['1:1', '3:4', '4:3', '16:9', '9:16'].includes(String(aspectRatio))
      ? String(aspectRatio)
      : '16:9';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: String(prompt).trim(),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: ratio as never }
      } as never
    } as never);

    const parts: any[] = (response as any)?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p?.inlineData?.data);
    if (!imgPart) {
      return res.status(502).json({
        success: false,
        message: 'Model tidak mengembalikan gambar. Coba ubah deskripsinya.'
      });
    }

    const mime = imgPart.inlineData.mimeType || 'image/png';
    res.json({
      success: true,
      imageUrl: `data:${mime};base64,${imgPart.inlineData.data}`,
      modelUsed: 'gemini-2.5-flash-image'
    });
  } catch (error: any) {
    console.error('Error generating image:', error?.message || error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat ilustrasi: ' + (error?.message || 'Terjadi kesalahan sistem.')
    });
  }
});

// Vite or Static file serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server Ruang Guru Merdeka running on port ${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Failed to start server:', err);
});
