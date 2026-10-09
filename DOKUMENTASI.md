# Dokumentasi — Ruang Guru Merdeka
### Generator Perangkat Ajar Kurikulum Merdeka

Aplikasi web untuk membantu guru Indonesia menyusun **7 perangkat ajar Kurikulum Merdeka** sesuai **Permendikdasmen No. 13 Tahun 2025** dan **Panduan Pembelajaran dan Asesmen**, dibantu AI Gemini dengan mesin cadangan otomatis, ekspor Word/PDF siap cetak kertas A4, dan arsip terverifikasi Belajar.id.

---

## 1. Fitur Utama

| Area | Isi |
|---|---|
| 7 Generator | Modul Ajar, RPP Ringkas, Soal AKM/HOTS, LKPD, ATP & KKTP, Prota & Promes, Modul P5 — **terkunci ke jenjang profil** (1 akun = 1 jenjang; admin bebas lintas jenjang) |
| AI + Fallback | Gemini (multi-model + retry) → otomatis ke template cadangan terverifikasi saat AI sibuk, lengkap dengan **badge penanda** "AI Gemini" / "Template cadangan" |
| Ilustrasi AI | Tombol di viewer → `POST /api/generate-image` (model `gemini-2.5-flash-image`), tersisip sebagai gambar dokumen |
| Ekspor | `.docx` asli (Times New Roman 12pt, A4, margin dinas), `.pdf` A4, cetak langsung, salin |
| Akun | Masuk/daftar Belajar.id, status PENDING → VERIFIED/REJECTED oleh admin, revalidasi sesi otomatis |
| Arsip & Statistik | Bank dokumen (cari + filter), dashboard D3.js (kurva/batang + donat), lencana guru |
| Panduan | Halaman + modal regulasi (fase A–F, komponen modul, diferensiasi, KKTP, 8 Dimensi Profil Lulusan) |
| Tema | Terang/gelap ala Apple, tersimpan otomatis, grafik adaptif |
| 🎯 LKPD 3 Tingkat | Sakelar di form LKPD → satu dokumen berisi 3 lembar siap cetak: 🟢 Perintis (scaffolding bertahap), 🟡 Reguler (analitis), 🟣 Mahir (HOTS terbuka). Prompt `lkpd_tiered` + fallback; flag `tiered` di body `/api/generate` |
| 📊 Lembar Penilaian .xlsx | Tombol di viewer dokumen KKTP → unduh `.xlsx` (exceljs, client-side): 30 baris nama, rumus IF otomatis Interval (Baru Berkembang/Layak/Cakap/Mahir) & Rekomendasi, sheet Rubrik KKTP, freeze header, siap cetak |
| 🖥️ Slide Tayang Kelas | Tombol di kartu Modul Ajar → AI/fallback rangkum modul jadi 5–7 slide JSON → `SlidePresenter` fullscreen (keyboard/klik, nomor slide, ekspor PDF via print). Tersimpan sebagai turunan Modul Ajar: koleksi `slidePaket`, `POST/GET /api/pakets/:id/slide` |
| 🧭 Diagnostik 5 Menit | Tombol di header workspace → `POST /api/pakets/:id/diagnostik` → 3–5 pertanyaan diagnostik + panduan fasilitasi "bila menjawab A → …". Modal `DiagnostikModal`, unduh .md |
| 🤝 Ulasan Rekan Sejawat | Di Perpustakaan: modal detail paket + `<UlasanPaket>` (👍 apresiasi / 💡 saran, 1–500 karakter). Koleksi `ulasanPaket`, `GET/POST /api/pakets/:id/ulasan` (hanya paket terpublikasi) |
| 🎨 Modul P5 Tematik | Generator tematik Projek Penguatan Profil Pelajar Pancasila lintas jenjang (SD, SMP, SMA, SMK) dengan tema resmi, isu kontekstual, bentuk aksi, alokasi JP, sistem waktu, mitra, dan rubrik asesmen profil lulusan (`src/data/p5Templates.ts`, `P5ThematicGeneratorSection.tsx`) |

---

## 2. Teknologi

- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + D3.js + `marked` + `exceljs`
- **Backend:** Express 5 + `tsx` (satu server menyajikan API + frontend, middleware Vite saat dev)
- **AI:** `@google/genai` (teks: `gemini-2.5-flash` → `gemini-3-flash-preview` → `gemini-2.5-flash-lite` → `gemini-2.5-pro`, fallback berurutan; gambar: `gemini-2.5-flash-image`)
- **Ekspor:** `docx` (Word asli), `jspdf` + `html2canvas` (PDF), `exceljs` (.xlsx lembar nilai KKTP), salin clipboard
- **Data:** JSON file `data/db.json` (di-gitignore), dimuat saat start + disimpan debounce tiap mutasi

