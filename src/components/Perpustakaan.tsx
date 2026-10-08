// GEL2: Perpustakaan — Worker D. Bank perangkat sekolah: daftar paket yang
// dipublikasikan guru lain, lengkap dengan aksi "Duplikat ke Paket Saya".
import React, { useEffect, useState } from 'react';
import { Library, Copy, FileText, UserRound, RefreshCw } from 'lucide-react';
import { TeacherUser } from '../types';
import { apiFetch } from '../utils/api';

// GEL2: mengikuti kontrak API GET /api/perpustakaan (Worker C).
interface PaketPublik {
  id: string;
  topik: string;
  mataPelajaran: string;
  jenjang: string;
  tingkat: string;
  pemilikNama: string;
  jumlahDokumen: number;
  diperbaruiPada: string;
}

interface PerpustakaanProps {
  currentUser: TeacherUser;
  onBukaPaket?: (paketId: string) => void;
  notify?: (msg: string, kind: 'success' | 'error' | 'info') => void;
}

export const Perpustakaan: React.FC<PerpustakaanProps> = ({
  currentUser: _currentUser,
  onBukaPaket,
  notify,
}) => {
  const [pakets, setPakets] = useState<PaketPublik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duplikatId, setDuplikatId] = useState<string | null>(null);

  const muatPerpustakaan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/perpustakaan');
      if (!res.ok) throw new Error('gagal memuat perpustakaan');
      const data = await res.json();
      const daftar = data?.perpustakaan ?? data?.pakets ?? (Array.isArray(data) ? data : []);
      setPakets(Array.isArray(daftar) ? daftar : []);
    } catch {
      setPakets([]);
      setError('Tidak dapat memuat koleksi perpustakaan. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatPerpustakaan();
  }, []);

  // GEL2: duplikat paket publik menjadi milik guru yang masuk.
  const handleDuplikat = async (p: PaketPublik) => {
    setDuplikatId(p.id);
    try {
      const res = await apiFetch(`/api/pakets/${p.id}/duplikat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: _currentUser.id }),
      });
      if (!res.ok) throw new Error('gagal menduplikat paket');
      const data = await res.json();
      const paketBaru = data?.paket ?? data;
      notify?.(`"${p.topik}" berhasil diduplikat ke Paket Saya.`, 'success');
      if (paketBaru?.id) onBukaPaket?.(paketBaru.id);
    } catch {
      notify?.('Gagal menduplikat paket. Silakan coba lagi.', 'error');
    } finally {
      setDuplikatId(null);
    }
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="ux-view-enter space-y-6">
      {/* GEL2: kepala halaman perpustakaan */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Perpustakaan</h1>
          <p className="text-[14px] opacity-70 mt-1">
            Bank perangkat sekolah — teladani paket dari guru lain, lalu duplikat ke Paket Saya.
          </p>
        </div>
        {!loading && !error && pakets.length > 0 && (
          <div className="badge badge-primary badge-soft">{pakets.length} paket terbit</div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Memuat perpustakaan">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card bg-base-100 shadow p-5">
              <div className="skeleton h-5 w-3/4 mb-3" />
              <div className="flex gap-2 mb-4">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
              <div className="skeleton h-4 w-1/2 mb-2" />
              <div className="skeleton h-9 w-full rounded-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={muatPerpustakaan}>
            <RefreshCw className="w-4 h-4" /> Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && pakets.length === 0 && (
        <div className="hero min-h-[52vh] rounded-[20px] bg-base-100 border border-black/10 dark:border-white/15">
          <div className="hero-content text-center">
            <div className="max-w-md px-4">
              <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/10 flex items-center justify-center mx-auto mb-5">
                <Library className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Belum ada paket yang dipublikasikan</h2>
              <p className="py-4 text-[14px] opacity-70">
                Jadilah yang pertama! Buat paket di Paket Saya, lengkapi dokumennya, lalu publikasikan agar bisa diteladani guru lain di sini.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && pakets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pakets.map((p) => (
            <div key={p.id} className="card bg-base-100 shadow hover:shadow-md transition-shadow">
              <div className="card-body p-5">
                <h2 className="card-title text-[16px] leading-snug line-clamp-2">{p.topik}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <div className="badge badge-secondary badge-soft">{p.mataPelajaran}</div>
                  <div className="badge badge-ghost">
                    {p.jenjang}{p.tingkat ? ` · ${p.tingkat}` : ''}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-[13px] opacity-70">
                  <p className="flex items-center gap-1.5">
                    <UserRound className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">oleh {p.pemilikNama}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>{p.jumlahDokumen} dokumen{formatTanggal(p.diperbaruiPada) ? ` · diperbarui ${formatTanggal(p.diperbaruiPada)}` : ''}</span>
                  </p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-primary btn-sm rounded-full"
                    onClick={() => handleDuplikat(p)}
                    disabled={duplikatId === p.id}
                  >
                    {duplikatId === p.id ? (
                      <span className="loading loading-spinner loading-sm" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Duplikat ke Paket Saya
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
