/**
 * KertasToggle.tsx — F2-5 "Kertas A4/F4" (Fase 2: siap cetak & siap arsip).
 *
 * Segmented control dua tombol "A4" / "F4 (Folio)" dengan gaya .apple-segment
 * yang konsisten dengan toggle tampilan di DocumentViewer.
 */
import type { UkuranKertas } from '../utils/kertasCetak';

interface Props {
  nilai: UkuranKertas;
  onUbah: (u: UkuranKertas) => void;
}

export default function KertasToggle({ nilai, onUbah }: Props) {
  return (
    <div
      className="apple-segment !rounded-full"
      role="group"
      aria-label="Ukuran kertas cetak"
      title="Ukuran kertas saat mencetak (window.print)"
    >
      <button
        type="button"
        onClick={() => onUbah('A4')}
        data-active={nilai === 'A4'}
        className="cursor-pointer"
        aria-pressed={nilai === 'A4'}
      >
        A4
      </button>
      <button
        type="button"
        onClick={() => onUbah('F4')}
        data-active={nilai === 'F4'}
        className="cursor-pointer"
        aria-pressed={nilai === 'F4'}
      >
        F4 (Folio)
      </button>
    </div>
  );
}