---

## 3. Struktur Folder

```
PerangkatAjar/
├── server.ts              # API Express + serve frontend
├── serverFallback.ts      # Template cadangan 7 tipe dokumen + tiered LKPD & P5
├── data/db.json           # Data runtime (dibuat otomatis, jangan di-commit)
├── .env                   # Kunci API (dibuat dari .env.example)
├── index.html
├── src/
│   ├── main.tsx           # Entry + ThemeProvider
│   ├── theme.tsx          # Sistem tema terang/gelap (persist localStorage)
│   ├── App.tsx            # Shell + navigasi + state global + toast
│   ├── index.css          # Sistem desain Apple + kertas A4 + dark mode
│   ├── types/index.ts     # TeacherUser, EducationalDocument, GeneratorParams, ...
│   ├── data/
│   │   ├── curriculumData.ts  # DOC_TYPE_INFO, JENJANG_CONFIGS, DIMENSI_P5, ...
│   │   ├── topicCatalog.ts    # Katalog topik per fase/kelas + pencarian
│   │   └── p5Templates.ts     # Katalog template projek P5 tematik SD/SMP/SMA/SMK
│   ├── components/
│   │   ├── Sidebar.tsx / TopHeader.tsx   # Navigasi (profil hanya di header)
│   │   ├── LoginPage.tsx                 # Masuk/daftar + akun demo 1-ketuk
│   │   ├── GeneratorForm.tsx             # Wizard 3 langkah 7 tipe dokumen + LKPD tiered
│   │   ├── P5ThematicGeneratorSection.tsx# Generator tematik spesifik P5 & katalog ide
│   │   ├── ContextualTopicSuggester.tsx  # Saran topik kontekstual + semester
│   │   ├── DocumentViewer.tsx            # Pratinjau A4 + edit + ilustrasi AI + ekspor .docx/.xlsx
│   │   ├── DocumentRepository.tsx        # Arsip (cari/filter/buka/unduh/hapus)
│   │   ├── PaketWorkspace.tsx            # Workspace paket 7 dokumen + status + slide + diagnostik
│   │   ├── SlidePresenter.tsx            # Presentasi kelas interaktif fullscreen + print PDF
│   │   ├── DiagnostikModal.tsx           # Modal instrumen asesmen diagnostik 5 menit
│   │   ├── Perpustakaan.tsx              # Galeri paket terpublikasi sekolah
│   │   ├── UlasanPaket.tsx               # Komponen umpan balik/peer-review guru
│   │   ├── Maskot.tsx                    # Maskot Owi (burung hantu pendamping guru)
│   │   ├── TeacherVerificationPanel.tsx  # Verifikasi guru + KPI + tambah manual
│   │   ├── UserProfileStatsDashboard.tsx # Profil + KPI + grafik D3 + riwayat
│   │   ├── ProductivityD3Chart.tsx / DocumentTypeD3Donut.tsx
│   │   └── BelajarIdAuthModal.tsx / CurriculumGuideModal.tsx / LogoutConfirmModal.tsx
│   └── utils/
│       ├── exportUtils.ts                # Markdown→HTML, docx, pdf, .doc legacy, clipboard
│       ├── lembarPenilaianXlsx.ts        # Ekspor Excel .xlsx nilai KKTP rumus otomatis
│       └── sapaan.ts                     # Generator sapaan kontekstual waktu
└── dist/                  # Hasil build produksi
```

---

## 4. Route

### 4.1 Tampilan (navigasi sidebar)

| Target | Fungsi |
|---|---|
| `modul_ajar` | Wizard Modul Ajar lengkap (Panduan Pembelajaran dan Asesmen) |
| `rpp` | RPP ringkas 1–2 lembar siap supervisi |
| `soal_ujian` | Paket soal + kisi-kisi + kunci (opsi jumlah & level) |
| `lkpd` | LKPD siap cetak (kop kelompok, 3 aktivitas, rubrik diri) |
| `kktp_atp` | Matriks ATP + 3 pendekatan KKTP + remedial/pengayaan |
| `prota_promes` | Tabel Prota + Promes ganjil/genap |
| `modul_p5` | Projek penguatan Profil Lulusan (8 tema, 4 tahap, rubrik, jurnal) |
| `stats` | Statistik, grafik, lencana, riwayat |
| `profile` | Profil Saya: edit mandiri (nama, sekolah, mapel, NIP, NPSN), statistik sendiri, ganti tema/akun |
| `repository` | Arsip semua dokumen |
| `admin` | Verifikasi + edit profil + ubah peran + tambah/hapus guru |
| `guide` | Panduan regulasi |

