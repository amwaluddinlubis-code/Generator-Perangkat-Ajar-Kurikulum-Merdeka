import React from 'react';
import { Minus, Plus } from 'lucide-react';

/** Jenis soal yang bisa dikustom guru — kunci harus cocok dengan backend (server.ts). */
export interface KomposisiSoalState {
  pg_biasa: number;
  pg_kompleks: number;
  menjodohkan: number;
  isian: number;
  uraian: number;
}

export const KOMPOSISI_DEFAULT: KomposisiSoalState = {
  pg_biasa: 5,
  pg_kompleks: 3,
  menjodohkan: 2,
  isian: 2,
  uraian: 3,
};

const JENIS_SOAL: Array<{ key: keyof KomposisiSoalState; label: string; desc: string; ikon: string }> = [
  { key: 'pg_biasa', label: 'Pilihan Ganda', desc: '4–5 opsi jawaban', ikon: '🔘' },
  { key: 'pg_kompleks', label: 'PG Kompleks (AKM)', desc: 'Benar/Salah atau pilih banyak', ikon: '☑️' },
  { key: 'menjodohkan', label: 'Menjodohkan', desc: 'Pasangan konsep–jawaban', ikon: '🔗' },
  { key: 'isian', label: 'Isian Singkat', desc: 'Melengkapi kalimat konsep', ikon: '✏️' },
  { key: 'uraian', label: 'Uraian HOTS', desc: 'Analisis kasus & solusi', ikon: '📝' },
];

const MAKS_PER_JENIS = 30;

interface Props {
  nilai: KomposisiSoalState;
  onUbah: (next: KomposisiSoalState) => void;
}

/**
 * KomposisiSoal — guru bebas mengatur jumlah tiap jenis soal.
 * Total dihitung otomatis = jumlah butir soal.
 */
export const KomposisiSoal: React.FC<Props> = ({ nilai, onUbah }) => {
  const total = Object.values(nilai).reduce((a, b) => a + (Number(b) || 0), 0);

  const setJenis = (key: keyof KomposisiSoalState, v: number) => {
    const next = { ...nilai, [key]: Math.max(0, Math.min(MAKS_PER_JENIS, Math.round(v) || 0)) };
    onUbah(next);
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-bold text-amber-950">
          🎯 Komposisi Soal — atur sesukamu, Guru!
        </p>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white">
          Total: {total} butir
        </span>
      </div>
      <div className="space-y-2">
        {JENIS_SOAL.map((j) => (
          <div
            key={j.key}
            className="flex items-center justify-between gap-2 bg-white rounded-xl border border-amber-100 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                <span className="mr-1">{j.ikon}</span>{j.label}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{j.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label={`Kurangi ${j.label}`}
                onClick={() => setJenis(j.key, nilai[j.key] - 1)}
                disabled={nilai[j.key] <= 0}
                className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 disabled:opacity-30 flex items-center justify-center text-amber-900"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={0}
                max={MAKS_PER_JENIS}
                value={nilai[j.key]}
                onChange={(e) => setJenis(j.key, Number(e.target.value))}
                aria-label={`Jumlah ${j.label}`}
                className="w-12 text-center text-sm font-bold text-slate-900 rounded-lg border border-amber-200 py-1 focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                aria-label={`Tambah ${j.label}`}
                onClick={() => setJenis(j.key, nilai[j.key] + 1)}
                disabled={nilai[j.key] >= MAKS_PER_JENIS}
                className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 flex items-center justify-center text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {total === 0 && (
        <p className="mt-2 text-[11px] text-red-600 font-medium">
          ⚠️ Total masih 0 — tambah minimal 1 butir soal ya, Guru!
        </p>
      )}
      {total > 50 && (
        <p className="mt-2 text-[11px] text-amber-700">
          💡 Total {total} butir cukup banyak — pastikan alokasi waktu ujian mencukupi.
        </p>
      )}
    </div>
  );
};

export default KomposisiSoal;
