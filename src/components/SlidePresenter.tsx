// F3 — SlidePresenter: mode presentasi fullscreen untuk "Slide Tayang Kelas".
// F3: Dokumen TURUNAN Modul Ajar (bukan dokumen ke-8) — dibuka dari kartu
// F3: Modul Ajar di PaketWorkspace (lihat SPESIFIKASI_KOORDINATOR.md di /tmp/qa-fitur/f3/).
// F3: Navigasi: klik zona kiri/kanan, tombol panah, keyboard
// F3: (ArrowRight/ArrowLeft/Escape). Ekspor PDF via window.print() + CSS print
// F3: yang hanya menampilkan slide aktif.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  StickyNote,
  Presentation,
} from 'lucide-react';
// FRIENDLY: Owi menemani empty state bila deck kosong/gagal dimuat
import { Maskot } from './Maskot';

/** F3: satu slide tayang. `catatan` = panduan untuk guru (opsional). */
export interface Slide {
  judul: string;
  poin: string[];
  catatan?: string;
}

interface SlidePresenterProps {
  /** Deck 5–7 slide dari AI / fallback. */
  slides: Slide[];
  /** Dipanggil saat keluar dari mode presentasi (tombol ✕ / Escape). */
  onTutup: () => void;
  /** mis. topik paket — tampil kecil di bilah atas */
  judulKonteks?: string;
  /** mis. "IPA · Kelas 7" — tampil kecil di bilah atas */
  infoKonteks?: string;
}

// F3: latar netral dingin — kartu slide tetap terang & kontras tinggi
const PALET: string[] = [
  'from-[#eef1f6] via-[#e9edf4] to-[#e2e7f0]',
  'from-[#e9edf4] via-[#eef1f6] to-[#e4e9f2]',
  'from-[#f0f2f7] via-[#e9edf4] to-[#e3e8f1]',
  'from-[#eceff5] via-[#f1f3f8] to-[#e5eaf3]',
  'from-[#e8ecf4] via-[#eef1f6] to-[#e6ebf4]',
  'from-[#f1f3f8] via-[#eaedf4] to-[#e2e7f0]',
  'from-[#edf0f6] via-[#f2f4f9] to-[#e4e9f2]',
];

// F3: CSS print disuntik dari komponen (tanpa menyentuh index.css):
// F3: saat mencetak, SEMUA disembunyikan kecuali area cetak slide aktif.
const PRINT_CSS = `
@media print {
  @page { size: landscape; margin: 10mm; }
  body * { visibility: hidden !important; }
  .slide-print-area, .slide-print-area * { visibility: visible !important; }
  .slide-print-area {
    position: fixed !important;
    inset: 0 !important;
    display: flex !important;
    flex-direction: column;
    justify-content: center;
    background: #fff !important;
    padding: 8mm !important;
  }
}
@media screen {
  .slide-print-area { display: none !important; }
}
`;