Alur generator: **Langkah 1** format & kelas → **2** materi → **3** periksa & susun → tinjau/edit → simpan/ekspor.

### 4.1a Navigasi baru — Redesign Gelombang 1 (DaisyUI)

Satuan kerja baru adalah **PAKET**: satu topik berisi 7 dokumen (modul_ajar, rpp, soal_ujian, lkpd, kktp_atp, prota_promes, modul_p5). Lifecycle tanpa reviewer: **Draf → Final**. Bahasa desain: DaisyUI (class semantik).

| Target | Fungsi |
|---|---|
| `beranda` | Beranda (default setelah login): hero sapaan + "Buat Paket Baru", 3 paket terakhir, 5 dokumen terbaru, stats |
| `paket` | Daftar Paket Saya: search, filter Aktif/Arsip, kartu progres, aksi Buka/Arsipkan/Duplikat/Hapus |
| `perpustakaan` | Placeholder "Segera hadir — Gelombang 2" |
| `guide` | Panduan regulasi (tetap) |

Menu pengguna (avatar kanan atas): Profil, Statistik Saya, Admin, Keluar. View lama (7 generator, repository, viewer) tetap ada dan tidak diubah — diintegrasikan Gelombang 2.

**Halaman Paket** (`PaketWorkspace`): header topik + chip konteks, pipeline 7 kartu dokumen (badge status belum/draf/final + versi), aksi Generate (simpan versi baru) / Buka / Tandai Final / Unduh, timeline aktivitas, tab Dokumen | Versi.

### 4.2b API Paket (`http://localhost:3000`)

| Method & Path | Fungsi | Catatan |
|---|---|---|
| `GET /api/pakets?status=aktif\|arsip` | Daftar paket milik user (+ progress) | admin: semua |
| `POST /api/pakets` | Buat paket + 7 DokumenPaket `belum` | butuh verifikasi |
| `GET /api/pakets/:id` | Detail + 7 dokumen | update `dibukaTerakhir` |
| `PATCH /api/pakets/:id` | Ubah metadata paket | pemilik/admin |
| `DELETE /api/pakets/:id` | Hapus paket + dokumen + versi | pemilik/admin |
| `POST /api/pakets/:id/arsip` | `{arsip:boolean}` aktif/arsip | — |
| `POST /api/pakets/:id/duplikat` | Duplikat bersih (dokumen `belum`) | butuh verifikasi |
| `GET /api/pakets/:id/dokumen` | 7 DokumenPaket + info versi aktif | — |
| `POST /api/pakets/:id/dokumen/:docType/generate` | Simpan versi baru → status `draf` | Wave 1: content jadi, tanpa AI |
| `PATCH /api/pakets/:id/dokumen/:docType/final` | Tandai `final` | 400 bila belum ada versi |
| `GET /api/pakets/:id/dokumen/:docType/versi` | Riwayat versi (desc) | — |
| `GET /api/pakets/:id/bundle` | Unduh .docx gabungan versi aktif (draf/final) | GEL2: halaman judul + daftar isi + page break |
| `POST /api/pakets/:id/publikasi` | `{publikasi:boolean}` toggle publikasi sekolah | GEL2: pemilik/admin |
| `GET /api/perpustakaan` | Paket terpublikasi satu sekolah | GEL2: ringkas + pemilikNama + jumlahDokumen |
| `POST /api/pakets/:id/slide` | Buat/refresh deck slide tayang kelas dari Modul Ajar | AI / fallback (JSON 5–7 slide), upsert 1 deck per paket |
| `GET /api/pakets/:id/slide` | Ambil deck slide tayang aktif paket | 404 bila belum dibuat |
| `POST /api/pakets/:id/diagnostik` | Hasilkan asesmen diagnostik 5 menit | AI / fallback Markdown + pemetaan miskonsepsi |
| `GET /api/pakets/:id/ulasan` | Daftar ulasan rekan sejawat (terbaru dulu) | Hanya paket terpublikasi |
| `POST /api/pakets/:id/ulasan` | Kirim ulasan `{tipe: 'apresiasi'\|'saran', isi}` | Maks 500 karakter |

