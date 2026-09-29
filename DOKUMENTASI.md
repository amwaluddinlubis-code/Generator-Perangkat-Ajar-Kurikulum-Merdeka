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
- **Backend:** Express 4.21 + `tsx` (satu server menyajikan API + frontend, middleware Vite saat dev)
- **AI:** `@google/genai` (teks multi-model + fallback; gambar: `gemini-2.5-flash-image`)
- **Ekspor:** `docx` (Word asli), `jspdf` + `html2canvas` (PDF), salin clipboard
- **Data:** SQLite file `data/app.sqlite` dengan transaksi, WAL, foreign keys, soft-delete, tenant `schoolId`, session store, rate-limit store, dan audit log. `data/db.json` hanya jalur migrasi legacy satu kali.

---

## 3. Struktur Folder

```
PerangkatAjar/
├── server.ts              # API Express + serve frontend
├── serverFallback.ts      # Template cadangan 7 tipe dokumen
├── data/app.sqlite        # Database runtime SQLite (dibuat otomatis, jangan di-commit)
├── data/backups/          # Hasil backup SQLite (jangan di-commit)
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
│   ├── server/
│   │   ├── database.ts       # SQLite schema, migration, persistence, backup
│   │   ├── security.ts       # session cookie, rate limit, security limits
│   │   ├── authorization.ts  # role + tenant authorization policy
│   │   └── validation.ts     # API + AI input/output validation
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
| `GET /api/users/current` | Profil aktif dari session cookie | Server menentukan identitas |
| `POST /api/auth/login-belajar-id` | Masuk/daftar; baru → `PENDING` | Cookie HttpOnly; rate limit; validasi payload |
| `POST /api/auth/logout` | Keluar + revoke session | Cookie dihapus server |
| `GET /api/users` | Daftar user sesuai role + `schoolId` | Super Admin lintas tenant; Admin sekolah sendiri |
| `POST /api/users/verify` | Ubah status `VERIFIED/PENDING/REJECTED` | Authorization policy + audit |
| `PUT /api/users/:id` | Ubah profil | Ownership/role/tenant diverifikasi server; tenant hanya dapat dipindah Super Admin |
| `DELETE /api/users/:id` | Soft-delete user | Session/membership direvoke; histori tetap ada |
| `GET /api/audit-logs` | Audit log | Super Admin global; Admin tenant sendiri |
| `GET /api/documents` | Daftar dokumen | Server filter berdasarkan role/ownership/`schoolId` |
| `POST /api/documents` | Simpan dokumen | author + tenant berasal dari session; private default |
| `DELETE /api/documents/:id` | Soft-delete dokumen | Ownership/tenant policy server-side |
| `POST /api/generate` | Susun dokumen via AI/fallback | Session wajib; input + output divalidasi |
| `POST /api/generate-image` | Buat ilustrasi | Session wajib; rate limit + input validation |

---

## 5. Menjalankan Lokal

### Prasyarat
Node.js 24.15+ · npm · port 3000 bebas. Versi pengembangan dipin ke Node 24.21.0 melalui `.nvmrc`.

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
| `npm run clean` | Hapus `dist` & `server.js` secara cross-platform |
| `npm test` | Unit + security + authorization + validation + API integration tests |
| `npm run backup` | Backup SQLite ke `data/backups/` atau path yang diberikan |
| `npm run restore -- <backup.sqlite>` | Restore aman; wajib server dihentikan dan `RGM_RESTORE_CONFIRM=YES` |

---

## 6. Desain & Tema

- Bahasa visual Apple: latar aurora gradien lembut, kartu putih, pil hitam, aksen biru `#0071e3`, target sentuh ≥ 44px.
- Toggle bulan/matahari di header; pilihan tersimpan (`rgm-theme`); anti-kedip via skrip `index.html`.
- Kertas dokumen (`.doc-paper`): lebar 210mm, serif formal, kop + ornamen + pengesahan; cetak via `@page A4`.
- Standar naskah dinas di `.docx`: Times New Roman 12pt, justify, spasi 1.5, margin atas 4cm / lain 3cm.

---

## 7. Data & Akun Demo

- Seed: 1 Super Admin, 1 Admin, guru terverifikasi/pending, dan 5 dokumen contoh.
- Pada startup pertama, SQLite diisi dari `data/db.json` bila file legacy tersedia; jika tidak, seed kode digunakan.
- Setelah migrasi, SQLite menjadi source of truth. Jangan menghapus `data/app.sqlite` pada instalasi yang sudah berisi data kecuali memang ingin memulai ulang.
- Login cepat tetap tersedia untuk akun seed di UI pilot.

## 8. Troubleshooting

