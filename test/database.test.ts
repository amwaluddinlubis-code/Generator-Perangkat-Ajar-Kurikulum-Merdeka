/**
 * Test Fase B: persistensi SQLite transaksional + penyimpanan berkas.
 * Dijalankan via: npx tsx test/database.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  bukaDatabase,
  imporJsonDariFile,
  normalisasiData,
  type DataTersimpan,
} from '../server/db.ts';
import {
  buatStorage,
  deteksiMimeGambar,
  gantiGambarDataUrl,
  mimeDariEkstensi,
} from '../server/storage.ts';

let passed = 0, failed = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${extra}`); }
}

const akar = fs.mkdtempSync(path.join(os.tmpdir(), 'rgm-fase-b-'));
const folderDb = path.join(akar, 'db');
const folderUpload = path.join(akar, 'uploads');

// PNG 1x1 transparan (magic bytes valid untuk deteksi MIME).
const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const DATA_URL = `data:image/png;base64,${PNG_1X1}`;

function snapshotContoh(): DataTersimpan {
  return {
    users: [{
      id: 'user-1', name: 'Guru Satu', email: 'guru1@sekolah.id', schoolName: 'SMPN 1',
      jenjang: 'SMP', mataPelajaran: 'Informatika', role: 'GURU', status: 'VERIFIED',
      registeredAt: '2026-01-01T00:00:00.000Z', passwordHash: 'scrypt$abc',
    }],
    documents: [{
      id: 'doc-1', title: 'Modul Ajar', docType: 'modul_ajar', jenjang: 'SMP',
      tingkat: 'Kelas 7', fase: 'Fase D', mataPelajaran: 'Informatika', topik: 'Algoritma',
      content: '# Judul\n\nIsi dokumen', createdAt: '2026-01-02T00:00:00.000Z',
      authorId: 'user-1', authorName: 'Guru Satu', schoolName: 'SMPN 1',
      isPublic: true, durationMinutes: 2.5, paketId: 'paket-1',
    }],
    pakets: [{
      id: 'paket-1', topik: 'Algoritma', mataPelajaran: 'Informatika', jenjang: 'SMP',
      fase: 'Fase D', tingkat: 'Kelas 7', pemilikId: 'user-1', status: 'aktif',
      dibuatPada: '2026-01-02T00:00:00.000Z', dibukaTerakhir: '2026-01-03T00:00:00.000Z',
      publikasiSekolah: false,
    }],
    dokumenPaket: [{
      id: 'dp-1', paketId: 'paket-1', docType: 'modul_ajar', status: 'final',
      versiAktif: 2, diperbaruiPada: '2026-01-03T00:00:00.000Z',
    }],
    versiDokumen: [{
      id: 'versi-2', dokumenPaketId: 'dp-1', nomorVersi: 2, content: 'isi v2',
      title: 'v2', dibuatPada: '2026-01-03T00:00:00.000Z', dibuatOleh: 'Guru Satu',
    }],
    slidePaket: [{
      id: 'slide-1', paketId: 'paket-1', modulAjarDokumenId: 'dp-1',
      slides: [{ judul: 'Slide 1', poin: ['a', 'b'] }],
      dibuatPada: '2026-01-03T00:00:00.000Z', dibuatOleh: 'Guru Satu',
    }],
    ulasanPaket: [{
      id: 'ulasan-1', paketId: 'paket-1', paketTopik: 'Algoritma', namaPemberi: 'Rekan',
      userId: 'user-2', tipe: 'saran', isi: 'Bagus', waktu: '2026-01-04T00:00:00.000Z',
    }],
    sessions: [{
      token: 'tok-1', userId: 'user-1',
      createdAt: '2026-01-04T00:00:00.000Z', expiresAt: '2026-01-11T00:00:00.000Z',
    }],
  };
}

console.log('Fase B — SQLite & penyimpanan berkas\n');

// 1. Roundtrip SQLite: tipe skalar, boolean, angka, dan field ekstra.
{
  const db = bukaDatabase({ file: path.join(folderDb, 'roundtrip.sqlite'), log: () => {} });
  check('basis data kosong -> load() null', db.load() === null);

  const data = snapshotContoh();
  // Field tak dikenal harus selamat lewat extra_json.
  (data.users[0] as unknown as Record<string, unknown>).catatanBaru = { sumber: 'beta' };
  db.save(data);

  const hasil = db.load();
  check('load() mengembalikan snapshot', !!hasil);
  check('users roundtrip', hasil?.users.length === 1 && hasil.users[0].email === 'guru1@sekolah.id');
  check('field ekstra tetap ada (extra_json)',
    JSON.stringify((hasil?.users[0] as unknown as Record<string, unknown>)?.catatanBaru) === JSON.stringify({ sumber: 'beta' }));
  check('boolean roundtrip', hasil?.documents[0].isPublic === true);
  check('angka roundtrip', hasil?.documents[0].durationMinutes === 2.5);
  check('json (slides) roundtrip',
    Array.isArray(hasil?.slidePaket[0].slides) && (hasil?.slidePaket[0].slides as any)[0].judul === 'Slide 1');
  check('sesi roundtrip', hasil?.sessions.length === 1 && hasil.sessions[0].token === 'tok-1');
  check('versi roundtrip', hasil?.versiDokumen[0].nomorVersi === 2);

  // 2. Save berikutnya menghapus baris yang tidak ada lagi di snapshot.
  const dikurangi = snapshotContoh();
  dikurangi.ulasanPaket = [];
  dikurangi.sessions = [];
  db.save(dikurangi);
  const setelahHapus = db.load();
  check('baris yang dihapus dari snapshot hilang dari tabel', setelahHapus?.ulasanPaket.length === 0);
  check('sesi ikut terhapus', setelahHapus?.sessions.length === 0);
  check('baris lain tetap ada', setelahHapus?.users.length === 1 && setelahHapus.documents.length === 1);

  db.close();
}

// 3. Migrasi dari db.json lama + normalisasi status.
{
  const fileJson = path.join(folderDb, 'db.json');
  fs.writeFileSync(fileJson, JSON.stringify({
    users: [{ id: 'u-lama', name: 'Lama', email: 'lama@sekolah.id', schoolName: 'SDN 1', jenjang: 'SD', mataPelajaran: 'Guru Kelas', role: 'GURU', status: 'STATUS_ASING', registeredAt: '2026-01-01T00:00:00.000Z' }],
    documents: [],
    sessions: 'bukan-array',
  }));

  const impor = imporJsonDariFile(fileJson);
  check('impor JSON membaca users', impor.users.length === 1);
  check('impor JSON menormalkan koleksi rusak menjadi array kosong', Array.isArray(impor.sessions) && impor.sessions.length === 0);

  const normal = normalisasiData({ users: [{ id: 'x', status: 'STATUS_ASING' }] });
  check('status tak dikenal -> PENDING', normal.users[0].status === 'PENDING');

  const db = bukaDatabase({ file: path.join(folderDb, 'migrasi.sqlite'), log: () => {} });
  db.save(impor);
  const hasil = db.load();
  check('data hasil migrasi tersimpan di SQLite', hasil?.users.length === 1 && hasil.users[0].id === 'u-lama');
  db.close();
}

// 4. Penyimpanan berkas: tulis, URL, traversal, hapus.
const storage = buatStorage({ folder: folderUpload });
{
  const tersimpan = storage.simpanBuffer(Buffer.from(PNG_1X1, 'base64'), 'image/png');
  check('URL publik berbentuk /uploads/<shard>/<uuid>.png',
    /^\/uploads\/[0-9a-f]{2}\/[0-9a-f]{32}\.png$/.test(tersimpan.url), tersimpan.url);
  check('berkas benar-benar ditulis ke disk', fs.existsSync(storage.pathDariUrl(tersimpan.url) || ''));
  check('mime terdeteksi dari magic bytes', tersimpan.mime === 'image/png');
  check('mime dari ekstensi', mimeDariEkstensi('x.png') === 'image/png' && mimeDariEkstensi('x.bin') === 'application/octet-stream');
  check('deteksi magic bytes menolak teks biasa', deteksiMimeGambar(Buffer.from('halo dunia')) === null);

  const dariDataUrl = storage.simpanDataUrl(DATA_URL);
  check('simpanDataUrl menulis berkas', !!dariDataUrl && fs.existsSync(storage.pathDariUrl(dariDataUrl.url) || ''));
  check('simpanDataUrl menolak non-gambar', storage.simpanDataUrl('data:text/plain;base64,aGFsbw==') === null);

  check('path traversal ditolak', storage.pathDariUrl('/uploads/../../rahasia.txt') === null);
  check('URL luar ditolak', storage.pathDariUrl('https://contoh.id/uploads/a.png') === null);
  check('hapusUrl menghapus berkas', storage.hapusUrl(tersimpan.url) && !fs.existsSync(storage.pathDariUrl(tersimpan.url) || ''));
  check('hapusUrl URL luar -> false', storage.hapusUrl('/etc/passwd') === false);
}

// 5. Ganti gambar data-URL di markdown & HTML, dengan cache anti-duplikat.
{
  const markdown = `Teks\n\n![ilustrasi](${DATA_URL})\n\n<img src="${DATA_URL}" alt="x">`;
  const cache = new Map<string, string>();
  const hasil = gantiGambarDataUrl(markdown, storage, cache);
  check('dua gambar diganti', hasil.diganti === 2 && hasil.gagal === 0, JSON.stringify(hasil));
  check('markdown memakai URL /uploads', /!\[ilustrasi\]\(\/uploads\/[0-9a-f]{2}\/[0-9a-f]+\.png\)/.test(hasil.teks));
  check('HTML img memakai URL /uploads', /<img src="\/uploads\/[0-9a-f]{2}\/[0-9a-f]+\.png"/.test(hasil.teks));
  check('tidak ada data:image tersisa', !hasil.teks.includes('data:image/'));
  check('cache menghasilkan satu berkas untuk gambar identik', cache.size === 1);

  const ulang = gantiGambarDataUrl(hasil.teks, storage);
  check('idempoten: konten yang sudah dimigrasi tidak berubah', ulang.diganti === 0 && ulang.teks === hasil.teks);
}

// Bersihkan artefak uji.
fs.rmSync(akar, { recursive: true, force: true });

console.log(`\n${passed} lulus, ${failed} gagal`);
if (failed > 0) process.exit(1);