**Migrasi otomatis:** saat server start, tiap `EducationalDocument` lama tanpa `paketId` dibungkus menjadi Paket `"Arsip — <judul>"` berisi 1 DokumenPaket `final` v1 (idempoten via `paketId`).

### 4.2c Redesign Gelombang 2 — alur paket penuh

- **Generator terhubung paket:** tombol Generate di kartu workspace membuka `GeneratorForm` dalam `paketMode` — konteks (topik, mapel, jenjang, fase, tingkat) terkunci sebagai chip, docType terkunci; submit → `POST /api/generate` (AI) → `POST .../dokumen/:docType/generate` (versi baru, status draf) → toast + kembali ke workspace.
- **Viewer berversi:** `DocumentViewer` dengan `paketMode={paketId, docType}` menampilkan pemilih versi (badge v1/v2/v3), "Jadikan versi aktif" (duplikat konten jadi versi baru — riwayat utuh), "Tandai Final". Mode dokumen lepas tidak berubah.
- **Bundle:** satu .docx berisi semua dokumen paket (versi aktif) — unduh dari tombol "Unduh Bundle" di workspace.
- **Perpustakaan Sekolah:** view `Perpustakaan` — grid paket terpublikasi satu sekolah + "Duplikat ke Paket Saya". Publikasi di-toggle per paket (endpoint `/publikasi`); placeholder "Segera hadir" dihapus.

### 4.2 API (`http://localhost:3000`)

| Method & Path | Fungsi | Catatan |
|---|---|---|
| `GET /api/users/current` | Profil aktif (header `x-user-id`, default Super Admin) | — |
| `POST /api/auth/login-belajar-id` | Masuk/daftar; baru → `PENDING` | Validasi domain Belajar.id |
| `POST /api/auth/logout` | Keluar (stateless) | — |
| `GET /api/users` | Daftar guru (panel admin) | — |
| `POST /api/users/verify` | Ubah status `VERIFIED/PENDING/REJECTED` | + `verifiedBy` |
| `PUT /api/users/:id` | Ubah profil (butuh `requesterId`) | Admin: profil siapa pun + role GURU/ADMIN (kecuali SUPER_ADMIN & diri sendiri); Guru: hanya profil sendiri tanpa jenjang/role/status |
| `DELETE /api/users/:id` | Hapus guru | — |
| `GET /api/documents` | Daftar dokumen (`?authorId&jenjang&docType`) | — |
| `POST /api/documents` | Simpan dokumen | — |
| `DELETE /api/documents/:id` | Hapus dokumen | — |
| `POST /api/generate` | Susun dokumen via AI/fallback | Balikan: `title, content, durationMinutes, modelUsed` |
| `POST /api/generate-image` | Buat ilustrasi (`prompt, aspectRatio`) | Balikan: `imageUrl` (data-URL) |

---

## 5. Menjalankan Lokal

### Prasyarat
Node.js 20+ · npm · port 3000 bebas.

### Langkah
```bash
# 1. Masuk folder project
# 2. Siapkan env
cp .env.example .env        # Windows: copy .env.example .env
# 3. Install (wajib flag karena konflik peer vite 8 + esbuild)
npm install --legacy-peer-deps
# 4. Jalan
npm run dev
# Buka http://localhost:3000
```

### API key Gemini (teks + gambar, satu kunci)
1. Buka `https://aistudio.google.com` → **Get API key** → salin.
2. Isi di `.env`: `GEMINI_API_KEY="kunci-anda"`.
3. Restart server. Tanda berhasil: badge hasil menjadi **"AI Gemini"**.
4. Tanpa key: aplikasi tetap jalan memakai template cadangan (badge "Template cadangan").

### Skrip npm
| Skrip | Fungsi |
|---|---|
| `npm run dev` / `start` | Jalan (`tsx server.ts`, port `PORT` default 3000) |
| `npm run build` | Build produksi Vite → `dist/` |
| `npm run preview` | Pratinjau hasil build (frontend saja) |
| `npm run lint` | `tsc --noEmit` |
| `npm run clean` | Hapus `dist` & `server.js` |

---

## 6. Desain & Tema