| Gejala | Solusi |
|---|---|
| `ERESOLVE` saat install | Pakai `npm install --legacy-peer-deps` |
| `EADDRINUSE` port 3000 | Matikan proses lama yang menjalankan `tsx server.ts` |
| Selalu "Template cadangan" | Isi `GEMINI_API_KEY` lalu restart |
| "API key not valid" (ilustrasi) | Key salah/kedaluwarsa — buat baru di AI Studio |
| Data tidak muncul | Pastikan `data/app.sqlite` dapat dibuat/ditulis oleh proses Node |
| Migrasi legacy | Letakkan `data/db.json` legacy sebelum startup pertama; migrasi hanya dilakukan bila SQLite belum berisi user |
| Restore | Hentikan server, jalankan `RGM_RESTORE_CONFIRM=YES npm run restore -- <backup.sqlite>`, lalu start kembali |
| Fase kosong untuk SMP/SMA | Default generator mengikuti jenjang akun |

---

## 9. Batasan yang Diketahui

- Statistik bulanan memakai tren contoh (bukan murni data nyata).
- SQLite saat ini ditujukan untuk deployment single-node. Untuk multi-instance/cloud, storage tenant/session perlu dipindahkan ke PostgreSQL atau database terkelola bersama.
- Belajar.id pada branch ini masih merupakan simulasi domain + approval internal; OAuth/OIDC resmi belum terintegrasi.
- Ilustrasi AI memakai kuota Gemini; tanpa `GEMINI_API_KEY`, generator teks tetap dapat memakai fallback dan generator gambar mengembalikan status konfigurasi.
- Gambar tersisip tetap berupa data-URL sehingga dokumen besar dapat meningkatkan ukuran payload.

---

## 10. Status Kesiapan Produk

Branch `main` tetap menjadi baseline prototype lama. Branch `feat/security-baseline` sekarang menjadi kandidat **pilot internal single-node** setelah automated gate PASS dan sebelum Browser QA.

| Area | Status |
|---|---|
| UI dan alur generator | Tersedia |
| 7 jenis perangkat ajar | Tersedia |
| AI + fallback | Tersedia; fallback tetap berjalan tanpa Gemini |
| Validasi AI output | PASS melalui automated tests |
| Autentikasi session | PASS — server-side persistent session |
| Otorisasi API | PASS — role + schoolId + ownership |
| Penyimpanan | PASS — SQLite transactional single-node |
| Rate limit | PASS — persistent + atomic |
| Audit log | PASS — tenant-scoped |
| Backup/restore | PASS — automated test |
| Type check | PASS |
| Unit/security/authorization/validation tests | PASS |
| API integration tests | PASS |
| Production build | PASS |
| OAuth/OIDC Belajar.id resmi | Belum |
| Multi-instance PostgreSQL | Belum |
| Browser QA | **DEFERRED — menunggu user memulai pengujian** |
| Public production readiness | Belum diklaim |

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

## 18. Update Implementasi — Fase 0 Security Baseline

Perubahan pada branch pengembangan ini mulai menerapkan Fase 0 tanpa mengklaim aplikasi sudah siap produksi.

### Sudah diterapkan

- **Server-side session:** login membuat session identifier acak di server dengan masa berlaku 8 jam. Browser hanya menerima cookie HttpOnly + SameSite=Lax; identitas tidak lagi diambil dari localStorage atau header x-user-id.
- **Server-side authorization:** endpoint profil, admin, dokumen, generator AI, dan generator gambar memeriksa session pada server. Role dan ownership tidak dipercaya dari request body.
- **Ownership dokumen:** guru hanya dapat membaca/menghapus dokumennya sendiri; admin dibatasi pada sekolah yang tercatat pada profil pilot; SUPER_ADMIN dapat melakukan inspeksi penuh. Dokumen baru PRIVATE secara default.
- **Validasi dan batas input:** batas panjang email, profil, topik, prompt generator, konten dokumen, dan prompt gambar diterapkan di API.
- **Rate limit baseline:** login, generator dokumen, dan generator gambar memiliki pembatasan per IP/email atau per user session. Implementasi saat ini masih in-memory dan ditujukan untuk baseline/pilot.
- **Audit log:** login, logout, verifikasi, perubahan profil, penghapusan user, pembuatan/penghapusan dokumen, dan pemanggilan generator dicatat. Log disimpan di db.json untuk pilot; belum merupakan audit store transaksional produksi.
- **HTTP hardening:** security headers dasar, Cache-Control no-store untuk API, dan pemeriksaan Origin untuk request yang mengubah state.
- **Sanitasi Markdown:** hasil marked disanitasi dengan allowlist HTML dan validasi URL sebelum dipasang melalui dangerouslySetInnerHTML. Marked sendiri tidak melakukan sanitasi output secara otomatis.
- **Automated checks:** tersedia npm test, test session/cookie/rate-limit, serta GitHub Actions untuk lint, test, dan production build.

