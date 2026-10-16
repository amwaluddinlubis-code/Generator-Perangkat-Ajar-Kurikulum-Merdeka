/**
 * NamaFileModal.tsx — F2-4 "Penamaan file cerdas" (Fase 2: siap cetak & siap arsip).
 *
 * Modal kecil untuk mengonfirmasi/mengubah nama file sebelum ekspor.
 * Menampilkan pratinjau hasil sanitasi secara live lewat `sanitasiNamaFile`
 * dari shared/kopPengesahan.ts. Simpan mengirim hasil sanitasi; tolak kosong.
 */
import { useEffect, useState } from 'react';
import { sanitasiNamaFile } from '@/shared/kopPengesahan.ts';

interface Props {
  /** Tampilkan/sembunyikan modal. */
  terbuka: boolean;
  /** Nilai awal input (idealnya dari `namaFileCerdas(judul, docType)`). */
  nilaiAwal: string;
  /** Dipanggil dengan hasil sanitasi saat Simpan (string selalu non-kosong). */
  onSimpan: (nama: string) => void;
  /** Dipanggil saat Batal / klik backdrop. */
  onBatal: () => void;
  /** Teks info opsional, mis. "Ekstensi: .docx" — tampil di bawah pratinjau. */
  infoEkstensi?: string;
}

export default function NamaFileModal({ terbuka, nilaiAwal, onSimpan, onBatal, infoEkstensi }: Props) {
  const [input, setInput] = useState(nilaiAwal);

  // Sinkronkan ulang tiap kali modal dibuka.
  useEffect(() => {
    if (terbuka) setInput(nilaiAwal);
  }, [terbuka, nilaiAwal]);

  // Tutup dengan Escape.
  useEffect(() => {
    if (!terbuka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBatal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [terbuka, onBatal]);

  if (!terbuka) return null;

  const hasil = sanitasiNamaFile(input);
  const valid = hasil.length > 0;

  const simpan = () => {
    if (!valid) return;
    onSimpan(hasil);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onBatal}
      role="dialog"
      aria-modal="true"
      aria-label="Nama file"
    >
      <div
        className="apple-card w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-semibold tracking-tight mb-1">
          Nama file
        </h3>
        <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mb-4">
          Ubah bila perlu sebelum berkas diunduh.
        </p>

        <label className="block text-[13px] font-medium mb-1.5" htmlFor="rgm-namafile-input">
          Nama berkas
        </label>
        <input
          id="rgm-namafile-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') simpan();
          }}
          autoFocus
          maxLength={120}
          placeholder="Nama_Berkas"
          className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-black/20 px-3.5 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#F59E0B]/60"
        />

        {/* Pratinjau hasil sanitasi live */}
        <div className="mt-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] px-3.5 py-2.5">
          <div className="text-[11.5px] uppercase tracking-wide text-[#6e6e73] dark:text-[#98989d] mb-1">
            Pratinjau nama file
          </div>
          <div className="text-[14px] font-mono break-all">
            {valid ? (
              <span className="text-[#1d1d1f] dark:text-white">{hasil}</span>
            ) : (
              <span className="text-red-500 italic">Nama tidak boleh kosong</span>
            )}
          </div>
          {infoEkstensi && valid && (
            <div className="text-[12px] text-[#6e6e73] dark:text-[#98989d] mt-1">
              {infoEkstensi}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-5">
          <button
            type="button"
            onClick={onBatal}
            className="btn-apple-secondary flex-1 !rounded-full cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={simpan}
            disabled={!valid}
            className="btn-apple flex-1 !rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
