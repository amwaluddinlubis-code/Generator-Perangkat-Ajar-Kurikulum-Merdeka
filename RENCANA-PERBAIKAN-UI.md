# Rencana Perbaikan UI/UX — Ruang Guru Merdeka

Dokumen kerja untuk menindaklanjuti **analisis UI** (Nov 2026).
Berisi temuan terukur, backlog berprioritas, rencana kerja bertahap, dan kriteria penerimaan.

> Status: **sebagian besar terlaksana** — Sprint 1 + UI-03, UI-07, UI-15 terlaksana pada commit `c09180d` ("perbaikan UI", sistem desain "Slate Core"); UI-05, UI-06, dan UI-16 (robots.txt) menyusul sesudahnya. Sisa terbuka: UI-08, UI-09, UI-10, UI-11…UI-14. Rincian per item di §11.
> **Keputusan yang menyimpang dari rencana awal:** aksen kanonik yang diterapkan adalah **indigo** ("Slate Core", `--accent: #4f46e5`), bukan amber seperti rancangan UI-01 di bawah — teks UI-01 dipertahankan sebagai catatan rancangan awal.
> Cakupan: tampilan, interaksi, aksesibilitas, konsistensi desain.
> Di luar cakupan: keamanan API, database, otorisasi (lihat `DOKUMENTASI.md` §10–§16).

---

## 1. Tujuan

| No | Sasaran | Ukuran keberhasilan |
|---|---|---|
| 1 | Satu bahasa desain | Tidak ada lagi tombol/a kartu dengan 3 palet berbeda dalam satu alur |
| 2 | Lolos WCAG AA | Lighthouse Accessibility **≥ 0.98**, `color-contrast` & `label-content-name-mismatch` **0 temuan** |
| 3 | Dark mode utuh | Semua panel terbaca di tema gelap, tanpa blok putih menyala |
| 4 | Alur paket tuntas | Dokumen paket dibuka lewat `DocumentViewer` (A4 + ekspor), bukan markdown mentah |
| 5 | Navigasi dapat diandalkan | Refresh dan tombol Back tidak membuang konteks; semua fitur punya pintu masuk |

---

## 2. Baseline (kondisi saat ini)

Diukur pada `http://localhost:3001` (dev), Chrome, viewport 1440×900.

| Metrik | Nilai sekarang | Target |
|---|---|---|
| Lighthouse Accessibility | 0.96 | ≥ 0.98 |
| Lighthouse Best Practices | 1.00 | 1.00 |
| Lighthouse SEO | 0.80 | ≥ 0.95 |
| Audit `color-contrast` | gagal (4 elemen) | 0 |
| Audit `label-content-name-mismatch` | gagal (1 elemen) | 0 |

**Kontras terukur:**

| Elemen | Lokasi | Rasio | Standar |
|---|---|---|---|
| Tombol "Tandai Final 🎉" | `PaketWorkspace.tsx` L798 | **1.95:1** | 4.5:1 |
| Deskripsi kartu `text-xs opacity-60` | kartu paket | **4.46:1** | 4.5:1 |
| Deskripsi kartu (varian) | kartu paket | **4.39:1** | 4.5:1 |
| Item aktif sidebar (putih di gradien amber) | `Sidebar.tsx` | < 3:1 | 4.5:1 |

**Palet yang berjalan bersamaan:**

| Sumber | Warna | Pemakaian |
|---|---|---|
| `rgm-*` (hangat/amber) | amber ~`#F59E0B` | hero Beranda, item aktif sidebar, kartu paket |
| DaisyUI default | violet `oklch(45% 0.24 277.023)`, magenta, cyan, hijau | `btn-primary` 19×, `alert-info`, badge |
| Apple | biru `#0071e3` | `btn-apple` 36×, `apple-card` 49× |

---

## 3. Prinsip perbaikan

