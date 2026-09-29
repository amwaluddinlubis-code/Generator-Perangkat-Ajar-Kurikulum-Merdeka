import React, { useState, useEffect } from 'react';
import { 
  Jenjang, 
  DocType, 
  GeneratorParams, 
  TeacherUser,
  TeacherVoice
} from '../types';
import {
  JENJANG_CONFIGS,
  DIMENSI_P5,
  MODEL_PEMBELAJARAN_PER_JENJANG,
  TEMA_P5,
  BENTUK_SOAL_OPTIONS,
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
  Loader2,
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
  submitError?: string | null;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  currentUser,
  onGenerate,
  isGenerating,
  activeDocType,
  submitError = null
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
  // Semua isian dikosongkan — wajib diisi/dipilih manual.
  useEffect(() => {
    const j = currentUser.jenjang || 'SD';
    setJenjang(j);
    setFase('');
    setTingkat('');
    setMataPelajaran('');
    setCustomMapel('');
    setTopik('');
    setAlokasiJP('');
    setDurasiJP('');
    setJumlahPertemuan('');
    setDimensiP5([]);
    setDimensiError(false);
    setLampiran([]);
    setFokusRpp('');
    setJumlahAktivitas('');
    setKunciLkpd(false);
    setPendekatanKktp('');
    setSemesterProta('');
    setTahunAjaran('');
    setJumlahSoal('');
    setBentukSoal([]);
    setKomposisi({ mudah: '', sedang: '', sukar: '' });
    setTemaP5('');
    setTeacherStory('');
    setStudentProfile('');
    setLearningNeeds('');
    setLocalContext('');
    setPriorKnowledge('');
    setEmotionalConsiderations('');
    setTeacherIntent('');
    setTeacherVoice('hangat');
    setModelPembelajaran((MODEL_PEMBELAJARAN_PER_JENJANG[j] || MODEL_PEMBELAJARAN_PER_JENJANG.SD)[0].value);
    setExtraError(null);
    setSchoolName(currentUser.schoolName || '');
    setAuthorName(currentUser.name || '');
    setNip(currentUser.nip || '');
    setFormStep(0);
  }, [currentUser.id]);

  /** Urai string katalog "N JP (N x M Menit) - K Pertemuan" ke tiga bagian. */
  const parseAlokasi = (text: string): void => {
    const match = /(\d+)\s*JP.*?(\d+)\s*Menit.*?(\d+)\s*Pertemuan/i.exec(text || '');
    if (!match) return;
    setAlokasiJP(match[1]);
    setDurasiJP(match[2]);
    setJumlahPertemuan(match[3]);
  };

  const [jenjang, setJenjang] = useState<Jenjang>(currentUser.jenjang || 'SD');
  const [fase, setFase] = useState<string>('');
  const [tingkat, setTingkat] = useState<string>('');
  const [mataPelajaran, setMataPelajaran] = useState<string>('');
  const [customMapel, setCustomMapel] = useState<string>('');
  const [topik, setTopik] = useState<string>('');
  const [alokasiJP, setAlokasiJP] = useState<string>('');
  const [durasiJP, setDurasiJP] = useState<string>('');
  const [jumlahPertemuan, setJumlahPertemuan] = useState<string>('');

  /** String alokasi untuk backend & pratinjau, tersusun dari tiga select. */
  const alokasiWaktu = alokasiJP && durasiJP && jumlahPertemuan
    ? `${alokasiJP} JP (${alokasiJP} x ${durasiJP} Menit) - ${jumlahPertemuan} Pertemuan`
    : '';
  const [modelPembelajaran, setModelPembelajaran] = useState<string>(
    () => (MODEL_PEMBELAJARAN_PER_JENJANG[currentUser.jenjang || 'SD'] || MODEL_PEMBELAJARAN_PER_JENJANG.SD)[0].value
  );
  const modelOptions = MODEL_PEMBELAJARAN_PER_JENJANG[jenjang] || MODEL_PEMBELAJARAN_PER_JENJANG.SD;
  // Nilai dari saran katalog di luar daftar jenjang tetap bisa dipakai (opsi dinamis).
  const modelSelectOptions = modelOptions.some(m => m.value === modelPembelajaran)
    ? modelOptions
    : [...modelOptions, { value: modelPembelajaran, label: `${modelPembelajaran} - Rekomendasi katalog` }];
  const modelHint = (modelSelectOptions.find(m => m.value === modelPembelajaran)?.label.split(' - ')[1])
    || 'Sintaks model dipakai menyusun kegiatan inti.';
  const [targetPeserta, setTargetPeserta] = useState<string>('Peserta didik reguler/tipikal dengan diferensiasi gaya belajar');
  const [dimensiP5, setDimensiP5] = useState<string[]>([]);
  const [dimensiError, setDimensiError] = useState<boolean>(false);

  // Konteks ini menjaga agar hasil tetap berakar pada pengalaman guru dan kelas nyata.
  const [teacherStory, setTeacherStory] = useState('');
  const [studentProfile, setStudentProfile] = useState('');
  const [learningNeeds, setLearningNeeds] = useState('');
  const [localContext, setLocalContext] = useState('');
  const [priorKnowledge, setPriorKnowledge] = useState('');
  const [emotionalConsiderations, setEmotionalConsiderations] = useState('');
  const [teacherIntent, setTeacherIntent] = useState('');
  const [teacherVoice, setTeacherVoice] = useState<TeacherVoice>('hangat');

  // Soal config (custom penuh oleh guru)
  const [jumlahSoal, setJumlahSoal] = useState<string>('');
  const [bentukSoal, setBentukSoal] = useState<string[]>([]);
  const [komposisi, setKomposisi] = useState<{ mudah: string; sedang: string; sukar: string }>({ mudah: '', sedang: '', sukar: '' });

  const toggleBentuk = (value: string) => {
    setExtraError(null);
    setBentukSoal(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  };

  const komposisiTotal = (Number(komposisi.mudah) || 0) + (Number(komposisi.sedang) || 0) + (Number(komposisi.sukar) || 0);

  // P5 config
  const [temaP5, setTemaP5] = useState<string>('');

  // Per-type specifics (satu jenis = input khusus sendiri)
  const LAMPIRAN_OPTIONS = ['LKPD siap pakai', 'Bahan bacaan', 'Glosarium', 'Remedial–Pengayaan'];
  const [lampiran, setLampiran] = useState<string[]>([]);
  const [fokusRpp, setFokusRpp] = useState<string>('');
  const [jumlahAktivitas, setJumlahAktivitas] = useState<string>('');
  const [kunciLkpd, setKunciLkpd] = useState<boolean>(false);
  const [pendekatanKktp, setPendekatanKktp] = useState<string>('');
  const [semesterProta, setSemesterProta] = useState<string>('');
  const [tahunAjaran, setTahunAjaran] = useState<string>('');
  const [extraError, setExtraError] = useState<string | null>(null);

  const toggleLampiran = (item: string) => {
    setExtraError(null);
    setLampiran(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  /** Validasi input khusus jenis aktif. Null = lolos. */
  const validateTypeSpecific = (): string | null => {
    if (docType === 'modul_ajar' && lampiran.length === 0) return 'Pilih minimal 1 kelengkapan lampiran modul ajar.';
    if (docType === 'rpp' && !fokusRpp) return 'Pilih fokus penekanan RPP.';
    if (docType === 'lkpd' && !jumlahAktivitas) return 'Pilih jumlah aktivitas LKPD.';
    if (docType === 'kktp_atp' && !pendekatanKktp) return 'Pilih pendekatan KKTP yang dipakai.';
    if (docType === 'prota_promes' && (!semesterProta || !tahunAjaran.trim())) return 'Lengkapi semester dan tahun ajaran Prota–Promes.';
    if (docType === 'soal_ujian') {
      const n = Number(jumlahSoal);
      if (!jumlahSoal || !Number.isInteger(n) || n < 1 || n > 50) return 'Isi jumlah soal 1–50 butir.';
      if (bentukSoal.length === 0) return 'Pilih minimal 1 bentuk soal.';
      if (komposisiTotal !== 100) return 'Komposisi kesulitan harus total 100%.';
    }
    if (docType === 'modul_p5' && !temaP5) return 'Pilih tema projek P5.';
    return null;
  };

  const validateHumanContext = (): string | null => {
    if (teacherStory.trim().length < 20) return 'Ceritakan pengalaman atau alasan Anda memilih materi ini (minimal 20 karakter).';
    if (teacherIntent.trim().length < 10) return 'Tuliskan niat utama Anda untuk membantu murid melalui pembelajaran ini.';
    const filled = [studentProfile, learningNeeds, localContext, priorKnowledge, emotionalConsiderations]
      .filter(value => value.trim().length >= 10).length;
    if (filled < 2) return 'Lengkapi sedikitnya dua konteks kelas: profil, kebutuhan, konteks lokal, pengetahuan awal, atau pertimbangan emosional.';
    return null;
  };

  // Identitas kop
  const [schoolName, setSchoolName] = useState<string>(currentUser.schoolName || 'SD Negeri 01 Menteng Pagi');
  const [authorName, setAuthorName] = useState<string>(currentUser.name || 'Guru Mata Pelajaran');
  const [nip, setNip] = useState<string>(currentUser.nip || '');

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [formStep, setFormStep] = useState<number>(0);
  const [progressStep, setProgressStep] = useState<number>(0);

  const GENERATION_STEPS = [
    'Membaca CP, fase, dan profil kelas Anda...',
    'Menyusun kerangka dan tujuan pembelajaran...',
    'Menulis materi, kegiatan, dan asesmen...',
    'Memeriksa kelengkapan struktur...'
  ];

  // Putar pesan progres selama AI bekerja; reset saat selesai
  useEffect(() => {
    if (!isGenerating) {
      setProgressStep(0);
      return;
    }
    const timer = setInterval(() => {
      setProgressStep(prev => (prev + 1) % GENERATION_STEPS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Toggle P5 Dimensi
  const toggleDimensi = (dim: string) => {
    setDimensiError(false);
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
      parseAlokasi(item.alokasiWaktuDefault);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dimensiP5.length === 0) {
      setDimensiError(true);
      setFormStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const typeErr = validateTypeSpecific();
    if (typeErr) {
      setExtraError(typeErr);
      setFormStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const humanContextErr = validateHumanContext();
    if (humanContextErr) {
      setExtraError(humanContextErr);
      setFormStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const finalMapel = customMapel.trim() ? customMapel.trim() : mataPelajaran;

    onGenerate({
      authorId: currentUser.id,
      docType,
      jenjang,
      tingkat,
      fase,
      mataPelajaran: finalMapel,
      topik: topik.trim(),
      alokasiWaktu,
      modelPembelajaran,
      targetPeserta,
      dimensiP5,
      ...(docType === 'soal_ujian'
        ? {
            soalConfig: {
              jumlahSoal: Number(jumlahSoal) || 0,
              bentukSoal,
              komposisi: {
                mudah: Number(komposisi.mudah) || 0,
                sedang: Number(komposisi.sedang) || 0,
                sukar: Number(komposisi.sukar) || 0
              }
            }
          }
        : {}),
      authorName,
      schoolName,
      nip,
      classroomContext: {
        teacherStory: teacherStory.trim(),
        studentProfile: studentProfile.trim(),
        learningNeeds: learningNeeds.trim(),
        localContext: localContext.trim(),
        priorKnowledge: priorKnowledge.trim(),
        emotionalConsiderations: emotionalConsiderations.trim(),
        teacherIntent: teacherIntent.trim(),
        teacherVoice
      },
      catatanTambahan: {
        temaP5,
        lampiran,
        fokusRpp,
        jumlahAktivitas: jumlahAktivitas ? Number(jumlahAktivitas) : undefined,
        kunciLkpd,
        pendekatanKktp,
        semesterProta,
        tahunAjaran: tahunAjaran.trim() || undefined
      }
    });
  };

  const handleNextStep = () => {
    if (formStep === 1 && dimensiP5.length === 0) {
      setDimensiError(true);
      document.getElementById('dimensi-label')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (formStep === 1) {
      const typeErr = validateTypeSpecific();
      if (typeErr) {
        setExtraError(typeErr);
        return;
      }
      const humanContextErr = validateHumanContext();
      if (humanContextErr) {
        setExtraError(humanContextErr);
        document.getElementById('teacher-story')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    const form = document.querySelector('form');
    if (!form?.reportValidity()) return;
    setExtraError(null);
    setFormStep((step) => Math.min(step + 1, 2));
  };

  const isVerified = currentUser.status === 'VERIFIED';
  const availableFases = JENJANG_CONFIGS[jenjang]?.fases || [];
  const currentFaseObj = availableFases.find(f => f.fase === fase) || availableFases[0];

  return (
    <div className="apple-card overflow-hidden shadow-[var(--app-shadow-md)]">
      
      {/* Verification Notice Banner if Pending */}
      {!isVerified && (
        <div className="border-b border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-warning)_9%,transparent)] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ff9f0a]/15 flex items-center justify-center text-[#9a6700] shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold">
                {currentUser.status === 'PENDING' ? 'Menunggu verifikasi admin' : 'Belum terverifikasi'}
              </h4>
              <p className="mt-0.5 text-[13px] text-[var(--app-text-secondary)]">
                Profil {currentUser.email} belum disetujui. Anda tetap bisa menyusun draf, hubungi admin bila status tak berubah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header ringkas */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--app-border)] px-5 py-4 sm:px-7">
        <h2 className="text-[20px] font-bold tracking-[-.02em] sm:text-[22px]">
          Susun {DOC_TYPE_INFO[docType].label}
        </h2>
        <span className="text-[12.5px] text-[var(--app-text-secondary)]">Draf berbantuan AI · 3 langkah</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-7">
        {/* Progres penyusunan bertahap */}
        {isGenerating && (
          <div className="mb-6 rounded-2xl border border-black/10 dark:border-white/15 bg-[#f5f5f7] dark:bg-white/5 px-5 py-4" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">Menyusun {DOC_TYPE_INFO[docType].label}...</p>
                <p key={progressStep} className="text-[13px] text-[#6e6e73] dark:text-[#98989d] truncate">
                  {GENERATION_STEPS[progressStep]}
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-black dark:bg-white transition-all duration-700"
                style={{ width: `${((progressStep + 1) / GENERATION_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
        <ol className="glass-panel mx-auto flex w-fit max-w-full items-center justify-center gap-1 rounded-full p-1.5 mb-8 overflow-x-auto" aria-label="Tahapan penyusunan dokumen">
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
                className={`flex shrink-0 items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 text-[12.5px] font-semibold transition-all min-h-[36px] ${
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

        <p className="mb-5 text-[12.5px] text-[var(--app-text-secondary)]" aria-live="polite">
          {formStep === 0 ? 'Tentukan fase dan kelas di jenjang Anda.' :
            formStep === 1 ? 'Isi mata pelajaran, materi, dan kebutuhan murid.' :
              'Periksa ringkasan, lalu susun.'}
        </p>

        {/* 1. Jenis dokumen — mengikuti pilihan sidebar */}
        {formStep === 0 && <>
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--app-border)] px-4 py-3">
          <span className="shrink-0 text-[var(--app-text-secondary)]">
            {docType === 'modul_ajar' && <FileText className="w-5 h-5" />}
            {docType === 'rpp' && <Layers className="w-5 h-5" />}
            {docType === 'soal_ujian' && <HelpCircle className="w-5 h-5" />}
            {docType === 'lkpd' && <BookOpen className="w-5 h-5" />}
            {docType === 'kktp_atp' && <Target className="w-5 h-5" />}
            {docType === 'prota_promes' && <Calendar className="w-5 h-5" />}
            {docType === 'modul_p5' && <Sparkles className="w-5 h-5" />}
          </span>
          <p className="min-w-0 flex-1 truncate text-[13.5px]">
            <b>{DOC_TYPE_INFO[docType].label}</b>
            <span className="text-[var(--app-text-secondary)]"> · {DOC_TYPE_INFO[docType].badge}</span>
          </p>
          <span className="shrink-0 text-[12px] text-[var(--app-text-tertiary)]">via sidebar</span>
        </div>

        {/* 2. Jenjang, Fase, & Kelas */}
        <div className="mt-5 space-y-3">
          <p className="text-[14px] font-semibold">
            Kelas & fase
          </p>

          {/* Jenjang terkunci profil — 1 akun untuk 1 jenjang */}
          <p className="text-[12.5px] text-[var(--app-text-secondary)]">
            Jenjang <b className="text-[var(--app-text)]">{jenjang}</b> mengikuti profil Anda · terkunci
          </p>

          {/* Fase & Tingkat Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="field-label field-required" htmlFor="gen-fase">
                Fase
              </label>
              <select
                id="gen-fase"
                value={fase}
                required
                onChange={(e) => {
                  const newF = e.target.value;
                  setFase(newF);
                  setTingkat('');
                }}
                className="apple-input !bg-[var(--app-surface-solid)]"
              >
                <option value="">— Pilih fase —</option>
                {availableFases.map((f) => (
                  <option key={f.fase} value={f.fase}>
                    {f.fase} ({f.kelas.join(', ')}) - {f.deskripsi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label field-required" htmlFor="gen-tingkat">
                Kelas
              </label>
              <select
                id="gen-tingkat"
                value={tingkat}
                required
                disabled={!fase}
                onChange={(e) => setTingkat(e.target.value)}
                className="apple-input !bg-white"
              >
                <option value="">{fase ? '— Pilih kelas —' : 'Pilih fase dulu'}</option>
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
        <section aria-label="Mata pelajaran dan topik">
          <p className="section-label mb-3">Mata pelajaran & topik</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="field-label field-required" htmlFor="gen-mapel">
                Mata pelajaran
              </label>
              <div className="space-y-2">
              <select
                id="gen-mapel"
                value={mataPelajaran}
                required
                onChange={(e) => {
                  setMataPelajaran(e.target.value);
                  setCustomMapel('');
                }}
                className="apple-input"
              >
                <option value="">— Pilih mata pelajaran —</option>
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
                    aria-label="Nama mata pelajaran lain"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="field-label field-required" htmlFor="gen-topik">
                Topik / materi pokok
              </label>
              <input
                id="gen-topik"
                type="text"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Contoh: Pecahan, Siklus Air, Hukum Newton…"
                required
                minLength={3}
                className="apple-input"
                aria-describedby="gen-topik-hint"
              />
              <p id="gen-topik-hint" className="field-hint">Spesifik lebih baik: “Operasi hitung pecahan” mengalahkan “Matematika”.</p>
            </div>
          </div>
        </section>

        {/* Dynamic Contextual Topic Suggestions based on Fase, Tingkat & Mata Pelajaran */}
        <ContextualTopicSuggester
          jenjang={jenjang}
          fase={fase}
          tingkat={tingkat}
          mataPelajaran={customMapel.trim() ? customMapel : mataPelajaran}
          currentTopik={topik}
          onSelectTopic={handleSelectContextualTopic}
        />

        <section aria-label="Cerita guru dan konteks kelas" className="mt-5 rounded-2xl border border-[#34c759]/25 bg-[#34c759]/[0.06] p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#34c759]/15 text-[#248a3d]"><UserCheck className="h-5 w-5" /></div>
            <div>
              <p className="section-label">Cerita guru & konteks kelas</p>
              <p className="field-hint mt-1">Ceritakan kelas Anda dengan bahasa sendiri. AI hanya membantu merapikan; keputusan pedagogis tetap milik Anda.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="field-label field-required" htmlFor="teacher-story">Mengapa materi ini penting bagi kelas Anda?</label>
              <textarea id="teacher-story" value={teacherStory} onChange={e => { setTeacherStory(e.target.value); setExtraError(null); }} required minLength={20} maxLength={2000} rows={3} className="apple-input resize-y" placeholder="Contoh: Anak-anak sering memakai pecahan saat membagi makanan di rumah, tetapi masih ragu menjelaskan alasannya..." />
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div><label className="field-label" htmlFor="student-profile">Seperti apa murid di kelas ini?</label><textarea id="student-profile" value={studentProfile} onChange={e => setStudentProfile(e.target.value)} maxLength={2000} rows={3} className="apple-input resize-y" placeholder="Minat, kebiasaan belajar, keragaman kemampuan..." /></div>
              <div><label className="field-label" htmlFor="learning-needs">Kebutuhan belajar yang perlu diperhatikan</label><textarea id="learning-needs" value={learningNeeds} onChange={e => setLearningNeeds(e.target.value)} maxLength={2000} rows={3} className="apple-input resize-y" placeholder="Dukungan, tantangan, atau diferensiasi yang dibutuhkan..." /></div>
              <div><label className="field-label" htmlFor="local-context">Konteks lokal atau kehidupan sehari-hari</label><textarea id="local-context" value={localContext} onChange={e => setLocalContext(e.target.value)} maxLength={2000} rows={3} className="apple-input resize-y" placeholder="Lingkungan, budaya, pekerjaan orang tua, atau isu sekitar..." /></div>
              <div><label className="field-label" htmlFor="prior-knowledge">Pengetahuan awal murid</label><textarea id="prior-knowledge" value={priorKnowledge} onChange={e => setPriorKnowledge(e.target.value)} maxLength={2000} rows={3} className="apple-input resize-y" placeholder="Apa yang sudah mereka pahami atau sering keliru?" /></div>
              <div><label className="field-label" htmlFor="emotional-considerations">Pertimbangan relasi dan emosi</label><textarea id="emotional-considerations" value={emotionalConsiderations} onChange={e => setEmotionalConsiderations(e.target.value)} maxLength={2000} rows={3} className="apple-input resize-y" placeholder="Cara menjaga rasa aman, percaya diri, dan saling menghargai..." /></div>
              <div><label className="field-label" htmlFor="teacher-voice">Nada suara dokumen</label><select id="teacher-voice" value={teacherVoice} onChange={e => setTeacherVoice(e.target.value as TeacherVoice)} className="apple-input"><option value="hangat">Hangat dan menyemangati</option><option value="reflektif">Reflektif dan penuh pertimbangan</option><option value="praktis">Praktis dan lugas</option><option value="dialogis">Dialogis dan dekat dengan murid</option><option value="kreatif">Kreatif dan ekspresif</option></select></div>
            </div>
            <div><label className="field-label field-required" htmlFor="teacher-intent">Niat utama Anda sebagai guru</label><textarea id="teacher-intent" value={teacherIntent} onChange={e => { setTeacherIntent(e.target.value); setExtraError(null); }} required minLength={10} maxLength={2000} rows={2} className="apple-input resize-y" placeholder="Setelah pembelajaran ini, perubahan apa yang paling ingin Anda lihat pada murid?" /></div>
          </div>
        </section>

        {/* Waktu, model & profil */}
        <section aria-label="Waktu, model, dan profil" className="mt-5">
          <p className="section-label mb-3">Waktu, model & profil</p>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3">
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="field-label field-required" htmlFor="gen-jp">
                Jumlah JP
              </label>
              <select
                id="gen-jp"
                value={alokasiJP}
                required
                onChange={(e) => setAlokasiJP(e.target.value)}
                className="apple-input"
              >
                <option value="">—</option>
                {['1', '2', '3', '4', '5', '6'].map(n => (
                  <option key={n} value={n}>{n} JP</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label field-required" htmlFor="gen-durasi">
                Durasi / JP
              </label>
              <select
                id="gen-durasi"
                value={durasiJP}
                required
                onChange={(e) => setDurasiJP(e.target.value)}
                className="apple-input"
              >
                <option value="">—</option>
                {['30', '35', '40', '45'].map(n => (
                  <option key={n} value={n}>{n} mnt</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label field-required" htmlFor="gen-pertemuan">
                Pertemuan
              </label>
              <select
                id="gen-pertemuan"
                value={jumlahPertemuan}
                required
                onChange={(e) => setJumlahPertemuan(e.target.value)}
                className="apple-input"
              >
                <option value="">—</option>
                {['1', '2', '3', '4'].map(n => (
                  <option key={n} value={n}>{n}×</option>
                ))}
              </select>
            </div>
          </div>
          <p className="field-hint !mt-1.5" aria-live="polite">
            {alokasiWaktu
              ? `Total: ${alokasiWaktu} • ${Number(alokasiJP) * Number(durasiJP) * Number(jumlahPertemuan)} menit keseluruhan.`
              : 'Lengkapi ketiga pilihan untuk melihat total alokasi.'}
          </p>
          </div>

            <div className="lg:col-span-2">
              <label className="field-label" htmlFor="gen-model">
                Model pembelajaran ({jenjang})
              </label>
              <select
                id="gen-model"
                value={modelPembelajaran}
                onChange={(e) => setModelPembelajaran(e.target.value)}
                className="apple-input"
                aria-describedby="gen-model-hint"
              >
                {modelSelectOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p id="gen-model-hint" className="field-hint">
                {modelHint}
              </p>
            </div>
          </div>
        </section>

        {/* Dimensi Profil Pelajar Pancasila */}
        <section aria-label="Dimensi Profil Pelajar Pancasila" className="mt-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[14px] font-semibold" id="dimensi-label">
              Dimensi Profil Pelajar Pancasila
            </p>
            <span className="text-[12.5px] text-[#6e6e73]">
              {dimensiP5.length} dipilih
            </span>
          </div>
          <p className="field-hint !mt-0 mb-2">Pilih 2–4 dimensi yang paling dikuatkan kegiatan ini.</p>
          {dimensiError && (
            <p role="alert" className="field-error !mt-0 mb-2">Pilih minimal 1 dimensi Profil Pelajar Pancasila.</p>
          )}
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
        </section>

        {/* 7. Dedicated Configuration Card per Document Type */}
        {docType === 'soal_ujian' && (
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-4 mt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[14px]">
                    Konfigurasi paket soal (AKM & HOTS)
                  </h4>
                  <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
                    Kisi-kisi & kunci pembahasan otomatis
                  </p>
                </div>
              </div>
              <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
                C1–C6
              </span>
            </div>

            <div>
              <label className="field-label field-required" htmlFor="gen-jumlah">
                Jumlah butir soal
              </label>
              <input
                id="gen-jumlah"
                type="number"
                min={1}
                max={50}
                step={1}
                value={jumlahSoal}
                required
                onChange={(e) => { setJumlahSoal(e.target.value); setExtraError(null); }}
                placeholder="mis. 15"
                className="apple-input !bg-white dark:!bg-white/5"
                aria-describedby="gen-jumlah-hint"
              />
              <p id="gen-jumlah-hint" className="field-hint">1–50 butir per paket.</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[14px] font-semibold mb-1.5" id="gen-bentuk-label">
                Bentuk soal <span className="text-[var(--app-danger)] font-bold" aria-hidden="true">*</span>
                <span className="sr-only">(wajib, pilih minimal 1)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-labelledby="gen-bentuk-label">
                {BENTUK_SOAL_OPTIONS.map(opt => {
                  const checked = bentukSoal.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleBentuk(opt.value)}
                      aria-pressed={checked}
                      className={`p-3 rounded-2xl text-left transition-all cursor-pointer min-h-[52px] border ${
                        checked
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                          : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <span className="block text-[13.5px] font-semibold leading-snug">{opt.value}</span>
                      <span className={`block text-[12px] mt-0.5 ${checked ? 'opacity-70' : 'text-[#6e6e73] dark:text-[#98989d]'}`}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[14px] font-semibold mb-1" id="gen-komposisi-label">
                Tingkat kemudahan <span className="text-[var(--app-danger)] font-bold" aria-hidden="true">*</span>
                <span className="sr-only">(wajib, total harus 100%)</span>
              </p>
              <p className="field-hint !mt-0 mb-2">Bagi 100% ke tiga tingkat — Mudah ≈ C1–C2, Sedang ≈ C3–C4, Sukar ≈ C5–C6 (HOTS).</p>
              <div className="grid grid-cols-3 gap-2.5" role="group" aria-labelledby="gen-komposisi-label">
                {([
                  ['mudah', 'Mudah'],
                  ['sedang', 'Sedang'],
                  ['sukar', 'Sukar']
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-[12.5px] font-medium mb-1 text-[#6e6e73] dark:text-[#98989d]" htmlFor={`gen-komp-${key}`}>
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        id={`gen-komp-${key}`}
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={komposisi[key]}
                        required
                        onChange={(e) => { setKomposisi(prev => ({ ...prev, [key]: e.target.value })); setExtraError(null); }}
                        placeholder="0"
                        className="apple-input !bg-white dark:!bg-white/5 !pr-9"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#86868b] pointer-events-none">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className={`mt-1.5 text-[12.5px] font-semibold ${komposisiTotal === 100 ? 'text-[#30b158]' : 'text-[#6e6e73] dark:text-[#98989d]'}`} aria-live="polite">
                Total: {komposisiTotal}% {komposisiTotal === 100 ? '— pas' : '(harus 100%)'}
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-[12.5px] text-[#424245] dark:text-[#c7c7cc]">
              <span className="font-semibold block">Kisi-kisi & kunci otomatis</span>
              <p className="mt-0.5">
                Setiap paket dilengkapi tabel kisi-kisi, kunci jawaban, pembahasan, dan pedoman penskoran.
              </p>
            </div>
            {extraError && docType === 'soal_ujian' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        {docType === 'modul_p5' && (
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-4 mt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[14px]">
                    Konfigurasi projek P5
                  </h4>
                  <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
                    Sesuai panduan BSKAP
                  </p>
                </div>
              </div>
              <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
                8 tema
              </span>
            </div>

            <div>
              <label className="block text-[13px] font-semibold mb-1.5">
                Tema projek
              </label>
              <select
                value={temaP5}
                required
                onChange={(e) => setTemaP5(e.target.value)}
                className="apple-input !bg-white dark:!bg-white/5"
              >
                <option value="">— Pilih tema —</option>
                {TEMA_P5.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-[12.5px] text-[#424245] dark:text-[#c7c7cc]">
              <span className="font-semibold block mb-0.5">Alur projek</span>
              <p>
                Pengenalan → Kontekstualisasi → Aksi nyata → Refleksi & gelar karya.
              </p>
            </div>
            {extraError && docType === 'modul_p5' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        {docType === 'modul_ajar' && (
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-3 mt-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-[14px]">
                  Kelengkapan lampiran
                </h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
                  Pilih minimal 1 — hanya yang dipilih yang disusun
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Kelengkapan lampiran">
              {LAMPIRAN_OPTIONS.map(item => {
                const checked = lampiran.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleLampiran(item)}
                    aria-pressed={checked}
                    className={`p-3 rounded-2xl text-left text-[13.5px] font-medium flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                      checked
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30'
                    }`}
                  >
                    <span className="truncate pr-1">{item}</span>
                    {checked ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-black/20 dark:border-white/30 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            {extraError && docType === 'modul_ajar' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        {docType === 'kktp_atp' && (
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-3 mt-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-[14px]">
                  ATP & KKTP
                </h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
                  3 pendekatan resmi ketuntasan belajar
                </p>
              </div>
            </div>

            <div>
              <label className="field-label field-required" htmlFor="gen-pendekatan">
                Pendekatan KKTP yang dipakai
              </label>
              <select
                id="gen-pendekatan"
                value={pendekatanKktp}
                required
                onChange={(e) => { setPendekatanKktp(e.target.value); setExtraError(null); }}
                className="apple-input !bg-white dark:!bg-white/5"
              >
                <option value="">— Pilih pendekatan —</option>
                <option value="Ketiganya">Ketiganya (lengkap)</option>
                <option value="Deskripsi Kriteria">Deskripsi kriteria</option>
                <option value="Rubrik Skala">Rubrik skala (BB–Mahir)</option>
                <option value="Interval Nilai">Interval nilai</option>
              </select>
              <p className="field-hint">Rubrik 4 level; interval mengatur remedial–pengayaan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12.5px] pt-1">
              <div className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <b className="block mb-0.5">1. Deskripsi kriteria</b>
                Daftar ketercapaian tujuan esensial.
              </div>
              <div className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <b className="block mb-0.5">2. Rubrik skala</b>
                Baru Berkembang → Mahir.
              </div>
              <div className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <b className="block mb-0.5">3. Interval nilai</b>
                Remedial & pengayaan.
              </div>
            </div>
            {extraError && docType === 'kktp_atp' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        {docType === 'rpp' && (
          <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-3 mt-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-[14px]">
                  RPP ringkas siap supervisi
                </h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5 leading-relaxed">
                  Esensi padat berorientasi murid: <b>tujuan</b>, <b>sintaks PBL/PjBL</b>, dan <b>asesmen cepat</b>.
                </p>
              </div>
            </div>
            <div>
              <label className="field-label field-required" htmlFor="gen-fokus">
                Fokus penekanan
              </label>
              <select
                id="gen-fokus"
                value={fokusRpp}
                required
                onChange={(e) => { setFokusRpp(e.target.value); setExtraError(null); }}
                className="apple-input !bg-white dark:!bg-white/5"
              >
                <option value="">— Pilih fokus —</option>
                <option value="Seimbang">Seimbang (semua komponen)</option>
                <option value="Kegiatan Inti">Kegiatan inti (sintaks model)</option>
                <option value="Asesmen">Asesmen & instrumen</option>
                <option value="Diferensiasi">Diferensiasi kebutuhan murid</option>
              </select>
            </div>
            {extraError && docType === 'rpp' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        {docType === 'lkpd' && (
          <div className="p-4 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-3 mt-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-[14px]">
                  LKPD siap cetak
                </h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5 leading-relaxed">
                  Kop kelompok, petunjuk kerja, stimulus nyata, tabel pengamatan, dan rubrik penilaian diri.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label field-required" htmlFor="gen-aktivitas">
                  Jumlah aktivitas
                </label>
                <select
                  id="gen-aktivitas"
                  value={jumlahAktivitas}
                  required
                  onChange={(e) => { setJumlahAktivitas(e.target.value); setExtraError(null); }}
                  className="apple-input !bg-white dark:!bg-white/5"
                >
                  <option value="">— Pilih —</option>
                  <option value="2">2 aktivitas</option>
                  <option value="3">3 aktivitas</option>
                  <option value="4">4 aktivitas</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 cursor-pointer rounded-2xl border border-black/10 dark:border-white/15 px-4 py-3 min-h-[46px] text-[13.5px] font-medium w-full">
                  <input
                    type="checkbox"
                    checked={kunciLkpd}
                    onChange={(e) => setKunciLkpd(e.target.checked)}
                    className="h-5 w-5 accent-black dark:accent-white"
                  />
                  Kunci jawaban guru
                </label>
              </div>
            </div>
            {extraError && docType === 'lkpd' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        {docType === 'prota_promes' && (
          <div className="p-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 space-y-3 mt-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-black dark:bg-white dark:text-black text-white shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-[14px]">
                  Cakupan program
                </h4>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
                  Tentukan semester dan tahun ajaran yang disusun
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label field-required" htmlFor="gen-semester">
                  Semester
                </label>
                <select
                  id="gen-semester"
                  value={semesterProta}
                  required
                  onChange={(e) => { setSemesterProta(e.target.value); setExtraError(null); }}
                  className="apple-input !bg-white dark:!bg-white/5"
                >
                  <option value="">— Pilih semester —</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                  <option value="Keduanya">Keduanya (setahun penuh)</option>
                </select>
              </div>
              <div>
                <label className="field-label field-required" htmlFor="gen-tahun">
                  Tahun ajaran
                </label>
                <input
                  id="gen-tahun"
                  type="text"
                  value={tahunAjaran}
                  required
                  onChange={(e) => { setTahunAjaran(e.target.value); setExtraError(null); }}
                  placeholder="2026/2027"
                  className="apple-input !bg-white dark:!bg-white/5"
                />
              </div>
            </div>
            {extraError && docType === 'prota_promes' && (
              <p role="alert" className="field-error !mt-1">{extraError}</p>
            )}
          </div>
        )}

        </>}

        {formStep === 2 && <>
        <div className="mb-5 rounded-2xl bg-[#f5f5f7] dark:bg-white/5 p-4 sm:p-5">
          <h4 className="mb-3 text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Ringkasan dokumen</h4>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">Format</dt>
              <dd className="text-[14px] font-semibold">{DOC_TYPE_INFO[docType].label}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">Kelas</dt>
              <dd className="text-[14px] font-semibold">{jenjang} · {tingkat} · {fase}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">Mata pelajaran</dt>
              <dd className="text-[14px] font-semibold">{customMapel.trim() || mataPelajaran}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">Topik</dt>
              <dd className="text-[14px] font-semibold">{topik}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">Konteks manusiawi</dt>
              <dd className="text-[14px] font-semibold">{teacherVoice} · {teacherStory ? 'cerita guru siap dipakai' : 'belum diisi'}</dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-black/10 dark:border-white/10 pt-3 text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
            Atas nama <b>{authorName}</b> · {schoolName}. Ubah identitas di bawah bila perlu.
          </p>
        </div>

        {/* Mini pratinjau kertas */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#1c1c1e]" aria-label="Pratinjau dokumen">
          <div className="border-b-4 border-double border-black px-5 py-4 text-center" style={{ fontFamily: 'Calibri, Segoe UI, Arial, sans-serif' }}>
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#555]">KURIKULUM MERDEKA</p>
            <p className="mt-0.5 text-[15px] font-bold uppercase leading-snug">{schoolName || 'Satuan Pendidikan'}</p>
          </div>
          <div className="px-5 py-4" style={{ fontFamily: 'Calibri, Segoe UI, Arial, sans-serif' }}>
            <p className="text-center text-[14px] font-bold leading-snug">
              {DOC_TYPE_INFO[docType].label} — {customMapel.trim() || mataPelajaran} {tingkat} ({topik || '…'})
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
              {[`${jenjang} · ${fase}`, alokasiWaktu || 'Alokasi menyusul', modelPembelajaran].map(chip => (
                <span key={chip} className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
                  {chip}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-center text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">
              Kertas A4 · Calibri 12 · kop, isi lengkap, dan pengesahan dibuat otomatis
            </p>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <div className="border border-black/10 dark:border-white/15 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 py-3.5 hover:bg-black/[0.03] dark:hover:bg-white/5 flex items-center justify-between text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Identitas & opsi tambahan
            </span>
            <span className="text-[12.5px] font-medium text-[#6e6e73] dark:text-[#98989d] flex items-center gap-1">
              {showAdvanced ? 'Tutup' : 'Buka'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {showAdvanced && (
            <div className="p-5 space-y-4 border-t border-black/10 dark:border-white/10">

              {/* Kop Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">
                    Sekolah
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SD Negeri 01 Menteng Pagi"
                    className="apple-input"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">
                    Nama penyusun
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Contoh: Siti Nurhaliza, S.Pd."
                    className="apple-input"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">
                    NIP <span className="font-normal text-[#86868b]">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19890412 201402 2 003"
                    className="apple-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Target peserta didik & diferensiasi
                </label>
                <input
                  type="text"
                  value={targetPeserta}
                  onChange={(e) => setTargetPeserta(e.target.value)}
                  placeholder="Reguler, diferensiasi auditori, visual, kinestetik"
                  className="apple-input"
                />
              </div>
            </div>
          )}
        </div>
        </>}

        {/* Bar navigasi — selalu tampil di langkah 1, 2, 3 */}
        {submitError && !isGenerating && (
          <div className="mb-3 rounded-2xl border border-[var(--app-danger)]/30 bg-[var(--app-danger)]/5 px-5 py-4" role="alert">
            <p className="text-[14px] font-bold">Penyusunan gagal</p>
            <p className="mt-1 text-[13px] leading-6 text-[var(--app-text-secondary)]">{submitError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="btn-apple-secondary btn-sm"
              >
                Periksa input langkah 2
              </button>
              {formStep === 2 && (
                <button type="submit" className="btn-apple btn-sm">
                  Coba lagi
                </button>
              )}
            </div>
          </div>
        )}
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
