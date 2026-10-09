// FITUR 4 — Generator Asesmen Diagnostik 5 Menit.
// Modal ringan mandiri: memicu POST /api/pakets/:id/diagnostik (dibuat koordinator),
// menampilkan hasil markdown dengan renderer sederhana buatan sendiri (tanpa dependensi baru),
// plus tombol unduh .md dan salin. Bukan bagian dari 7 dokumen utama paket.
import React, { useCallback, useEffect, useState } from 'react';
import { X, Download, ClipboardCopy, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import type { Jenjang } from '../types';
import { apiFetch, extractErrorMessage } from '../utils/api';
import { Maskot } from './Maskot';

export interface DiagnostikPaketInfo {
  id: string;
  mataPelajaran: string;
  topik: string;
  tingkat: string;
  fase: string;
  jenjang: Jenjang;
}

interface DiagnostikModalProps {
  paket: DiagnostikPaketInfo;
  onClose: () => void;
}

/**
 * Renderer markdown SEDERHANA (buatan sendiri, tanpa dependensi):
 * - heading: # / ## / ### di awal baris
 * - bold: **teks**
 * - list tak-bernomor: "- " atau "* " di awal baris
 * - list bernomor: "1. " di awal baris
 * - sisanya: paragraf
 */
function renderMarkdownSederhana(md: string): React.ReactNode {
  const blok: React.ReactNode[] = [];
  const itemList: React.ReactNode[] = [];
  let tipeList: 'ul' | 'ol' | null = null;
  let kunci = 0;

  const renderInline = (teks: string): React.ReactNode[] => {
    const hasil: React.ReactNode[] = [];
    const pola = /\*\*([^*]+)\*\*/g;
    let terakhir = 0;
    let cocok: RegExpExecArray | null;
    while ((cocok = pola.exec(teks)) !== null) {
      if (cocok.index > terakhir) hasil.push(teks.slice(terakhir, cocok.index));
      hasil.push(<strong key={kunci++}>{cocok[1]}</strong>);
      terakhir = cocok.index + cocok[0].length;
    }
    if (terakhir < teks.length) hasil.push(teks.slice(terakhir));
    return hasil;
  };

  const siramList = () => {
    if (tipeList && itemList.length > 0) {
      const Tag = tipeList;
      blok.push(
        <Tag
          key={kunci++}
          className={tipeList === 'ul' ? 'list-disc pl-6 space-y-1.5 mb-2' : 'list-decimal pl-6 space-y-1.5 mb-2'}
        >
          {itemList}
        </Tag>
      );
      itemList.length = 0;
      tipeList = null;
    }
  };

  for (const barisMentah of md.split('\n')) {
    const baris = barisMentah.trim();
    if (baris === '' || baris === '---' || baris === '***') {
      siramList();
      continue;
    }
    const judul = baris.match(/^(#{1,3})\s+(.*)$/);
    if (judul) {
      siramList();
      const level = judul[1].length;
      const isi = renderInline(judul[2]);
      const kelas =
        level === 1
          ? 'text-xl font-black tracking-tight mt-4 mb-2'
          : level === 2
            ? 'text-lg font-bold mt-4 mb-1.5'
            : 'text-base font-semibold mt-3 mb-1';
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
      blok.push(<Tag key={kunci++} className={kelas}>{isi}</Tag>);
      continue;
    }
    const listTakBernomor = baris.match(/^[-*]\s+(.*)$/);
    if (listTakBernomor) {
      if (tipeList !== 'ul') siramList();
      tipeList = 'ul';
      itemList.push(
        <li key={kunci++} className="text-sm leading-relaxed">
          {renderInline(listTakBernomor[1])}
        </li>
      );
      continue;
    }
    const listBernomor = baris.match(/^\d+\.\s+(.*)$/);
    if (listBernomor) {
      if (tipeList !== 'ol') siramList();
      tipeList = 'ol';
      itemList.push(
        <li key={kunci++} className="text-sm leading-relaxed">
          {renderInline(listBernomor[1])}
        </li>
      );
      continue;
    }
    siramList();
    blok.push(
      <p key={kunci++} className="text-sm leading-relaxed mb-2">
        {renderInline(baris)}
      </p>
    );
  }
  siramList();
  return blok;
}

export const DiagnostikModal: React.FC<DiagnostikModalProps> = ({ paket, onClose }) => {
  const [memuat, setMemuat] = useState<boolean>(false);
  const [konten, setKonten] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [disalin, setDisalin] = useState<boolean>(false);
  const [sudahGenerate, setSudahGenerate] = useState<boolean>(false);

  // FRIENDLY: tutup dengan Escape
  useEffect(() => {
    const tangani = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !memuat) onClose();
    };
    window.addEventListener('keydown', tangani);
    return () => window.removeEventListener('keydown', tangani);
  }, [onClose, memuat]);

  const buatPertanyaan = useCallback(async () => {
    setMemuat(true);
    setGalat(null);
    setDisalin(false);
    try {
      const res = await apiFetch(`/api/pakets/${encodeURIComponent(paket.id)}/diagnostik`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.content) {
        throw new Error(extractErrorMessage(data, `Server menjawab ${res.status}`));
      }
      setKonten(String(data.content));
      setSudahGenerate(true);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : 'Gagal membuat pertanyaan diagnostik');
    } finally {
      setMemuat(false);
    }
  }, [paket.id]);

  const unduhMd = useCallback(() => {
    if (!konten) return;
    const namaBersih = paket.topik
      .replace(/[^\w\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
    const nama = `asesmen-diagnostik-${namaBersih || paket.id}.md`;
    const blob = new Blob([konten], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [konten, paket.topik, paket.id]);

  const salin = useCallback(async () => {
    if (!konten) return;
    try {
      await navigator.clipboard.writeText(konten);
      setDisalin(true);
      window.setTimeout(() => setDisalin(false), 2500);
    } catch {
      // FRIENDLY: fallback untuk browser tanpa izin clipboard — textarea sementara
      const area = document.createElement('textarea');
      area.value = konten;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        setDisalin(true);
        window.setTimeout(() => setDisalin(false), 2500);
      } catch {
        /* abaikan — biarkan pengguna menyalin manual */
      }
      area.remove();
    }
  }, [konten]);

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Asesmen Diagnostik 5 Menit">
      <div className="modal-box max-w-3xl rounded-3xl ux-pop-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span aria-hidden="true">🧭</span> Asesmen Diagnostik 5 Menit
            </h3>
            <p className="text-xs opacity-70 mt-1">
              {paket.mataPelajaran} · {paket.tingkat} ({paket.fase}) · “{paket.topik}”
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle shrink-0"
            onClick={onClose}
            disabled={memuat}
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Area konten */}
        {!konten && !memuat && !galat && (
          <div className="mt-4 flex flex-col items-center text-center gap-3 py-6">
            <Maskot size={88} />
            <p className="text-sm max-w-md">
              Belum mulai kelas tapi mau tahu murid sudah siap atau belum?
              Owi bantu racikkan <strong>3–5 pertanyaan diagnostik kilat</strong>:
              cek konsep prasyarat + pemantik minat, lengkap dengan
              <strong> panduan fasilitasi cepat</strong> — semua muat dalam 5 menit pertama! 🦉
            </p>
            <button type="button" className="btn btn-primary" onClick={buatPertanyaan}>
              ✨ Buatkan pertanyaan
            </button>
          </div>
        )}

        {memuat && (
          <div
            className="mt-4 flex flex-col items-center text-center gap-3 py-10"
            aria-busy="true"
            aria-live="polite"
          >
            <Maskot size={88} />
            <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Owi sedang meracik pertanyaan… 🦉</p>
            <p className="text-xs opacity-60">Menghubungkan topik dengan konsep prasyarat murid…</p>
          </div>
        )}

        {galat && (
          <div className="mt-4 alert alert-error" role="alert">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Ups, racikan Owi gagal 😅</p>
              <p className="text-xs">{galat}</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline ml-auto"
              onClick={buatPertanyaan}
              disabled={memuat}
            >
              Coba lagi
            </button>
          </div>
        )}

        {konten && !memuat && (
          <div className="mt-4">
            <div className="rounded-2xl bg-base-200/60 p-4 md:p-5 max-h-[55vh] overflow-y-auto">
              {renderMarkdownSederhana(konten)}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {sudahGenerate && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={buatPertanyaan}>
                  ✨ Buatkan versi lain
                </button>
              )}
              <span className="flex-1" />
              <button type="button" className="btn btn-outline btn-sm" onClick={salin}>
                {disalin ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success" /> Tersalin!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="w-4 h-4" /> 📋 Salin
                  </>
                )}
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={unduhMd}>
                <Download className="w-4 h-4" /> ⬇️ Unduh .md
              </button>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={memuat}>
            Tutup
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={() => !memuat && onClose()} />
    </div>
  );
};

export default DiagnostikModal;
