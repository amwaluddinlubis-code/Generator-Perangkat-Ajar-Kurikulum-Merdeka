/**
 * Lapisan persistensi SQLite (node:sqlite, tanpa dependency tambahan).
 *
 * Fase B: data tidak lagi ditulis ulang sebagai satu file JSON besar. Setiap
 * koleksi punya tabel sendiri dengan kolom skalar + `extra_json` (jaring aman
 * agar field baru dari versi lama/beta tidak hilang saat migrasi). Seluruh
 * penyimpanan dilakukan dalam SATU transaksi, jadi crash di tengah tulis tidak
 * meninggalkan data setengah jadi.
 *
 * Catatan: node:sqlite masih berstatus eksperimental di Node 24 — API yang
 * dipakai sengaja dibatasi ke DatabaseSync/exec/prepare.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const VERSI_SKEMA = 1;

export interface PenggunaTersimpan {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  npsn?: string;
  nip?: string;
  jenjang: string;
  mataPelajaran: string;
  role: string;
  status: string;
  avatarUrl?: string;
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  passwordHash?: string;
}

export interface DokumenTersimpan {
  id: string;
  title: string;
  docType: string;
  jenjang: string;
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
  paketId?: string;
}

export interface PaketTersimpan {
  id: string;
  topik: string;
  mataPelajaran: string;
  jenjang: string;
  fase: string;
  tingkat: string;
  pemilikId: string;
  sekolahId?: string;
  status: string;
  dibuatPada: string;
  dibukaTerakhir: string;
  publikasiSekolah?: boolean;
}

export interface DokumenPaketTersimpan {
  id: string;
  paketId: string;
  docType: string;
  status: string;
  versiAktif: number;
  diperbaruiPada: string;
}

export interface VersiDokumenTersimpan {
  id: string;
  dokumenPaketId: string;
  nomorVersi: number;
  content: string;
  title: string;
  dibuatPada: string;
  dibuatOleh: string;
}

export interface SlideTersimpan {
  id: string;
  paketId: string;
  modulAjarDokumenId: string;
  slides: unknown[];
  dibuatPada: string;
  dibuatOleh: string;
}

export interface UlasanTersimpan {
  id: string;
  paketId: string;
  paketTopik?: string;
  namaPemberi: string;
  userId: string;
  tipe: string;
  isi: string;
  waktu: string;
}

export interface SesiTersimpan {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DataTersimpan {
  users: PenggunaTersimpan[];
  documents: DokumenTersimpan[];
  pakets: PaketTersimpan[];
  dokumenPaket: DokumenPaketTersimpan[];
  versiDokumen: VersiDokumenTersimpan[];
  slidePaket: SlideTersimpan[];
  ulasanPaket: UlasanTersimpan[];
  sessions: SesiTersimpan[];
}

export interface OpsiDatabase {
  /** Lokasi file SQLite (dibuat otomatis bila belum ada). */
  file: string;
  log?: (pesan: string) => void;
}

export interface DatabaseRGM {
  file: string;
  /** null bila basis data masih kosong (server memakai data seed di memori). */
  load(): DataTersimpan | null;
  /** Tulis seluruh koleksi secara atomik dalam satu transaksi. */
  save(data: DataTersimpan): void;
  close(): void;
}

// ---------------------------------------------------------------------------
// Definisi tabel
// ---------------------------------------------------------------------------

type TipeKolom = 'teks' | 'angka' | 'boolean' | 'json';

interface KolomTabel {
  kolom: string;
  prop: string;
  tipe?: TipeKolom;
}

interface DefinisiTabel {
  nama: string;
  /** Nama koleksi pada snapshot (tidak selalu sama dengan nama tabel SQL). */
  kunciData: keyof DataTersimpan;
  kunciKolom: string;
  kunciProp: string;
  kolom: KolomTabel[];
  ambil: (data: DataTersimpan) => unknown[];
}

const k = (kolom: string, prop: string, tipe: TipeKolom = 'teks'): KolomTabel => ({ kolom, prop, tipe });

