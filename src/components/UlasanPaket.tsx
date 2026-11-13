// FITUR 5 — Telaah & Umpan Balik Rekan Sejawat: daftar + form ulasan untuk satu paket.
// Dipakai di tampilan detail paket yang dipublikasikan (lihat Perpustakaan.tsx).
// Kontrak API (lihat server.ts): GET /api/pakets/:id/ulasan → { ulasan: [...] }
// (terbaru dulu), POST /api/pakets/:id/ulasan { tipe, isi } → 201 + ulasan baru.
import React, { useCallback, useEffect, useState } from 'react';
import { Send, RefreshCw, ThumbsUp, Lightbulb, MessageSquare } from 'lucide-react';
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

const TIPE_META: Record<
  TipeUlasan,
  { label: string; badge: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  apresiasi: { label: 'Apresiasi', badge: 'ds-badge-ok', Icon: ThumbsUp },
  saran: { label: 'Saran', badge: 'ds-badge-warn', Icon: Lightbulb },
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
      setError('Ulasan belum bisa dimuat. Periksa koneksi lalu coba lagi.');
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
      setPesanForm({ kind: 'success', teks: 'Ulasan terkirim.' });
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
    <section aria-label="Telaah dan umpan balik rekan sejawat" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)]">
          <MessageSquare className="w-4 h-4 text-[var(--muted)]" />
          Telaah rekan sejawat
        </h3>
        {ulasan.length > 0 && <span className="ds-badge">{ulasan.length} ulasan</span>}
      </div>

      {/* Form kirim ulasan */}
      <form onSubmit={handleKirim} className="apple-card p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pilih tipe ulasan">
          {(Object.keys(TIPE_META) as TipeUlasan[]).map((t) => {
            const { Icon, label } = TIPE_META[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTipe(t)}
                aria-pressed={tipe === t}
                className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors cursor-pointer ${
                  tipe === t
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-ink)]'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        <div>
          <label className="mb-1.5 block text-[11.5px] text-[var(--muted)]" htmlFor="ulasan-isi">
            {tipe === 'apresiasi'
              ? 'Sampaikan apresiasi — apa yang paling berkesan dari paket ini?'
              : 'Bagikan saran — apa yang bisa dibuat lebih baik?'}
          </label>
          <textarea
            id="ulasan-isi"
            className="apple-input min-h-24 resize-y !text-[12.5px]"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            maxLength={MAKS_ISI + 50}
            placeholder="Tulis ulasan singkat dan jelas…"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-[11px] ${
              panjangIsi > MAKS_ISI ? 'font-medium text-[var(--danger)]' : 'text-[var(--muted)]'
            }`}
          >
            {panjangIsi}/{MAKS_ISI} karakter
          </span>
          <button
            type="submit"
            className="btn-apple !min-h-[32px] !py-1 !px-3 !text-[12px]"
            disabled={!isiValid || mengirim}
          >
            {mengirim ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Kirim
          </button>
        </div>

        {pesanForm && (
          <div
            role={pesanForm.kind === 'error' ? 'alert' : 'status'}
            className={`rounded-lg border px-3 py-2 text-[11.5px] ${
              pesanForm.kind === 'success'
                ? 'border-[var(--ok)]/30 bg-[var(--ok-soft)] text-[var(--ok)]'
                : 'border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]'
            }`}
          >
            {pesanForm.teks}
          </div>
        )}
      </form>

      {/* Daftar ulasan */}
      {loading && (
        <div className="space-y-2" aria-busy="true" aria-label="Memuat ulasan">
          {[0, 1].map((i) => (
            <div key={i} className="apple-card p-3.5">
              <div className="mb-2 h-3 w-1/3 animate-pulse rounded bg-[var(--surface-3)]" />
              <div className="mb-1 h-3 w-full animate-pulse rounded bg-[var(--surface-3)]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--surface-3)]" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[11.5px] text-[var(--danger)]"
        >
          <span className="flex-1">{error}</span>
          <button
            onClick={muatUlasan}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--danger)]/35 px-2 py-1 font-semibold hover:bg-[var(--danger)]/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && ulasan.length === 0 && (
        <div className="apple-card flex flex-col items-center px-5 py-8 text-center">
          <Maskot size={80} melayang={true} className="mx-auto mb-3" />
          <h4 className="text-[13.5px] font-semibold text-[var(--ink)]">Belum ada ulasan</h4>
          <p className="mt-1 max-w-sm text-[12px] text-[var(--muted)]">
            Paket ini belum ditelaah rekan sejawat. Tulis apresiasi atau saran pada formulir di atas.
          </p>
        </div>
      )}

      {!loading && !error && ulasan.length > 0 && (
        <ul className="space-y-2">
          {ulasan.map((u) => {
            const meta = TIPE_META[u.tipe];
            const Icon = meta?.Icon ?? MessageSquare;
            return (
              <li key={u.id} className="apple-card p-3.5">
                <div className="flex items-start gap-2.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[12.5px] font-semibold text-[var(--ink-soft)]"
                    aria-hidden="true"
                  >
                    {(u.namaPemberi || 'G').trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold text-[var(--ink)]">
                        {u.namaPemberi || 'Guru'}
                      </span>
                      <span className={`ds-badge ${meta?.badge ?? ''}`}>
                        <Icon className="w-3 h-3" />
                        {meta?.label ?? u.tipe}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">{formatWaktu(u.waktu)}</p>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                      {u.isi}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default UlasanPaket;
