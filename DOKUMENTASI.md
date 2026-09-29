# Dokumentasi — Ruang Guru Merdeka
### Generator Perangkat Ajar Kurikulum Merdeka

Aplikasi web untuk membantu guru Indonesia menyusun **7 perangkat ajar Kurikulum Merdeka** sesuai **Permendikbudristek No. 12 Tahun 2024** dan **Panduan Pembelajaran & Asesmen (PPA) 2024**, dibantu AI Gemini dengan mesin cadangan otomatis, ekspor Word/PDF siap cetak kertas A4, dan arsip terverifikasi Belajar.id.

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
| Panduan | Halaman + modal regulasi (fase A–F, komponen modul, diferensiasi, KKTP) |
| Tema | Terang/gelap ala Apple, tersimpan otomatis, grafik adaptif |

---

## 2. Teknologi

- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + D3.js + `marked`
- **Backend:** Express 5 + `tsx` (satu server menyajikan API + frontend, middleware Vite saat dev)
- **AI:** `@google/genai` (teks: `gemini-3.8-flash` dkk. dengan fallback; gambar: `gemini-2.5-flash-image`)
- **Ekspor:** `docx` (Word asli), `jspdf` + `html2canvas` (PDF), salin clipboard
- **Data:** JSON file `data/db.json` (di-gitignore), dimuat saat start + disimpan debounce tiap mutasi

---

## 3. Struktur Folder

```
PerangkatAjar/
├── server.ts              # API Express + serve frontend
├── serverFallback.ts      # Template cadangan 7 tipe dokumen
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
│   │   └── topicCatalog.ts    # Katalog topik per fase/kelas + pencarian
│   ├── components/
│   │   ├── Sidebar.tsx / TopHeader.tsx   # Navigasi (profil hanya di header)
│   │   ├── LoginPage.tsx                 # Masuk/daftar + akun demo 1-ketuk
│   │   ├── GeneratorForm.tsx             # Wizard 3 langkah 7 tipe dokumen
│   │   ├── ContextualTopicSuggester.tsx  # Saran topik kontekstual + semester
│   │   ├── DocumentViewer.tsx            # Pratinjau A4 + edit + ilustrasi AI + ekspor
│   │   ├── DocumentRepository.tsx        # Arsip (cari/filter/buka/unduh/hapus)
│   │   ├── TeacherVerificationPanel.tsx  # Verifikasi guru + KPI + tambah manual
│   │   ├── UserProfileStatsDashboard.tsx # Profil + KPI + grafik D3 + riwayat
│   │   ├── ProductivityD3Chart.tsx / DocumentTypeD3Donut.tsx
│   │   └── BelajarIdAuthModal.tsx / CurriculumGuideModal.tsx / LogoutConfirmModal.tsx
│   └── utils/exportUtils.ts  # Markdown→HTML, docx, pdf, .doc legacy, clipboard
└── dist/                  # Hasil build produksi
```

---

## 4. Route

### 4.1 Tampilan (navigasi sidebar)

| Target | Fungsi |
|---|---|
| `modul_ajar` | Wizard Modul Ajar lengkap PPA 2024 |
| `rpp` | RPP ringkas 1–2 lembar siap supervisi |
| `soal_ujian` | Paket soal + kisi-kisi + kunci (opsi jumlah & level) |
| `lkpd` | LKPD siap cetak (kop kelompok, 3 aktivitas, rubrik diri) |
| `kktp_atp` | Matriks ATP + 3 pendekatan KKTP + remedial/pengayaan |
| `prota_promes` | Tabel Prota + Promes ganjil/genap |
| `modul_p5` | Projek P5 (8 tema, 4 tahap, rubrik, jurnal) |
| `stats` | Statistik, grafik, lencana, riwayat |
| `profile` | Profil Saya: edit mandiri (nama, sekolah, mapel, NIP, NPSN), statistik sendiri, ganti tema/akun |
| `repository` | Arsip semua dokumen |
| `admin` | Verifikasi + edit profil + ubah peran + tambah/hapus guru |
| `guide` | Panduan regulasi |

Alur generator: **Langkah 1** format & kelas → **2** materi → **3** periksa & susun → tinjau/edit → simpan/ekspor.

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