const TABEL: DefinisiTabel[] = [
  {
    nama: 'users',
    kunciData: 'users',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.users,
    kolom: [
      k('id', 'id'), k('name', 'name'), k('email', 'email'), k('school_name', 'schoolName'),
      k('npsn', 'npsn'), k('nip', 'nip'), k('jenjang', 'jenjang'), k('mata_pelajaran', 'mataPelajaran'),
      k('role', 'role'), k('status', 'status'), k('avatar_url', 'avatarUrl'),
      k('registered_at', 'registeredAt'), k('verified_at', 'verifiedAt'),
      k('verified_by', 'verifiedBy'), k('password_hash', 'passwordHash'),
    ],
  },
  {
    nama: 'documents',
    kunciData: 'documents',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.documents,
    kolom: [
      k('id', 'id'), k('title', 'title'), k('doc_type', 'docType'), k('jenjang', 'jenjang'),
      k('tingkat', 'tingkat'), k('fase', 'fase'), k('mata_pelajaran', 'mataPelajaran'),
      k('topik', 'topik'), k('content', 'content'), k('created_at', 'createdAt'),
      k('author_id', 'authorId'), k('author_name', 'authorName'), k('school_name', 'schoolName'),
      k('is_public', 'isPublic', 'boolean'), k('duration_minutes', 'durationMinutes', 'angka'),
      k('paket_id', 'paketId'),
    ],
  },
  {
    nama: 'pakets',
    kunciData: 'pakets',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.pakets,
    kolom: [
      k('id', 'id'), k('topik', 'topik'), k('mata_pelajaran', 'mataPelajaran'),
      k('jenjang', 'jenjang'), k('fase', 'fase'), k('tingkat', 'tingkat'),
      k('pemilik_id', 'pemilikId'), k('sekolah_id', 'sekolahId'), k('status', 'status'),
      k('dibuat_pada', 'dibuatPada'), k('dibuka_terakhir', 'dibukaTerakhir'),
      k('publikasi_sekolah', 'publikasiSekolah', 'boolean'),
    ],
  },
  {
    nama: 'dokumen_paket',
    kunciData: 'dokumenPaket',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.dokumenPaket,
    kolom: [
      k('id', 'id'), k('paket_id', 'paketId'), k('doc_type', 'docType'), k('status', 'status'),
      k('versi_aktif', 'versiAktif', 'angka'), k('diperbarui_pada', 'diperbaruiPada'),
    ],
  },
  {
    nama: 'versi_dokumen',
    kunciData: 'versiDokumen',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.versiDokumen,
    kolom: [
      k('id', 'id'), k('dokumen_paket_id', 'dokumenPaketId'),
      k('nomor_versi', 'nomorVersi', 'angka'), k('content', 'content'), k('title', 'title'),
      k('dibuat_pada', 'dibuatPada'), k('dibuat_oleh', 'dibuatOleh'),
    ],
  },
  {
    nama: 'slide_paket',
    kunciData: 'slidePaket',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.slidePaket,
    kolom: [
      k('id', 'id'), k('paket_id', 'paketId'), k('modul_ajar_dokumen_id', 'modulAjarDokumenId'),
      k('slides_json', 'slides', 'json'), k('dibuat_pada', 'dibuatPada'), k('dibuat_oleh', 'dibuatOleh'),
    ],
  },
  {
    nama: 'ulasan_paket',
    kunciData: 'ulasanPaket',
    kunciKolom: 'id',
    kunciProp: 'id',
    ambil: d => d.ulasanPaket,
    kolom: [
      k('id', 'id'), k('paket_id', 'paketId'), k('paket_topik', 'paketTopik'),
      k('nama_pemberi', 'namaPemberi'), k('user_id', 'userId'), k('tipe', 'tipe'),
      k('isi', 'isi'), k('waktu', 'waktu'),
    ],
  },
  {
    nama: 'sessions',
    kunciData: 'sessions',
    kunciKolom: 'token',
    kunciProp: 'token',
    ambil: d => d.sessions,
    kolom: [
      k('token', 'token'), k('user_id', 'userId'), k('created_at', 'createdAt'),
      k('expires_at', 'expiresAt'),
    ],
  },
];

// DDL ditulis manual (bukan digenerate) agar mudah dibaca & di-review.
const DDL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school_name TEXT NOT NULL,
  npsn TEXT,
  nip TEXT,
  jenjang TEXT NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  avatar_url TEXT,
  registered_at TEXT NOT NULL,
  verified_at TEXT,
  verified_by TEXT,
  password_hash TEXT,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  jenjang TEXT NOT NULL,
  tingkat TEXT NOT NULL,
  fase TEXT NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  topik TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  is_public INTEGER,
  duration_minutes REAL,
  paket_id TEXT,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_doctype ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_paket ON documents(paket_id);

