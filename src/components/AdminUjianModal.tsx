/**
 * AdminUjianModal.tsx — F2-3 "Paket admin ujian".
 *
 * Modal form pengisian data administrasi ujian (daftar siswa, hari/tanggal,
 * pengawas, mapel, kelas). Menghasilkan 3 dokumen markdown siap cetak:
 * Berita Acara, Daftar Hadir, dan Kartu Hasil Ujian.
 *
 * Ekspor .docx dilakukan pemanggil lewat prop onUnduh (koordinator/integrasi).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { X, Users, Download, ClipboardList } from 'lucide-react';
import {
  parseDaftarSiswa,
  susunBeritaAcara,
  susunDaftarHadir,
  susunKartuHasil,
  type DataAdminUjian,
} from '../utils/adminUjian.ts';
import type { KopPengesahan } from '@/shared/kopPengesahan.ts';

export interface DokumenUnduhan {
  judul: string;
  markdown: string;
}

interface AdminUjianModalProps {
  terbuka: boolean;
  kop: KopPengesahan;
  mapelAwal?: string;
  kelasAwal?: string;
  onBatal: () => void;
  onUnduh: (docs: DokumenUnduhan[]) => void;
}

const inputCls =
  'w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--apple-blue)]/40';

export const AdminUjianModal: React.FC<AdminUjianModalProps> = ({
  terbuka,
  kop,
  mapelAwal,
  kelasAwal,
  onBatal,
  onUnduh,
}) => {
  const [daftarTeks, setDaftarTeks] = useState('');
  const [hariTanggal, setHariTanggal] = useState('');
  const [pengawas, setPengawas] = useState('');
  const [mapel, setMapel] = useState('');
  const [kelas, setKelas] = useState('');

  // Isi awal mapel/kelas setiap kali modal dibuka (mis. dari paket soal aktif).
  useEffect(() => {
    if (terbuka) {
      setMapel(mapelAwal ?? '');
      setKelas(kelasAwal ?? '');
    }
  }, [terbuka, mapelAwal, kelasAwal]);

  const siswa = useMemo(() => parseDaftarSiswa(daftarTeks), [daftarTeks]);
  const valid = siswa.length > 0 && hariTanggal.trim().length > 0;

  if (!terbuka) return null;

  const handleUnduh = () => {
    if (!valid) return;
    const d: DataAdminUjian = {
      daftarSiswa: siswa,
      hariTanggal: hariTanggal.trim(),
      pengawas: pengawas.trim(),
      mapel: mapel.trim(),
      kelas: kelas.trim(),
    };
    onUnduh([
      { judul: 'Berita_Acara_Ujian', markdown: susunBeritaAcara(d, kop) },
      { judul: 'Daftar_Hadir_Ujian', markdown: susunDaftarHadir(d, kop) },
      { judul: 'Kartu_Hasil_Ujian', markdown: susunKartuHasil(d, kop) },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="apple-card max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 relative shrink-0 border-b border-black/10 dark:border-white/10">
          <button
            onClick={onBatal}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="apple-eyebrow">Administrasi ujian</p>
          <h2 className="text-[20px] font-bold tracking-tight mt-0.5 pr-10 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Paket Admin Ujian
          </h2>
          <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
            Berita acara, daftar hadir, dan kartu hasil — siap diunduh sebagai 3 dokumen.
          </p>
        </div>

        {/* Form */}
        <div className="p-5 overflow-y-auto space-y-4 text-[14px]">
          <div>
            <label className="font-semibold block mb-1.5">Daftar siswa</label>
            <textarea
              value={daftarTeks}
              onChange={(e) => setDaftarTeks(e.target.value)}
              rows={6}
              placeholder={'Satu nama per baris.\nContoh:\nAhmad Fauzi - 12345\nSiti Aminah | 12346\nBudi Santoso'}
              className={`${inputCls} font-mono resize-y`}
            />
            <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                <b>{siswa.length} siswa terbaca</b>
                {' '}— format opsional: "Nama - NIS" atau "Nama | NIS".
              </span>
            </p>
          </div>

          <div>
            <label className="font-semibold block mb-1.5">
              Hari / tanggal <span className="text-red-500">*</span>
            </label>
            <input
              value={hariTanggal}
              onChange={(e) => setHariTanggal(e.target.value)}
              placeholder='Contoh: Senin, 20 Oktober 2026'
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1.5">Pengawas</label>
              <input
                value={pengawas}
                onChange={(e) => setPengawas(e.target.value)}
                placeholder="Nama pengawas ujian"
                className={inputCls}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1.5">Mata pelajaran</label>
              <input
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                placeholder="Contoh: Informatika"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1.5">Kelas</label>
            <input
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Contoh: VIII-1"
              className={inputCls}
            />
          </div>

          {!valid && (
            <p className="text-[12.5px] text-amber-600 dark:text-amber-400">
              Isi minimal 1 nama siswa dan hari/tanggal untuk mengunduh dokumen.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-end gap-2.5 shrink-0">
          <button
            onClick={onBatal}
            className="px-4 py-2 rounded-full text-sm font-medium border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleUnduh}
            disabled={!valid}
            className="btn-apple !min-h-[40px] px-5 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Unduh Semua (3 dokumen)
          </button>
        </div>
      </div>
    </div>
  );
};
