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
  activeDocType?: DocType;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  currentUser,
  onGenerate,
  isGenerating,
  activeDocType
}) => {
  const [docType, setDocType] = useState<DocType>(activeDocType || 'modul_ajar');

  // Jenis dokumen sepenuhnya mengikuti pilihan sidebar.
  useEffect(() => {
    if (activeDocType && activeDocType !== docType) {
      setDocType(activeDocType);
      setFormStep(0);
    }
  }, [activeDocType]);

  // Sinkronkan form bila akun berganti (mis. demo SD -> SMP) agar
  // fase/kelas/mapel selalu valid untuk jenjang pengguna aktif.
  useEffect(() => {
    const cfg = JENJANG_CONFIGS[currentUser.jenjang] || JENJANG_CONFIGS['SD'];
    const j = currentUser.jenjang || 'SD';
    setJenjang(j);
    setFase(cfg.fases[0]?.fase || 'Fase B');
    setTingkat(cfg.fases[0]?.kelas[0] || 'Kelas 4');
    setMataPelajaran(cfg.defaultMapel[0] || '');
    setCustomMapel('');
    setAlokasiWaktu(defaultAlokasi(j));
    setSchoolName(currentUser.schoolName || '');
    setAuthorName(currentUser.name || '');
    setNip(currentUser.nip || '');
    setFormStep(0);
  }, [currentUser.id]);

  const defaultAlokasi = (j: Jenjang) =>
    j === 'SD' ? '2 JP (2 x 35 Menit) - 1 Pertemuan' :
    j === 'SMP' ? '2 JP (2 x 40 Menit) - 1 Pertemuan' :
    '2 JP (2 x 45 Menit) - 1 Pertemuan';

  const initialCfg = JENJANG_CONFIGS[currentUser.jenjang || 'SD'] || JENJANG_CONFIGS['SD'];

  const [jenjang, setJenjang] = useState<Jenjang>(currentUser.jenjang || 'SD');
  const [fase, setFase] = useState<string>(initialCfg.fases[0]?.fase || 'Fase B');
  const [tingkat, setTingkat] = useState<string>(initialCfg.fases[0]?.kelas[0] || 'Kelas 4');
  const [mataPelajaran, setMataPelajaran] = useState<string>(initialCfg.defaultMapel[0] || 'IPAS (Ilmu Pengetahuan Alam & Sosial)');
  const [customMapel, setCustomMapel] = useState<string>('');
  const [topik, setTopik] = useState<string>('Bagian Tubuh Tumbuhan dan Fungsinya');
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>(() => defaultAlokasi(currentUser.jenjang || 'SD'));
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
  const [formStep, setFormStep] = useState<number>(0);

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

  // Apply contextual topic from Suggester (tetap dalam jenjang profil)
  const handleSelectContextualTopic = (item: CurriculumTopicItem) => {
    setTopik(item.topik);
    if (item.rekomendasiModel) {
      setModelPembelajaran(item.rekomendasiModel);
    }
    if (item.alokasiWaktuDefault) {
      setAlokasiWaktu(item.alokasiWaktuDefault);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMapel = customMapel.trim() ? customMapel.trim() : mataPelajaran;

    onGenerate({
      authorId: currentUser.id,
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

  const handleNextStep = () => {
    if (formStep === 1) {
      const form = document.querySelector('form');
      if (!form?.reportValidity()) return;
    }
    setFormStep((step) => Math.min(step + 1, 2));
  };

  const isVerified = currentUser.status === 'VERIFIED';
  const availableFases = JENJANG_CONFIGS[jenjang]?.fases || [];
  const currentFaseObj = availableFases.find(f => f.fase === fase) || availableFases[0];

  return (
    <div className="apple-card overflow-hidden">
      
      {/* Verification Notice Banner if Pending */}
      {!isVerified && (
        <div className="bg-[#fff8e5] border-b border-black/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ff9f0a]/15 flex items-center justify-center text-[#9a6700] shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold">
                {currentUser.status === 'PENDING' ? 'Menunggu verifikasi admin' : 'Belum terverifikasi'}
              </h4>
              <p className="text-[13px] text-[#6e6e73] mt-0.5">
                Profil {currentUser.email} belum disetujui. Anda tetap bisa menyusun draf, hubungi admin bila status tak berubah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Form — Apple hero */}
      <div className="p-6 sm:p-10 pb-6 text-center border-b border-black/10">
        <p className="apple-eyebrow">Draf berbantuan AI</p>
        <h2 className="apple-headline !text-[30px] sm:!text-[38px] mt-1">
          Susun {DOC_TYPE_INFO[docType].label}.
        </h2>
        <p className="apple-sub mt-2 max-w-xl mx-auto !text-[15px]">
          Tiga langkah singkat — pilih format dan kelas, isi materi, periksa lalu susun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-8">
        <ol className="flex items-center justify-center gap-2 mb-8" aria-label="Tahapan penyusunan dokumen">
          {[
            { title: 'Format & kelas' },
            { title: 'Materi' },
            { title: 'Periksa & susun' }
          ].map((step, index) => (
            <li key={step.title} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => index < formStep && setFormStep(index)}
                aria-current={formStep === index ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 text-[13px] font-semibold transition-all min-h-[36px] ${
                  formStep === index ? 'bg-black text-white dark:bg-white dark:text-black' :
                  formStep > index ? 'bg-black/5 dark:bg-white/10' : 'text-[#86868b]'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] ${
                  formStep === index ? 'bg-white text-black dark:bg-black dark:text-white' :
                  formStep > index ? 'bg-[#30b158] text-white' : 'bg-black/10 dark:bg-white/15 text-[#6e6e73] dark:text-[#98989d]'
                }`}>
                  {formStep > index ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                {step.title}
              </button>
              {index < 2 && <span className="w-4 sm:w-8 h-px bg-black/15 dark:bg-white/20" />}
            </li>
          ))}
        </ol>

        <div className="mb-6 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 px-5 py-4 text-center">
          <h3 className="text-[15px] font-semibold">
            {formStep === 0 ? 'Mulai dari format dan kelas' : formStep === 1 ? 'Isi kebutuhan pembelajaran' : 'Periksa sebelum menyusun'}
          </h3>
          <p className="mt-1 text-[13.5px] text-[#6e6e73] dark:text-[#98989d]">
            {formStep === 0 ? 'Jenis dokumen mengikuti sidebar — tentukan fase dan kelas di jenjang Anda.' :
              formStep === 1 ? 'Tentukan mata pelajaran, materi, alokasi waktu, dan kebutuhan murid.' :
                'Dokumen dibuat atas nama Anda — sesuaikan bila perlu.'}
          </p>
        </div>

        {/* 1. Jenis dokumen — mengikuti pilihan sidebar */}
        {formStep === 0 && <>
        <div>
          <p className="text-[14px] font-semibold mb-3">
            Jenis dokumen
          </p>
          <div className="flex items-center gap-3.5 rounded-2xl bg-black dark:bg-white dark:text-black text-white p-4 sm:p-5">
            <div className="shrink-0">
              {docType === 'modul_ajar' && <FileText className="w-6 h-6" />}
              {docType === 'rpp' && <Layers className="w-6 h-6" />}
              {docType === 'soal_ujian' && <HelpCircle className="w-6 h-6" />}
              {docType === 'lkpd' && <BookOpen className="w-6 h-6" />}
              {docType === 'kktp_atp' && <Target className="w-6 h-6" />}
              {docType === 'prota_promes' && <Calendar className="w-6 h-6" />}
              {docType === 'modul_p5' && <Sparkles className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-[15px]">{DOC_TYPE_INFO[docType].label}</p>
                <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/10">
                  {DOC_TYPE_INFO[docType].badge}
                </span>
              </div>
              <p className="text-[13px] opacity-70 mt-0.5">{DOC_TYPE_INFO[docType].desc}</p>
              <p className="text-[12px] opacity-60 mt-1.5">Ganti jenis lewat menu sidebar.</p>
            </div>
          </div>
        </div>

        {/* 2. Jenjang, Fase, & Kelas */}
        <div className="bg-[#f5f5f7] dark:bg-white/5 p-4 sm:p-6 rounded-2xl space-y-4 mt-4">
          <p className="text-[14px] font-semibold">
            Kelas & fase
          </p>
          
          {/* Jenjang terkunci profil — 1 akun untuk 1 jenjang */}
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/15 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                {jenjang}
              </div>
              <div>
                <p className="text-[14px] font-semibold">Jenjang {jenjang}</p>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
                  Mengikuti profil Anda{currentUser.role !== 'GURU' ? ' (admin bebas lintas jenjang)' : ''}.
                </p>
              </div>
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
              Terkunci
            </span>
          </div>

          {/* Fase & Tingkat Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5">
                Fase
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
                className="apple-input !bg-white"
              >
                {availableFases.map((f) => (
                  <option key={f.fase} value={f.fase}>
                    {f.fase} ({f.kelas.join(', ')}) - {f.deskripsi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">
                Kelas
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                className="apple-input !bg-white"
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

        </>}

        {formStep === 1 && <>
        {/* 3. Mata Pelajaran & Topik */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <label className="block text-[14px] font-semibold mb-1.5">
              Mata pelajaran
            </label>
            <div className="space-y-2">
              <select
                value={mataPelajaran}
                onChange={(e) => {
                  setMataPelajaran(e.target.value);
                  setCustomMapel('');
                }}
                className="apple-input"
              >
                {JENJANG_CONFIGS[jenjang]?.defaultMapel.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="custom">Lainnya — ketik sendiri…</option>
              </select>

              {mataPelajaran === 'custom' && (
                <input
                  type="text"
                  placeholder="Contoh: Muatan Lokal, Robotika…"
                  value={customMapel}
                  onChange={(e) => setCustomMapel(e.target.value)}
                  required
                  className="apple-input"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-semibold mb-1.5">
              Topik / materi pokok
            </label>
            <input
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Pecahan, Siklus Air, Hukum Newton…"
              required
              className="apple-input"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-[14px] font-semibold mb-1.5">
              Alokasi waktu
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={alokasiWaktu}
                onChange={(e) => setAlokasiWaktu(e.target.value)}
                placeholder="2 JP (2 x 35 Menit)"
                className="apple-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-semibold mb-1.5">
              Model pembelajaran
            </label>
            <select
              value={modelPembelajaran}
              onChange={(e) => setModelPembelajaran(e.target.value)}
              className="apple-input"
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
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[14px] font-semibold">
              Dimensi Profil Pelajar Pancasila
            </label>
            <span className="text-[12.5px] text-[#6e6e73]">
              {dimensiP5.length} dipilih
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
                  aria-pressed={checked}
                  className={`p-3 rounded-2xl text-left text-[13.5px] font-medium flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                    checked
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-[#f5f5f7] dark:bg-white/5 hover:bg-[#e8e8ed] dark:hover:bg-white/10'
                  }`}
                >
                  <span className="truncate pr-1">{dim}</span>
                  {checked ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-black/20 dark:border-white/30 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Dedicated Configuration Card per Document Type */}
        {docType === 'soal_ujian' && (
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-4 mt-3">
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
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-4 mt-3">
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
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-3 mt-3">
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
          <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 flex items-start gap-3 mt-3">
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
          <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 flex items-start gap-3 mt-3">
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

        </>}

        {formStep === 2 && <>
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="mb-3 text-xs font-bold uppercase text-slate-500">Ringkasan dokumen</h4>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] text-slate-500">Format</dt>
              <dd className="text-sm font-semibold text-slate-900">{DOC_TYPE_INFO[docType].label}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Kelas</dt>
              <dd className="text-sm font-semibold text-slate-900">{jenjang} · {tingkat} · {fase}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Mata pelajaran</dt>
              <dd className="text-sm font-semibold text-slate-900">{customMapel.trim() || mataPelajaran}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-slate-500">Topik</dt>
              <dd className="text-sm font-semibold text-slate-900">{topik}</dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
            Dokumen dibuat atas nama <b>{authorName}</b> · {schoolName}. Anda masih dapat mengubah identitas di pengaturan tambahan.
          </p>
        </div>

        {/* Advanced Options Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-500" />
              Sesuaikan identitas dan opsi tambahan
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
        </>}

        {/* Bar navigasi — selalu tampil di langkah 1, 2, 3 */}
        <div className="mt-8 sticky bottom-4 flex flex-col-reverse gap-2.5 rounded-2xl border border-black/10 dark:border-white/15 bg-white/85 dark:bg-[#1c1c1e]/85 p-3 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setFormStep((step) => Math.max(step - 1, 0))}
            disabled={isGenerating}
            className={`btn-apple-secondary !bg-transparent hover:!bg-black/5 dark:hover:!bg-white/10 disabled:invisible ${formStep === 0 ? 'invisible' : ''}`}
          >
            Kembali
          </button>
          {formStep < 2 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-apple flex-1 sm:flex-none sm:min-w-[220px]"
            >
              Lanjutkan ke langkah {formStep + 2} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-apple flex-1 sm:flex-none sm:min-w-[260px]"
            >
              {isGenerating ? <Clock className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? 'Menyusun…' : `Susun ${DOC_TYPE_INFO[docType].label}`}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
