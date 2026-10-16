/**
 * BankSoalPanel.tsx — Panel impor/ekspor XLSX bank soal (F3-1 roadmap RGM).
 *
 * Komponen MURNI terkendali: tidak menyimpan ke mana pun. Setelah impor,
 * menampilkan ringkasan (X butir valid, Y baris error + daftar error),
 * lalu memanggil onImpor(items) — parent yang menyimpan ke paket.
 */
import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileUp, FileDown, Loader2, FileSpreadsheet } from 'lucide-react';
import {
  DAFTAR_BENTUK,
  LABEL_BENTUK,
  type ButirSoal,
  type PaketSoalTerstruktur,
} from '@/shared/soalTerstruktur';
import {
  eksporXlsx,
  hitungDistribusiBentuk,
  imporXlsx,
  templateXlsx,
} from '@/src/utils/bankSoalXlsx';

export interface BankSoalPanelProps {
  paket: PaketSoalTerstruktur;
  onImpor: (items: ButirSoal[]) => void;
}

interface RingkasanImpor {
  jumlahValid: number;
  errors: string[];
}

function unduhBlob(blob: Blob, namaFile: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const BankSoalPanel: React.FC<BankSoalPanelProps> = ({ paket, onImpor }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mengimpor, setMengimpor] = useState(false);
  const [mengekspor, setMengekspor] = useState(false);
  const [mengunduhTemplate, setMengunduhTemplate] = useState(false);
  const [ringkasan, setRingkasan] = useState<RingkasanImpor | null>(null);

  const jumlahButir = paket.items.length;
  const dist = hitungDistribusiBentuk(paket.items);

  const tanganiUnduhTemplate = async () => {
    setMengunduhTemplate(true);
    try {
      const blob = await templateXlsx();
      unduhBlob(blob, 'Template_Bank_Soal_RGM.xlsx');
    } finally {
      setMengunduhTemplate(false);
    }
  };

  const tanganiEkspor = async () => {
    if (jumlahButir === 0) return;
    setMengekspor(true);
    try {
      const blob = await eksporXlsx(paket.items);
      const topik = (paket.identitas.topik || 'bank-soal').replace(/[^\w\- ]/g, '').trim().slice(0, 40) || 'bank-soal';
      unduhBlob(blob, `Bank_Soal_${topik.replace(/\s+/g, '_')}.xlsx`);
    } finally {
      setMengekspor(false);
    }
  };

  const tanganiFileDipilih = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // boleh pilih file yang sama lagi
    if (!file) return;
    setMengimpor(true);
    setRingkasan(null);
    try {
      const buffer = await file.arrayBuffer();
      const { items, errors } = await imporXlsx(buffer);
      setRingkasan({ jumlahValid: items.length, errors });
      if (items.length > 0) onImpor(items);
    } catch {
      setRingkasan({ jumlahValid: 0, errors: ['Gagal membaca berkas. Pastikan file berformat .xlsx yang valid.'] });
    } finally {
      setMengimpor(false);
    }
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-sm">Bank Soal — Impor / Ekspor XLSX</h3>
      </div>

      <p className="text-xs opacity-70 leading-relaxed">
        Paket ini berisi <strong>{jumlahButir} butir soal</strong>. Impor menambahkan butir
        baru ke paket (nomor disusun ulang otomatis). Baris yang gagal divalidasi dilaporkan
        tanpa menggagalkan baris lainnya.
      </p>

      {jumlahButir > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {DAFTAR_BENTUK.map(b => (
            <span key={b} className="badge badge-ghost badge-sm">
              {LABEL_BENTUK[b]}: {dist[b]}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={tanganiUnduhTemplate}
          disabled={mengunduhTemplate}
          className="btn btn-outline btn-sm"
          title="Unduh template XLSX berisi header kolom + 2 baris contoh"
        >
          {mengunduhTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Unduh Template
        </button>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={mengimpor}
          className="btn btn-primary btn-sm"
          title="Impor butir soal dari berkas .xlsx (sheet pertama)"
        >
          {mengimpor ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
          {mengimpor ? 'Mengimpor...' : 'Impor XLSX'}
        </button>
        <button
          onClick={tanganiEkspor}
          disabled={mengekspor || jumlahButir === 0}
          className="btn btn-outline btn-sm"
          title={jumlahButir === 0 ? 'Belum ada butir untuk diekspor' : 'Ekspor seluruh butir paket ke .xlsx'}
        >
          {mengekspor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Ekspor XLSX
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={tanganiFileDipilih}
          aria-label="Pilih berkas XLSX untuk diimpor"
        />
      </div>

      {ringkasan && (
        <div className="rounded-xl border border-base-300 p-3 space-y-2 text-sm">
          {ringkasan.jumlahValid > 0 ? (
            <div className="flex items-start gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span><strong>{ringkasan.jumlahValid} butir valid</strong> berhasil diimpor ke paket.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Tidak ada butir yang berhasil diimpor.</span>
            </div>
          )}
          {ringkasan.errors.length > 0 && (
            <details className="text-xs" open={ringkasan.jumlahValid === 0}>
              <summary className="cursor-pointer font-semibold text-amber-700">
                {ringkasan.errors.length} baris bermasalah — klik untuk melihat
              </summary>
              <ul className="mt-1.5 space-y-1 max-h-40 overflow-y-auto list-disc pl-5 opacity-80">
                {ringkasan.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