- Bahasa visual Apple: latar aurora gradien lembut, kartu putih, pil hitam, aksen biru `#0071e3`, target sentuh ≥ 44px.
- Toggle bulan/matahari di header; pilihan tersimpan (`rgm-theme`); anti-kedip via skrip `index.html`.
- Kertas dokumen (`.doc-paper`): lebar 210mm, serif formal, kop + ornamen + pengesahan; cetak via `@page A4`.
- Standar naskah dinas di `.docx`: Times New Roman 12pt, justify, spasi 1.5, margin atas 4cm / lain 3cm.
- Sprint UI/UX (Okt 2026): validasi inline per field di form generator (pesan dekat field, `aria-invalid`), form terkunci + banner progres saat AI menyusun, ringkasan tinjau dengan tombol "Ubah" per seksi, empty state arsip yang ramah + dialog hapus bergaya aplikasi + toast sukses/gagal unduh/salin/simpan, drawer sidebar mobile aksesibel keyboard (Escape, `aria-modal`), `aria-label`/`aria-current` di navigasi, fokus `:focus-visible` global, transisi antar tab, dan pesan error login yang jelas dengan label terasosiasi.

---

## 7. Data & Akun Demo

- Seed: 1 Super Admin (`amwaluddin.lubis@gmail.com`), 1 admin, 3 guru terverifikasi, 3 pendaftar PENDING, 5 dokumen contoh.
- Data tersimpan di `data/db.json`; hapus file untuk kembali ke data awal.
- Login cepat 1-ketuk tersedia di halaman masuk dan modal ganti akun.

## 8. Troubleshooting

| Gejala | Solusi |
|---|---|
| `ERESOLVE` saat install | Pakai `npm install --legacy-peer-deps` |
| `EADDRINUSE` port 3000 | Matikan proses lama yang menjalankan `tsx server.ts` |
| Selalu "Template cadangan" | Isi `GEMINI_API_KEY` lalu restart |
| "API key not valid" (ilustrasi) | Key salah/kedaluwarsa — buat baru di AI Studio |
| Data kembali ke awal | `data/db.json` terhapus — normal, akan dibuat ulang |
| Fase kosong untuk SMP/SMA | Sudah diperbaiki — default mengikuti jenjang akun |

---

## 9. Batasan yang Diketahui

- Statistik bulanan memakai tren contoh (bukan murni data nyata).
- Arsip tersimpan per-server (file lokal), bukan cloud multi-perangkat.
- Ilustrasi AI memakai kuota Gemini; saat habis, hanya teks yang memakai fallback.
- Gambar tersisip tersimpan sebagai data-URL (memperbesar `db.json`); di `.docx` menjadi keterangan teks.

---

## 10. Status Kesiapan Produk

Versi pada branch `main` saat ini adalah **prototype fungsional / pilot internal**, bukan aplikasi produksi multi-guru.

Fitur antarmuka dan alur utama sudah tersedia, tetapi produksi publik belum boleh dilakukan sebelum kontrol berikut selesai:

- autentikasi dan sesi server yang nyata;
- otorisasi terpusat pada seluruh endpoint;
- database transaksional untuk multi-user;
- perlindungan data pribadi guru dan sekolah;
- sanitasi konten Markdown/HTML;
- rate limit untuk generator AI;
- audit log tindakan admin;
- backup dan pemulihan data;
- pengujian unit, integrasi, dan end-to-end;
- validasi kualitas hasil dokumen AI dan template fallback.

Status penilaian saat ini:

| Area | Status |
|---|---|
| UI dan alur generator | Berfungsi sebagai prototype |
| 7 jenis perangkat ajar | Tersedia |
| AI dan fallback | Tersedia, belum memiliki validator output |
| Ekspor Word/PDF | Tersedia, perlu pengujian dokumen panjang |
| Autentikasi Belajar.id | Simulasi validasi domain, belum OAuth/OIDC |
| Otorisasi API | Belum aman untuk produksi |
| Penyimpanan | File JSON lokal, hanya untuk pilot tunggal |
| Testing | Belum tersedia secara memadai |
| Observability | Belum tersedia |
| Kesiapan produksi | Belum siap |

## 11. Sasaran Produk Produksi Multi-Guru

Target produk adalah aplikasi SaaS/internal platform yang memungkinkan banyak guru dari banyak sekolah menggunakan generator secara aman, dengan batas kepemilikan data yang jelas.

### Peran pengguna

