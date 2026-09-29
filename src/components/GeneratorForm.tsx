import React, { useState, useEffect } from 'react';
import { 
  Jenjang, 
  DocType, 
  GeneratorParams, 
  TeacherUser 
} from '../types';
import { 
  JENJANG_CONFIGS, 
  DIMENSI_P5, 
  MODEL_PEMBELAJARAN, 
  TEMA_P5, 
  DOC_TYPE_INFO, 
  TOPIK_INSPIRASI 
} from '../data/curriculumData';
import { ContextualTopicSuggester } from './ContextualTopicSuggester';
import { CurriculumTopicItem } from '../data/topicCatalog';
import { 
  Sparkles, 
  FileText, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  Target, 
  Calendar, 
  Clock, 
  Settings2, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Building2,
  UserCheck,
  Check
} from 'lucide-react';

interface GeneratorFormProps {
  currentUser: TeacherUser;
  onGenerate: (params: GeneratorParams) => Promise<void>;
  isGenerating: boolean;
  onSwitchToVerifiedUser?: () => void;
  activeDocType?: DocType;
  onSelectDocType?: (type: DocType) => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  currentUser,
  onGenerate,
  isGenerating,
  onSwitchToVerifiedUser,
  activeDocType,
  onSelectDocType
}) => {
  const [docType, setDocType] = useState<DocType>(activeDocType || 'modul_ajar');

  useEffect(() => {
    if (activeDocType && activeDocType !== docType) {
      setDocType(activeDocType);
    }
  }, [activeDocType]);

  const handleDocTypeChange = (newType: DocType) => {
    setDocType(newType);
    onSelectDocType?.(newType);
  };

  const [jenjang, setJenjang] = useState<Jenjang>(currentUser.jenjang || 'SD');
  const [fase, setFase] = useState<string>('Fase B');
  const [tingkat, setTingkat] = useState<string>('Kelas 4');
  const [mataPelajaran, setMataPelajaran] = useState<string>('IPAS (Ilmu Pengetahuan Alam & Sosial)');
  const [customMapel, setCustomMapel] = useState<string>('');
  const [topik, setTopik] = useState<string>('Bagian Tubuh Tumbuhan dan Fungsinya');
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>('2 JP (2 x 35 Menit) - 1 Pertemuan');
  const [modelPembelajaran, setModelPembelajaran] = useState<string>('Problem Based Learning (PBL)');
  const [targetPeserta, setTargetPeserta] = useState<string>('Peserta didik reguler/tipikal dengan diferensiasi gaya belajar');
  const [dimensiP5, setDimensiP5] = useState<string[]>([
    'Bernalar Kritis',
    'Gotong Royong',
    'Mandiri'
  ]);
  
  // Soal config
  const [jumlahSoal, setJumlahSoal] = useState<number>(15);
  const [levelKognitif, setLevelKognitif] = useState<string>('Kombinasi MOTS & HOTS (C3-C5)');

  // P5 config
  const [temaP5, setTemaP5] = useState<string>('Gaya Hidup Berkelanjutan');

  // Identitas kop
  const [schoolName, setSchoolName] = useState<string>(currentUser.schoolName || 'SD Negeri 01 Menteng Pagi');
  const [authorName, setAuthorName] = useState<string>(currentUser.name || 'Guru Mata Pelajaran');
  const [nip, setNip] = useState<string>(currentUser.nip || '');

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Update jenjang and sync fases and mapel
  const handleJenjangChange = (newJenjang: Jenjang) => {
    setJenjang(newJenjang);
    const config = JENJANG_CONFIGS[newJenjang];
    if (config.fases.length > 0) {
      const defaultF = config.fases[0];
      setFase(defaultF.fase);
      setTingkat(defaultF.kelas[0] || 'Kelas 1');
    }
    if (config.defaultMapel.length > 0) {
      setMataPelajaran(config.defaultMapel[0]);
    }
    // Set default time allocation
    if (newJenjang === 'SD') setAlokasiWaktu('2 JP (2 x 35 Menit) - 1 Pertemuan');
    else if (newJenjang === 'SMP') setAlokasiWaktu('2 JP (2 x 40 Menit) - 1 Pertemuan');
    else setAlokasiWaktu('2 JP (2 x 45 Menit) - 1 Pertemuan');
  };

  // Toggle P5 Dimensi
  const toggleDimensi = (dim: string) => {
    if (dimensiP5.includes(dim)) {
      if (dimensiP5.length > 1) {
        setDimensiP5(dimensiP5.filter(d => d !== dim));
      }
    } else {
      setDimensiP5([...dimensiP5, dim]);
    }
  };

  // Apply contextual topic from Suggester
  const handleSelectContextualTopic = (item: CurriculumTopicItem) => {
    setTopik(item.topik);
    if (item.rekomendasiModel) {
      setModelPembelajaran(item.rekomendasiModel);
    }
    if (item.alokasiWaktuDefault) {
      setAlokasiWaktu(item.alokasiWaktuDefault);
    }
  };

  // Apply inspiration topic
  const applyInspirasi = (item: { jenjang: Jenjang; mapel: string; topik: string; tingkat: string }) => {
    handleJenjangChange(item.jenjang);
    setTingkat(item.tingkat);
    setMataPelajaran(item.mapel);
    setTopik(item.topik);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMapel = customMapel.trim() ? customMapel.trim() : mataPelajaran;

    onGenerate({
      docType,
      jenjang,
      tingkat,
      fase,
      mataPelajaran: finalMapel,
      topik,
      alokasiWaktu,
      modelPembelajaran,
      targetPeserta,
      dimensiP5,
      soalConfig: {
        jumlahSoal,
        bentukSoal: ['Pilihan Ganda', 'Pilihan Ganda Kompleks (AKM)', 'Menjodohkan', 'Isian Singkat', 'Uraian HOTS'],
        levelKognitif
      },
      authorName,
      schoolName,
      nip,
      catatanTambahan: {
        temaP5
      }
    });
  };

  const isVerified = currentUser.status === 'VERIFIED';
  const availableFases = JENJANG_CONFIGS[jenjang]?.fases || [];
  const currentFaseObj = availableFases.find(f => f.fase === fase) || availableFases[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      
      {/* Verification Notice Banner if Pending */}
      {!isVerified && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Akun Belajar.id Anda ({currentUser.email}) Menunggu Verifikasi Admin
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Sesuai kebijakan keamanan, akun guru baru diverifikasi oleh Verifikator Kurikulum (Bpk. Amwaluddin Lubis, M.Pd.) sebelum akses penuh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onSwitchToVerifiedUser && (
              <button
                type="button"
                onClick={onSwitchToVerifiedUser}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Coba Sebagai Admin / Guru Terverifikasi
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Form */}
      <div className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Generator AI Standar Kurikulum Merdeka
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Penyusun Perangkat Ajar & Modul Belajar.id
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Ditenagai AI dengan acuan resmi Permendikbudristek No. 12 Tahun 2024, BSKAP No. 032/H/KR/2024, dan Panduan Pembelajaran & Asesmen (PPA 2024).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Semua Mapel SD • SMP • SMA • SMK
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 sm:space-y-8">

        {/* 1. Pilih Jenis Perangkat Ajar */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2.5">
            1. Pilih Jenis Dokumen Perangkat Ajar
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {(Object.keys(DOC_TYPE_INFO) as DocType[]).map((typeKey) => {
              const info = DOC_TYPE_INFO[typeKey];
              const isSelected = docType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => handleDocTypeChange(typeKey)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {typeKey === 'modul_ajar' && <FileText className="w-4 h-4" />}
                        {typeKey === 'rpp' && <Layers className="w-4 h-4" />}
                        {typeKey === 'soal_ujian' && <HelpCircle className="w-4 h-4" />}
                        {typeKey === 'lkpd' && <BookOpen className="w-4 h-4" />}
                        {typeKey === 'kktp_atp' && <Target className="w-4 h-4" />}
                        {typeKey === 'prota_promes' && <Calendar className="w-4 h-4" />}
                        {typeKey === 'modul_p5' && <Sparkles className="w-4 h-4" />}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {info.badge}
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {info.label}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {info.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Specialized Highlight Card for Active Perangkat Ajar */}
          <div className="mt-3.5 p-4 rounded-2xl border transition-all flex items-start gap-3.5 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 border-blue-200/80">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 mt-0.5">
              {docType === 'modul_ajar' && <FileText className="w-5 h-5" />}
              {docType === 'rpp' && <Layers className="w-5 h-5" />}
              {docType === 'soal_ujian' && <HelpCircle className="w-5 h-5" />}
              {docType === 'lkpd' && <BookOpen className="w-5 h-5" />}
              {docType === 'kktp_atp' && <Target className="w-5 h-5" />}
              {docType === 'prota_promes' && <Calendar className="w-5 h-5" />}
              {docType === 'modul_p5' && <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Format Aktif: {DOC_TYPE_INFO[docType].label}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800">
                  {DOC_TYPE_INFO[docType].badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {DOC_TYPE_INFO[docType].desc}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Jenjang, Fase, & Kelas */}
        <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <label className="block text-sm font-bold text-slate-900">
            2. Tingkat Satuan Pendidikan & Fase Kurikulum Merdeka
          </label>
          
          {/* Jenjang Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['SD', 'SMP', 'SMA', 'SMK'] as Jenjang[]).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => handleJenjangChange(j)}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                  jenjang === j
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{j}</span>
                <span className="text-[11px] font-normal opacity-85">
                  ({j === 'SD' ? 'Fase A-C' : j === 'SMP' ? 'Fase D' : 'Fase E-F'})
                </span>
              </button>
            ))}
          </div>

          {/* Fase & Tingkat Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fase Capaian Pembelajaran (BSKAP 032/H/KR/2024)
              </label>
              <select
                value={fase}
                onChange={(e) => {
                  const newF = e.target.value;
                  setFase(newF);
                  const fObj = availableFases.find(f => f.fase === newF);
                  if (fObj && fObj.kelas.length > 0) {
                    setTingkat(fObj.kelas[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableFases.map((f) => (
                  <option key={f.fase} value={f.fase}>
                    {f.fase} ({f.kelas.join(', ')}) - {f.deskripsi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tingkat Kelas
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(currentFaseObj?.kelas || []).map((k) => (
                  <option key={k} value={k}>
                    {k} ({jenjang})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Mata Pelajaran & Topik */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              3. Mata Pelajaran
            </label>
            <div className="space-y-2">
              <select
                value={mataPelajaran}
                onChange={(e) => {
                  setMataPelajaran(e.target.value);
                  setCustomMapel('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JENJANG_CONFIGS[jenjang]?.defaultMapel.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="custom">-- Mata Pelajaran Lainnya (Ketik Sendiri) --</option>
              </select>

              {mataPelajaran === 'custom' && (
                <input
                  type="text"
                  placeholder="Ketik nama mata pelajaran (contoh: Muatan Lokal Bahasa Sunda, Robotika, dll)..."
                  value={customMapel}
                  onChange={(e) => setCustomMapel(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-400 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              4. Topik / Materi Pokok Pembelajaran
            </label>
            <input
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Operasi Hitung Pecahan, Siklus Air, Hukum Newton..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Contextual Topic Suggestions based on Fase, Tingkat & Mata Pelajaran */}
        <ContextualTopicSuggester
          jenjang={jenjang}
          fase={fase}
          tingkat={tingkat}
          mataPelajaran={customMapel.trim() ? customMapel : mataPelajaran}
          currentTopik={topik}
          onSelectTopic={handleSelectContextualTopic}
        />

        {/* 5. Alokasi Waktu & Model Pembelajaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              5. Alokasi Waktu
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={alokasiWaktu}
                onChange={(e) => setAlokasiWaktu(e.target.value)}
                placeholder="2 JP (2 x 35 Menit)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              6. Model Pembelajaran
            </label>
            <select
              value={modelPembelajaran}
              onChange={(e) => setModelPembelajaran(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MODEL_PEMBELAJARAN.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6. Dimensi Profil Pelajar Pancasila */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-900">
              7. Dimensi Profil Pelajar Pancasila (Pilih 2 - 4 Dimensi)
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {dimensiP5.length} dimensi terpilih
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {DIMENSI_P5.map((dim) => {
              const checked = dimensiP5.includes(dim);
              return (
                <button
                  key={dim}
                  type="button"
                  onClick={() => toggleDimensi(dim)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    checked
                      ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate pr-1">{dim}</span>
                  {checked ? (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Dedicated Configuration Card per Document Type */}
        {docType === 'soal_ujian' && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 border border-amber-300/80 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950">
                    Konfigurasi Khusus Paket Soal Ujian (AKM & HOTS)
                  </h4>
                  <p className="text-xs text-amber-800">
                    Standar Asesmen Nasional Kemendikbudristek lengkap dengan Kisi-Kisi & Kunci Pembahasan
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                Level Kognitif C1-C6
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1.5">
                  Jumlah Butir Soal Ujian
                </label>
                <select
                  value={jumlahSoal}
                  onChange={(e) => setJumlahSoal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value={10}>10 Butir Soal (Kuis / Asesmen Formatif)</option>
                  <option value={15}>15 Butir Soal (Standar Penilaian Tengah Semester)</option>
                  <option value={20}>20 Butir Soal (Lengkap Penilaian Akhir Semester)</option>
                  <option value={25}>25 Butir Soal (Ujian Sekolah / Asesmen Sumatif Akhir Jenjang)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1.5">
                  Komposisi Level Berpikir Soal
                </label>
                <select
                  value={levelKognitif}
                  onChange={(e) => setLevelKognitif(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Kombinasi MOTS & HOTS (C3-C5)">Kombinasi MOTS & HOTS (C3-C5) - Rekomendasi PPA 2024</option>
                  <option value="Dominan HOTS (C4-C6)">Dominan HOTS & AKM Penalaran Kritis Tinggi (C4-C6)</option>
                  <option value="Dasar ke Menengah (C1-C3)">Dasar ke Menengah (C1-C3) - Fase A / Diagnostik Awal</option>
                </select>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">• Bentuk Soal Otomatis:</span>
              <p className="text-[11px] text-amber-800">
                Pilihan Ganda (PG), Pilihan Ganda Kompleks (Model AKM), Menjodohkan, Isian Singkat, dan Uraian Analitis HOTS berbasis stimulus wacana kontekstual Indonesia.
              </p>
            </div>
          </div>
        )}

        {docType === 'modul_p5' && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/60 border border-purple-300/80 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-purple-950">
                    Konfigurasi Modul Projek Penguatan Profil Pelajar Pancasila (P5)
                  </h4>
                  <p className="text-xs text-purple-800">
                    Sesuai Panduan Pengembangan Projek Penguatan Profil Pelajar Pancasila BSKAP 2024
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                8 Tema Resmi
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1.5">
                Pilih Tema Resmi Projek P5
              </label>
              <select
                value={temaP5}
                onChange={(e) => setTemaP5(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 text-xs sm:text-sm bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                {TEMA_P5.map((t) => (
                  <option key={t} value={t}>
                    Tema: {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-purple-200 text-xs text-purple-900">
              <span className="font-bold block mb-1">• Tahapan Alur Projek yang Disusun:</span>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                1. Tahap Pengenalan → 2. Tahap Kontekstualisasi Masalah → 3. Tahap Aksi Nyata Murid → 4. Tahap Refleksi & Gelar Karya Pameran.
              </p>
            </div>
          </div>
        )}

        {docType === 'kktp_atp' && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-blue-50/60 border border-indigo-300/80 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-indigo-950">
                  Konfigurasi Alur Tujuan Pembelajaran & Kriteria KKTP
                </h4>
                <p className="text-xs text-indigo-800">
                  Perencanaan ketuntasan belajar berbasis 3 Pendekatan Resmi PPA Kemendikbudristek 2024
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                <b className="text-indigo-900 block mb-0.5">1. Deskripsi Kriteria:</b>
                Daftar kriteria ketercapaian tujuan esensial.
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                <b className="text-indigo-900 block mb-0.5">2. Rubrik Skala:</b>
                4 level: Baru Berkembang, Layak, Cakap, Mahir.
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                <b className="text-indigo-900 block mb-0.5">3. Interval Nilai:</b>
                Penetapan intervensi remedial & pengayaan.
              </div>
            </div>
          </div>
        )}

        {docType === 'rpp' && (
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-300/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-sky-950">
                Format RPP Ringkas 1-2 Lembar Siap Supervisi
              </h4>
              <p className="text-xs text-sky-800 mt-0.5 leading-relaxed">
                Menyajikan esensi pembelajaran secara padat, efisien, dan berorientasi murid: <b>Tujuan Pembelajaran</b>, <b>Langkah-Langkah Sintaks PBL/PjBL</b> (Pendahuluan, Inti, Penutup), dan <b>Instrumen Asesmen Cepat</b>.
              </p>
            </div>
          </div>
        )}

        {docType === 'lkpd' && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-emerald-950">
                Format Lembar Kerja Peserta Didik (LKPD) Siap Cetak
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Dilengkapi kop isian kelompok, instruksi keselamatan/petunjuk kerja, kasus stimulus fenomena nyata, tabel pengamatan, dan rubrik penilaian diri siswa.
              </p>
            </div>
          </div>
        )}

        {/* Advanced Options Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-500" />
              Pengaturan Lanjutan & Kop Surat Satuan Pendidikan
            </span>
            <span className="text-blue-600 font-semibold text-xs flex items-center gap-1">
              {showAdvanced ? 'Tutup Pengaturan' : 'Buka Pengaturan'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {showAdvanced && (
            <div className="p-5 space-y-4 bg-white border-t border-slate-200">
              
              {/* Kop Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Satuan Pendidikan (Sekolah)
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SD Negeri 01 Menteng Pagi"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Guru Penyusun
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Contoh: Siti Nurhaliza, S.Pd."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Guru (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19890412 201402 2 003"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Soal Ujian Specific */}
              {docType === 'soal_ujian' && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    Konfigurasi Khusus Paket Soal Ujian (AKM & HOTS)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jumlah Soal Ujian
                      </label>
                      <select
                        value={jumlahSoal}
                        onChange={(e) => setJumlahSoal(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value={10}>10 Butir Soal (Format Singkat)</option>
                        <option value={15}>15 Butir Soal (Standar Ujian Tengah Semester)</option>
                        <option value={20}>20 Butir Soal (Lengkap Sumatif Akhir Semester)</option>
                        <option value={25}>25 Butir Soal (Ujian Sekolah / Try Out Komprehensif)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Komposisi Level Berpikir
                      </label>
                      <select
                        value={levelKognitif}
                        onChange={(e) => setLevelKognitif(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="Kombinasi MOTS & HOTS (C3-C5)">Kombinasi MOTS & HOTS (C3-C5) - Rekomendasi PPA 2024</option>
                        <option value="Dominan HOTS (C4-C6)">Dominan HOTS & AKM Literasi/Numerasi Tinggi (C4-C6)</option>
                        <option value="Dasar ke Menengah (C1-C3)">Dasar ke Menengah (C1-C3) - Cocok Fase A / Asesmen Diagnostik</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Modul P5 Specific */}
              {docType === 'modul_p5' && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    Pilihan Tema Resmi Projek Penguatan Profil Pelajar Pancasila (Kemendikbud)
                  </div>
                  <select
                    value={temaP5}
                    onChange={(e) => setTemaP5(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                  >
                    {TEMA_P5.map((t) => (
                      <option key={t} value={t}>
                        Tema: {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Peserta Didik & Kebutuhan Diferensiasi
                </label>
                <input
                  type="text"
                  value={targetPeserta}
                  onChange={(e) => setTargetPeserta(e.target.value)}
                  placeholder="Peserta didik reguler, dengan diferensiasi gaya belajar auditori, visual, dan kinestetik"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isGenerating
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2.5">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Menyusun Perangkat Ajar Sesuai Permendikbudristek No. 12 Tahun 2024...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                Generate {DOC_TYPE_INFO[docType].label} dengan AI
              </span>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-2.5">
            Hasil tersusun lengkap dengan Capaian Pembelajaran, Diferensiasi, Asesmen & Rubrik KKTP, LKPD, serta Kop Surat Resmi Sekolah.
          </p>
        </div>

      </form>
    </div>
  );
};
