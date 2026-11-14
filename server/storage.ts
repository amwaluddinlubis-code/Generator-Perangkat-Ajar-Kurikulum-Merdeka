/**
 * Penyimpanan berkas (Fase B) — abstraksi kecil di atas disk lokal.
 *
 * Tujuan: ilustrasi/gambar tidak lagi disimpan sebagai data-URL base64 di
 * dokumen (membuat db.json membengkak). Berkas ditulis ke folder uploads
 * dengan nama acak (UUID), lalu dokumen hanya menyimpan URL pendek.
 *
 * Antarmuka sengaja sempit agar mudah diganti ke S3/R2: simpanBuffer /
 * simpanDataUrl / hapusUrl. Kalau nanti pindah ke object storage, cukup
 * implementasi modul ini tanpa mengubah route.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const MAKS_BERKAS_BYTES = 6 * 1024 * 1024; // 6 MB per gambar

const MIME_KE_EKSTENSI: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const EKSTENSI_KE_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

export interface OpsiStorage {
  folder: string;
  /** Prefix URL publik, default `/uploads`. */
  prefixUrl?: string;
  maxBytes?: number;
}

export interface BerkasTersimpan {
  url: string;
  bytes: number;
  mime: string;
}

export interface PenyimpananBerkas {
  folder: string;
  prefixUrl: string;
  simpanBuffer(buffer: Buffer, mimeDeklarasi?: string): BerkasTersimpan;
  /** null bila string bukan data-URL gambar yang didukung. */
  simpanDataUrl(dataUrl: string): BerkasTersimpan | null;
  pathDariUrl(url: string): string | null;
  hapusUrl(url: string): boolean;
}

/** Deteksi tipe gambar dari magic bytes — jangan percaya MIME dari klien. */
export function deteksiMimeGambar(buffer: Buffer): string | null {
  if (buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  if (buffer.length >= 6 && buffer.toString('ascii', 0, 3) === 'GIF') {
    return 'image/gif';
  }
  return null;
}

export function buatStorage(opsi: OpsiStorage): PenyimpananBerkas {
  const folder = path.resolve(opsi.folder);
  const prefixUrl = (opsi.prefixUrl || '/uploads').replace(/\/+$/, '');
  const maxBytes = opsi.maxBytes || MAKS_BERKAS_BYTES;
  fs.mkdirSync(folder, { recursive: true });

  function simpanBuffer(buffer: Buffer, mimeDeklarasi?: string): BerkasTersimpan {
    if (!buffer || buffer.length === 0) {
      throw new Error('Berkas gambar kosong.');
    }
    if (buffer.length > maxBytes) {
      throw new Error(`Ukuran gambar melebihi batas ${Math.round(maxBytes / (1024 * 1024))} MB.`);
    }
    const mime = deteksiMimeGambar(buffer);
    if (!mime) {
      throw new Error('Format gambar tidak didukung (hanya PNG, JPEG, WebP, atau GIF).');
    }
    const deklarasi = (mimeDeklarasi || '').toLowerCase().replace('image/jpg', 'image/jpeg');
    if (deklarasi && deklarasi !== mime) {
      throw new Error('Isi berkas tidak sesuai dengan tipe gambar yang dinyatakan.');
    }

    const id = crypto.randomUUID().replace(/-/g, '');
    const shard = id.slice(0, 2);
    const namaFile = `${id}.${MIME_KE_EKSTENSI[mime]}`;
    const dir = path.join(folder, shard);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, namaFile), buffer, { flag: 'wx' });

    return { url: `${prefixUrl}/${shard}/${namaFile}`, bytes: buffer.length, mime };
  }

  function simpanDataUrl(dataUrl: string): BerkasTersimpan | null {
    const cocok = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i.exec((dataUrl || '').trim());
    if (!cocok) return null;
    // Perkiraan ukuran sebelum decode agar tidak alokasi buffer raksasa.
    const perkiraan = Math.floor((cocok[2].length * 3) / 4);
    if (perkiraan > maxBytes + 1024) {
      throw new Error(`Ukuran gambar melebihi batas ${Math.round(maxBytes / (1024 * 1024))} MB.`);
    }
    return simpanBuffer(Buffer.from(cocok[2], 'base64'), cocok[1]);
  }

  function pathDariUrl(url: string): string | null {
    if (typeof url !== 'string' || !url.startsWith(`${prefixUrl}/`)) return null;
    const relatif = url.slice(prefixUrl.length + 1).split('?')[0].split('#')[0];
    if (!relatif) return null;
    const absolut = path.resolve(folder, relatif);
    const cek = path.relative(folder, absolut);
    if (!cek || cek.startsWith('..') || path.isAbsolute(cek)) return null;
    return absolut;
  }

  function hapusUrl(url: string): boolean {
    const target = pathDariUrl(url);
    if (!target) return false;
    try {
      fs.unlinkSync(target);
      return true;
    } catch {
      return false;
    }
  }

  return { folder, prefixUrl, simpanBuffer, simpanDataUrl, pathDariUrl, hapusUrl };
}

/** MIME berdasarkan ekstensi file upload (untuk header respons statis). */
export function mimeDariEkstensi(file: string): string {
  const ext = path.extname(file).replace('.', '').toLowerCase();
  return EKSTENSI_KE_MIME[ext] || 'application/octet-stream';
}

export interface HasilGantiGambar {
  teks: string;
  diganti: number;
  gagal: number;
}

/**
 * Ganti gambar base64 di dalam markdown/HTML dokumen menjadi URL penyimpanan.
 * Dipakai saat menyimpan dokumen dan saat migrasi konten lama.
 */
export function gantiGambarDataUrl(teks: string, storage: PenyimpananBerkas, cache?: Map<string, string>): HasilGantiGambar {
  if (typeof teks !== 'string' || !teks.includes('data:image/')) {
    return { teks, diganti: 0, gagal: 0 };
  }
  let diganti = 0;
  let gagal = 0;

  const gantiDengan = (dataUrl: string): string | null => {
    // cache mencegah berkas yang sama ditulis berkali-kali (mis. konten dokumen
    // dan versi dokumen memuat gambar identik setelah migrasi).
    const tersimpan = cache?.get(dataUrl);
    if (tersimpan) {
      diganti++;
      return tersimpan;
    }
    try {
      const hasil = storage.simpanDataUrl(dataUrl);
      if (!hasil) {
        gagal++;
        return null;
      }
      cache?.set(dataUrl, hasil.url);
      diganti++;
      return hasil.url;
    } catch (err) {
      gagal++;
      console.warn('[Storage] Gagal memindahkan gambar data-URL:', (err as Error).message);
      return null;
    }
  };

  // Markdown: ![alt](data:image/...)
  let hasilTeks = teks.replace(
    /(!\[[^\]]*\]\()(data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+)(\))/gi,
    (utuh, depan: string, dataUrl: string, belakang: string) => {
      const url = gantiDengan(dataUrl);
      return url ? `${depan}${url}${belakang}` : utuh;
    }
  );

  // HTML: <img src="data:image/..."> (konten lama/editor tertentu)
  hasilTeks = hasilTeks.replace(
    /(<img\b[^>]*?\bsrc=["'])(data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+)(["'])/gi,
    (utuh, depan: string, dataUrl: string, belakang: string) => {
      const url = gantiDengan(dataUrl);
      return url ? `${depan}${url}${belakang}` : utuh;
    }
  );

  return { teks: hasilTeks, diganti, gagal };
}