| Peran | Kewenangan |
|---|---|
| `SUPER_ADMIN` | Konfigurasi sistem, seluruh tenant, audit dan pemulihan |
| `ADMIN` | Mengelola pengguna dan dokumen dalam tenant/sekolahnya |
| `GURU` | Membuat, mengedit, menyimpan, dan mengekspor dokumen sendiri |
| `KEPALA_SEKOLAH` | Meninjau, memberi komentar, dan menyetujui dokumen sekolah |

Model akses harus berbasis `tenantId`/`schoolId`. Filter di frontend tidak boleh menjadi pengaman; setiap pembatasan harus diverifikasi ulang di backend.

### Batas kepemilikan data

- Data profil guru hanya dapat dibaca oleh pemilik, admin sekolah yang berwenang, dan super admin.
- Dokumen baru harus `PRIVATE` secara default.
- Dokumen dapat dibagikan ke sekolah atau dibuat publik melalui tindakan eksplisit.
- Guru hanya dapat mengubah/menghapus dokumennya sendiri, kecuali role yang berwenang.
- Dokumen soal, identitas siswa, dan data sekolah tidak boleh otomatis tampil di katalog publik.

## 12. Arah Arsitektur Target

```text
React + TypeScript
        |
        v
Express API + middleware autentikasi/otorisasi
        |
        +-- PostgreSQL atau SQLite untuk pengembangan lokal
        +-- Object storage untuk gambar dan lampiran
        +-- AI provider adapter Gemini + fallback engine
        +-- Queue/worker untuk pekerjaan AI yang lama
        +-- Audit log dan observability
```

### Backend

Backend perlu dipisah secara logis menjadi modul berikut:

```text
src/server/
  auth/             # OIDC/OAuth, session, refresh, logout
  users/            # profil, role, membership sekolah
  schools/          # tenant dan konfigurasi kop dokumen
  documents/        # CRUD, ownership, versioning, sharing
  generation/       # prompt, AI adapter, fallback, validator
  exports/           # Word, PDF, print metadata
  audit/             # jejak tindakan sensitif
```

Route HTTP tidak boleh mengambil keputusan authorization dari `requesterId` yang dikirim klien. Identitas pengguna harus berasal dari session/token yang sudah diverifikasi middleware.

### Data dan penyimpanan

Migrasikan `data/db.json` ke database transaksional. Minimal entitas target:

- `users`
- `schools`
- `school_memberships`
- `documents`
- `document_versions`
- `document_shares`
- `generation_jobs`
- `audit_logs`
- `ai_usage_records`

Gambar dan lampiran jangan disimpan sebagai data-URL di dokumen. Simpan file pada object storage dan hanya simpan metadata serta URL internal yang memiliki masa berlaku.

## 13. Roadmap Implementasi

### Fase 0 — Baseline dan keamanan P0

Tujuan: menutup celah yang menghalangi produksi.

- Tambahkan session/token server-side.
- Terapkan middleware `requireAuth`, `requireRole`, dan `requireSchoolAccess`.
- Lindungi seluruh endpoint admin, dokumen, dan AI.
- Hilangkan kepercayaan terhadap `requesterId`, `authorId`, `authorName`, dan `isPublic` dari body request.
- Validasi input dengan schema terpusat.
- Tambahkan rate limit, ukuran prompt maksimum, timeout, dan idempotency untuk generate.
- Sanitasi Markdown sebelum `dangerouslySetInnerHTML`.
- Sembunyikan endpoint daftar pengguna dari akses publik.
- Tambahkan audit log untuk verifikasi, perubahan role, penghapusan, sharing, dan ekspor.

**Kriteria selesai:** pengguna tidak dapat membaca atau mengubah data tenant lain meskipun memanggil API secara langsung.

### Fase 1 — Database dan tenancy

Tujuan: mendukung banyak guru dan sekolah tanpa kehilangan data.

- Buat schema database dan migration.
- Tambahkan `schoolId`/`tenantId` pada semua data bisnis.
- Implementasikan unique constraint email dan membership.
- Gunakan transaksi untuk pembuatan dokumen dan versi.
- Tambahkan soft delete untuk pengguna dan dokumen penting.
- Tambahkan backup terjadwal dan prosedur restore yang diuji.
- Pisahkan konfigurasi dev, staging, dan production.

**Kriteria selesai:** dua sekolah dapat menggunakan sistem bersamaan tanpa kebocoran data dan tanpa overwrite dokumen.

### Fase 2 — Identitas dan administrasi sekolah