1. **Satu sumber warna.** Semua warna berasal dari token di `src/index.css`. Tidak ada `bg-white`, `text-amber-950`, atau `bg-[#fff8e5]` di komponen.
2. **Komponen, bukan salinan.** Satu `Button`, satu `Modal`, satu `Toast`. Varian ditentukan prop, bukan kelas yang diulang.
3. **Kontras dulu, estetika kemudian.** Tidak ada teks di bawah 4.5:1, termasuk placeholder dan teks sekunder.
4. **Tema gelap setara, bukan tambahan.** Setiap komponen baru wajib diuji di dua tema sebelum dianggap selesai.
5. **Perubahan kecil, terverifikasi.** Setiap tahap diakhiri Lighthouse + uji manual, bukan digabung di akhir.

---

## 4. Backlog berprioritas

Legenda prioritas: **P0** = menghalangi pemakaian/merusak kredibilitas · **P1** = penting, mengurangi friksi · **P2** = penyempurnaan.

### P0 — Wajib

| ID | Judul | Area | Berkas utama | Bukti |
|---|---|---|---|---|
| UI-01 | Unifikasi palet & token warna | Design system | `src/index.css`, semua komponen | 3 palet bersaing; DaisyUI primary violet |
| UI-02 | Perbaikan kontras teks & tombol | A11y | `PaketWorkspace.tsx`, `Sidebar.tsx`, kartu paket | 1.95:1, 4.46:1, 4.39:1 |
| UI-03 | Pakai `DocumentViewer` di alur paket | Alur inti | `PaketWorkspace.tsx` L987–1010 | "Buka" menampilkan `<pre>` markdown mentah |
| UI-04 | Selesaikan dark mode | Tema | `GeneratorForm.tsx` L401, 849–935, 1102–1210; `index.css` | Panel putih menyala & teks gelap di atas gelap |

### P1 — Penting

| ID | Judul | Area | Berkas utama |
|---|---|---|---|
| UI-05 | Tambah routing (URL = state) | Arsitektur | `src/App.tsx`, `src/main.tsx` |
| UI-06 | Lengkapi navigasi / hapus target mati | Navigasi | `Sidebar.tsx`, `App.tsx` |
| UI-07 | Perbaiki refresh data saat ganti akun | State | `DaftarPaket.tsx` (deps effect) |
| UI-08 | Standarkan modal (focus trap, scroll lock, Escape) | A11y | `PaketWorkspace.tsx`, `DaftarPaket.tsx`, modal lain |
| UI-09 | Satukan implementasi toast | Konsistensi | `App.tsx`, komponen dengan toast lokal |
| UI-10 | Pisahkan modul server dari bundle client | Performa | impor `fs`/`path`/`url` yang bocor |

### P2 — Penyempurnaan

| ID | Judul | Area | Berkas utama |
|---|---|---|---|
| UI-11 | Ringkas empty state Perpustakaan | Visual | `Perpustakaan.tsx` (`hero min-h-[52vh]`) |
| UI-12 | Perbaiki overflow tabel admin | Responsif | `TeacherVerificationPanel.tsx` |
| UI-13 | Hilangkan judul ganda header/breadcrumb | Visual | `TopHeader.tsx` |
| UI-14 | Satukan avatar (hitam vs amber) | Visual | `TopHeader.tsx`, `Sidebar.tsx` |
| UI-15 | Hormati `prefers-reduced-motion` | A11y | `index.css` (`ux-*`) |
| UI-16 | `robots.txt` + metadata SEO | SEO | `public/` |

---

## 5. Rincian pekerjaan

### UI-01 — Unifikasi palet & token warna

**Masalah.** Tiga sistem warna aktif bersamaan; aksi utama bisa berwarna berbeda di dua halaman bersebelahan.

**Langkah.**
1. Tetapkan palet kanonik di `:root` (`src/index.css`):
   - `--brand` (primary aksi) → amber hangat
   - `--brand-ink` (teks di atas brand, harus ≥ 4.5:1)
   - `--link` → `#0071e3` khusus tautan/aksi sekunder
   - `--surface`, `--surface-raised`, `--border`, `--text`, `--text-muted`
