# Panduan Deploy — Ruang Guru Merdeka

Panduan ini membawa aplikasi dari laptop ke internet supaya bisa dibuka dari HP.
Pilih **satu** cara di bawah. Yang paling mudah untuk guru: **Cara A (Render)**.

## Persiapan (semua cara)

1. Pastikan kode terbaru sudah di-push ke GitHub.
2. Siapkan **Gemini API key** (gratis): buka https://aistudio.google.com →
   **Get API key** → salin kuncinya.
3. Catat akun demo bila perlu (lihat `DOKUMENTASI.md` §7).

---

## Cara A — Render.com (gratis, paling mudah) ⭐

1. Daftar/login di https://render.com (bisa pakai akun GitHub).
2. Klik **New + → Blueprint**, pilih repo
   `amwaluddinlubis-code/Generator-Perangkat-Ajar-Kurikulum-Merdeka`.
3. Render otomatis membaca `render.yaml`. Pada kolom **Environment**,
   isi `GEMINI_API_KEY` dengan kunci dari persiapan langkah 2
   (centang sebagai *Secret*).
4. Klik **Apply**. Tunggu ±5 menit hingga status **Live**.
5. Buka URL yang diberikan (mis. `https://ruang-guru-merdeka.onrender.com`).

Catatan paket gratis:
- Server "tidur" setelah 15 menit tidak dipakai; kunjungan pertama
  butuh ±30–60 detik untuk bangun. Ini normal di paket gratis.
- Data tersimpan di disk 1 GB (tidak hilang saat restart).

## Cara B — Railway.app (gratis trial, lebih cepat)

1. Login di https://railway.app dengan akun GitHub.
2. **New Project → Deploy from GitHub repo** → pilih repo ini.
3. Railway otomatis build via `Dockerfile`. Tambahkan variable:
   `GEMINI_API_KEY` = kunci Anda, `NODE_ENV` = `production`.
4. Tambahkan **Volume** di-mount ke `/app/data` agar `db.json` awet.
5. Klik **Generate Domain** untuk mendapatkan URL publik.

## Cara C — VPS sendiri (Docker)

```bash
# di server (Ubuntu)
git clone https://github.com/amwaluddinlubis-code/Generator-Perangkat-Ajar-Kurikulum-Merdeka
cd Generator-Perangkat-Ajar-Kurikulum-Merdeka
cp .env.example .env   # lalu isi GEMINI_API_KEY di .env
docker build -t rgm .
docker run -d --restart unless-stopped -p 3000:3000 \
  --env-file .env -v rgm-data:/app/data --name rgm rgm
```

## Cek kesehatan

Setelah deploy, buka `https://<domain-anda>/api/health`.
Harus tampil: `{"success":true,"status":"ok",...}`.

## Checklist setelah live

- [ ] `/api/health` OK
- [ ] Login akun demo berhasil
- [ ] Generate 1 Modul Ajar → badge tampil "AI Gemini" (bukan "Template cadangan")
- [ ] Ekspor .docx terunduh dan terbuka di Word/WPS
- [ ] Ganti password akun demo (lihat `DOKUMENTASI.md` §7)

## Keamanan

Jangan pernah menaruh `GEMINI_API_KEY` langsung di kode atau commit.
Selalu isi lewat *Environment Variable / Secret* di dashboard platform.
