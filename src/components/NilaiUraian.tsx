/**
 * NilaiUraian.tsx — F3-5 roadmap RGM: tombol "Nilai dengan AI" untuk butir uraian.
 *
 * Mengirim pertanyaan + kunci + rubrik + jawaban siswa ke POST /api/nilai-uraian,
 * menampilkan skor + alasan AI, SELALU dengan label "⚠️ Perlu verifikasi guru".
 * Komponen MURNI terkendali via onHasil — penyimpanan skor dilakukan parent.
 */
import React, { useState } from 'react';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { type ButirSoal } from '@/shared/soalTerstruktur';
import { apiFetch, extractErrorMessage } from '../utils/api';

export interface HasilNilaiAI { skor: number; skorMaks: number; alasan: string; perluVerifikasi: boolean; }
export interface TombolNilaiAIProps { butir: ButirSoal; jawaban: string; disabled?: boolean; onHasil: (h: HasilNilaiAI) => void; }

export function TombolNilaiAI({ butir, jawaban, disabled, onHasil }: TombolNilaiAIProps) {
  const [memuat, setMemuat] = useState(false);
  const [hasil, setHasil] = useState<HasilNilaiAI | null>(null);
  const [galat, setGalat] = useState('');

  const jawabanKosong = !jawaban || !jawaban.trim();

  async function nilaiDenganAI() {
    if (memuat || disabled || jawabanKosong) return;
    setMemuat(true);
    setGalat('');
    try {
      const res = await apiFetch('/api/nilai-uraian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pertanyaan: butir.pertanyaan,
          kunci: butir.kunci,
          rubrik: butir.rubrik || [],
          jawabanSiswa: jawaban,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(extractErrorMessage(data, 'Gagal menilai jawaban'));
      }
      const h: HasilNilaiAI = {
        skor: Number(data.skor) || 0,
        skorMaks: Number(data.skorMaks) || 0,
        alasan: String(data.alasan || ''),
        perluVerifikasi: true,
      };
      setHasil(h);
      onHasil(h);
    } catch (e: any) {
      setGalat(e?.message || 'Gagal menilai jawaban. Periksa koneksi internet lalu coba lagi.');
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={nilaiDenganAI}
        disabled={disabled || memuat || jawabanKosong}
        title={jawabanKosong ? 'Isi dulu jawaban siswa sebelum dinilai' : 'Nilai jawaban dengan AI'}
      >
        {memuat ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
        {memuat ? 'Menilai…' : 'Nilai dengan AI'}
      </button>

      {galat && (
        <div className="mt-2 alert alert-error text-xs" role="alert">
          <span>{galat}</span>
        </div>
      )}

      {hasil && (
        <div className="mt-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm" role="status">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">Skor AI: {hasil.skor} / {hasil.skorMaks}</span>
            <span className="badge badge-warning badge-sm gap-1">
              <AlertTriangle size={12} />
              ⚠️ Perlu verifikasi guru
            </span>
          </div>
          {hasil.alasan && <p className="mt-1 text-xs opacity-80">Alasan: {hasil.alasan}</p>}
        </div>
      )}
    </div>
  );
}