2. Petakan token DaisyUI ke token di atas (`--color-primary`, `--color-secondary`, `--color-info`, `--color-success`) agar `btn-primary`/`badge`/`alert` otomatis ikut.
3. Hapus pemakaian langsung `bg-white`, `text-*-950`, `bg-[#...]` di komponen.
4. Konsolidasikan kelas kartu: `rgm-card` menjadi satu-satunya kartu; `apple-card` dipertahankan hanya sebagai alias.
5. Ganti `alert alert-info` (cyan) pada `GeneratorForm.tsx` L432 ke varian netral/brand.

**Selesai bila.** Grep tidak menemukan warna hardcoded di `src/components`; semua tombol aksi memakai satu kelas dasar.

---

### UI-02 — Perbaikan kontras

**Masalah.** Aksi terpenting ("Tandai Final 🎉") justru paling tidak terbaca.

**Langkah.**
1. `PaketWorkspace.tsx` L798: ganti `btn btn-success btn-outline` → `btn btn-success` (solid) atau `btn-brand`. Verifikasi ≥ 4.5:1 di dua tema.
2. Teks sekunder kartu: `text-xs opacity-60` → warna muted eksplisit (`--text-muted`) tanpa `opacity`, minimal 4.5:1.
3. Item aktif sidebar: ganti putih-di-atas-gradien-amber menjadi permukaan terang dengan teks gelap + indikator batang amber, atau amber gelap dengan teks putih yang lolos 4.5:1.
4. `TopHeader`: samakan teks terlihat dengan `aria-label` tombol profil (perbaiki `label-content-name-mismatch`).

**Selesai bila.** Lighthouse `color-contrast` = 0 temuan; audit manual 4 elemen di tabel §2 lolos.

---

### UI-03 — `DocumentViewer` di alur paket

**Masalah.** Fitur inti (membuka dokumen paket) menampilkan markdown mentah.

**Langkah.**
1. Di `PaketWorkspace.tsx`, ganti isi modal `lihat` (L987–1010) dengan `DocumentViewer`.
2. Teruskan `paketMode={{ paketId, docType, onTutup, ... }}` — prop sudah tersedia di `DocumentViewer.tsx` L73.
3. Pastikan pemilih versi, "Jadikan versi aktif", dan "Tandai Final" berfungsi dari viewer.
4. Ekspor `.docx`/PDF/print dari viewer menggantikan tombol "Unduh .md" sebagai jalur utama (`.md` tetap sebagai opsi sekunder).
5. Uji dokumen panjang (tabel, > 3 halaman) di viewer dan hasil cetak.

**Selesai bila.** "Buka" pada kartu dokumen menampilkan halaman A4 rapi; tidak ada `<pre>` markdown di alur paket.

**Catatan.** `DocumentViewer` saat ini hanya dirender di `App.tsx` L570 (alur lama). Setelah perubahan, ia dipakai dua alur — pastikan tidak ada state yang bocor antar-alur.

---

### UI-04 — Dark mode

**Masalah.** Sebagian panel tetap terang atau menjadi tidak terbaca saat tema gelap.

**Langkah.**
1. Sapu `GeneratorForm.tsx`: `text-amber-950` (L849, L872), `text-indigo-950` (L903), `text-sky-950` (L935), `bg-white/80` (L887), `bg-white` (L913, L917, L921), panel advanced (L1102, L1166, L1192, L1210), banner `bg-[#fff8e5]` (L401).
2. Ganti ke token semantik yang punya nilai di `.dark`.
3. `rgm-card` di dark: beri `--surface-raised` yang **berbeda** dari latar halaman + border halus agar elevasi terlihat.
4. Lengkapi jembatan token DaisyUI gelap → `--apple-*`.
5. Uji setiap layar di dua tema; simpan tangkapan layar sebagai bukti di PR.