- Integrasikan Belajar.id melalui OAuth/OIDC resmi jika tersedia.
- Sediakan alur undangan guru ke sekolah.
- Sediakan verifikasi email atau mekanisme recovery yang sah sebagai fallback.
- Tambahkan konfigurasi kepala sekolah, kop, NPSN, alamat, tanda tangan, dan tahun ajaran.
- Hapus nama kepala sekolah, NIP, Jakarta, NPSN, dan akreditasi hardcoded dari renderer dokumen.

**Kriteria selesai:** setiap dokumen yang diekspor memakai identitas sekolah dan penandatangan yang berasal dari profil tenant.

### Fase 3 — Kualitas AI dan dokumen

- Buat schema output berbeda untuk setiap `docType`.
- Validasi jumlah soal, kunci jawaban, tabel, rubrik, fase, dan alokasi waktu.
- Simpan `promptVersion`, `model`, `generationStatus`, dan `validationErrors`.
- Tampilkan status `AI`, `fallback`, atau `needs_review` secara jujur.
- Tambahkan tombol regenerasi bagian tertentu, bukan hanya seluruh dokumen.
- Tambahkan versioning dan autosave draft.
- Uji ekspor dengan tabel panjang, gambar, halaman lebih dari satu, dan dokumen berbahasa Indonesia.

**Kriteria selesai:** hasil yang tidak memenuhi struktur minimum tidak dapat diberi status siap ekspor tanpa peringatan.

### Fase 4 — Operasional produksi

- Gunakan HTTPS dan secure cookie.
- Kelola secret melalui secret manager, bukan file `.env` di server produksi.
- Tambahkan structured logging tanpa membocorkan prompt atau data pribadi.
- Tambahkan health check dan readiness check.
- Tambahkan metrik latency, error rate, penggunaan AI, fallback rate, dan ukuran penyimpanan.
- Tambahkan alert untuk kegagalan AI, database, disk, dan backup.
- Gunakan CI untuk lint, build, unit test, integration test, dan dependency audit.
- Sediakan staging environment sebelum deployment produksi.

**Kriteria selesai:** tim dapat mendeteksi kegagalan, memulihkan data, dan melakukan rollback tanpa mengedit data produksi secara manual.

## 14. Kontrak API Produksi

Semua endpoint bisnis harus:

- menerima identitas pengguna dari session/token;
- mengembalikan error JSON dengan format konsisten;
- melakukan validasi schema sebelum masuk service;
- menerapkan ownership/tenant check;
- mencatat tindakan sensitif ke audit log;
- memiliki timeout dan batas payload;
- tidak mengembalikan data pribadi yang tidak diperlukan.

