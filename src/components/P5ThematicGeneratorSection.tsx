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
    <div className="space-y-4">
      {/* Header Banner Khusus P5 */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="ds-badge ds-badge-accent">Kokurikuler lintas disiplin</span>
                <span className="text-[11.5px] font-medium text-[var(--muted)]">
                  {jenjang} · {tingkat} ({fase})
                </span>
              </div>
              <h3 className="text-[16px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)] mt-1">
                Generator Modul Projek P5
              </h3>
              <p className="text-[12.5px] text-[var(--ink-soft)] mt-1 max-w-2xl leading-relaxed">
                Dirancang sesuai panduan Kemendikdasmen: berbasis 8 tema resmi, alur 4 tahap nyata, rubrik perkembangan holistik, dan gelar karya kontekstual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="btn-apple-secondary shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            {showCatalog ? 'Sembunyikan katalog' : 'Buka katalog template'}
          </button>
        </div>

        {/* Selected Template Badge */}
        {activeTemplate && (
          <div className="mt-3 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--ink-soft)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
              <span>
                Template aktif: <strong className="text-[var(--ink)]">{activeTemplate.judul}</strong> · tema {activeTemplate.tema}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTemplateId(null);
                setTopik('');
                setIsuKontekstual('');
              }}
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Reset ke kustom mandiri
            </button>
          </div>
        )}
      </div>

      {/* Katalog Template Tematik P5 */}
      {showCatalog && (
        <div className="apple-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="font-semibold text-[13.5px] text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                Template tematik siap pakai ({jenjang})
              </h4>
              <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                Pilih satu template untuk mengisi topik, isu nyata, alur tahap, dan dimensi sasaran.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari ide projek / tema…"
                className="apple-input !pl-9 !py-1.5 !text-[12px]"
                aria-label="Cari template projek"
              />
            </div>
          </div>

          {/* Filter Baris Tema P5 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
            <button
              type="button"
              onClick={() => setFilterTema('SEMUA')}
              className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                filterTema === 'SEMUA'
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)]/35 text-[var(--accent-ink)]'
                  : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]'
              }`}
            >
              Semua tema ({P5_THEMATIC_TEMPLATES.filter(t => t.jenjang.includes(jenjang)).length})
            </button>
            {TEMA_P5.map((t) => {
              const count = P5_THEMATIC_TEMPLATES.filter(tpl => tpl.jenjang.includes(jenjang) && tpl.tema === t).length;
              if (count === 0) return null;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterTema(t)}
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    filterTema === t
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)]/35 text-[var(--accent-ink)]'
                      : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>

          {/* Daftar Kartu Template Tematik */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 rounded-lg border border-dashed border-[var(--line-strong)] text-[var(--muted)] text-[12px]">
              Tidak ada template yang sesuai filter. Anda dapat mengetik judul projek kustom di bawah.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                const isExpanded = expandedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`rounded-xl border transition-colors p-3.5 text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-[var(--accent)]/45 bg-[var(--accent-soft)]'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]'
                    }`}
                  >
                    <div>
                      {/* Badge Tema & Alokasi */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="ds-badge ds-badge-accent !text-[10.5px]">
                          {tpl.tema}
                        </span>
                        <span className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tpl.alokasiJP}
                        </span>
                      </div>

                      {/* Judul & Deskripsi */}
                      <h5 className="font-semibold text-[13px] text-[var(--ink)] leading-snug">
                        {tpl.judul}
                      </h5>
                      <p className="text-[11.5px] text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                        {tpl.deskripsi}
                      </p>

                      {/* Isu Kontekstual */}
                      <div className="mt-2 p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[11px] text-[var(--ink-soft)]">
                        <span className="font-semibold text-[var(--ink)] block mb-0.5">
                          Isu kontekstual
                        </span>
                        {tpl.isuKontekstual}
                      </div>

                      {/* Rincian 4 Tahap Aktivitas (Jika di-expand) */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--line)] space-y-1.5 text-[11px]">
                          <div>
                            <span className="font-semibold text-[var(--ink)]">1. Pengenalan: </span>
                            <span className="text-[var(--muted)]">{tpl.ringkasanAktivitas.pengenalan}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--ink)]">2. Kontekstualisasi: </span>
                            <span className="text-[var(--muted)]">{tpl.ringkasanAktivitas.kontekstualisasi}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--ink)]">3. Aksi nyata: </span>
                            <span className="text-[var(--muted)]">{tpl.ringkasanAktivitas.aksi}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--ink)]">4. Refleksi & gelar karya: </span>
                            <span className="text-[var(--muted)]">{tpl.ringkasanAktivitas.refleksi}</span>
                          </div>
                          <div className="pt-1 text-[var(--muted)]">
                            <strong className="text-[var(--ink-soft)]">Luaran:</strong> {tpl.bentukAksi}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Aksi Bawah */}
                    <div className="mt-3 pt-2.5 border-t border-[var(--line)] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                        className="text-[11px] text-[var(--accent)] font-medium hover:underline"
                      >
                        {isExpanded ? 'Tutup rincian' : 'Lihat alur 4 tahap'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer border ${
                          isSelected
                            ? 'border-[var(--ok)]/35 bg-[var(--ok-soft)] text-[var(--ok)]'
                            : 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Diterapkan
                          </>
                        ) : (
                          <>
                            Gunakan template
                            <ArrowRight className="w-3 h-3" />
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
      <div className="apple-card p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[var(--accent)] text-white">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-[13.5px] text-[var(--ink)]">
              Detail konfigurasi modul projek P5
            </h4>
            <p className="text-[11.5px] text-[var(--muted)]">
              Sesuaikan tema, judul, isu kontekstual, bentuk aksi nyata, dan alokasi waktu projek
            </p>
          </div>
        </div>

        {/* 1. Pemilihan Tema Resmi & Judul Projek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Tema resmi projek P5 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              value={temaP5}
              onChange={(e) => setTemaP5(e.target.value)}
              className="apple-input"
            >
              {TEMA_P5.map((t) => (
                <option key={t} value={t}>
                  Tema: {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Judul / topik projek <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Jejak Hijau: Mengolah Sampah Organik Menjadi Kompos"
              className={`apple-input ${topikError ? '!border-[var(--danger)]' : ''}`}
              aria-invalid={!!topikError}
            />
            {topikError && (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-[var(--danger)]">
                {topikError}
              </p>
            )}
          </div>
        </div>

        {/* 2. Isu Kontekstual & Bentuk Aksi Nyata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Latar belakang isu kontekstual sekolah
            </label>
            <input
              type="text"
              value={isuKontekstual}
              onChange={(e) => setIsuKontekstual(e.target.value)}
              placeholder="Contoh: Sampah kemasan plastik di kantin sekolah menumpuk tanpa pemilahan…"
              className="apple-input"
            />
            <p className="text-[11px] text-[var(--muted)] mt-1">
              Isu nyata di lingkungan sekolah/daerah yang akan diinvestigasi murid.
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Bentuk aksi nyata / gelar karya
            </label>
            <select
              value={bentukAksi}
              onChange={(e) => setBentukAksi(e.target.value)}
              className="apple-input"
            >
              {BENTUK_AKSI_P5.map((aksi) => (
                <option key={aksi} value={aksi}>
                  {aksi}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              Bentuk perayaan belajar / produk nyata yang dipamerkan di akhir projek.
            </p>
          </div>
        </div>

        {/* 3. Sistem Waktu & Alokasi Total JP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Model sistem pelaksanaan waktu
            </label>
            <select
              value={sistemWaktu}
              onChange={(e) => setSistemWaktu(e.target.value)}
              className="apple-input"
            >
              {SISTEM_WAKTU_P5.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Total alokasi waktu projek
            </label>
            <input
              type="text"
              value={alokasiWaktu}
              onChange={(e) => setAlokasiWaktu(e.target.value)}
              placeholder="36 JP"
              className="apple-input"
            />
            <div className="flex gap-1.5 mt-1.5">
              {['24 JP', '36 JP', '48 JP', '72 JP'].map((jp) => (
                <button
                  key={jp}
                  type="button"
                  onClick={() => setAlokasiWaktu(jp)}
                  className="text-[10.5px] px-2 py-0.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                >
                  {jp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Target Mitra Kolaborasi */}
        <div>
          <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
            Narasumber / mitra kolaborasi luar sekolah (opsional)
          </label>
          <input
            type="text"
            value={mitraProjek}
            onChange={(e) => setMitraProjek(e.target.value)}
            placeholder="Contoh: Dinas Lingkungan Hidup, pengelola bank sampah, orang tua murid, puskesmas"
            className="apple-input"
          />
        </div>

        {/* 5. Pemilihan Dimensi Profil Lulusan / Profil Pelajar */}
        <div className="pt-3 border-t border-[var(--line)]">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <label className="block text-[12.5px] font-semibold text-[var(--ink)]">
                Dimensi profil sasaran projek
              </label>
              <p className="text-[11px] text-[var(--muted)]">
                Pilih dimensi utama yang menjadi fokus asesmen dan perkembangan murid pada projek ini
              </p>
            </div>
            <span className="ds-badge ds-badge-accent shrink-0">
              {dimensiProfilLulusan.length} terpilih
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
                  aria-pressed={isChecked}
                  className={`p-2.5 rounded-lg text-left text-[11.5px] font-medium flex items-center justify-between transition-colors cursor-pointer border ${
                    isChecked
                      ? 'border-[var(--accent)]/45 bg-[var(--accent-soft)] text-[var(--accent-ink)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <span className="truncate pr-1">{dim}</span>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
