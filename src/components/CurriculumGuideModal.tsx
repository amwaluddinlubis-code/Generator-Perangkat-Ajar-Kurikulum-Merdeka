import React from 'react';
import { Modal } from './ui/Modal';
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

const sectionCls = 'rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4';
const cardCls = 'rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3';
const bodyCls = 'text-[12.5px] leading-relaxed text-[var(--ink-soft)]';

export const CurriculumGuideModal: React.FC<CurriculumGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <Modal label="Panduan regulasi kurikulum" onClose={onClose} boxClassName="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        
        {/* Header */}
        <div className="relative shrink-0 border-b border-[var(--line)] px-5 py-4">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Pedoman resmi</p>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)] mt-1 pr-10">
            Regulasi Kurikulum Merdeka
          </h2>
          <p className="text-[12px] text-[var(--muted)] mt-0.5">
            Permendikdasmen No. 13/2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto p-5 text-[13px]">
          
          {/* Section 1 */}
          <div className={sectionCls}>
            <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <Scale className="w-4 h-4 text-[var(--accent)]" />
              1. Permendikdasmen No. 13 Tahun 2025
            </div>
            <p className={`${bodyCls} mb-3`}>
              Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 13 Tahun 2025 (perubahan atas Permendikbudristek No. 12/2024) menegaskan Kurikulum Merdeka sebagai <b className="text-[var(--ink)]">Kurikulum Nasional</b> untuk PAUD, Pendidikan Dasar, dan Pendidikan Menengah, dengan penguatan <b className="text-[var(--ink)]">pembelajaran mendalam</b> (berkesadaran, bermakna, menggembirakan).
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className={cardCls}>
                <span className="mb-1 block text-[12px] font-semibold text-[var(--ink)]">Struktur kurikulum</span>
                <ul className={`list-disc space-y-1 pl-4 ${bodyCls}`}>
                  <li><b className="text-[var(--ink-soft)]">Intrakurikuler</b>: pembelajaran reguler berbasis capaian.</li>
                  <li><b className="text-[var(--ink-soft)]">Kokurikuler</b>: projek penguatan Profil Lulusan 8 dimensi, terintegrasi dengan pembelajaran tematik/projek.</li>
                  <li><b className="text-[var(--ink-soft)]">Ekstrakurikuler</b>: minat dan bakat peserta didik.</li>
                </ul>
              </div>

              <div className={cardCls}>
                <span className="mb-1 block text-[12px] font-semibold text-[var(--ink)]">Fase perkembangan</span>
                <ul className={`list-disc space-y-1 pl-4 ${bodyCls}`}>
                  <li><b className="text-[var(--ink-soft)]">Fase A</b>: Kelas 1–2 SD</li>
                  <li><b className="text-[var(--ink-soft)]">Fase B</b>: Kelas 3–4 SD</li>
                  <li><b className="text-[var(--ink-soft)]">Fase C</b>: Kelas 5–6 SD</li>
                  <li><b className="text-[var(--ink-soft)]">Fase D</b>: Kelas 7–9 SMP</li>
                  <li><b className="text-[var(--ink-soft)]">Fase E</b>: Kelas 10 SMA/SMK</li>
                  <li><b className="text-[var(--ink-soft)]">Fase F</b>: Kelas 11–12 SMA/SMK</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              2. Komponen modul ajar
            </div>
            <p className={bodyCls}>
              Pendidik boleh memodifikasi modul ajar. Modul yang ideal memuat:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className={sectionCls}>
                <span className="mb-1.5 block text-[12px] font-semibold text-[var(--ink)]">
                  I. Informasi umum
                </span>
                <ul className={`space-y-1 text-[11.5px] ${bodyCls}`}>
                  <li>Identitas sekolah &amp; guru</li>
                  <li>Kompetensi awal</li>
                  <li>Profil Lulusan (8 dimensi)</li>
                  <li>Sarana &amp; prasarana</li>
                  <li>Target peserta didik</li>
                  <li>Model (PBL/PjBL)</li>
                </ul>
              </div>

              <div className={sectionCls}>
                <span className="mb-1.5 block text-[12px] font-semibold text-[var(--ink)]">
                  II. Komponen inti
                </span>
                <ul className={`space-y-1 text-[11.5px] ${bodyCls}`}>
                  <li>Capaian (CP)</li>
                  <li>Tujuan (TP)</li>
                  <li>Pemahaman bermakna</li>
                  <li>Pertanyaan pemantik</li>
                  <li>Kegiatan berdiferensiasi</li>
                  <li>Asesmen &amp; KKTP</li>
                </ul>
              </div>

              <div className={sectionCls}>
                <span className="mb-1.5 block text-[12px] font-semibold text-[var(--ink)]">
                  III. Lampiran
                </span>
                <ul className={`space-y-1 text-[11.5px] ${bodyCls}`}>
                  <li>LKPD</li>
                  <li>Bahan bacaan</li>
                  <li>Pengayaan &amp; remedial</li>
                  <li>Glosarium</li>
                  <li>Daftar pustaka</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className={sectionCls}>
            <div className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              3. Pembelajaran berdiferensiasi
            </div>
            <p className={`${bodyCls} mb-2.5`}>
              Perhatikan kebutuhan unik setiap murid:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className={cardCls}>
                <b className="mb-0.5 block text-[12px] text-[var(--ink)]">Konten</b>
                <span className={bodyCls}>Materi beragam bentuk: teks bergradasi, visual, video, objek nyata.</span>
              </div>
              <div className={cardCls}>
                <b className="mb-0.5 block text-[12px] text-[var(--ink)]">Proses</b>
                <span className={bodyCls}>Bimbingan bervariasi: kelompok mandiri vs terbimbing intensif.</span>
              </div>
              <div className={cardCls}>
                <b className="mb-0.5 block text-[12px] text-[var(--ink)]">Produk</b>
                <span className={bodyCls}>Bebas memilih laporan: infografis, presentasi, artikel, karya.</span>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <Target className="w-4 h-4 text-[var(--accent)]" />
              4. Penetapan KKTP
            </div>
            <p className={bodyCls}>
              Tanpa KKM angka tunggal yang kaku — pilih satu dari 3 pendekatan resmi:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className={cardCls}>
                <b className="mb-1 block text-[12px] text-[var(--ink)]">1. Deskripsi kriteria</b>
                <span className={bodyCls}>Checklist tercapai / belum untuk tindak lanjut.</span>
              </div>
              <div className={cardCls}>
                <b className="mb-1 block text-[12px] text-[var(--ink)]">2. Rubrik skala</b>
                <span className={bodyCls}>4 tingkat: Baru Berkembang, Layak, Cakap, Mahir.</span>
              </div>
              <div className={cardCls}>
                <b className="mb-1 block text-[12px] text-[var(--ink)]">3. Interval nilai</b>
                <span className={bodyCls}>0–60 remedial, 61–80 penguatan, 81–100 tuntas + pengayaan.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-action shrink-0 border-t border-[var(--line)] px-5 py-3.5">
          <button onClick={onClose} className="btn-apple">
            Mengerti
          </button>
        </div>
    </Modal>
  );
};
