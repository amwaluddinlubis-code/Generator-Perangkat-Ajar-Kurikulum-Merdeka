/**
 * NamaFileModal.tsx — F2-4 "Penamaan file cerdas" (Fase 2: siap cetak & siap arsip).
 *
 * Modal kecil untuk mengonfirmasi/mengubah nama file sebelum ekspor.
 * Menampilkan pratinjau hasil sanitasi secara live lewat `sanitasiNamaFile`
 * dari shared/kopPengesahan.ts. Simpan mengirim hasil sanitasi; tolak kosong.
 */
import { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
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
    <Modal label="Nama file" onClose={onBatal} boxClassName="max-w-sm">
        <h3 className="mb-1 text-[15px] font-semibold text-[var(--ink)]">
          Nama file
        </h3>
        <p className="mb-4 text-[12px] text-[var(--muted)]">
          Ubah bila perlu sebelum berkas diunduh.
        </p>

        <label className="mb-1.5 block text-[12px] font-medium text-[var(--ink-soft)]" htmlFor="rgm-namafile-input">
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
          className="apple-input !text-[13px]"
        />

        {/* Pratinjau hasil sanitasi live */}
        <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5">
          <div className="mb-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
            Pratinjau nama file
          </div>
          <div className="break-all font-mono text-[12.5px]">
            {valid ? (
              <span className="text-[var(--ink)]">{hasil}</span>
            ) : (
              <span className="italic text-[var(--danger)]">Nama tidak boleh kosong</span>
            )}
          </div>
          {infoEkstensi && valid && (
            <div className="mt-1 text-[11px] text-[var(--muted)]">
              {infoEkstensi}
            </div>
          )}
        </div>

        <div className="modal-action">
          <button
            type="button"
            onClick={onBatal}
            className="btn-apple-secondary flex-1"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={simpan}
            disabled={!valid}
            className="btn-apple flex-1"
          >
            Simpan
          </button>
        </div>
    </Modal>
  );
}