export const SlidePresenter: React.FC<SlidePresenterProps> = ({
  slides,
  onTutup,
  judulKonteks,
  infoKonteks,
}) => {
  const total = slides.length;
  const [indeks, setIndeks] = useState(0);
  const [tampilCatatan, setTampilCatatan] = useState(true);

  const berikut = useCallback(() => {
    setIndeks((i) => (total === 0 ? 0 : Math.min(i + 1, total - 1)));
  }, [total]);
  const sebelum = useCallback(() => {
    setIndeks((i) => Math.max(i - 1, 0));
  }, []);
  const lompat = useCallback(
    (i: number) => {
      if (i >= 0 && i < total) setIndeks(i);
    },
    [total]
  );

  // F3: kunci scroll body selama presentasi
  useEffect(() => {
    const semula = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = semula;
    };
  }, []);

  // F3: navigasi keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onTutup();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        berikut();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        sebelum();
      } else if (e.key === 'Home') {
        e.preventDefault();
        lompat(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        lompat(total - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [berikut, sebelum, lompat, total, onTutup]);

  const aktif = total > 0 ? slides[Math.min(indeks, total - 1)] : null;
  const palet = PALET[indeks % PALET.length];
  const progres = useMemo(
    () => (total === 0 ? 0 : ((indeks + 1) / total) * 100),
    [indeks, total]
  );

  // F3: empty state — Owi menenangkan
  if (!aktif) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#e9edf4] p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Slide tayang"
      >
        <style>{PRINT_CSS}</style>
        <div className="w-full max-w-md rounded-xl border border-[#d8dee8] bg-white p-8 text-center shadow-xl ux-pop-in">
          <div className="flex justify-center">
            <Maskot size={110} />
          </div>
          <h2 className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[#0f172a]">Slide belum tersedia</h2>
          <p className="mt-2 text-[12.5px] text-[#5b6675]">
            Deck slide untuk modul ajar ini belum berhasil dibuat. Coba buat ulang dari
            kartu Modul Ajar.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#4f46e5] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#4338ca] cursor-pointer"
            onClick={onTutup}
          >
            <X className="w-4 h-4" /> Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[100] bg-gradient-to-br ${palet} flex flex-col select-none`}
      role="dialog"
      aria-modal="true"
      aria-label={`Presentasi slide ${indeks + 1} dari ${total}`}
    >
      <style>{PRINT_CSS}</style>

      {/* F3: bilah atas — konteks, nomor slide, progres, aksi */}
      <div className="slide-screen-only shrink-0 px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold bg-white/80 rounded-lg px-3 py-1.5 shadow-sm max-w-64 truncate text-[#0f172a] border border-[#d8dee8]">
            <Presentation className="w-4 h-4 shrink-0 text-[#4f46e5]" />
            <span className="truncate">{judulKonteks || 'Slide tayang kelas'}</span>
          </span>
          {infoKonteks && (
            <span className="hidden md:inline-block text-[11.5px] font-medium bg-white/70 rounded-lg px-3 py-1.5 text-[#5b6675] border border-[#d8dee8]">
              {infoKonteks}
            </span>
          )}
          <span
            className="ml-auto text-[12.5px] font-semibold bg-[#0f172a] text-white rounded-lg px-3 py-1.5 tabular-nums"
            aria-live="polite"
          >
            {indeks + 1} / {total}
          </span>
          <div className="flex items-center gap-1.5">
            {aktif.catatan && (
              <button
                type="button"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                  tampilCatatan
                    ? 'border-[#4f46e5] bg-[#4f46e5] text-white'
                    : 'border-[#d8dee8] bg-white/85 text-[#0f172a] hover:bg-white'
                }`}
                onClick={() => setTampilCatatan((v) => !v)}
                aria-label={tampilCatatan ? 'Sembunyikan catatan guru' : 'Tampilkan catatan guru'}
                aria-pressed={tampilCatatan}
                title="Catatan guru"
              >
                <StickyNote className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dee8] bg-white/85 text-[#0f172a] shadow-sm transition-colors hover:bg-white cursor-pointer"
              onClick={() => window.print()}
              aria-label="Ekspor PDF"
              title="Ekspor PDF (cetak slide aktif)"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dee8] bg-white/85 text-[#0f172a] shadow-sm transition-colors hover:bg-white cursor-pointer"
              onClick={onTutup}
              aria-label="Keluar dari presentasi"
              title="Keluar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* F3: progress bar */}
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0f172a]/10"
          role="progressbar"
          aria-valuenow={indeks + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Kemajuan slide"
        >
          <div
            className="h-full rounded-full bg-[#4f46e5] transition-all duration-300"
            style={{ width: `${progres}%` }}
          />
        </div>
      </div>

      {/* F3: area slide + zona klik kiri/kanan */}
      <div className="slide-screen-only relative flex-1 flex items-center justify-center px-14 sm:px-20 py-4 min-h-0">
        {/* zona klik kiri */}
        <button
          type="button"
          className="absolute left-0 top-0 h-full w-14 sm:w-20 cursor-w-resize group"
          onClick={sebelum}
          disabled={indeks === 0}
          aria-label="Slide sebelumnya"
        >
          <span className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/85 border border-[#d8dee8] text-[#0f172a] shadow-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
            <ChevronLeft className="w-6 h-6" />
          </span>
        </button>
        {/* zona klik kanan */}
        <button
          type="button"
          className="absolute right-0 top-0 h-full w-14 sm:w-20 cursor-e-resize group"
          onClick={berikut}
          disabled={indeks === total - 1}
          aria-label="Slide berikutnya"
        >
          <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/85 border border-[#d8dee8] text-[#0f172a] shadow-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
            <ChevronRight className="w-6 h-6" />
          </span>
        </button>

        {/* F3: kartu slide — besar & terbaca dari belakang kelas */}
        <article
          key={indeks}
          className="ux-pop-in w-full max-w-5xl max-h-full overflow-y-auto rounded-2xl border border-[#d8dee8] bg-white px-6 py-8 shadow-2xl sm:px-12 sm:py-12"
          aria-roledescription="slide"
          aria-label={`Slide ${indeks + 1}: ${aktif.judul}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#0f172a] leading-tight">
            {aktif.judul}
          </h2>
          <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            {aktif.poin.map((p, i) => (
              <li key={i} className="flex items-start gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="shrink-0 mt-1 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#eef0fe] text-[#4f46e5] font-semibold flex items-center justify-center text-base sm:text-lg"
                >
                  {i + 1}
                </span>
                <span className="text-lg sm:text-2xl lg:text-[1.7rem] font-normal leading-snug text-[#1f2937]">
                  {p}
                </span>
              </li>
            ))}
          </ul>
          {tampilCatatan && aktif.catatan && (
            <aside className="mt-6 sm:mt-8 flex gap-3 rounded-xl border border-[#d8dee8] bg-[#f5f7fb] p-4">
              <StickyNote className="w-5 h-5 shrink-0 text-[#4f46e5] mt-0.5" />
              <p className="text-sm sm:text-base text-[#374151]">
                <span className="font-semibold text-[#0f172a]">Catatan guru: </span>
                {aktif.catatan}
              </p>
            </aside>
          )}
        </article>
      </div>

      {/* F3: bilah bawah — panah besar + dot navigasi */}
      <div className="slide-screen-only shrink-0 pb-5 pt-1 flex items-center justify-center gap-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d8dee8] bg-white/85 text-[#0f172a] shadow-lg transition-colors hover:bg-white cursor-pointer disabled:opacity-40"
          onClick={sebelum}
          disabled={indeks === 0}
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Pilih slide">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === indeks}
              aria-label={`Ke slide ${i + 1}: ${s.judul}`}
              title={s.judul}
              onClick={() => lompat(i)}
              className={`rounded-full transition-all cursor-pointer ${
                i === indeks
                  ? 'w-8 h-2.5 bg-[#4f46e5]'
                  : 'w-2.5 h-2.5 bg-[#0f172a]/25 hover:bg-[#0f172a]/45'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d8dee8] bg-white/85 text-[#0f172a] shadow-lg transition-colors hover:bg-white cursor-pointer disabled:opacity-40"
          onClick={berikut}
          disabled={indeks === total - 1}
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* F3: area cetak — HANYA slide aktif, tampil saat print saja */}
      <div className="slide-print-area" aria-hidden="true">
        <h2
          style={{
            fontSize: '32pt',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '18pt',
            lineHeight: 1.2,
          }}
        >
          {aktif.judul}
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {aktif.poin.map((p, i) => (
            <li
              key={i}
              style={{
                fontSize: '20pt',
                marginBottom: '12pt',
                color: '#1f2937',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 700, marginRight: '10pt' }}>{i + 1}.</span>
              {p}
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '24pt', fontSize: '11pt', color: '#666' }}>
          Slide {indeks + 1} dari {total}
          {judulKonteks ? ` · ${judulKonteks}` : ''}
          {infoKonteks ? ` · ${infoKonteks}` : ''}
        </p>
      </div>
    </div>
  );
};

export default SlidePresenter;
