import React, { useState, useMemo } from 'react';
import { Jenjang } from '../types';
import { 
  P5_THEMATIC_TEMPLATES, 
  P5ThematicTemplate, 
  SISTEM_WAKTU_P5, 
  BENTUK_AKSI_P5 
} from '../data/p5Templates';
import { TEMA_P5, DIMENSI_PROFIL_LULUSAN } from '../data/curriculumData';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Users, 
  ArrowRight, 
  Search, 
  SlidersHorizontal,
  Compass,
  Award,
  Calendar,
  Building,
  Target
} from 'lucide-react';

interface P5ThematicGeneratorSectionProps {
  jenjang: Jenjang;
  fase: string;
  tingkat: string;
  temaP5: string;
  setTemaP5: (tema: string) => void;
  topik: string;
  setTopik: (topik: string) => void;
  isuKontekstual: string;
  setIsuKontekstual: (isu: string) => void;
  bentukAksi: string;
  setBentukAksi: (aksi: string) => void;
  sistemWaktu: string;
  setSistemWaktu: (sistem: string) => void;
  alokasiWaktu: string;
  setAlokasiWaktu: (waktu: string) => void;
  mitraProjek: string;
  setMitraProjek: (mitra: string) => void;
  dimensiProfilLulusan: string[];
  toggleDimensiProfil: (dim: string) => void;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  topikError?: string;
}

