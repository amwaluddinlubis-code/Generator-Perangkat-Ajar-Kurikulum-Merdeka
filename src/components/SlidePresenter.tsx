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

// F3: palet hangat & playful, diputar per indeks slide (peach/ungu dominan)
const PALET: string[] = [
  'from-[#FFE8C7] via-[#FFD9E8] to-[#E3D4FF]',
  'from-[#E3D4FF] via-[#D9ECFF] to-[#FFE8C7]',
  'from-[#D9F5E3] via-[#FFF3C7] to-[#FFD9C7]',
  'from-[#FFD9E8] via-[#FFE8C7] to-[#D9ECFF]',
  'from-[#D9ECFF] via-[#E3D4FF] to-[#D9F5E3]',
  'from-[#FFF3C7] via-[#FFD9C7] to-[#E3D4FF]',
  'from-[#FFE8C7] via-[#D9F5E3] to-[#FFD9E8]',
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#FFE8C7] to-[#E3D4FF] p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Slide tayang"
      >
        <style>{PRINT_CSS}</style>
        <div className="bg-white/90 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center ux-pop-in">
          <div className="flex justify-center">
            <Maskot size={110} />
          </div>
          <h2 className="text-xl font-black mt-3">Ups, slidenya belum ada 😅</h2>
          <p className="text-sm opacity-70 mt-2">
            Deck slide untuk modul ajar ini belum berhasil dibuat. Coba buat ulang dari
            kartu Modul Ajar ya.
          </p>
          <button type="button" className="btn btn-primary mt-5" onClick={onTutup}>
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
          <span className="hidden sm:flex items-center gap-1.5 text-sm font-bold bg-white/70 rounded-full px-3 py-1.5 shadow-sm max-w-64 truncate">
            <Presentation className="w-4 h-4 shrink-0 text-violet-600" />
            <span className="truncate">{judulKonteks || 'Slide Tayang Kelas'}</span>
          </span>
          {infoKonteks && (
            <span className="hidden md:inline-block text-xs font-semibold bg-white/60 rounded-full px-3 py-1.5">
              {infoKonteks}
            </span>
          )}
          <span
            className="ml-auto text-sm font-black bg-[#3B2F5A] text-white rounded-full px-3.5 py-1.5 tabular-nums"
            aria-live="polite"
          >
            {indeks + 1} / {total}
          </span>
          <div className="flex items-center gap-1.5">
            {aktif.catatan && (
              <button
                type="button"
                className={`btn btn-circle btn-sm shadow-md ${tampilCatatan ? 'btn-primary' : 'bg-white/80'}`}
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
              className="btn btn-circle btn-sm bg-white/80 shadow-md"
              onClick={() => window.print()}
              aria-label="Ekspor PDF"
              title="Ekspor PDF (cetak slide aktif)"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="btn btn-circle btn-sm bg-white/80 shadow-md"
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
          className="mt-3 h-2 rounded-full bg-white/50 overflow-hidden"
          role="progressbar"
          aria-valuenow={indeks + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Kemajuan slide"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 transition-all duration-300"
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
          <span className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 shadow-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
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
          <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 shadow-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
            <ChevronRight className="w-6 h-6" />
          </span>
        </button>

        {/* F3: kartu slide — besar & terbaca dari belakang kelas */}
        <article
          key={indeks}
          className="ux-pop-in w-full max-w-5xl max-h-full overflow-y-auto bg-white/92 backdrop-blur rounded-[2rem] shadow-2xl border-4 border-white px-6 py-8 sm:px-12 sm:py-12"
          aria-roledescription="slide"
          aria-label={`Slide ${indeks + 1}: ${aktif.judul}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#3B2F5A] leading-tight">
            {aktif.judul}
          </h2>
          <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            {aktif.poin.map((p, i) => (
              <li key={i} className="flex items-start gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="shrink-0 mt-1 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center text-base sm:text-xl shadow"
                >
                  {i + 1}
                </span>
                <span className="text-lg sm:text-2xl lg:text-[1.7rem] font-medium leading-snug text-stone-800">
                  {p}
                </span>
              </li>
            ))}
          </ul>
          {tampilCatatan && aktif.catatan && (
            <aside className="mt-6 sm:mt-8 rounded-2xl bg-violet-50 border-2 border-dashed border-violet-300 p-4 flex gap-3">
              <StickyNote className="w-5 h-5 shrink-0 text-violet-600 mt-0.5" />
              <p className="text-sm sm:text-base text-violet-900">
                <span className="font-bold">Catatan guru: </span>
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
          className="btn btn-circle bg-white/85 shadow-lg"
          onClick={sebelum}
          disabled={indeks === 0}
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
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
              className={`rounded-full transition-all shadow ${
                i === indeks
                  ? 'w-8 h-3 bg-[#3B2F5A]'
                  : 'w-3 h-3 bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-circle bg-white/85 shadow-lg"
          onClick={berikut}
          disabled={indeks === total - 1}
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* F3: area cetak — HANYA slide aktif, tampil saat print saja */}
      <div className="slide-print-area" aria-hidden="true">
        <h2
          style={{
            fontSize: '32pt',
            fontWeight: 900,
            color: '#3B2F5A',
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
                color: '#1c1c1e',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 800, marginRight: '10pt' }}>{i + 1}.</span>
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