**Selesai bila.** Tidak ada area putih menyala di tema gelap; semua teks ≥ 4.5:1.

---

### UI-05 — Routing

**Masalah.** URL tidak berubah; refresh selalu kembali ke Beranda; Back tidak berfungsi.

**Langkah.**
1. Pilih pendekatan: `react-router` (disarankan) atau sinkronisasi `location.hash` bila ingin tanpa dependensi baru.
2. Peta rute: `/beranda`, `/paket`, `/paket/:id`, `/paket/:id/:docType`, `/perpustakaan`, `/profil`, `/statistik`, `/admin`, `/panduan`.
3. Ganti state `activeTab` menjadi sumber dari router; `NavigationTarget` lama dipensiunkan bertahap.
4. Pertahankan transisi `ux-view-enter` saat pindah rute.

**Selesai bila.** F5 di halaman mana pun tetap di halaman itu; Back kembali ke halaman sebelumnya.

**Catatan.** Menambah dependensi perlu persetujuan (lihat AGENTS.md). Opsi hash-router menghindarinya.

---

### UI-06 — Navigasi lengkap

**Langkah.**
1. Inventaris `NavigationTarget` di `Sidebar.tsx` vs view yang benar-benar dirender di `App.tsx`.
2. Untuk `repository` + 7 generator: **tampilkan** di sidebar (grup "Arsip" dan "Generator Satuan") atau **hapus** dari tipe.
3. Pastikan tidak ada target tanpa tujuan dan tidak ada tujuan tanpa pintu masuk.
4. Tambahkan `aria-current` yang benar pada item aktif.

**Selesai bila.** Setiap nilai `NavigationTarget` dapat dijangkau pengguna lewat UI.

---

### UI-07 — Refresh data saat ganti akun

**Masalah.** Ganti akun saat berada di "Paket Saya" meninggalkan daftar basi/kosong sampai reload penuh — berpotensi menampilkan data akun sebelumnya.

**Langkah.**
1. `DaftarPaket.tsx`: tambahkan `currentUser` (atau `currentUser.id`) ke dependency effect, dan reset state list sebelum fetch.
2. Audit komponen lain dengan pola serupa (`Perpustakaan`, `Beranda`, dashboard statistik).
3. Tambahkan guard: bila `currentUser.id` berubah, batalkan request lama (AbortController).

**Selesai bila.** Ganti akun → daftar langsung menampilkan data akun baru tanpa reload.

---

### UI-08 — Standarkan modal

**Langkah.**
1. Buat `src/components/ui/Modal.tsx`: portal, `role="dialog"`, `aria-modal`, focus trap, restore focus, Escape, scroll lock, klik backdrop.
2. Migrasikan semua modal (paket, generate, hapus, profil, admin, ulasan) ke komponen ini.
3. Perbaiki khusus modal `lihat` di `PaketWorkspace` yang belum punya handler Escape.

**Selesai bila.** Tab tidak bisa keluar dari modal; halaman belakang tidak ikut scroll; Escape menutup semua modal.

---

### UI-09 — Satukan toast

**Langkah.** Satu provider (`ToastProvider`) di `App.tsx`; hapus implementasi lokal; posisi, durasi, dan warna konsisten; `role="status"` + `aria-live="polite"`.

---

### UI-10 — Bundle client

**Masalah.** `fs`, `path`, `url`, `source-map-js` ter-externalize ke browser (peringatan Vite saat start).

**Langkah.**
1. Temukan impor yang membawa modul Node ke komponen React.
2. Pindahkan util terkait ke `server/` atau beri guard `import 'server-only'`.
3. Impor hanya tipe/konstanta dari modul bersama (`shared/`).
4. Ukur ulang ukuran bundle sebelum/sesudah.

---

### UI-11 … UI-16 — Penyempurnaan