export const P5ThematicGeneratorSection: React.FC<P5ThematicGeneratorSectionProps> = ({
  jenjang,
  fase,
  tingkat,
  temaP5,
  setTemaP5,
  topik,
  setTopik,
  isuKontekstual,
  setIsuKontekstual,
  bentukAksi,
  setBentukAksi,
  sistemWaktu,
  setSistemWaktu,
  alokasiWaktu,
  setAlokasiWaktu,
  mitraProjek,
  setMitraProjek,
  dimensiProfilLulusan,
  toggleDimensiProfil,
  selectedTemplateId,
  setSelectedTemplateId,
  topikError
}) => {
  const [filterTema, setFilterTema] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCatalog, setShowCatalog] = useState<boolean>(true);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  // Filter templates based on Jenjang, selected Tema filter, and Search
  const filteredTemplates = useMemo(() => {
    return P5_THEMATIC_TEMPLATES.filter((tpl) => {
      // Jenjang match (if template supports this jenjang)
      const matchJenjang = tpl.jenjang.includes(jenjang);
      
      // Tema filter
      const matchTema = filterTema === 'SEMUA' || tpl.tema === filterTema;

      // Search keyword
      const q = searchTerm.trim().toLowerCase();
      const matchSearch = !q || 
        tpl.judul.toLowerCase().includes(q) || 
        tpl.deskripsi.toLowerCase().includes(q) ||
        tpl.isuKontekstual.toLowerCase().includes(q) ||
        tpl.tema.toLowerCase().includes(q);

      return matchJenjang && matchTema && matchSearch;
    });
  }, [jenjang, filterTema, searchTerm]);

  // Apply template to form state
  const handleApplyTemplate = (tpl: P5ThematicTemplate) => {
    setSelectedTemplateId(tpl.id);
    setTemaP5(tpl.tema);
    setTopik(tpl.judul);
    setIsuKontekstual(tpl.isuKontekstual);
    setBentukAksi(tpl.bentukAksi);
    setSistemWaktu(tpl.sistemWaktu);
    setAlokasiWaktu(tpl.alokasiJP);
    setMitraProjek(tpl.mitraProjek);

    // Sync Dimensions
    if (tpl.dimensiUtama && tpl.dimensiUtama.length > 0) {
      // Toggle to ensure all tpl.dimensiUtama are selected
      tpl.dimensiUtama.forEach((d) => {
        if (!dimensiProfilLulusan.includes(d)) {
          toggleDimensiProfil(d);
        }
      });
    }

    // Scroll slightly to let teacher review
    setExpandedTemplateId(tpl.id);
  };

  const activeTemplate = useMemo(() => {
    return P5_THEMATIC_TEMPLATES.find((t) => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId]);

  return (
    <div className="space-y-6">
      {/* Header Banner Khusus P5 */}
      <div className="rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-linear-to-r from-purple-50 via-indigo-50/50 to-pink-50/40 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-pink-950/10 p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                  Kokurikuler Lintas Disiplin Ilmu
                </span>
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                  {jenjang} · {tingkat} ({fase})
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                Generator Modul Projek Penguatan Profil Pelajar Pancasila (P5)
              </h3>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Dirancang khusus sesuai panduan Kemendikdasmen: berbasis 8 tema resmi, alur 4 tahap nyata, rubrik perkembangan holistik, dan gelar karya kontekstual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="btn btn-sm btn-outline border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 hover:bg-purple-600 hover:text-white shrink-0 gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            {showCatalog ? 'Sembunyikan Katalog Template' : 'Buka Katalog Template Tematik'}
          </button>
        </div>

        {/* Selected Template Badge */}
        {activeTemplate && (
          <div className="mt-4 pt-4 border-t border-purple-200/60 dark:border-purple-800/40 flex flex-wrap items-center justify-between gap-2.5 text-xs text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Template aktif: <strong>{activeTemplate.judul}</strong> (Tema: {activeTemplate.tema})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTemplateId(null);
                setTopik('');
                setIsuKontekstual('');
              }}
              className="text-purple-700 dark:text-purple-300 hover:underline font-semibold text-[11.5px]"
            >
              Reset ke Kustom Mandiri
            </button>
          </div>
        )}
      </div>

      {/* Katalog Template Tematik P5 */}
      {showCatalog && (
        <div className="apple-card p-5 sm:p-6 border border-purple-100 dark:border-purple-900/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Pilihan Template Tematik Siap Pakai ({jenjang})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih salah satu template di bawah untuk otomatis mengisi topik, isu nyata, alur tahap, dan dimensi sasaran.
              </p>
            </div>

            {/* Pencarian Template */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ide projek / tema…"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-white/5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filter Baris Tema P5 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
            <button
              type="button"
              onClick={() => setFilterTema('SEMUA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterTema === 'SEMUA'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Semua Tema ({P5_THEMATIC_TEMPLATES.filter(t => t.jenjang.includes(jenjang)).length})
            </button>
            {TEMA_P5.map((t) => {
              const count = P5_THEMATIC_TEMPLATES.filter(tpl => tpl.jenjang.includes(jenjang) && tpl.tema === t).length;
              if (count === 0) return null;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterTema(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    filterTema === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>

          {/* Daftar Kartu Template Tematik */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-slate-500 text-xs">
              Tidak ada template tematik yang sesuai dengan filter. Anda dapat mengetik judul projek kustom di bawah.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const isExpanded = expandedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`rounded-2xl border transition-all p-4 text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-purple-300'
                    }`}
                  >
                    <div>
                      {/* Badge Tema & Alokasi */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                          {tpl.tema}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tpl.alokasiJP}
                        </span>
                      </div>

                      {/* Judul & Deskripsi */}
                      <h5 className="font-bold text-[14.5px] text-slate-900 dark:text-white leading-snug">
                        {tpl.judul}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.deskripsi}
                      </p>

                      {/* Isu Kontekstual */}
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[11.5px] text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 block mb-0.5">
                          Isu Kontekstual:
                        </span>
                        {tpl.isuKontekstual}
                      </div>

                      {/* Rincian 4 Tahap Aktivitas (Jika di-expand) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 space-y-2 text-[11.5px]">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">1. Pengenalan: </span>
                            <span className="text-slate-600 dark:text-slate-400">{tpl.ringkasanAktivitas.pengenalan}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">2. Kontekstualisasi: </span>
                            <span className="text-slate-600 dark:text-slate-400">{tpl.ringkasanAktivitas.kontekstualisasi}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">3. Aksi Nyata: </span>
                            <span className="text-slate-600 dark:text-slate-400">{tpl.ringkasanAktivitas.aksi}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">4. Refleksi & Gelar Karya: </span>
                            <span className="text-slate-600 dark:text-slate-400">{tpl.ringkasanAktivitas.refleksi}</span>
                          </div>
                          <div className="pt-1 text-slate-500">
                            <strong>Luaran:</strong> {tpl.bentukAksi}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Aksi Bawah */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                        className="text-[11.5px] text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                      >
                        {isExpanded ? 'Tutup Rincian' : 'Lihat Alur 4 Tahap'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className={`btn btn-xs rounded-xl font-bold gap-1 ${
                          isSelected
                            ? 'btn-success text-white'
                            : 'btn-primary bg-purple-600 hover:bg-purple-700 border-purple-600 text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Diterapkan
                          </>
                        ) : (
                          <>
                            Gunakan Template
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form Konfigurasi Khusus Parameter Projek P5 */}
      <div className="apple-card p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Detail Konfigurasi Modul Projek P5
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sesuaikan tema, rumusan judul, isu kontekstual, bentuk aksi nyata, dan alokasi waktu projek
            </p>
          </div>
        </div>

        {/* 1. Pemilihan Tema Resmi & Judul Projek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Tema Resmi Projek P5 <span className="text-red-500">*</span>
            </label>
            <select
              value={temaP5}
              onChange={(e) => setTemaP5(e.target.value)}
              className="apple-input font-medium"
            >
              {TEMA_P5.map((t) => (
                <option key={t} value={t}>
                  Tema: {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Judul / Topik Projek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Jejak Hijau: Mengolah Sampah Organik Menjadi Kompos"
              className={`apple-input ${topikError ? '!border-red-500' : ''}`}
            />
            {topikError && (
              <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
                {topikError}
              </p>
            )}
          </div>
        </div>

        {/* 2. Isu Kontekstual & Bentuk Aksi Nyata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Latar Belakang Isu Kontekstual Sekolah
            </label>
            <input
              type="text"
              value={isuKontekstual}
              onChange={(e) => setIsuKontekstual(e.target.value)}
              placeholder="Contoh: Sampah kemasan plastik di kantin sekolah yang menumpuk tanpa pemilahan..."
              className="apple-input"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Isu nyata di lingkungan sekolah/daerah yang akan diinvestigasi oleh murid.
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Bentuk Aksi Nyata / Gelar Karya
            </label>
            <select
              value={bentukAksi}
              onChange={(e) => setBentukAksi(e.target.value)}
              className="apple-input font-medium"
            >
              {BENTUK_AKSI_P5.map((aksi) => (
                <option key={aksi} value={aksi}>
                  {aksi}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Bentuk perayaan belajar / produk nyata yang dipamerkan di akhir projek.
            </p>
          </div>
        </div>

        {/* 3. Sistem Waktu & Alokasi Total JP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Model Sistem Pelaksanaan Waktu
            </label>
            <select
              value={sistemWaktu}
              onChange={(e) => setSistemWaktu(e.target.value)}
              className="apple-input font-medium"
            >
              {SISTEM_WAKTU_P5.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
              Total Alokasi Waktu Projek
            </label>
            <input
              type="text"
              value={alokasiWaktu}
              onChange={(e) => setAlokasiWaktu(e.target.value)}
              placeholder="36 JP"
              className="apple-input font-semibold"
            />
            <div className="flex gap-1.5 mt-1">
              {['24 JP', '36 JP', '48 JP', '72 JP'].map((jp) => (
                <button
                  key={jp}
                  type="button"
                  onClick={() => setAlokasiWaktu(jp)}
                  className="text-[10.5px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  {jp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Target Mitra Kolaborasi */}
        <div>
          <label className="block text-[13px] font-semibold mb-1.5 text-slate-800 dark:text-slate-200">
            Narasumber / Mitra Kolaborasi Luar Sekolah (Opsional)
          </label>
          <input
            type="text"
            value={mitraProjek}
            onChange={(e) => setMitraProjek(e.target.value)}
            placeholder="Contoh: Dinas Lingkungan Hidup, Pengelola Bank Sampah, Orang Tua Murid, Puskesmas"
            className="apple-input"
          />
        </div>

        {/* 5. Pemilihan Dimensi Profil Lulusan / Profil Pelajar */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-[13.5px] font-bold text-slate-900 dark:text-white">
                Dimensi Profil Sasaran Projek
              </label>
              <p className="text-[11.5px] text-slate-500">
                Pilih dimensi utama yang menjadi fokus asesmen dan perkembangan murid pada projek ini
              </p>
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">
              {dimensiProfilLulusan.length} Dimensi Terpilih
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {DIMENSI_PROFIL_LULUSAN.map((dim) => {
              const isChecked = dimensiProfilLulusan.includes(dim);
              return (
                <button
                  key={dim}
                  type="button"
                  onClick={() => toggleDimensiProfil(dim)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                    isChecked
                      ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                  }`}
                >
                  <span className="truncate pr-1">{dim}</span>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
