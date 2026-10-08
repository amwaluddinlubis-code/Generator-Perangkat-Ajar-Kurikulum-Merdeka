import React from 'react';
import {
  X,
  Layers,
  Target,
  Sparkles,
  Scale,
} from 'lucide-react';

interface CurriculumGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumGuideModal: React.FC<CurriculumGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="apple-card max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-5 relative shrink-0 border-b border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="apple-eyebrow">Pedoman resmi</p>
          <h2 className="text-[22px] font-bold tracking-tight mt-0.5 pr-10">
            Regulasi Kurikulum Merdeka
          </h2>
          <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">
            Permendikdasmen No. 13/2025
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-[13.5px] leading-relaxed">
          
          {/* Section 1: Permendikbudristek No 12/2024 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/5">
            <div className="flex items-center gap-2 font-semibold text-[15px] mb-2">
              <Scale className="w-5 h-5" />
              1. Permendikdasmen No. 13 Tahun 2025
            </div>
            <p className="text-[#424245] dark:text-[#c7c7cc] mb-3">
              Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 13 Tahun 2025 (perubahan atas Permendikbudristek No. 12/2024) menegaskan Kurikulum Merdeka sebagai <b>Kurikulum Nasional</b> untuk PAUD, Pendidikan Dasar, dan Pendidikan Menengah, dengan penguatan <b>pembelajaran mendalam</b> (berkesadaran, bermakna, menggembirakan).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px]">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <span className="font-semibold block mb-1">Struktur kurikulum</span>
                <ul className="list-disc pl-4 space-y-1 text-[#424245] dark:text-[#c7c7cc]">
                  <li><b>Intrakurikuler</b>: pembelajaran reguler berbasis capaian.</li>
                  <li><b>Kokurikuler</b>: projek penguatan Profil Lulusan 8 dimensi, terintegrasi dengan pembelajaran tematik/projek.</li>
                  <li><b>Ekstrakurikuler</b>: minat dan bakat peserta didik.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <span className="font-semibold block mb-1">Fase perkembangan</span>
                <ul className="list-disc pl-4 space-y-1 text-[#424245] dark:text-[#c7c7cc]">
                  <li><b>Fase A</b>: Kelas 1–2 SD</li>
                  <li><b>Fase B</b>: Kelas 3–4 SD</li>
                  <li><b>Fase C</b>: Kelas 5–6 SD</li>
                  <li><b>Fase D</b>: Kelas 7–9 SMP</li>
                  <li><b>Fase E</b>: Kelas 10 SMA/SMK</li>
                  <li><b>Fase F</b>: Kelas 11–12 SMA/SMK</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Komponen Modul Ajar (Panduan Pembelajaran dan Asesmen) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-[15px]">
              <Layers className="w-5 h-5" />
              2. Komponen Modul Ajar (Panduan Pembelajaran dan Asesmen)
            </div>
            <p className="text-[#424245] dark:text-[#c7c7cc]">
              Pendidik boleh memodifikasi modul ajar. Modul yang ideal memuat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5">
                <span className="font-semibold text-[12px] block mb-1.5">
                  I. Informasi umum
                </span>
                <ul className="text-[12.5px] space-y-1 text-[#424245] dark:text-[#c7c7cc]">
                  <li>• Identitas sekolah & guru</li>
                  <li>• Kompetensi awal</li>
                  <li>• Profil Lulusan (8 dimensi)</li>
                  <li>• Sarana & prasarana</li>
                  <li>• Target peserta didik</li>
                  <li>• Model (PBL/PjBL)</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5">
                <span className="font-semibold text-[12px] block mb-1.5">
                  II. Komponen inti
                </span>
                <ul className="text-[12.5px] space-y-1 text-[#424245] dark:text-[#c7c7cc]">
                  <li>• Capaian (CP)</li>
                  <li>• Tujuan (TP)</li>
                  <li>• Pemahaman bermakna</li>
                  <li>• Pertanyaan pemantik</li>
                  <li>• Kegiatan berdiferensiasi</li>
                  <li>• Asesmen & KKTP</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/5">
                <span className="font-semibold text-[12px] block mb-1.5">
                  III. Lampiran
                </span>
                <ul className="text-[12.5px] space-y-1 text-[#424245] dark:text-[#c7c7cc]">
                  <li>• LKPD</li>
                  <li>• Bahan bacaan</li>
                  <li>• Pengayaan & remedial</li>
                  <li>• Glosarium</li>
                  <li>• Daftar pustaka</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Prinsip Berdiferensiasi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/5">
            <div className="flex items-center gap-2 font-semibold text-[15px] mb-2">
              <Sparkles className="w-5 h-5" />
              3. Pembelajaran berdiferensiasi
            </div>
            <p className="text-[13px] mb-3">
              Perhatikan kebutuhan unik setiap murid:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12.5px]">
              <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <b className="block mb-0.5">Konten</b>
                Materi beragam bentuk: teks bergradasi, visual, video, objek nyata.
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <b className="block mb-0.5">Proses</b>
                Bimbingan bervariasi: kelompok mandiri vs terbimbing intensif.
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <b className="block mb-0.5">Produk</b>
                Bebas memilih laporan: infografis, presentasi, artikel, karya.
              </div>
            </div>
          </div>

          {/* Section 4: KKTP */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-[15px]">
              <Target className="w-5 h-5" />
              4. Penetapan KKTP
            </div>
            <p className="text-[#424245] dark:text-[#c7c7cc]">
              Tanpa KKM angka tunggal yang kaku — pilih satu dari 3 pendekatan resmi:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12.5px]">
              <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <b className="block mb-1">1. Deskripsi kriteria</b>
                Checklist tercapai / belum untuk tindak lanjut.
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <b className="block mb-1">2. Rubrik skala</b>
                4 tingkat: Baru Berkembang, Layak, Cakap, Mahir.
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                <b className="block mb-1">3. Interval nilai</b>
                0–60 remedial, 61–80 penguatan, 81–100 tuntas + pengayaan.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-apple !min-h-[40px]"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>
  );
};