CREATE TABLE IF NOT EXISTS pakets (
  id TEXT PRIMARY KEY,
  topik TEXT NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  jenjang TEXT NOT NULL,
  fase TEXT NOT NULL,
  tingkat TEXT NOT NULL,
  pemilik_id TEXT NOT NULL,
  sekolah_id TEXT,
  status TEXT NOT NULL,
  dibuat_pada TEXT NOT NULL,
  dibuka_terakhir TEXT NOT NULL,
  publikasi_sekolah INTEGER,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_pakets_pemilik ON pakets(pemilik_id);
CREATE INDEX IF NOT EXISTS idx_pakets_status ON pakets(status);

CREATE TABLE IF NOT EXISTS dokumen_paket (
  id TEXT PRIMARY KEY,
  paket_id TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  status TEXT NOT NULL,
  versi_aktif INTEGER NOT NULL,
  diperbarui_pada TEXT NOT NULL,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_dokumen_paket_paket ON dokumen_paket(paket_id);

CREATE TABLE IF NOT EXISTS versi_dokumen (
  id TEXT PRIMARY KEY,
  dokumen_paket_id TEXT NOT NULL,
  nomor_versi INTEGER NOT NULL,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  dibuat_pada TEXT NOT NULL,
  dibuat_oleh TEXT NOT NULL,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_versi_dokumen_paket ON versi_dokumen(dokumen_paket_id);

CREATE TABLE IF NOT EXISTS slide_paket (
  id TEXT PRIMARY KEY,
  paket_id TEXT NOT NULL,
  modul_ajar_dokumen_id TEXT NOT NULL,
  slides_json TEXT NOT NULL,
  dibuat_pada TEXT NOT NULL,
  dibuat_oleh TEXT NOT NULL,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_slide_paket ON slide_paket(paket_id);

CREATE TABLE IF NOT EXISTS ulasan_paket (
  id TEXT PRIMARY KEY,
  paket_id TEXT NOT NULL,
  paket_topik TEXT,
  nama_pemberi TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tipe TEXT NOT NULL,
  isi TEXT NOT NULL,
  waktu TEXT NOT NULL,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_ulasan_paket ON ulasan_paket(paket_id);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  extra_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`;

function dataArray<T>(nilai: unknown): T[] {
  return Array.isArray(nilai) ? (nilai as T[]) : [];
}

const STATUS_SAH = new Set(['PENDING', 'VERIFIED', 'REJECTED']);

/** Normalisasi data mentah (hasil parse JSON lama) ke bentuk snapshot. */
export function normalisasiData(raw: unknown): DataTersimpan {
  const r = (raw || {}) as Record<string, unknown>;
  const users = dataArray<PenggunaTersimpan>(r.users).map(u => ({
    ...u,
    status: STATUS_SAH.has(String(u.status)) ? u.status : 'PENDING',
  }));
  return {
    users,
    documents: dataArray(r.documents),
    pakets: dataArray(r.pakets),
    dokumenPaket: dataArray(r.dokumenPaket),
    versiDokumen: dataArray(r.versiDokumen),
    slidePaket: dataArray(r.slidePaket),
    ulasanPaket: dataArray(r.ulasanPaket),
    sessions: dataArray(r.sessions),
  };
}

/** Baca data/db.json lama untuk migrasi satu-kali ke SQLite. */
export function imporJsonDariFile(file: string): DataTersimpan {
  return normalisasiData(JSON.parse(fs.readFileSync(file, 'utf-8')));
}

function keNilai(kolom: KolomTabel, baris: Record<string, unknown>): unknown {
  const nilai = baris[kolom.prop];
  if (nilai === undefined || nilai === null) return null;
  if (kolom.tipe === 'boolean') return nilai ? 1 : 0;
  if (kolom.tipe === 'json') return JSON.stringify(nilai);
  if (kolom.tipe === 'angka') {
    const n = Number(nilai);
    return Number.isFinite(n) ? n : null;
  }
  return nilai;
}

function dariBaris(kolom: KolomTabel, nilai: unknown, ekstra: Record<string, unknown>): unknown {
  if (nilai === null || nilai === undefined) return ekstra[kolom.prop];
  if (kolom.tipe === 'boolean') return !!nilai;
  if (kolom.tipe === 'angka') return Number(nilai);
  if (kolom.tipe === 'json') {
    try {
      return JSON.parse(String(nilai));
    } catch {
      return ekstra[kolom.prop];
    }
  }
  return nilai;
}

function ekstraDariJson(json: unknown): Record<string, unknown> {
  if (typeof json !== 'string' || !json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function bukaDatabase(opsi: OpsiDatabase): DatabaseRGM {
  const catat = opsi.log || ((pesan: string) => console.log(pesan));
  const file = path.resolve(opsi.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  // WAL: baca & tulis tidak saling mengunci; tetap satu penulis (SQLite).
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec(DDL);

  const versiLama = Number(
    (db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value?: string } | undefined)?.value || 0
  );
  if (versiLama > VERSI_SKEMA) {
    db.close();
    throw new Error(
      `Basis data dibuat dengan skema v${versiLama}, sedangkan server ini mendukung v${VERSI_SKEMA}. Perbarui aplikasi.`
    );
  }
  db.prepare(
    "INSERT INTO meta(key, value) VALUES('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(String(VERSI_SKEMA));

  // Siapkan statement sekali agar save() hanya bind + run.
  const operasi = TABEL.map(t => {
    const namaKolom = t.kolom.map(c => c.kolom);
    const daftarKolom = namaKolom.join(', ');
    const placeholder = namaKolom.map(() => '?').join(', ');
    const update = namaKolom
      .filter(c => c !== t.kunciKolom)
      .map(c => `${c} = excluded.${c}`)
      .join(', ');
    return {
      definisi: t,
      kolomSah: new Set(t.kolom.map(c => c.prop)),
      upsert: db.prepare(
        `INSERT INTO ${t.nama} (${daftarKolom}, extra_json) VALUES (${placeholder}, ?) ` +
          `ON CONFLICT(${t.kunciKolom}) DO UPDATE SET ${update}, extra_json = excluded.extra_json`
      ),
      hapus: db.prepare(
        `DELETE FROM ${t.nama} WHERE ${t.kunciKolom} NOT IN (SELECT value FROM json_each(?))`
      ),
      hitung: db.prepare(`SELECT COUNT(*) AS jumlah FROM ${t.nama}`),
      baca: db.prepare(`SELECT * FROM ${t.nama}`),
    };
  });

  function load(): DataTersimpan | null {
    const total = operasi.reduce(
      (n, o) => n + Number((o.hitung.get() as { jumlah?: number }).jumlah || 0),
      0
    );
    if (total === 0) return null;

    const hasil = {} as Record<string, unknown[]>;
    for (const o of operasi) {
      const t = o.definisi;
      const baris = o.baca.all() as Record<string, unknown>[];
      hasil[t.kunciData as string] = baris.map(b => {
        const ekstra = ekstraDariJson(b.extra_json);
        const objek: Record<string, unknown> = {};
        for (const kolom of t.kolom) {
          objek[kolom.prop] = dariBaris(kolom, b[kolom.kolom], ekstra);
        }
        for (const [prop, nilai] of Object.entries(ekstra)) {
          if (!o.kolomSah.has(prop)) objek[prop] = nilai;
        }
        return objek;
      });
    }

    return {
      users: hasil.users as PenggunaTersimpan[],
      documents: hasil.documents as DokumenTersimpan[],
      pakets: hasil.pakets as PaketTersimpan[],
      dokumenPaket: hasil.dokumenPaket as DokumenPaketTersimpan[],
      versiDokumen: hasil.versiDokumen as VersiDokumenTersimpan[],
      slidePaket: hasil.slidePaket as SlideTersimpan[],
      ulasanPaket: hasil.ulasanPaket as UlasanTersimpan[],
      sessions: hasil.sessions as SesiTersimpan[],
    };
  }

  function save(data: DataTersimpan): void {
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const o of operasi) {
        const t = o.definisi;
        const baris = Array.isArray(t.ambil(data)) ? (t.ambil(data) as Record<string, unknown>[]) : [];
        const kunci: string[] = [];
        for (const b of baris) {
          const nilaiKunci = b[t.kunciProp];
          if (typeof nilaiKunci !== 'string' || !nilaiKunci) {
            throw new Error(`Baris ${t.nama} tanpa ${t.kunciProp} tidak dapat disimpan.`);
          }
          kunci.push(nilaiKunci);
          const ekstra: Record<string, unknown> = {};
          for (const [prop, nilai] of Object.entries(b)) {
            if (prop !== t.kunciProp && !o.kolomSah.has(prop)) ekstra[prop] = nilai;
          }
          const nilai = t.kolom.map(c => keNilai(c, b));
          nilai.push(Object.keys(ekstra).length > 0 ? JSON.stringify(ekstra) : null);
          o.upsert.run(...(nilai as never[]));
        }
        o.hapus.run(JSON.stringify(kunci));
      }
      db.exec('COMMIT');
    } catch (err) {
      try {
        db.exec('ROLLBACK');
      } catch {
        // transaksi mungkin sudah dibatalkan SQLite
      }
      throw err;
    }
  }

  function close(): void {
    try {
      db.close();
    } catch {
      // sudah tertutup
    }
  }

  catat(`[DB] SQLite siap: ${file}`);
  return { file, load, save, close };
}
