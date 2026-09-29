import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

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
## Sesuai Permendikbudristek No. 12 Tahun 2024 & Panduan Pembelajaran dan Asesmen (PPA) 2024

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
1. **Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia**: Menyadari kebesaran ciptaan Tuhan melalui keteraturan struktur tumbuhan bagi kelangsungan hidup bumi.
2. **Bernalar Kritis**: Mengidentifikasi keterkaitan fungsi setiap organ tumbuhan terhadap fotosintesis dan daya hidup tanaman.
3. **Bergotong Royong**: Berkolaborasi dalam kelompok kecil untuk mengamati spesimen dan menyajikan hasil pengamatan.
4. **Mandiri**: Bertanggung jawab menyelesaikan LKPD dan refleksi belajar mandiri.

---

### III. KOMPONEN INTI

#### A. Capaian Pembelajaran (CP) - Keputusan Kepala BSKAP No. 032/H/KR/2024
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
## Sesuai Permendikbudristek No. 12 Tahun 2024 & PPA 2024

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
    mataPelajaran: 'Projek Penguatan Profil Pelajar Pancasila',
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
// 1. Current user session / default user
app.get('/api/users/current', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  let user = users.find(u => u.id === userId);
  if (!user) {
    // Default to the creator / Super Admin Amwaluddin Lubis for immediate full-featured access
    user = users.find(u => u.email === 'amwaluddin.lubis@gmail.com') || users[0];
  }
  res.json({ success: true, user });
});

// 2. Belajar.id Login / Switcher
app.post('/api/auth/login-belajar-id', (req: Request, res: Response) => {
  const { email, name, schoolName, jenjang, mataPelajaran } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email Belajar.id wajib diisi' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    return res.json({
      success: true,
      message: `Selamat datang kembali, ${existingUser.name}!`,
      user: existingUser
    });
  }

  // Determine role and status
  const isSuper = cleanEmail === 'amwaluddin.lubis@gmail.com' || cleanEmail.includes('admin@');
  const role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU' = isSuper ? 'SUPER_ADMIN' : 'GURU';
  // New teachers are PENDING unless they are admin
  const status: 'VERIFIED' | 'PENDING' = isSuper ? 'VERIFIED' : 'PENDING';

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
    jenjang: detectedJenjang,
    mataPelajaran: mataPelajaran || 'Semua Mata Pelajaran',
    role,
    status,
    registeredAt: new Date().toISOString(),
    verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : undefined,
    verifiedBy: status === 'VERIFIED' ? 'Sistem Terverifikasi' : undefined
  };

  users.unshift(newUser);

  res.json({
    success: true,
    message: status === 'VERIFIED'
      ? 'Akun Admin berhasil diaktifkan!'
      : 'Pendaftaran Akun Belajar.id berhasil! Akun Anda sedang menunggu verifikasi oleh Admin Kurikulum (Bpk. Amwaluddin Lubis).',
    user: newUser
  });
});

// 2b. Logout endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Berhasil keluar dari akun. Sesi telah diakhiri.'
  });
});

// 3. User list (for Admin verification panel)
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ success: true, users });
});

// 4. Admin verify / reject / update teacher status
app.post('/api/users/verify', (req: Request, res: Response) => {
  const { userId, status, adminName } = req.body;
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
    user.verifiedBy = adminName || 'Amwaluddin Lubis, M.Pd.';
  } else {
    user.verifiedAt = undefined;
    user.verifiedBy = undefined;
  }

  res.json({
    success: true,
    message: `Status guru ${user.name} berhasil diubah menjadi: ${status}`,
    user
  });
});

// 5. Delete teacher
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = users.length;
  users = users.filter(u => u.id !== id);
  if (users.length === initialLength) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }
  res.json({ success: true, message: 'Data guru berhasil dihapus' });
});

