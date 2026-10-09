// FITUR 5 — Telaah & Umpan Balik Rekan Sejawat: daftar + form ulasan untuk satu paket.
// Dipakai di tampilan detail paket yang dipublikasikan (lihat Perpustakaan.tsx).
// Kontrak API (lihat server.ts): GET /api/pakets/:id/ulasan → { ulasan: [...] }
// (terbaru dulu), POST /api/pakets/:id/ulasan { tipe, isi } → 201 + ulasan baru.
import React, { useCallback, useEffect, useState } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { apiFetch, extractErrorMessage } from '../utils/api';
import Maskot from './Maskot';

export type TipeUlasan = 'apresiasi' | 'saran';

export interface UlasanPaketData {
  id: string;
  paketId: string;
  paketTopik?: string;
  namaPemberi: string;
  userId: string;
  tipe: TipeUlasan;
  isi: string;
  waktu: string;
}

interface UlasanPaketProps {
  paketId: string;
}

const TIPE_META: Record<TipeUlasan, { label: string; badge: string; ikon: string }> = {
  apresiasi: { label: 'Apresiasi', badge: 'badge-success', ikon: '👍' },
  saran: { label: 'Saran', badge: 'badge-warning', ikon: '💡' },
};

const MAKS_ISI = 500;

export const UlasanPaket: React.FC<UlasanPaketProps> = ({ paketId }) => {
  const [ulasan, setUlasan] = useState<UlasanPaketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipe, setTipe] = useState<TipeUlasan>('apresiasi');
  const [isi, setIsi] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [pesanForm, setPesanForm] = useState<{ kind: 'success' | 'error'; teks: string } | null>(null);

  const muatUlasan = useCallback(async () => {
    if (!paketId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/ulasan`);
      if (!res.ok) throw new Error('gagal memuat ulasan');
      const data = await res.json();
      const daftar = data?.ulasan;
      setUlasan(Array.isArray(daftar) ? daftar : []);
    } catch {
      setUlasan([]);
      setError('Ups, ulasan belum bisa dimuat. Cek koneksi lalu coba lagi, ya!');
    } finally {
      setLoading(false);
    }
  }, [paketId]);

  useEffect(() => {
    muatUlasan();
  }, [muatUlasan]);

  const handleKirim = async (e: React.FormEvent) => {
    e.preventDefault();
    const teks = isi.trim();
    if (teks.length < 1 || teks.length > MAKS_ISI) return;
    setMengirim(true);
    setPesanForm(null);
    try {
      const res = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/ulasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipe, isi: teks }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(extractErrorMessage(data, 'Gagal mengirim ulasan'));
      setIsi('');
      setPesanForm({ kind: 'success', teks: 'Yeay, ulasanmu sudah terkirim! 🎉' });
      await muatUlasan();
    } catch (err) {
      setPesanForm({ kind: 'error', teks: err instanceof Error ? err.message : 'Gagal mengirim ulasan' });
    } finally {
      setMengirim(false);
    }
  };

  const formatWaktu = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const panjangIsi = isi.trim().length;
  const isiValid = panjangIsi >= 1 && panjangIsi <= MAKS_ISI;

  return (
    <section aria-label="Telaah dan umpan balik rekan sejawat" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight">💬 Telaah Rekan Sejawat</h3>
        {ulasan.length > 0 && <div className="badge badge-primary badge-soft">{ulasan.length} ulasan</div>}
      </div>

      {/* Form kirim ulasan */}
      <form onSubmit={handleKirim} className="card bg-base-100 shadow border border-[#F5C77E]/40">
        <div className="card-body p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih tipe ulasan">
            {(Object.keys(TIPE_META) as TipeUlasan[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipe(t)}
                aria-pressed={tipe === t}
                className={`btn btn-sm rounded-full ${tipe === t ? 'btn-primary' : 'btn-ghost'}`}
              >
                {TIPE_META[t].ikon} {TIPE_META[t].label}
              </button>
            ))}
          </div>
          <label className="form-control w-full">
            <span className="label-text text-[13px] opacity-70 mb-1 block">
              {tipe === 'apresiasi'
                ? 'Sampaikan apresiasimu — apa yang paling kamu suka dari paket ini? 🌟'
                : 'Bagikan saran membangunmu — apa yang bisa dibuat lebih baik lagi? 🌱'}
            </span>
            <textarea
              className="textarea textarea-bordered w-full min-h-24"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              maxLength={MAKS_ISI + 50}
              placeholder="Tulis dengan hangat dan santai…"
              aria-label="Isi ulasan"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className={`text-[12px] ${panjangIsi > MAKS_ISI ? 'text-error font-medium' : 'opacity-60'}`}>
              {panjangIsi}/{MAKS_ISI} karakter
            </span>
            <button type="submit" className="btn btn-primary btn-sm rounded-full" disabled={!isiValid || mengirim}>
              {mengirim ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim 💬
            </button>
          </div>
          {pesanForm && (
            <div
              role={pesanForm.kind === 'error' ? 'alert' : 'status'}
              className={`alert ${pesanForm.kind === 'success' ? 'alert-success' : 'alert-error'}`}
            >
              <span>{pesanForm.teks}</span>
            </div>
          )}
        </div>
      </form>

      {/* Daftar ulasan */}
      {loading && (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat ulasan">
          {[0, 1].map((i) => (
            <div key={i} className="card bg-base-100 shadow p-4">
              <div className="skeleton h-4 w-1/3 mb-2" />
              <div className="skeleton h-4 w-full mb-1" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={muatUlasan}>
            <RefreshCw className="w-4 h-4" /> Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && ulasan.length === 0 && (
        <div className="hero rounded-[20px] bg-[#FFFBF5] dark:bg-white/5 border border-[#F5C77E]/40">
          <div className="hero-content text-center">
            <div className="max-w-md px-4 py-6">
              <Maskot size={96} melayang={true} className="mx-auto mb-4" />
              <h4 className="text-lg font-bold tracking-tight">Belum ada ulasan — jadilah yang pertama! 🎉</h4>
              <p className="py-3 text-[14px] opacity-70">
                Paket ini masih menunggu sentuhan hangat dari rekan sejawat. Tulis apresiasi atau saranmu di atas, yuk!
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && ulasan.length > 0 && (
        <ul className="space-y-3">
          {ulasan.map((u) => (
            <li key={u.id} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <div className="avatar placeholder shrink-0" aria-hidden="true">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                      <span className="text-lg">{(u.namaPemberi || 'G').trim().charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[14px] truncate">{u.namaPemberi || 'Guru'}</span>
                      <span className={`badge badge-sm ${TIPE_META[u.tipe]?.badge ?? 'badge-ghost'}`}>
                        {TIPE_META[u.tipe]?.ikon ?? '💬'} {TIPE_META[u.tipe]?.label ?? u.tipe}
                      </span>
                    </div>
                    <p className="text-[12px] opacity-60">{formatWaktu(u.waktu)}</p>
                    <p className="mt-1.5 text-[14px] whitespace-pre-wrap break-words">{u.isi}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default UlasanPaket;