| ID | Langkah singkat |
|---|---|
| UI-11 | `Perpustakaan.tsx`: turunkan `min-h-[52vh]` → ±`240px`; empty state ringkas + CTA "Buat Paket Pertama" |
| UI-12 | `TeacherVerificationPanel.tsx`: bungkus tabel dengan `overflow-x-auto` + `min-w` kolom; atau ubah ke kartu bertumpuk di < 768px |
| UI-13 | `TopHeader.tsx`: pilih satu lokasi judul (header **atau** breadcrumb), bukan keduanya |
| UI-14 | Satukan sumber avatar (satu komponen `Avatar` dipakai header & sidebar) |
| UI-15 | `index.css`: bungkus `ux-view-enter`, `ux-pop-in`, `ux-stagger` dengan `@media (prefers-reduced-motion: no-preference)` |
| UI-16 | Tambah `public/robots.txt`, `meta description`, dan `lang="id"` yang konsisten |

---

## 6. Rencana kerja bertahap

Estimasi untuk 1 pengembang, sudah termasuk verifikasi.

| Tahap | Isi | Estimasi | Keluaran |
|---|---|---|---|
| **Sprint 1 — Kredibilitas visual** | UI-01, UI-02, UI-04 | 3–4 hari | Satu palet, kontras lolos, dark mode utuh |
| **Sprint 2 — Alur inti** | UI-03, UI-07 | 2–3 hari | Dokumen paket tampil layak; data akun benar |
| **Sprint 3 — Fondasi interaksi** | UI-05, UI-06, UI-08, UI-09 | 4–5 hari | Routing, navigasi lengkap, modal & toast standar |
| **Sprint 4 — Poles** | UI-10, UI-11 … UI-16 | 2–3 hari | SEO, performa, detail visual |

**Total: ± 11–15 hari kerja.** Sprint 1 dan 2 memberi dampak terbesar bila waktu terbatas.

### Urutan ketergantungan

```
UI-01 (token) ──► UI-02 (kontras)
            └───► UI-04 (dark mode)
UI-03 (viewer) ──► UI-08 sebagian (modal viewer)
UI-05 (routing) ──► UI-06 (navigasi)
UI-01 ──► UI-14 (avatar) ──► UI-13 (header)
```

---

## 7. Kriteria penerimaan

### Otomatis
- `npm run lint` (`tsc --noEmit`) bersih.
- `npm run build` sukses.
- Lighthouse (mobile + desktop) di halaman Login, Beranda, Paket, Workspace:
  - Accessibility ≥ 0.98
  - Best Practices ≥ 0.95
  - SEO ≥ 0.95
  - `color-contrast` & `label-content-name-mismatch` = 0

### Manual
- [ ] Semua layar diperiksa di tema **terang dan gelap**.
- [ ] Semua layar diperiksa di lebar 360px, 768px, 1024px, 1440px.
- [ ] Navigasi keyboard penuh: Tab, Shift+Tab, Enter, Escape, tanpa jebakan fokus.
- [ ] Refresh (F5) dan Back browser mempertahankan konteks.
- [ ] Ganti akun tidak menampilkan data akun sebelumnya.
- [ ] "Buka" dokumen paket menampilkan halaman A4, bukan markdown.
- [ ] Ekspor Word/PDF dari viewer berhasil untuk dokumen > 3 halaman.

---

## 8. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Perubahan token memecah tampilan lama (7 generator, repository) | Regresi visual | Perubahan token bertahap; uji semua view tiap tahap |
| `DocumentViewer` dipakai 2 alur sekaligus | State bocor / bug sulit | Prop `paketMode` eksplisit; `key` unik per dokumen |
| Routing menyentuh `App.tsx` yang besar | Konflik dengan perubahan lain | Kerjakan di branch terpisah, commit kecil |
| Dark mode "selesai" tapi ada komponen baru | Kembali tidak konsisten | Checklist dua tema di PR |
| Waktu terbatas | P0 tidak selesai | Sprint 1–2 didahulukan; P2 ditunda |