// 6. Documents repository
app.get('/api/documents', (req: Request, res: Response) => {
  const { authorId, jenjang, docType } = req.query;
  let filtered = [...documents];

  if (authorId && authorId !== 'all') {
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

app.post('/api/documents', (req: Request, res: Response) => {
  const { title, docType, jenjang, tingkat, fase, mataPelajaran, topik, content, authorId, authorName, schoolName, durationMinutes } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Judul dan konten dokumen wajib diisi' });
  }

  const newDoc: EducationalDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    docType: docType || 'modul_ajar',
    jenjang: jenjang || 'SD',
    tingkat: tingkat || 'Kelas 4',
    fase: fase || 'Fase B',
    mataPelajaran: mataPelajaran || 'Umum',
    topik: topik || title,
    content,
    createdAt: new Date().toISOString(),
    authorId: authorId || 'user-admin-1',
    authorName: authorName || 'Guru Merdeka Belajar',
    schoolName: schoolName || 'Sekolah Penggerak',
    isPublic: true,
    durationMinutes: durationMinutes || Number((2.8 + Math.random() * 0.9).toFixed(1))
  };

  documents.unshift(newDoc);
  res.json({ success: true, message: 'Dokumen perangkat ajar berhasil disimpan ke arsip!', document: newDoc });
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  documents = documents.filter(d => d.id !== id);
  res.json({ success: true, message: 'Dokumen berhasil dihapus dari arsip' });
});

// 7. AI Perangkat Ajar Generator using Gemini 3.8 Flash
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
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
      dimensiP5,
      soalConfig,
      authorName,
      schoolName,
      catatanTambahan
    } = req.body;

    if (!mataPelajaran || !topik) {
      return res.status(400).json({
        success: false,
        message: 'Mata pelajaran dan topik materi pokok wajib diisi!'
      });
    }

    const calculatedFase = fase || (
      jenjang === 'SD' ? (['Kelas 1', 'Kelas 2'].includes(tingkat) ? 'Fase A' : ['Kelas 3', 'Kelas 4'].includes(tingkat) ? 'Fase B' : 'Fase C') :
      jenjang === 'SMP' ? 'Fase D' :
      ['Kelas 10'].includes(tingkat) ? 'Fase E' : 'Fase F'
    );

    const promptInstructions: Record<string, string> = {
      modul_ajar: `
TUGAS: Susunlah **MODUL AJAR LENGKAP & SISTEMATIS KURIKULUM MERDEKA** sesuai dengan **Permendikbudristek No. 12 Tahun 2024** dan **Panduan Pembelajaran dan Asesmen (PPA) 2024**.
Modul ajar ini harus siap digunakan di kelas nyata, komprehensif, kaya akan diferensiasi pembelajaran, dan terstruktur rapi.

STRUKTUR RESMI YANG WAJIB ADA:
1. **INFORMASI UMUM**:
   - Identitas: Nama Guru (${authorName || 'Guru Mata Pelajaran'}), Satuan Pendidikan (${schoolName || 'Satuan Pendidikan'}), Jenjang (${jenjang}), Tingkat/Kelas (${tingkat}), ${calculatedFase}, Semester, Alokasi Waktu (${alokasiWaktu || '2 x 40 menit / 1 Pertemuan'}).
   - Kompetensi Awal / Prasyarat Belajar.
   - Profil Pelajar Pancasila (fokuskan pada dimensi: ${Array.isArray(dimensiP5) && dimensiP5.length ? dimensiP5.join(', ') : 'Bernalar Kritis, Gotong Royong, Mandiri'}).
   - Sarana dan Prasarana (alat, media, teknologi kontekstual).
   - Target Peserta Didik (${targetPeserta || 'Reguler/tipikal, dengan diferensiasi kebutuhan belajar'}).
   - Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning (PBL)'} dengan moda Tatap Muka.

2. **KOMPONEN INTI**:
   - Capaian Pembelajaran (CP) sesuai BSKAP No. 032/H/KR/2024 untuk ${mataPelajaran} ${calculatedFase}.
   - Tujuan Pembelajaran (TP) yang jelas (mengandung Audience, Behavior, Condition, Degree).
   - Indikator Ketercapaian Tujuan Pembelajaran (IKTP).
   - Pemahaman Bermakna (manfaat nyata di kehidupan sehari-hari).
   - Pertanyaan Pemantik (pertanyaan esensial, memicu rasa ingin tahu, minimal 2-3 pertanyaan).
   - Persiapan Pembelajaran.

3. **KEGIATAN PEMBELAJARAN BERDIFERENSIASI (RINCI MENIT PER MENIT)**:
   - **Kegiatan Pendahuluan**: Salam, doa, presensi, apersepsi kontekstual, asesmen diagnostik non-kognitif/kognitif singkat, penyampaian tujuan dan alur kegiatan.
   - **Kegiatan Inti**: Ikuti sintaks model pembelajaran (${modelPembelajaran || 'PBL'}), sertakan instruksi eksplisit diferensiasi:
     * *Diferensiasi Konten*: materi teks, visual/gambar, objek konkret/video.
     * *Diferensiasi Proses*: scaffolding, bimbingan kelompok kecil vs mandiri, aktivitas hands-on.
     * *Diferensiasi Produk*: variasi penyajian hasil belajar (laporan gambar, tulisan, presentasi verbal).
   - **Kegiatan Penutup**: Kesimpulan bersama, refleksi murid & guru, asesmen formatif akhir (exit ticket / refleksi 3-2-1), tindak lanjut & doa.

4. **ASESMEN DAN KRITERIA KETERCAPAIAN (KKTP)**:
   - Asesmen Diagnostik (Awal), Asesmen Formatif (Proses / Observasi / Lembar Kerja), Asesmen Sumatif (Lingkup Materi).
   - Rubrik Penilaian KKTP dalam bentuk TABEL LENGKAP dengan 4 skala: *Baru Berkembang*, *Layak*, *Cakap*, *Mahir* beserta deskriptor operasional.
   - Instrumen penilaian sikap dan keterampilan.

5. **LAMPIRAN LENGKAP**:
   - Lembar Kerja Peserta Didik (LKPD) yang siap dikerjakan siswa (berisi petunjuk, tugas pengamatan, pertanyaan analisis).
   - Bahan Bacaan Guru dan Peserta Didik (ringkasan materi esensial 1-2 halaman).
   - Program Pengayaan dan Remedial.
   - Glosarium (definisi istilah penting).
   - Daftar Pustaka resmi Kemendikbudristek.
`,
      rpp: `
TUGAS: Susunlah **RENCANA PELAKSANAAN PEMBELAJARAN (RPP) INOVATIF & RINGKAS (1-2 LEMBAR)** Kurikulum Merdeka sesuai Permendikbudristek No 12 Tahun 2024.
Fokus pada efisiensi, kemudahan dibaca kepala sekolah/pengawas saat supervisi, dan kejelasan operasional di kelas.

FORMAT WAJIB:
1. **IDENTITAS & KOMPONEN RPP**: Sekolah (${schoolName || 'Satuan Pendidikan'}), Mata Pelajaran (${mataPelajaran}), Kelas/Fase (${tingkat} / ${calculatedFase}), Topik (${topik}), Alokasi Waktu (${alokasiWaktu || '2 JP'}).
2. **TUJUAN PEMBELAJARAN**: Rumusan TP operasional berorientasi HOTS & Profil Pelajar Pancasila.
3. **MEDIA, ALAT & SUMBER BELAJAR**: Alat praktis dan bahan ajar relevan.
4. **LANGKAH-LANGKAH PEMBELAJARAN**:
   - Pendahuluan (10 menit): Doa, Apersepsi, Ice Breaking, Pertanyaan Pemantik.
   - Kegiatan Inti (60 menit): Penerapan sintaks ${modelPembelajaran || 'Problem Based Learning'} dengan sentuhan diferensiasi.
   - Penutup (10 menit): Refleksi, asesmen cepat (Exit Ticket), pesan moral dan doa.
5. **ASESMEN**:
   - Asesmen Sikap (Observasi Profil Pelajar Pancasila).
   - Asesmen Pengetahuan (Tes tulis/lisan).
   - Asesmen Keterampilan (Kinerja/Produk diskusi).
6. **TANDA TANGAN PENGESAHAN**: Tempat & Tanggal, Mengetahui Kepala Sekolah & Guru Mata Pelajaran.
`,
      soal_ujian: `
TUGAS: Susunlah **PAKET SOAL UJIAN & ASESMEN SUMATIF KOMPREHENSIF** berstandar **Asesmen Nasional (AKM) dan HOTS (Higher Order Thinking Skills)** sesuai Permendikbudristek No 12 Tahun 2024.

KONFIGURASI SOAL:
- Jumlah Soal: ${soalConfig?.jumlahSoal || 15} butir soal.
- Komposisi Bentuk Soal:
  1. Pilihan Ganda Biasa (4-5 pilihan A, B, C, D, E).
  2. Pilihan Ganda Kompleks (Model AKM: Centang Benar/Salah atau pilih lebih dari 1 jawaban benar).
  3. Menjodohkan (Pasangan pernyataan dan jawaban).
  4. Isian Singkat.
  5. Uraian HOTS Berbasis Stimulus (Infografis/Studi Kasus/Wacana Kontekstual Indonesia).

STRUKTUR RESMI DOKUMEN UJIAN:
1. **KOP UJIAN RESMI**: Satuan Pendidikan, Penilaian Sumatif Akhir/Tengah Semester, Mata Pelajaran (${mataPelajaran}), Kelas (${tingkat} / ${calculatedFase}), Alokasi Waktu (${alokasiWaktu || '90 Menit'}).
2. **KISI-KISI SOAL (TABEL LENGKAP)**:
   - Kolom: No, Capaian/Tujuan Pembelajaran, Materi, Indikator Soal, Level Kognitif (C1-C6 / L1-L3), Bentuk Soal, No Soal.
3. **NASKAH BUTIR SOAL LENGKAP**:
   - Setiap soal diawali dengan stimulus menarik (data, kasus nyata, cerita, tabel, deskripsi fenomena).
   - Kalimat jelas, tidak ambigu, mengukur daya nalar kritis siswa.
4. **KUNCI JAWABAN & PEMBAHASAN MENDALAM**:
   - Kunci jawaban setiap butir.
   - Pembahasan rasional mengapa jawaban tersebut benar dan alternatif jawaban lain salah.
5. **PEDOMAN PENSKORAN & RUBRIK SOAL URAIAN**:
   - Bobot masing-masing bentuk soal (misal PG = 1, PG Kompleks = 2, Menjodohkan = 2, Isian = 3, Uraian = 5).
   - Perhitungan Nilai Akhir = (Skor Perolehan / Total Skor Maksimal) x 100.
`,
      kktp_atp: `
TUGAS: Susunlah **ALUR TUJUAN PEMBELAJARAN (ATP) DAN KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)** untuk ${mataPelajaran} ${tingkat} (${calculatedFase}) sesuai Permendikbudristek No 12 Tahun 2024 & Panduan Pembelajaran dan Asesmen 2024.

KOMPONEN WAJIB:
1. Rasional dan Capaian Pembelajaran Elemen & Fase.
2. Matriks Alur Tujuan Pembelajaran (ATP) dalam tabel (Elemen, Capaian Pembelajaran, Tujuan Pembelajaran, Alur Pembelajaran, Alokasi Waktu JP, Profil Pelajar Pancasila, Penilaian).
3. Penetapan KKTP dengan 3 Pendekatan Resmi Kemendikbud:
   a. Pendekatan Deskripsi Kriteria.
   b. Pendekatan Rubrik Skala Berkembang.
   c. Pendekatan Interval Nilai (0-60 belum mencapai perlu remedial, 61-75 mencapai sebagian, 76-90 sudah tuntas, 91-100 melampaui ketuntasan perlu pengayaan).
4. Panduan Intervensi Remedial dan Pengayaan Berdasarkan Hasil KKTP.
`,
      lkpd: `
TUGAS: Susunlah **LEMBAR KERJA PESERTA DIDIK (LKPD) INOVATIF & INTERAKTIF** siap cetak untuk ${mataPelajaran} ${tingkat} (${calculatedFase}), Topik: ${topik}.

KOMPONEN WAJIB:
1. Kop LKPD: Nama Sekolah, Nama Kelompok, Anggota Kelompok, Kelas, Tanggal.
2. Judul Aktivitas yang Menarik Siswa.
3. Petunjuk Belajar & Keselamatan Kerja/Praktik.
4. Stimulus / Kasus Masalah Nyata.
5. Aktivitas 1: Eksplorasi Konsep & Pengamatan Nyata (Tabel Isian).
6. Aktivitas 2: Analisis & Kolaborasi Pemecahan Masalah (Diskusi Berpikir Kritis).
7. Aktivitas 3: Kesimpulan & Refleksi Belajar Mandiri.
8. Rubrik Penilaian Diri & Penilaian Antar-Teman.
`,
      prota_promes: `
TUGAS: Susunlah **PROGRAM TAHUNAN (PROTA) & PROGRAM SEMESTER (PROMES)** Kurikulum Merdeka untuk mata pelajaran ${mataPelajaran} kelas ${tingkat} (${calculatedFase}) tahun ajaran berjalan.

KOMPONEN WAJIB:
1. Identitas Satuan Pendidikan dan Alokasi Total Jam Pelajaran per Tahun (Intrakurikuler dan Kokurikuler P5).
2. Tabel Prota: No, Capaian Pembelajaran / Materi Pokok / Lingkup Materi, Alokasi Waktu (JP), Keterangan Semester (Ganjil/Genap).
3. Tabel Promes Semester 1 & 2: Distribusi JP per minggu efektif, jadwal asesmen sumatif lingkup materi, asesmen sumatif tengah semester, sumatif akhir semester, dan libur kalender pendidikan.
`,
      modul_p5: `
TUGAS: Susunlah **MODUL PROYEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)** sesuai Panduan Pengembangan Projek Penguatan Profil Pelajar Pancasila BSKAP 2024.

Tema Proyek: ${catatanTambahan?.temaP5 || 'Gaya Hidup Berkelanjutan / Kewirausahaan / Kearifan Lokal / Suara Demokrasi'}
Topik: ${topik}
Jenjang / Fase: ${jenjang} / ${calculatedFase}

KOMPONEN WAJIB:
1. Profil Modul (Tema, Topik, Fase/Kelas, Durasi JP).
2. Dimensi, Elemen, dan Subelemen Profil Pelajar Pancasila yang Dikembangkan (Matriks Target Pencapaian di Akhir Fase).
3. Alur Aktivitas Projek (Tahap Pengenalan, Tahap Kontekstualisasi, Tahap Aksi Nyata, Tahap Refleksi dan Tindak Lanjut).
4. Asesmen Diagnostik, Formatif, dan Sumatif Projek (Rubrik Penilaian Perkembangan Subelemen: Belum Berkembang, Mulai Berkembang, Berkembang Sesuai Harapan, Sangat Berkembang).
5. Lampiran: Lembar Jurnal Refleksi Siswa dan Panduan Pameran Karya (Gelar Karya Projek).
`
    };

    const specificInstructions = promptInstructions[docType] || promptInstructions.modul_ajar;

    const fullPrompt = `
Anda adalah Pakar Kurikulum Nasional Indonesia & Pengembang Perangkat Ajar Senior di Kementerian Pendidikan Dasar dan Menengah RI (Kemendikdasmen / Kemendikbudristek).
Anda memiliki pemahaman mendalam tentang:
- **Permendikbudristek No. 12 Tahun 2024** (Kurikulum Merdeka sebagai Kurikulum Nasional).
- **Keputusan Kepala BSKAP No. 032/H/KR/2024** (Capaian Pembelajaran PAUD, Dikdas, dan Dikmen).
- **Panduan Pembelajaran dan Asesmen (PPA) 2024**.
- Paradigma Pembelajaran Berdiferensiasi (Diferensiasi Konten, Proses, Produk).
- Asesmen Berkelanjutan (Diagnostik, Formatif, Sumatif) & AKM (Asesmen Kompetensi Minimum).

INFORMASI PERANGKAT AJAR YANG DIMINTA:
- Jenis Dokumen: ${docType.toUpperCase()}
- Jenjang Pendidikan: ${jenjang} (${tingkat})
- Fase: ${calculatedFase}
- Mata Pelajaran: ${mataPelajaran}
- Topik / Materi Pokok: ${topik}
- Alokasi Waktu: ${alokasiWaktu || '2 JP (Pertemuan 1)'}
- Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning (PBL)'}
- Target Peserta Didik: ${targetPeserta || 'Reguler/Tipikal dengan keberagaman gaya belajar'}
- Dimensi Profil Pelajar Pancasila: ${Array.isArray(dimensiP5) && dimensiP5.length ? dimensiP5.join(', ') : 'Bernalar Kritis, Gotong Royong, Mandiri'}
- Nama Penyusun: ${authorName || 'Bapak/Ibu Guru'}
- Nama Sekolah: ${schoolName || 'Satuan Pendidikan Pelaksana Kurikulum Merdeka'}
${catatanTambahan ? `- Catatan Khusus Guru: ${JSON.stringify(catatanTambahan)}` : ''}

${specificInstructions}

PANDUAN PENULISAN:
1. Format output dalam **MARKDOWN BERKUALITAS TINGGI** dengan heading hierarkis (\`#\`, \`##\`, \`###\`), penomoran teratur, bullet point, dan TABEL Markdown untuk matriks capaian, jadwal, soal, serta rubrik KKTP.
2. Gunakan Bahasa Indonesia baku, pedagogis, hangat, inspiratif, dan sesuai standar dokumen administrasi guru resmi di Indonesia.
3. Jangan berikan placeholder kosong seperti "[isi di sini]" jika bisa langsung diisikan konten materi nyata yang edukatif, berbobot, dan aplikatif.
4. Pastikan rubrik penilaian memiliki deskriptor yang jelas dan terukur, bukan sekadar kata sifat umum.
`;

    // Generate with Gemini 3.8 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
    });

    const generatedText = response.text || '';

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

    res.json({
      success: true,
      title: generatedTitle,
      content: generatedText,
      durationMinutes: calculatedDuration,
      meta: {
        docType,
        jenjang,
        tingkat,
        fase: calculatedFase,
        mataPelajaran,
        topik,
        durationMinutes: calculatedDuration,
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
