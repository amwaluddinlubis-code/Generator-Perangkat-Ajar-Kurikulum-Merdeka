import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  bagiKomposisiPreset,
  totalKognitif,
  LABEL_PRESET_KOGNITIF,
  DAFTAR_KOGNITIF,
  LABEL_KOGNITIF,
  type LevelKognitif,
  type PresetKognitif,
  type KomposisiKognitifState,
} from '../../shared/soalTerstruktur';

/**
 * Re-export tipe kontrak Fase 1 ("Paket soal terpercaya") agar konsumen cukup
 * import dari sini. Pakai `export type` agar aman dengan isolatedModules.
 */
export type { KomposisiKognitifState, PresetKognitif } from '../../shared/soalTerstruktur';

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
  /**
   * F1-4: aktifkan section "Komposisi Kognitif (Taksonomi Bloom)".
   * Opsional agar kompatibel mundur — section hanya dirender bila
   * `kognitif` DAN `onUbahKognitif` diberikan.
   */
  kognitif?: KomposisiKognitifState;
  onUbahKognitif?: (next: KomposisiKognitifState) => void;
  /** Total butir soal target (jumlah komposisi jenis soal) — dipakai validasi C1–C6. */
  totalButir?: number;
}

/** Mode section kognitif: preset yang dipilih, atau 'kustom' bila diedit manual. */
type ModeKognitif = `preset:${PresetKognitif}` | 'kustom';

const DAFTAR_PRESET: PresetKognitif[] = ['C1-C2', 'C1-C4', 'HOTS', 'LENGKAP'];

/**
 * KomposisiSoal — guru bebas mengatur jumlah tiap jenis soal.
 * Total dihitung otomatis = jumlah butir soal.
 */
export const KomposisiSoal: React.FC<Props> = ({ nilai, onUbah, kognitif, onUbahKognitif, totalButir }) => {
  const total = Object.values(nilai).reduce((a, b) => a + (Number(b) || 0), 0);

  const setJenis = (key: keyof KomposisiSoalState, v: number) => {
    const next = { ...nilai, [key]: Math.max(0, Math.min(MAKS_PER_JENIS, Math.round(v) || 0)) };
    onUbah(next);
  };

  // F1-4: state section kognitif (hanya dipakai bila props kognitif diaktifkan).
  const kognitifAktif = !!kognitif && !!onUbahKognitif;
  const [modeKognitif, setModeKognitif] = useState<ModeKognitif>('preset:LENGKAP');
  const targetButir = Math.max(0, Math.round(Number(totalButir) || 0));
  const totalK = kognitifAktif ? totalKognitif(kognitif!) : 0;

  const pilihPresetKognitif = (p: PresetKognitif) => {
    if (!onUbahKognitif) return;
    onUbahKognitif(bagiKomposisiPreset(p, targetButir));
    setModeKognitif(`preset:${p}`);
  };

  const setLevelKognitif = (lv: LevelKognitif, v: number) => {
    if (!kognitif || !onUbahKognitif) return;
    onUbahKognitif({ ...kognitif, [lv]: Math.max(0, Math.min(MAKS_PER_JENIS, Math.round(v) || 0)) });
    // Edit manual apa pun → mode kustom.
    setModeKognitif('kustom');
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

      {/* F1-4: Komposisi Kognitif (Taksonomi Bloom) — hanya bila props kognitif diaktifkan. */}
      {kognitifAktif && kognitif && (
        <div className="mt-3.5 rounded-2xl border border-violet-200 bg-violet-50/60 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-violet-950">
              🧠 Komposisi Kognitif (Taksonomi Bloom)
            </p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-500 text-white">
              {totalK} / {targetButir}
            </span>
          </div>

          {/* Tombol preset + kustom */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {DAFTAR_PRESET.map((p) => {
              const aktif = modeKognitif === `preset:${p}`;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => pilihPresetKognitif(p)}
                  aria-pressed={aktif}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                    aktif
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-white border-violet-200 text-violet-900 hover:bg-violet-100'
                  }`}
                >
                  {LABEL_PRESET_KOGNITIF[p]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setModeKognitif('kustom')}
              aria-pressed={modeKognitif === 'kustom'}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                modeKognitif === 'kustom'
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-white border-violet-200 text-violet-900 hover:bg-violet-100'
              }`}
            >
              ✏️ Kustom
            </button>
          </div>

          {modeKognitif === 'kustom' ? (
            /* Mode kustom: 6 input angka C1–C6, pola minus/plus + input. */
            <div className="space-y-2">
              {DAFTAR_KOGNITIF.map((lv) => (
                <div
                  key={lv}
                  className="flex items-center justify-between gap-2 bg-white rounded-xl border border-violet-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{lv}</p>
                    <p className="text-[10px] text-slate-500 truncate">{LABEL_KOGNITIF[lv].replace(`${lv} `, '')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      aria-label={`Kurangi ${lv}`}
                      onClick={() => setLevelKognitif(lv, kognitif[lv] - 1)}
                      disabled={kognitif[lv] <= 0}
                      className="w-7 h-7 rounded-full bg-violet-100 hover:bg-violet-200 disabled:opacity-30 flex items-center justify-center text-violet-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={MAKS_PER_JENIS}
                      value={kognitif[lv]}
                      onChange={(e) => setLevelKognitif(lv, Number(e.target.value))}
                      aria-label={`Jumlah ${lv}`}
                      className="w-12 text-center text-sm font-bold text-slate-900 rounded-lg border border-violet-200 py-1 focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      aria-label={`Tambah ${lv}`}
                      onClick={() => setLevelKognitif(lv, kognitif[lv] + 1)}
                      disabled={kognitif[lv] >= MAKS_PER_JENIS}
                      className="w-7 h-7 rounded-full bg-violet-500 hover:bg-violet-600 disabled:opacity-30 flex items-center justify-center text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Mode preset: ringkasan distribusi (baca-saja), edit via tombol Kustom. */
            <div className="flex flex-wrap gap-1.5">
              {DAFTAR_KOGNITIF.map((lv) => (
                <span
                  key={lv}
                  title={LABEL_KOGNITIF[lv]}
                  className="text-[11px] font-bold px-2 py-1 rounded-full bg-white border border-violet-200 text-violet-900"
                >
                  {lv}: {kognitif[lv]}
                </span>
              ))}
            </div>
          )}

          {totalK !== targetButir && (
            <p role="alert" className="mt-2 text-[11px] text-red-600 font-medium">
              ⚠️ Jumlah C1–C6 ({totalK}) harus sama dengan total butir soal ({targetButir}).
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KomposisiSoal;