---

## 9. Di luar cakupan dokumen ini

- Autentikasi/sesi nyata, otorisasi API, database transaksional → `DOKUMENTASI.md` §10–§16.
- Validasi kualitas output AI → `DOKUMENTASI.md` Fase 3.
- Fitur baru (kisi-kisi, RME, diferensiasi, dll.) → `DOKUMENTASI.md` §18.
- Redesign total merek/aplikasi.

---

## 10. Catatan & konvensi

- Repo memiliki perubahan belum ter-commit; jangan menimpa pekerjaan yang tidak terkait.
- Setiap PR sebaiknya menyentuh **satu ID** dari backlog agar mudah ditinjau dan di-rollback.
- Lampirkan tangkapan layar sebelum/sesudah (terang + gelap) pada PR yang mengubah visual.
- Dev server berjalan di `http://localhost:3001` (mengikuti `PORT` di `.env`), bukan 3000.

---

## 11. Status pelaksanaan (per 13 Nov 2026)

| ID | Status | Bukti |
|---|---|---|
| UI-01 | ✅ Selesai (`c09180d`) | Token tunggal "Slate Core" di `src/index.css`; DaisyUI terpetakan ke token yang sama di dua tema; `--apple-*` hanya alias. Aksen kanonik: indigo (menyimpang dari rancangan amber — lihat catatan status di kepala dokumen) |
| UI-02 | ✅ Selesai (`c09180d`) | Tombol "Final" kini ghost dengan teks `--ok` (≥ 5,9:1 terang); item aktif sidebar = latar `--accent-soft` + teks `--accent-ink` (≥ 7:1 kedua tema, tercatat di komentar `Sidebar.tsx`); `aria-label` tombol profil TopHeader memuat nama pengguna |
| UI-03 | ✅ Selesai (`c09180d`) | `PaketWorkspace` membuka dokumen lewat `DocumentViewer` layar penuh (A4 + ekspor); tidak ada lagi `<pre>` markdown di alur paket |
| UI-04 | ✅ Selesai (`c09180d`) | Sapuan token semantik; tidak ada lagi `text-amber-950`/`bg-white`/`bg-[#fff8e5]` di `GeneratorForm.tsx`; jembatan `.dark .bg-white` dsb. di `index.css` untuk sisa pemakaian lama |
| UI-05 | ✅ Selesai (hash routing) | `App.tsx`: `activeTarget` <-> `#/<target>` dua arah — F5 bertahan di view yang sama, Back kembali ke view sebelumnya. Tanpa dependensi baru (opsi hash yang disarankan §5 UI-05). Substatus workspace paket (`paketAktifId`) belum masuk URL |
| UI-06 | ✅ Selesai | `Sidebar.tsx`: grup "Generator Satuan" (7 generator) + grup "Arsip" (Arsip Dokumen) ditambahkan; seluruh 15 `NavigationTarget` kini terjangkau dari sidebar/menu pengguna |
| UI-07 | ✅ Selesai (`c09180d`) | `DaftarPaket.tsx`: effect me-reset daftar dan bergantung pada `currentUser.id` |
| UI-08 | ⬜ Terbuka | Standarisasi modal (satu komponen `ui/Modal`) belum dikerjakan |
| UI-09 | 🟡 Sebagian | Toast aplikasi sudah terpusat di `App.tsx` dengan `role="status"`; toast lokal per komponen belum diaudit |
| UI-10 | ⬜ Terbuka | Peringatan externalize modul Node saat build belum ditelusuri |
| UI-11…UI-14 | ⬜ Terbuka | Penyempurnaan visual Sprint 4 |
| UI-15 | ✅ Selesai (`c09180d`) | `@media (prefers-reduced-motion: reduce)` ada di `index.css` |
| UI-16 | ✅ Selesai | `lang="id"` + meta description sudah ada di `index.html`; `public/robots.txt` ditambahkan |
