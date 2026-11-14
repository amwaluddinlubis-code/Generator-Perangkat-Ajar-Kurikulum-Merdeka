// Perpustakaan — bank perangkat sekolah: paket terpublikasi guru lain.
import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { Copy, FileText, UserRound, RefreshCw, MessageSquare, X } from 'lucide-react';
import { TeacherUser } from '../types';
import { apiFetch } from '../utils/api';
import Maskot from './Maskot';
import { pesanKosong } from '../utils/sapaan';
import UlasanPaket from './UlasanPaket';

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
  onBuatPaket?: () => void;
  notify?: (msg: string, kind: 'success' | 'error' | 'info') => void;
}

export const Perpustakaan: React.FC<PerpustakaanProps> = ({
  currentUser,
  onBukaPaket,
  onBuatPaket,
  notify,
}) => {
  const [pakets, setPakets] = useState<PaketPublik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duplikatId, setDuplikatId] = useState<string | null>(null);
  const [paketAktif, setPaketAktif] = useState<PaketPublik | null>(null);

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

  // Muat ulang saat identitas berubah agar tidak menampilkan data basi.
  useEffect(() => {
    muatPerpustakaan();
  }, [currentUser.id]);

  const handleDuplikat = async (p: PaketPublik) => {
    setDuplikatId(p.id);
    try {
      const res = await apiFetch(`/api/pakets/${p.id}/duplikat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: currentUser.id }),
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
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--ink)]">Perpustakaan</h1>
          <p className="apple-sub mt-1 max-w-2xl">
            Bank perangkat sekolah — teladani paket dari guru lain, lalu duplikat ke Paket Saya.
          </p>
        </div>
        {!loading && !error && pakets.length > 0 && (
          <span className="ds-badge ds-badge-accent">{pakets.length} paket terbit</span>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" aria-busy="true" aria-label="Memuat perpustakaan">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="apple-card p-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="flex gap-2 mt-3">
                <div className="skeleton h-5 w-20 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-3 w-1/2 mt-4" />
              <div className="skeleton h-8 w-full mt-4" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-[13px] text-[var(--danger)]"
        >
          <span>{error}</span>
          <button className="btn-apple-secondary !min-h-[32px] !py-1.5 !px-3 !text-[12.5px]" onClick={muatPerpustakaan}>
            <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && pakets.length === 0 && (
        <div className="apple-card py-8 px-6 text-center">
          <Maskot size={56} melayang={true} className="mx-auto mb-3" />
          <h2 className="text-[16px] font-semibold text-[var(--ink)]">Belum ada paket yang dipublikasikan</h2>
          <p className="apple-sub mt-1.5 max-w-md mx-auto">
            {pesanKosong('perpustakaan')} Buat paket di Paket Saya, lengkapi dokumennya, lalu publikasikan
            agar bisa diteladani guru lain di sini.
          </p>
          {onBuatPaket && (
            <button className="btn-apple mt-4 !min-h-[38px] !py-2 !px-4 !text-[13px]" onClick={onBuatPaket}>
              Buat Paket Pertama
            </button>
          )}
        </div>
      )}

      {!loading && !error && pakets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {pakets.map((p) => (
            <div key={p.id} className="apple-card ux-lift p-4 flex flex-col">
              <h2 className="text-[14.5px] font-semibold text-[var(--ink)] leading-snug line-clamp-2">
                {p.topik}
              </h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="ds-badge ds-badge-accent">{p.mataPelajaran}</span>
                <span className="ds-badge">
                  {p.jenjang}
                  {p.tingkat ? ` · ${p.tingkat}` : ''}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-[12px] text-[var(--muted)]">
                <p className="flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">oleh {p.pemilikNama}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {p.jumlahDokumen} dokumen
                    {formatTanggal(p.diperbaruiPada) ? ` · diperbarui ${formatTanggal(p.diperbaruiPada)}` : ''}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-4">
                <button
                  className="btn-apple-secondary flex-1 !min-h-[34px] !py-1.5 !text-[12.5px]"
                  onClick={() => setPaketAktif(p)}
                  title="Lihat detail & beri ulasan"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ulasan
                </button>
                <button
                  className="btn-apple flex-1 !min-h-[34px] !py-1.5 !text-[12.5px]"
                  onClick={() => handleDuplikat(p)}
                  disabled={duplikatId === p.id}
                  title="Duplikat ke Paket Saya"
                >
                  {duplikatId === p.id ? (
                    <span className="loading loading-spinner loading-xs" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Duplikat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {paketAktif && (
        <Modal label={`Detail ${paketAktif.topik}`} onClose={() => setPaketAktif(null)} boxClassName="max-w-2xl ux-pop-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-[var(--ink)] leading-snug">{paketAktif.topik}</h3>
              <button
                type="button"
                className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center shrink-0 cursor-pointer"
                onClick={() => setPaketAktif(null)}
                aria-label="Tutup detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="ds-badge ds-badge-accent">{paketAktif.mataPelajaran}</span>
              <span className="ds-badge">
                {paketAktif.jenjang}
                {paketAktif.tingkat ? ` · ${paketAktif.tingkat}` : ''}
              </span>
              <span className="ds-badge">oleh {paketAktif.pemilikNama}</span>
              <span className="ds-badge">{paketAktif.jumlahDokumen} dokumen</span>
            </div>
            <div className="h-px bg-[var(--line)] my-4" />
            <UlasanPaket paketId={paketAktif.id} />
            <div className="modal-action">
              <button
                type="button"
                className="btn-apple-secondary"
                onClick={() => {
                  setPaketAktif(null);
                  void handleDuplikat(paketAktif);
                }}
              >
                <Copy className="w-4 h-4" />
                Duplikat ke Paket Saya
              </button>
              <button type="button" className="btn-apple-ghost" onClick={() => setPaketAktif(null)}>
                Tutup
              </button>
            </div>
    </Modal>
      )}
    </div>
  );
};
