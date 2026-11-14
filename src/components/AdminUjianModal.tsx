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
import { Modal } from './ui/Modal';
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

const labelCls = 'mb-1.5 block text-[12px] font-medium text-[var(--ink-soft)]';

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
    <Modal label="Paket admin ujian" onClose={onBatal} boxClassName="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="relative shrink-0 border-b border-[var(--line)] px-5 py-4">
          <button
            onClick={onBatal}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
            Administrasi ujian
          </p>
          <h2 className="mt-1 flex items-center gap-2 pr-10 text-[16px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            <ClipboardList className="w-4 h-4 text-[var(--accent)]" />
            Paket admin ujian
          </h2>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            Berita acara, daftar hadir, dan kartu hasil — siap diunduh sebagai 3 dokumen.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3.5 overflow-y-auto p-5">
          <div>
            <label className={labelCls} htmlFor="admin-ujian-daftar">Daftar siswa</label>
            <textarea
              id="admin-ujian-daftar"
              value={daftarTeks}
              onChange={(e) => setDaftarTeks(e.target.value)}
              rows={6}
              placeholder={'Satu nama per baris.\nContoh:\nAhmad Fauzi - 12345\nSiti Aminah | 12346\nBudi Santoso'}
              className="apple-input resize-y font-mono !text-[12.5px]"
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--muted)]">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>
                <b className="text-[var(--ink-soft)]">{siswa.length} siswa terbaca</b>
                {' '}— format opsional: &quot;Nama - NIS&quot; atau &quot;Nama | NIS&quot;.
              </span>
            </p>
          </div>

          <div>
            <label className={labelCls} htmlFor="admin-ujian-tanggal">
              Hari / tanggal <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id="admin-ujian-tanggal"
              value={hariTanggal}
              onChange={(e) => setHariTanggal(e.target.value)}
              placeholder="Contoh: Senin, 20 Oktober 2026"
              className="apple-input"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="admin-ujian-pengawas">Pengawas</label>
              <input
                id="admin-ujian-pengawas"
                value={pengawas}
                onChange={(e) => setPengawas(e.target.value)}
                placeholder="Nama pengawas ujian"
                className="apple-input"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="admin-ujian-mapel">Mata pelajaran</label>
              <input
                id="admin-ujian-mapel"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                placeholder="Contoh: Informatika"
                className="apple-input"
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="admin-ujian-kelas">Kelas</label>
            <input
              id="admin-ujian-kelas"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Contoh: VIII-1"
              className="apple-input"
            />
          </div>

          {!valid && (
            <p className="rounded-lg border border-[var(--warn)]/30 bg-[var(--warn-soft)] px-3 py-2 text-[11.5px] text-[var(--warn)]">
              Isi minimal 1 nama siswa dan hari/tanggal untuk mengunduh dokumen.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action shrink-0 border-t border-[var(--line)] px-5 py-3.5">
          <button onClick={onBatal} className="btn-apple-secondary">
            Batal
          </button>
          <button onClick={handleUnduh} disabled={!valid} className="btn-apple">
            <Download className="w-4 h-4" />
            Unduh semua (3 dokumen)
          </button>
        </div>
    </Modal>
  );
};
