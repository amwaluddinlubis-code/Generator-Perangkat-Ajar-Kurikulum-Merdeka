import React from 'react';
import { 
  FileCheck, 
  X, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Target, 
  Sparkles,
  Scale,
  Award
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              Pedoman Resmi Kemendikbudristek RI
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Ringkasan Regulasi Kurikulum Merdeka Terbaru
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Permendikbudristek No. 12 Tahun 2024 & Panduan Pembelajaran dan Asesmen (PPA 2024)
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
          
          {/* Section 1: Permendikbudristek No 12/2024 */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-base mb-2">
              <Scale className="w-5 h-5 text-blue-600" />
              1. Permendikbudristek No. 12 Tahun 2024
            </div>
            <p className="text-slate-600 mb-3">
              Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 12 Tahun 2024 secara resmi menetapkan Kurikulum Merdeka sebagai <b>Kurikulum Nasional</b> untuk jenjang PAUD, Pendidikan Dasar, dan Pendidikan Menengah di seluruh Indonesia.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Struktur Kurikulum:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><b>Intrakurikuler</b>: Pembelajaran mata pelajaran reguler berbasis capaian pembelajaran.</li>
                  <li><b>Kokurikuler (P5)</b>: Projek Penguatan Profil Pelajar Pancasila (20-30% jam pelajaran).</li>
                  <li><b>Ekstrakurikuler</b>: Pengembangan minat dan bakat peserta didik.</li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Fase Perkembangan Peserta Didik:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><b>Fase A</b>: Kelas 1 - 2 SD</li>
                  <li><b>Fase B</b>: Kelas 3 - 4 SD</li>
                  <li><b>Fase C</b>: Kelas 5 - 6 SD</li>
                  <li><b>Fase D</b>: Kelas 7 - 9 SMP</li>
                  <li><b>Fase E</b>: Kelas 10 SMA/SMK</li>
                  <li><b>Fase F</b>: Kelas 11 - 12 SMA/SMK</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Komponen Modul Ajar (PPA 2024) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
              <Layers className="w-5 h-5 text-indigo-600" />
              2. Komponen Modul Ajar Standar PPA 2024
            </div>
            <p className="text-slate-600">
              Pendidik memiliki keleluasaan untuk memodifikasi modul ajar. Namun, modul ajar yang ideal dan komprehensif memuat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                <span className="font-bold text-blue-900 text-xs uppercase block mb-1.5">
                  I. Informasi Umum
                </span>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li>• Identitas Sekolah & Guru</li>
                  <li>• Kompetensi Awal</li>
                  <li>• Profil Pelajar Pancasila</li>
                  <li>• Sarana & Prasarana</li>
                  <li>• Target Peserta Didik</li>
                  <li>• Model Pembelajaran (PBL/PjBL)</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <span className="font-bold text-indigo-900 text-xs uppercase block mb-1.5">
                  II. Komponen Inti
                </span>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li>• Capaian Pembelajaran (CP)</li>
                  <li>• Tujuan Pembelajaran (TP)</li>
                  <li>• Pemahaman Bermakna</li>
                  <li>• Pertanyaan Pemantik</li>
                  <li>• Kegiatan Berdiferensiasi</li>
                  <li>• Asesmen & Rubrik KKTP</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50">
                <span className="font-bold text-sky-900 text-xs uppercase block mb-1.5">
                  III. Lampiran
                </span>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li>• Lembar Kerja Peserta Didik (LKPD)</li>
                  <li>• Bahan Bacaan Guru & Siswa</li>
                  <li>• Pengayaan & Remedial</li>
                  <li>• Glosarium Istilah</li>
                  <li>• Daftar Pustaka Kemendikbud</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Prinsip Berdiferensiasi */}
          <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              3. Prinsip Pembelajaran Berdiferensiasi
            </div>
            <p className="text-xs sm:text-sm text-amber-950 mb-3">
              Kurikulum Merdeka mewajibkan guru memperhatikan kebutuhan unik peserta didik:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <b className="text-amber-900 block mb-0.5">Diferensiasi Konten:</b>
                Menyajikan materi ajar dalam berbagai bentuk (teks bacaan bergradasi, diagram visual, video, atau objek riil).
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <b className="text-amber-900 block mb-0.5">Diferensiasi Proses:</b>
                Variasi bimbingan (scaffolding), kelompok diskusi kecil mandiri vs kelompok terbimbing intensif.
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <b className="text-amber-900 block mb-0.5">Diferensiasi Produk:</b>
                Siswa bebas memilih bentuk laporan (infografis, presentasi lisan, artikel tulis, karya tangan).
              </div>
            </div>
          </div>

          {/* Section 4: Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
              <Target className="w-5 h-5 text-blue-600" />
              4. Penetapan KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)
            </div>
            <p className="text-slate-600">
              Dalam Kurikulum Merdeka, tidak lagi menggunakan KKM angka tunggal yang kaku. Guru menentukan ketercapaian tujuan melalui salah satu dari 3 pendekatan resmi:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <b className="text-slate-900 block mb-1">1. Deskripsi Kriteria</b>
                Menggunakan daftar kriteria (checklist) tercapai / belum tercapai untuk menentukan tindak lanjut.
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <b className="text-slate-900 block mb-1">2. Rubrik Skala</b>
                Menggunakan skala 4 tingkat (Baru Berkembang, Layak, Cakap, Mahir) dengan deskriptor operasional.
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <b className="text-slate-900 block mb-1">3. Interval Nilai</b>
                Misal: 0-60 belum mencapai (remedial total), 61-80 mencapai (remedial bagian kecil), 81-100 tuntas (pengayaan).
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Tutup & Mengerti
          </button>
        </div>

      </div>
    </div>
  );
};