Format error yang disarankan:

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_ACCESS_DENIED",
    "message": "Anda tidak memiliki akses ke dokumen ini.",
    "requestId": "..."
  }
}
```

## 15. Pengujian Minimum Sebelum Go-Live

### Unit test

- validasi domain dan identitas;
- perhitungan fase/jenjang;
- generator fallback;
- parser Markdown dan sanitasi;
- authorization policy;
- validasi schema setiap jenis dokumen.

### Integration test

- login dan logout;
- pembuatan tenant/sekolah;
- undangan dan verifikasi guru;
- CRUD dokumen dengan ownership;
- akses silang antar sekolah harus ditolak;
- generator AI dan fallback;
- audit log;
- backup dan restore.

### End-to-end test

Minimal satu alur lengkap untuk setiap role:

1. Guru masuk.
2. Guru membuat draft.
3. Guru mengedit dan menyimpan versi.
4. Kepala sekolah meninjau.
5. Dokumen diekspor ke Word/PDF.
6. Admin melihat audit trail.

## 16. Definition of Done Produksi

Aplikasi dapat disebut siap produksi apabila seluruh kondisi berikut terpenuhi:

- tidak ada endpoint bisnis kritis tanpa authorization;
- tidak ada data antar sekolah yang dapat dibaca silang;
- autentikasi tidak bergantung pada localStorage sebagai sumber kebenaran;
- database dan backup telah diuji restore;
- raw HTML dari pengguna/AI telah disanitasi;
- semua route penting memiliki test otomatis;
- hasil AI memiliki validasi dan label status yang jelas;
- ekspor Word/PDF lulus pengujian dokumen nyata;
- secret, log, dan data pribadi memiliki perlindungan yang memadai;
- staging telah digunakan untuk uji pilot minimal beberapa sekolah;
- tersedia runbook untuk deployment, rollback, backup, restore, dan insiden keamanan.

## 17. Keputusan Produk yang Harus Ditentukan

Sebelum implementasi Fase 1, pemilik produk perlu menetapkan:

1. Apakah aplikasi bersifat SaaS multi-sekolah atau instalasi terpisah per sekolah?
2. Apakah Belajar.id akan menggunakan integrasi OAuth/OIDC resmi atau undangan admin?
3. Apakah dokumen dapat dibagikan lintas sekolah?
4. Siapa yang berwenang menyetujui dokumen: admin, kepala sekolah, atau keduanya?
5. Berapa lama dokumen, log, dan file gambar disimpan?
6. Apakah penggunaan AI dibatasi per guru, per sekolah, atau per bulan?
7. Di mana wilayah penyimpanan data dan backup akan ditempatkan?

Keputusan tersebut memengaruhi schema database, authorization policy, biaya operasional, dan desain onboarding.

---

## 18. Roadmap Ide Pengembangan Strategis Berikutnya

Rencana peningkatan fitur strategis berdasarkan kebutuhan nyata guru di kelas dan regulasi Kurikulum Merdeka (Permendikdasmen No. 13 Tahun 2025 & Panduan Pembelajaran dan Asesmen):

| No | Inisiatif Fitur | Deskripsi & Nilai Manfaat bagi Guru | Area Terdampak |
|---|---|---|---|
| 1 | **📋 Generator Kisi-Kisi & Kartu Soal Standar Asesmen (AKM & Sumatif)** | Menghasilkan tabel matriks kisi-kisi resmi (Capaian Pembelajaran, Indikator Soal, Level Kognitif L1/L2/L3, Bentuk Soal: PG, PG Kompleks, Menjodohkan, Isian, Uraian) serta Kartu Soal per butir berformat dinas siap lampirkan di portofolio asesmen sekolah. | `GeneratorForm.tsx`, `server.ts` (prompt soal), ekspor `.docx` |
| 2 | **🗓️ Kalkulator Rincian Minggu Efektif (RME) Interaktif pada Prota & Promes** | Widget penghitung otomatis kalender pendidikan: guru memasukkan semester dan minggu libur/ujian, sistem menghitung total JP efektif dan mendistribusikan alokasi waktu per bab/TP secara proporsional. | `GeneratorForm.tsx`, `server.ts` (prota_promes), `serverFallback.ts` |
| 3 | **🧩 Matriks Diferensiasi Terpadu (Konten · Proses · Produk) di Modul Ajar** | Sakelar untuk merinci strategi diferensiasi 3 pilar pada Modul Ajar: diferensiasi konten (auditori/visual/kinestetik), proses (kelompok terbimbing vs mandiri), dan produk (opsi luaran tugas murid: infografis, podcast, laporan, unjuk kerja). | `GeneratorForm.tsx`, `server.ts` (modul_ajar prompt) |
| 4 | **🖋️ Lembar Pengesahan Resmi Supervisi (Kepala Sekolah & Pengawas)** | Penyisipan otomatis halaman Pengesahan Resmi di halaman awal dokumen / bundle paket (berisi nama & NIP Kepala Sekolah, NIP Pengawas Pembina, tanggal penetapan, dan kop dinas) untuk kebutuhan bukti fisik SKP di PMM (Platform Merdeka Mengajar). | `types/index.ts`, `UserProfileStatsDashboard.tsx`, `exportUtils.ts` |
| 5 | **📖 Jurnal Refleksi Pasca-Mengajar Guru (Portofolio Kinerja PMM)** | Tab pencatatan refleksi setelah pembelajaran selesai di kelas (menggunakan kerangka 4F: *Facts, Feelings, Findings, Future*), tersimpan di paket dan dapat diekspor sebagai jurnal rekam jejak guru untuk supervisi. | `PaketWorkspace.tsx`, API `/api/pakets/:id/refleksi`, DB |
| 6 | **🌿 Kurikulum Muatan Lokal & Kontekstualisasi Kearifan Budaya** | Pemilih konteks daerah (Sumatera, Jawa, Bali-Nusa Tenggara, Kalimantan, Sulawesi, Maluku-Papua, serta ekosistem Pesisir/Agraris/Perkotaan) untuk mengadaptasi studi kasus, stimulus fenomena nyata, dan proyek murid sesuai budaya setempat. | `GeneratorForm.tsx`, `data/curriculumData.ts`, `server.ts` |