### Yang masih sengaja belum dianggap selesai

1. Belajar.id OAuth/OIDC resmi dan identity proofing.
2. Session store persisten/terdistribusi untuk multi-instance production.
3. Database transaksional dan model schoolId/tenantId yang immutable.
4. Schema validation terpusat untuk seluruh API.
5. Audit store terpisah, retention policy, dan UI audit trail.
6. Rate limit terdistribusi/WAF dan observability produksi.
7. Sanitasi/validasi konten pada pipeline server-side sebelum penyimpanan bila format rich-text diperluas.
8. Backup/restore database, object storage, dan runbook operasional.
9. Pengujian integration/E2E lintas role dan lintas sekolah.
10. Integrasi approval/sharing dokumen yang eksplisit.

**Catatan penting:** session store dan rate limiter pada baseline ini menggunakan memory process. Ini memperbaiki sumber identitas dari sisi klien dan menutup bypass API yang paling jelas, tetapi belum cocok untuk deployment multi-instance atau restart-safe production. Fase 1 tetap wajib memindahkan state bisnis dan session ke storage transaksional/persisten.

### Kontrak keamanan yang mulai berlaku

Klien boleh mengirim data formulir, tetapi tidak lagi berwenang menentukan:

- siapa requester sebenarnya;
- siapa authorId dokumen;
- authorName/schoolName pemilik dokumen;
- role atau status akun;
- apakah dokumen otomatis publik.

Keputusan tersebut berasal dari session dan data user yang dibaca server. Pola ini menjadi baseline sebelum implementasi tenancy Fase 1.

---

## 19. Status Implementasi Terkini — Security + Tenant Baseline

**Branch kerja:** `feat/security-baseline`

### Selesai dan terverifikasi otomatis

- Session server-side persisten di SQLite; token raw tidak disimpan, hanya hash.
- Cookie session HttpOnly + SameSite=Lax; Secure + `__Host-` pada production.
- Absolute session TTL 8 jam dan idle timeout 2 jam.
- Login/logout, status akun, role, dan ownership diverifikasi server-side.
- `schoolId` menjadi tenant boundary server-owned. Client tidak dapat memilih `schoolId`, `authorId`, `authorName`, atau `schoolName` sebagai sumber otorisasi.
- Admin hanya melihat/mengelola user dan dokumen dalam sekolahnya; Super Admin dapat lintas tenant.
- Privilege escalation ke `ADMIN`/`SUPER_ADMIN` diblok.
- User delete menjadi soft-delete agar referensi dokumen dan audit tetap valid.
- SQLite memakai foreign key, WAL, synchronous FULL, busy timeout, dan transaksi untuk operasi penting.
- Rate limit disimpan di SQLite dan update quota dibuat atomik.
- Audit log tenant-aware dan visibilitas log mengikuti role/tenant.
- Input validation terpusat untuk login, profil, dokumen, generator, dan image generator.
- Output AI divalidasi sebelum dikembalikan.
- Prompt generator memiliki security boundary yang memperlakukan input guru sebagai data, bukan instruksi sistem.
- Markdown output disanitasi sebelum DOM injection.
- Security headers: CSP, HSTS production, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP/CORP.
- CSRF baseline: fetch metadata + Origin validation untuk request state-changing.
- Backup dan restore SQLite tersedia melalui npm scripts.
- Automated tests mencakup authorization policy, validation, session/rate limit, SQLite persistence/backup, dan API integration lintas tenant.
- GitHub Actions memverifikasi lint/typecheck, seluruh test, dan production build pada Node 24.21.0.

### Hasil verifikasi terakhir

Run terakhir yang berhasil:

- **CI Runtime:** PASS — runtime/integration tests.
- **CI:** PASS — dependency install, TypeScript check, security/unit tests, production build.
- **Browser QA:** **DEFERRED** sesuai keputusan pengembangan. Tidak ada manual UI/browser test yang dianggap selesai sebelum pengguna menyatakan siap.

### Yang masih berada di luar baseline ini

1. OAuth/OIDC Belajar.id resmi dan identity proofing.
2. Deployment multi-instance dengan PostgreSQL/managed database.
3. Object storage untuk file/gambar besar.
4. Metrics/tracing/alerting produksi.
5. Role `KEPALA_SEKOLAH`, workflow approval, komentar, dan sharing eksplisit.
6. E2E browser QA setelah user meminta tahap tersebut.

**Kriteria masuk Browser QA:** automated CI dan runtime integration sudah PASS. Tahap berikutnya adalah pengguna menjalankan aplikasi dan melakukan uji UI nyata; hasil Browser QA kemudian dicatat sebagai gate terpisah, bukan dicampur dengan hasil automated test.
