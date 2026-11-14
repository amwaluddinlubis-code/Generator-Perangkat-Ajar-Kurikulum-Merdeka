import React, { useEffect, useRef } from 'react';

// UI-08: SATU komponen modal standar. Semua modal wajib memakai ini agar
// perilakunya seragam: Escape menutup, klik backdrop menutup, scroll halaman
// terkunci, fokus terperangkap di dalam modal dan dikembalikan saat tutup.
export const Modal: React.FC<{
  label: string;
  onClose: () => void;
  /** Kelas lebar modal-box, mis. 'max-w-xl'. Bawaan 'max-w-lg'. */
  boxClassName?: string;
  /** true = Escape & klik backdrop tidak menutup (mis. proses sedang berjalan). */
  sibuk?: boolean;
  /** Kelas tambahan untuk elemen luar, mis. 'no-print'. */
  className?: string;
  children: React.ReactNode;
}> = ({ label, onClose, boxClassName = 'max-w-lg', sibuk = false, className = '', children }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const tutupRef = useRef(onClose);
  tutupRef.current = onClose;
  const sibukRef = useRef(sibuk);
  sibukRef.current = sibuk;

  useEffect(() => {
    const fokusSebelumnya = document.activeElement as HTMLElement | null;

    // Kunci scroll halaman selama modal terbuka.
    const overflowAsli = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Fokus awal ke elemen interaktif pertama di dalam modal.
    const box = boxRef.current;
    const fokusAwal = box?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (fokusAwal ?? box)?.focus();

    const tangani = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sibukRef.current) {
        e.stopPropagation();
        tutupRef.current();
        return;
      }
      if (e.key !== 'Tab' || !boxRef.current) return;
      // Focus trap: Tab berputar di dalam modal.
      const elemen = Array.from(
        boxRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (elemen.length === 0) return;
      const pertama = elemen[0];
      const terakhir = elemen[elemen.length - 1];
      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    };
    // Fase capture agar menang atas handler Escape modal/global lain.
    document.addEventListener('keydown', tangani, true);
    return () => {
      document.removeEventListener('keydown', tangani, true);
      document.body.style.overflow = overflowAsli;
      fokusSebelumnya?.focus?.();
    };
  }, []);

  return (
    <div className={`modal modal-open ${className}`} role="dialog" aria-modal="true" aria-label={label}>
      <div ref={boxRef} tabIndex={-1} className={`modal-box ${boxClassName}`}>
        {children}
      </div>
      <div
        className="modal-backdrop"
        onClick={() => {
          if (!sibukRef.current) tutupRef.current();
        }}
      />
    </div>
  );
};
