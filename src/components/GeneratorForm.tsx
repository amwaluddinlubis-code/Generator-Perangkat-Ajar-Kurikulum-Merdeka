import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Jenjang, 
  DocType, 
  GeneratorParams, 
  TeacherUser,
  Paket
} from '../types';
import {
  JENJANG_CONFIGS,
  DIMENSI_PROFIL_LULUSAN,
  MODEL_PEMBELAJARAN,
  TEMA_P5,
  DOC_TYPE_INFO,
} from '../data/curriculumData';
import { ContextualTopicSuggester } from './ContextualTopicSuggester';
import { KomposisiSoal, KomposisiSoalState, KOMPOSISI_DEFAULT } from './KomposisiSoal';
import { P5ThematicGeneratorSection } from './P5ThematicGeneratorSection';
import { CurriculumTopicItem } from '../data/topicCatalog';
import { apiFetch } from '../utils/api';
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
  Check,
  Lock,
  XCircle,
  X
} from 'lucide-react';

interface GeneratorFormProps {
  currentUser: TeacherUser;
  onGenerate: (params: GeneratorParams) => Promise<void>;
  isGenerating: boolean;
  activeDocType?: DocType;
  onSelectDocType?: (type: DocType) => void;
  // GEL2: mode paket — generator terhubung paket. Bila diisi, konteks
  // (paket + docType) terkunci, hasil generate disimpan sebagai versi baru,
  // dan onSelesai dipanggil setelah versi tersimpan.
  paketMode?: {
    paket: Paket;
    docType: DocType;
    onSelesai: () => void;
  };
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  currentUser,
  onGenerate,
  isGenerating,
  activeDocType,
  onSelectDocType,
  paketMode
}) => {
  // GEL2: docType dikunci mengikuti kartu yang diklik bila paketMode ada.
  const [docType, setDocType] = useState<DocType>(paketMode?.docType || activeDocType || 'modul_ajar');
  // FITUR 1: sakelar LKPD 3 tingkat diferensiasi (hanya relevan saat docType==='lkpd').
  const [lkpdTiered, setLkpdTiered] = useState(false);

  useEffect(() => {
    if (paketMode) {
      // GEL2: pemilih jenis dokumen disembunyikan — docType selalu terkunci.
      if (docType !== paketMode.docType) setDocType(paketMode.docType);
      return;
    }
    if (activeDocType && activeDocType !== docType) {
      setDocType(activeDocType);
    }
    // FITUR 1: matikan sakelar tiered begitu docType bukan lkpd.
    if (docType !== 'lkpd' && lkpdTiered) setLkpdTiered(false);
  }, [activeDocType, paketMode, docType, lkpdTiered]);

  // Sinkronkan form bila akun berganti (mis. demo SD -> SMP) agar
  // fase/kelas/mapel selalu valid untuk jenjang pengguna aktif.
  // GEL2: mode paket — konteks berasal dari paket, bukan dari akun; jangan reset.
  useEffect(() => {
    if (paketMode) return;
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
  }, [currentUser.id, paketMode]);

  const handleDocTypeChange = (newType: DocType) => {
    setDocType(newType);
    if (newType === 'modul_p5') {
      if (!alokasiWaktu.includes('JP') || alokasiWaktu.includes('Menit')) {
        setAlokasiWaktu('36 JP');
      }
    } else {
      if (alokasiWaktu === '36 JP' || alokasiWaktu === '48 JP' || alokasiWaktu === '72 JP') {
        setAlokasiWaktu(defaultAlokasi(jenjang));
      }
    }
    onSelectDocType?.(newType);
  };

  const defaultAlokasi = (j: Jenjang) =>
    j === 'SD' ? '2 JP (2 x 35 Menit) - 1 Pertemuan' :
    j === 'SMP' ? '2 JP (2 x 40 Menit) - 1 Pertemuan' :
    '2 JP (2 x 45 Menit) - 1 Pertemuan';

  const initialCfg = (() => {
    // GEL2: mode paket — jenjang awal mengikuti paket, bukan akun/default.
    const j: Jenjang = paketMode?.paket.jenjang || currentUser.jenjang || 'SD';
    return JENJANG_CONFIGS[j] || JENJANG_CONFIGS['SD'];
  })();

  const [jenjang, setJenjang] = useState<Jenjang>(paketMode?.paket.jenjang || currentUser.jenjang || 'SD');
  const [fase, setFase] = useState<string>(paketMode?.paket.fase || initialCfg.fases[0]?.fase || 'Fase B');
  const [tingkat, setTingkat] = useState<string>(paketMode?.paket.tingkat || initialCfg.fases[0]?.kelas[0] || 'Kelas 4');
  const [mataPelajaran, setMataPelajaran] = useState<string>(paketMode?.paket.mataPelajaran || initialCfg.defaultMapel[0] || 'IPAS (Ilmu Pengetahuan Alam & Sosial)');
  const [customMapel, setCustomMapel] = useState<string>('');
  // UX: topik dikosongkan — default "Bagian Tubuh Tumbuhan..." membingungkan guru non-IPA
  // dan berisiko terkirim tanpa disadari. Placeholder + validasi inline memandu pengisian.
  // GEL2: mode paket — topik awal mengikuti topik paket.
  const [topik, setTopik] = useState<string>(paketMode?.paket.topik || '');
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>(() => defaultAlokasi(paketMode?.paket.jenjang || currentUser.jenjang || 'SD'));
  const [modelPembelajaran, setModelPembelajaran] = useState<string>('Problem Based Learning (PBL)');
  const [targetPeserta, setTargetPeserta] = useState<string>('Peserta didik reguler/tipikal dengan diferensiasi gaya belajar');
  const [dimensiProfilLulusan, setDimensiProfilLulusan] = useState<string[]>([
    'Penalaran Kritis',
    'Kolaborasi',
    'Kemandirian'
  ]);
  
  // Soal config — guru bebas kustom komposisi tiap jenis soal (FITUR: soal kustom)
  const [komposisiSoal, setKomposisiSoal] = useState<KomposisiSoalState>({ ...KOMPOSISI_DEFAULT });
  const jumlahSoal = Object.values(komposisiSoal).reduce((a, b) => a + (Number(b) || 0), 0);
  const [levelKognitif, setLevelKognitif] = useState<string>('Kombinasi MOTS & HOTS (C3-C5)');
  const [pesanValidasi, setPesanValidasi] = useState<string | null>(null);

  // Konfigurasi tema & modul projek P5
  const [temaP5, setTemaP5] = useState<string>('Gaya Hidup Berkelanjutan');
  const [isuKontekstual, setIsuKontekstual] = useState<string>('');
  const [bentukAksi, setBentukAksi] = useState<string>('Gelar Karya & Pameran Projek Komunitas Sekolah');
  const [sistemWaktu, setSistemWaktu] = useState<string>('Sistem Terjadwal Berkala (1 Hari per Minggu)');
  const [mitraProjek, setMitraProjek] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Identitas kop
  // UX: tanpa default "SD Negeri 01 Menteng Pagi" yang salah jenjang untuk guru SMP;
  // placeholder memandu pengisian dan konsisten dengan reset saat ganti akun.
  const [schoolName, setSchoolName] = useState<string>(currentUser.schoolName || '');
  const [authorName, setAuthorName] = useState<string>(currentUser.name || 'Guru Mata Pelajaran');
  const [nip, setNip] = useState<string>(currentUser.nip || '');

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [formStep, setFormStep] = useState<number>(0);

  // UX: pesan error inline per field — menggantikan tooltip generik reportValidity()
  const [fieldErrors, setFieldErrors] = useState<{ topik?: string; customMapel?: string; alokasiWaktu?: string }>({});
  // UX: notifikasi sementara saat saran topik ikut mengubah model/alokasi waktu
  const [saranNotice, setSaranNotice] = useState<string | null>(null);

  // UX: notifikasi saran hilang otomatis setelah 5 detik agar tidak menumpuk
  useEffect(() => {
    if (!saranNotice) return;
    const t = setTimeout(() => setSaranNotice(null), 5000);
    return () => clearTimeout(t);
  }, [saranNotice]);

  // GEL2: toast lokal mengikuti pola DocumentRepository/PaketWorkspace —
  // dipakai mode paket untuk kabar sukses/gagal generate & simpan versi.
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    setToast({ message, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  // GEL2: kunci double-submit khusus mode paket (isGenerating milik parent
  // mungkin tidak diset saat generate dari dalam mode paket).
  const [sedangSimpan, setSedangSimpan] = useState<boolean>(false);

  // Toggle dimensi Profil Lulusan
  const toggleDimensiProfil = (dim: string) => {
    if (dimensiProfilLulusan.includes(dim)) {
      if (dimensiProfilLulusan.length > 1) {
        setDimensiProfilLulusan(dimensiProfilLulusan.filter(d => d !== dim));
      }
    } else {
      setDimensiProfilLulusan([...dimensiProfilLulusan, dim]);
    }
  };

  // UX: saran topik yang ikut mengubah model/alokasi waktu kini diberi tahu ke pengguna
  // (sebelumnya ditimpa diam-diam), dan error topik ikut dibersihkan saat topik dipilih.
  const handleSelectContextualTopic = (item: CurriculumTopicItem) => {
    setTopik(item.topik);
    setFieldErrors((prev) => ({ ...prev, topik: undefined }));
    const disesuaikan: string[] = [];
    if (item.rekomendasiModel && item.rekomendasiModel !== modelPembelajaran) {
      setModelPembelajaran(item.rekomendasiModel);
      disesuaikan.push('model pembelajaran');
    }
    if (item.alokasiWaktuDefault && item.alokasiWaktuDefault !== alokasiWaktu) {
      setAlokasiWaktu(item.alokasiWaktuDefault);
      disesuaikan.push('alokasi waktu');
    }
    setSaranNotice(
      disesuaikan.length > 0
        ? `Topik “${item.topik}” diterapkan — ${disesuaikan.join(' dan ')} disesuaikan mengikuti saran.`
        : `Topik “${item.topik}” diterapkan.`
    );
  };

  // UX: validasi langkah "Materi" dengan pesan di dekat field masing-masing
  const validateMateriStep = (): boolean => {
    const errors: { topik?: string; customMapel?: string; alokasiWaktu?: string } = {};
    if (!topik.trim()) {
      errors.topik = docType === 'modul_p5'
        ? 'Pilih salah satu template tematik atau ketik judul projek P5 di bawah.'
        : 'Isi topik/materi pokok dulu — contoh: Pecahan, Siklus Air.';
    }
    if (docType !== 'modul_p5' && mataPelajaran === 'custom' && !customMapel.trim()) {
      errors.customMapel = 'Ketik nama mata pelajaran dulu.';
    }
    if (!alokasiWaktu.trim()) {
      errors.alokasiWaktu = docType === 'modul_p5' ? 'Isi alokasi waktu projek — contoh: 36 JP.' : 'Isi alokasi waktu — contoh: 2 JP (2 x 35 Menit).';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // GEL2: rakit body GeneratorParams sekali — dipakai mode lepas maupun
  // mode paket agar isi request ke /api/generate identik.
  const bangunParams = (): GeneratorParams => {
    const isP5 = docType === 'modul_p5';
    const finalMapel = isP5
      ? 'Projek Penguatan Profil Pelajar Pancasila (P5)'
      : (customMapel.trim() ? customMapel.trim() : mataPelajaran);
    return {
      authorId: currentUser.id,
      docType,
      // FITUR 1: flag tiered — hanya dikirim saat LKPD + sakelar aktif.
      tiered: docType === 'lkpd' && lkpdTiered ? true : undefined,
      jenjang,
      tingkat,
      fase,
      mataPelajaran: finalMapel,
      topik,
      alokasiWaktu,
      modelPembelajaran: isP5 ? (sistemWaktu || 'Alur 4 Tahap Projek P5') : modelPembelajaran,
      targetPeserta,
      dimensiProfilLulusan,
      soalConfig: {
        jumlahSoal,
        komposisi: { ...komposisiSoal },
        bentukSoal: ['Pilihan Ganda', 'Pilihan Ganda Kompleks (AKM)', 'Menjodohkan', 'Isian Singkat', 'Uraian HOTS'],
        levelKognitif
      },
      authorName,
      schoolName,
      nip,
      catatanTambahan: {
        temaP5,
        templateId: selectedTemplateId || undefined,
        judulProjek: topik,
        isuKontekstual: isuKontekstual || undefined,
        bentukAksi: bentukAksi || undefined,
        sistemWaktu: sistemWaktu || undefined,
        mitraProjek: mitraProjek || undefined,
      }
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UX: validasi ulang sebelum generate agar dokumen tak terkirim dengan field kosong
    if (!validateMateriStep()) {
      setFormStep(1);
      return;
    }
    // FITUR soal kustom: jangan generate bila total butir 0
    if (docType === 'soal_ujian' && jumlahSoal < 1) {
      setPesanValidasi('Tambah minimal 1 butir soal pada komposisi di atas ya, Guru! 🎯');
      return;
    }
    setPesanValidasi(null);

    onGenerate(bangunParams());
  };

  // GEL2: submit mode paket — generate via AI (body sama persis seperti mode
  // lepas), simpan hasilnya sebagai versi baru lewat kontrak API paket,
  // tampilkan toast, lalu panggil onSelesai().
  const handleSubmitPaket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paketMode) return;
    // GEL2: cegah double-submit saat generate/simpan sedang berjalan.
    if (sedangSimpan || isGenerating) return;
    // GEL2: validasi sama seperti mode lepas; tanpa pindah langkah karena
    // mode paket memakai satu tampilan bertumpuk.
    if (!validateMateriStep()) return;

    const params = bangunParams();
    setSedangSimpan(true);
    try {
      // GEL2: langkah 1 — panggil AI, tiru body App.tsx handleGenerate.
      const res = await apiFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghasilkan perangkat ajar');
      }

      // GEL2: langkah 2 — simpan {title, content} sebagai versi baru.
      const res2 = await apiFetch(
        `/api/pakets/${encodeURIComponent(paketMode.paket.id)}/dokumen/${paketMode.docType}/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: data.title, content: data.content })
        }
      );
      let data2: { success?: boolean; message?: string } | null = null;
      try {
        data2 = await res2.json();
      } catch {
        /* GEL2: respons non-JSON tetap diperlakukan sebagai gagal di bawah */
      }
      if (!res2.ok || (data2 && data2.success === false)) {
        throw new Error(data2?.message || `Dokumen berhasil dibuat AI, tetapi gagal disimpan sebagai versi baru (HTTP ${res2.status})`);
      }

      showToast(`Versi baru ${DOC_TYPE_INFO[paketMode.docType].label} tersimpan ke paket`, 'success');
      paketMode.onSelesai();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal generate & menyimpan versi baru', 'error');
    } finally {
      setSedangSimpan(false);
    }
  };

  const handleNextStep = () => {
    // UX: ganti reportValidity() generik dengan validasi inline per field
    if (formStep === 1 && !validateMateriStep()) return;
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
        <p className="apple-eyebrow">Draf berbantuan AI 🤖</p>
        <h2 className="apple-headline !text-[30px] sm:!text-[38px] mt-1">
          Susun {DOC_TYPE_INFO[docType].label}.
        </h2>
        <p className="apple-sub mt-2 max-w-xl mx-auto !text-[15px]">
          Tiga langkah singkat — pilih format dan kelas, isi materi, periksa lalu susun.
        </p>
      </div>

      {/* GEL2: mode paket — konteks terkunci tampil sebagai chip/badge DaisyUI di atas form */}
      {paketMode && (
        <div className="px-5 sm:px-8 pt-5">
          <div className="alert alert-info">
            <Lock className="w-5 h-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm">Mode Paket — konteks terkunci</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="badge badge-neutral badge-sm">{paketMode.paket.topik}</span>
                <span className="badge badge-outline badge-sm">{paketMode.paket.mataPelajaran}</span>
                <span className="badge badge-outline badge-sm">{paketMode.paket.jenjang}</span>
                <span className="badge badge-outline badge-sm">{paketMode.paket.fase}</span>
                <span className="badge badge-outline badge-sm">{paketMode.paket.tingkat}</span>
                <span className="badge badge-primary badge-sm">{DOC_TYPE_INFO[paketMode.docType].label}</span>
              </div>
            </div>
            <span className="badge badge-ghost shrink-0">Terkunci</span>
          </div>
        </div>
      )}

      <form onSubmit={paketMode ? handleSubmitPaket : handleSubmit} className="p-5 sm:p-8" aria-busy={isGenerating}>
        {/* UX: banner progres saat generate — beri tahu durasi & larangan tutup/ubah halaman */}
        {isGenerating && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-3xl border border-[#F5C77E]/60 bg-[#FFEEDB]/70 dark:bg-amber-900/20 p-4">
            <Clock className="h-5 w-5 shrink-0 mt-0.5 animate-spin text-[#B45309] dark:text-amber-300" />
            <div>
              <p className="text-[14px] font-semibold text-[#78350F] dark:text-amber-100">
                Owi 🦉 sedang menyusun {DOC_TYPE_INFO[docType].label} untuk Anda…
              </p>
              <p className="mt-0.5 text-[12.5px] text-[#92400E] dark:text-amber-200/80">
                Jangan tutup atau mengubah halaman ini — biasanya selesai dalam 30–60 detik. ☕
              </p>
            </div>
          </div>
        )}
        {/* UX: kunci seluruh form saat generate agar parameter tak berubah di tengah proses (cegah double-submit tak sengaja) */}
        {/* GEL2: mode paket juga dikunci saat menyimpan versi (sedangSimpan) */}
        <fieldset disabled={isGenerating || sedangSimpan} className="contents">
        {/* GEL2: mode paket memakai satu tampilan bertumpuk — wizard langkah disembunyikan */}
        {!paketMode && (
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
        )}

        {!paketMode && (
        <div className="mb-6 rounded-2xl bg-[#FFEEDB]/50 dark:bg-amber-900/10 px-5 py-4 text-center border border-[#F5C77E]/30">
          <h3 className="text-[15px] font-semibold">
            {formStep === 0 ? 'Mulai dari format dan kelas' : formStep === 1 ? 'Isi kebutuhan pembelajaran' : 'Periksa sebelum menyusun'}
          </h3>
          <p className="mt-1 text-[13.5px] text-[#6e6e73] dark:text-[#98989d]">
            {formStep === 0 ? 'Pilih jenis dokumen, lalu fase dan kelas di jenjang Anda.' :
              formStep === 1 ? 'Tentukan mata pelajaran, materi, alokasi waktu, dan kebutuhan murid.' :
                'Dokumen dibuat atas nama Anda — sesuaikan bila perlu.'}
          </p>
        </div>
        )}

        {/* 1. Pilih Jenis Perangkat Ajar — GEL2: disembunyikan di mode paket (docType terkunci) */}
        {formStep === 0 && !paketMode && <>
        <div>
          <p className="text-[14px] font-semibold mb-3">
            Jenis dokumen
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(Object.keys(DOC_TYPE_INFO) as DocType[]).map((typeKey) => {
              const info = DOC_TYPE_INFO[typeKey];
              const isSelected = docType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => handleDocTypeChange(typeKey)}
                  aria-pressed={isSelected}
                  className={`p-4 rounded-2xl border text-left transition-all min-h-[104px] flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                      : 'border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30 hover:bg-[#f5f5f7] dark:hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={isSelected ? '' : 'text-[#424245] dark:text-[#c7c7cc]'}>
                        {typeKey === 'modul_ajar' && <FileText className="w-5 h-5" />}
                        {typeKey === 'rpp' && <Layers className="w-5 h-5" />}
                        {typeKey === 'soal_ujian' && <HelpCircle className="w-5 h-5" />}
                        {typeKey === 'lkpd' && <BookOpen className="w-5 h-5" />}
                        {typeKey === 'kktp_atp' && <Target className="w-5 h-5" />}
                        {typeKey === 'prota_promes' && <Calendar className="w-5 h-5" />}
                        {typeKey === 'modul_p5' && <Sparkles className="w-5 h-5" />}
                      </span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <div className={`font-semibold text-[14px] leading-snug ${isSelected ? '' : ''}`}>
                      {info.label}
                    </div>
                  </div>
                  <p className={`text-[12px] mt-1 line-clamp-2 ${isSelected ? 'opacity-70' : 'text-[#6e6e73] dark:text-[#98989d]'}`}>
                    {info.desc}
                  </p>
                </button>
              );
            })}
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

        {/* GEL2: mode paket menampilkan langkah materi + tinjau bertumpuk (tanpa wizard) */}
        {(formStep === 1 || paketMode) && <>
        {docType === 'modul_p5' ? (
          <P5ThematicGeneratorSection
            jenjang={jenjang}
            fase={fase}
            tingkat={tingkat}
            temaP5={temaP5}
            setTemaP5={setTemaP5}
            topik={topik}
            setTopik={(t) => {
              setTopik(t);
              if (fieldErrors.topik) setFieldErrors((prev) => ({ ...prev, topik: undefined }));
            }}
            isuKontekstual={isuKontekstual}
            setIsuKontekstual={setIsuKontekstual}
            bentukAksi={bentukAksi}
            setBentukAksi={setBentukAksi}
            sistemWaktu={sistemWaktu}
            setSistemWaktu={setSistemWaktu}
            alokasiWaktu={alokasiWaktu}
            setAlokasiWaktu={(w) => {
              setAlokasiWaktu(w);
              if (fieldErrors.alokasiWaktu) setFieldErrors((prev) => ({ ...prev, alokasiWaktu: undefined }));
            }}
            mitraProjek={mitraProjek}
            setMitraProjek={setMitraProjek}
            dimensiProfilLulusan={dimensiProfilLulusan}
            toggleDimensiProfil={toggleDimensiProfil}
            selectedTemplateId={selectedTemplateId}
            setSelectedTemplateId={setSelectedTemplateId}
            topikError={fieldErrors.topik}
          />
        ) : (
          <>
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
                  placeholder="Contoh: Muatan Lokal, Robotika, Bahasa Daerah…"
                  value={customMapel}
                  onChange={(e) => {
                    setCustomMapel(e.target.value);
                    // UX: bersihkan error begitu pengguna mulai mengetik
                    if (fieldErrors.customMapel) setFieldErrors((prev) => ({ ...prev, customMapel: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.customMapel}
                  aria-describedby={fieldErrors.customMapel ? 'customMapel-error' : undefined}
                  className={`apple-input ${fieldErrors.customMapel ? '!border-red-500' : ''}`}
                />
              )}
              {/* UX: pesan error inline tepat di bawah field, bukan tooltip generik browser */}
              {fieldErrors.customMapel && (
                <p id="customMapel-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-600">
                  {fieldErrors.customMapel}
                </p>
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
              onChange={(e) => {
                setTopik(e.target.value);
                // UX: bersihkan error begitu pengguna mulai mengetik
                if (fieldErrors.topik) setFieldErrors((prev) => ({ ...prev, topik: undefined }));
              }}
              placeholder="Contoh: Pecahan, Siklus Air, Hukum Newton — materi apa yang seru hari ini? 🤔"
              aria-invalid={!!fieldErrors.topik}
              aria-describedby={fieldErrors.topik ? 'topik-error' : undefined}
              className={`apple-input ${fieldErrors.topik ? '!border-red-500' : ''}`}
            />
            {/* UX: pesan error inline tepat di bawah field, bukan tooltip generik browser */}
            {fieldErrors.topik && (
              <p id="topik-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-600">
                {fieldErrors.topik}
              </p>
            )}
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
        {/* UX: konfirmasi terlihat saat saran topik diterapkan (termasuk bila model/alokasi ikut berubah) */}
        {saranNotice && (
          <p role="status" className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
            {saranNotice}
          </p>
        )}

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
                onChange={(e) => {
                  setAlokasiWaktu(e.target.value);
                  // UX: bersihkan error begitu pengguna mulai mengetik
                  if (fieldErrors.alokasiWaktu) setFieldErrors((prev) => ({ ...prev, alokasiWaktu: undefined }));
                }}
                placeholder="2 JP (2 x 35 Menit)"
                aria-invalid={!!fieldErrors.alokasiWaktu}
                aria-describedby={fieldErrors.alokasiWaktu ? 'alokasiWaktu-error' : undefined}
                className={`apple-input ${fieldErrors.alokasiWaktu ? '!border-red-500' : ''}`}
              />
            </div>
            {/* UX: pesan error inline tepat di bawah field, bukan tooltip generik browser */}
            {fieldErrors.alokasiWaktu && (
              <p id="alokasiWaktu-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-red-600">
                {fieldErrors.alokasiWaktu}
              </p>
            )}
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

        {/* 6. Dimensi Profil Lulusan */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[14px] font-semibold">
              Dimensi Profil Lulusan (8 Dimensi)
            </label>
            <span className="text-[12.5px] text-[#6e6e73]">
              {dimensiProfilLulusan.length} dipilih
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {DIMENSI_PROFIL_LULUSAN.map((dim) => {
              const checked = dimensiProfilLulusan.includes(dim);
              return (
                <button
                  key={dim}
                  type="button"
                  onClick={() => toggleDimensiProfil(dim)}
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

            <div className="grid grid-cols-1 gap-3.5 pt-1">
              <KomposisiSoal nilai={komposisiSoal} onUbah={(n) => { setKomposisiSoal(n); setPesanValidasi(null); }} />

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1.5">
                  Komposisi Level Berpikir Soal
                </label>
                <select
                  value={levelKognitif}
                  onChange={(e) => setLevelKognitif(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Kombinasi MOTS & HOTS (C3-C5)">Kombinasi MOTS & HOTS (C3-C5) - Rekomendasi PPA</option>
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
          <div className="mt-3 space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 dark:bg-emerald-950/20 dark:border-emerald-800/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                  Format Lembar Kerja Peserta Didik (LKPD) Siap Cetak
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-200/80 mt-0.5 leading-relaxed">
                  Dilengkapi kop isian kelompok, instruksi keselamatan/petunjuk kerja, kasus stimulus fenomena nyata, tabel pengamatan, dan rubrik penilaian diri siswa.
                </p>
              </div>
            </div>
            {/* FITUR 1: sakelar 3 tingkat diferensiasi — hanya tampil untuk LKPD */}
            <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-700/60 p-4 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
              <input
                type="checkbox"
                className="toggle toggle-success mt-0.5"
                checked={lkpdTiered}
                onChange={(e) => setLkpdTiered(e.target.checked)}
                aria-label="Buat 3 tingkat diferensiasi"
              />
              <span className="flex-1">
                <span className="block text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                  🎯 Buat 3 tingkat diferensiasi (Diferensiasi Pembelajaran)
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-emerald-800 dark:text-emerald-200/90">
                  Satu dokumen berisi 3 lembar kerja berjenjang siap cetak: 🟢 <strong>Perintis</strong> (butuh perancah/bimbingan), 🟡 <strong>Reguler</strong> (mandiri &amp; analitis), 🟣 <strong>Mahir</strong> (pengayaan HOTS &amp; studi kasus terbuka).
                </span>
              </span>
            </label>
          </div>
        )}
          </>
        )}

        </>}

        {(formStep === 2 || paketMode) && <>
        {/* UX: ringkasan tinjau yang lengkap (format, materi, kebutuhan) + tombol Ubah ke langkah terkait */}
        {/* GEL2: tombol Ubah disembunyikan di mode paket — semua parameter sudah tampil bertumpuk */}
        <div className="mb-5 space-y-3">
          <div className="rgm-card ux-stagger rounded-2xl border border-[#F5C77E]/40 bg-[#FFFBF5] dark:bg-white/5 p-4" style={{ '--ux-delay': '60ms' } as React.CSSProperties}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-500">Format & kelas</h4>
              {!paketMode && (
              <button type="button" onClick={() => setFormStep(0)} className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800">
                Ubah
              </button>
              )}
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] text-slate-500">Format</dt>
                <dd className="text-sm font-semibold text-slate-900">{DOC_TYPE_INFO[docType].label}</dd>
              </div>
              {docType === 'lkpd' && lkpdTiered && (
                <div>
                  <dt className="text-[11px] text-slate-500">Diferensiasi</dt>
                  <dd className="text-sm font-semibold text-slate-900">🎯 3 Tingkat (🟢 Perintis · 🟡 Reguler · 🟣 Mahir)</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] text-slate-500">Kelas</dt>
                <dd className="text-sm font-semibold text-slate-900">{jenjang} · {tingkat} · {fase}</dd>
              </div>
            </dl>
          </div>

          <div className="rgm-card ux-stagger rounded-2xl border border-[#F5C77E]/40 bg-[#FFFBF5] dark:bg-white/5 p-4" style={{ '--ux-delay': '140ms' } as React.CSSProperties}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-500">Materi & kebutuhan</h4>
              {!paketMode && (
              <button type="button" onClick={() => setFormStep(1)} className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800">
                Ubah
              </button>
              )}
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] text-slate-500">Mata pelajaran</dt>
                <dd className="text-sm font-semibold text-slate-900">
                  {docType === 'modul_p5' ? 'Projek Penguatan Profil Pelajar Pancasila (P5)' : (customMapel.trim() || mataPelajaran)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">{docType === 'modul_p5' ? 'Judul / Topik Projek' : 'Topik'}</dt>
                <dd className="text-sm font-semibold text-slate-900">{topik || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">{docType === 'modul_p5' ? 'Sistem Pelaksanaan' : 'Model pembelajaran'}</dt>
                <dd className="text-sm font-semibold text-slate-900">{docType === 'modul_p5' ? sistemWaktu : modelPembelajaran}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Alokasi waktu</dt>
                <dd className="text-sm font-semibold text-slate-900">{alokasiWaktu}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] text-slate-500">Dimensi Profil Sasaran ({dimensiProfilLulusan.length})</dt>
                <dd className="text-sm font-semibold text-slate-900">{dimensiProfilLulusan.join(', ')}</dd>
              </div>
              {docType === 'modul_p5' && (
                <>
                  <div>
                    <dt className="text-[11px] text-slate-500">Tema resmi projek</dt>
                    <dd className="text-sm font-semibold text-slate-900">{temaP5}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500">Bentuk aksi nyata</dt>
                    <dd className="text-sm font-semibold text-slate-900">{bentukAksi}</dd>
                  </div>
                  {isuKontekstual && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] text-slate-500">Isu kontekstual sekolah</dt>
                      <dd className="text-sm font-semibold text-slate-900">{isuKontekstual}</dd>
                    </div>
                  )}
                  {mitraProjek && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] text-slate-500">Narasumber / mitra luar</dt>
                      <dd className="text-sm font-semibold text-slate-900">{mitraProjek}</dd>
                    </div>
                  )}
                </>
              )}
              <div className="sm:col-span-2">
                <dt className="text-[11px] text-slate-500">Target peserta didik</dt>
                <dd className="text-sm font-semibold text-slate-900">{targetPeserta}</dd>
              </div>
            </dl>
          </div>

          <p className="rounded-2xl border border-[#F5C77E]/40 bg-[#FFEEDB]/50 dark:bg-amber-900/10 p-4 text-xs text-slate-600 dark:text-[#c7c7cc]">
            Dokumen dibuat atas nama <b>{authorName || '—'}</b>{schoolName ? <> · {schoolName}</> : null}. Anda masih dapat mengubah identitas di pengaturan tambahan. 👌
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
                  <div className="grid grid-cols-1 gap-3">
                    <KomposisiSoal nilai={komposisiSoal} onUbah={(n) => { setKomposisiSoal(n); setPesanValidasi(null); }} />
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Komposisi Level Berpikir
                      </label>
                      <select
                        value={levelKognitif}
                        onChange={(e) => setLevelKognitif(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="Kombinasi MOTS & HOTS (C3-C5)">Kombinasi MOTS & HOTS (C3-C5) - Rekomendasi PPA</option>
                        <option value="Dominan HOTS (C4-C6)">Dominan HOTS & AKM Literasi/Numerasi Tinggi (C4-C6)</option>
                        <option value="Dasar ke Menengah (C1-C3)">Dasar ke Menengah (C1-C3) - Cocok Fase A / Asesmen Diagnostik</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Modul Projek Specific */}
              {docType === 'modul_p5' && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                  <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    Parameter Tambahan Projek P5 (Kemendikdasmen)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                        Tema Resmi Projek P5
                      </label>
                      <select
                        value={temaP5}
                        onChange={(e) => setTemaP5(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs bg-white font-medium"
                      >
                        {TEMA_P5.map((t) => (
                          <option key={t} value={t}>
                            Tema: {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                        Bentuk Aksi Nyata / Gelar Karya
                      </label>
                      <input
                        type="text"
                        value={bentukAksi}
                        onChange={(e) => setBentukAksi(e.target.value)}
                        placeholder="Gelar Karya & Pameran Produk Siswa"
                        className="w-full px-3 py-2 rounded-lg border border-purple-200 text-xs bg-white"
                      />
                    </div>
                  </div>
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

        {/* FITUR soal kustom: pesan validasi komposisi */}
        {pesanValidasi && (
          <p role="alert" className="mt-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {pesanValidasi}
          </p>
        )}

        {/* Bar navigasi — selalu tampil di langkah 1, 2, 3 (mode lepas saja) */}
        {/* GEL2: mode paket memakai tombol "Generate & Simpan sebagai Versi Baru" di bawah */}
        {!paketMode && (
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
              className="btn btn-primary btn-lg flex-1 sm:flex-none sm:min-w-[260px] shadow-[0_6px_20px_rgba(245,158,11,0.35)]"
            >
              {isGenerating ? <Clock className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? 'Menyusun…' : `✨ Susun ${DOC_TYPE_INFO[docType].label}`}
            </button>
          )}
        </div>
        )}

        {/* GEL2: bilah aksi mode paket — sticky agar tombol selalu terlihat; cegah double-submit saat isGenerating/sedangSimpan */}
        {paketMode && (
          <div className="mt-8 sticky bottom-4 rounded-2xl border border-black/10 dark:border-white/15 bg-white/85 dark:bg-[#1c1c1e]/85 p-3 shadow-lg backdrop-blur-md">
            <button
              type="submit"
              disabled={isGenerating || sedangSimpan}
              className="btn btn-primary btn-lg w-full"
            >
              {isGenerating || sedangSimpan ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {isGenerating || sedangSimpan ? 'Menyusun & menyimpan…' : '✨ Generate & Simpan sebagai Versi Baru'}
            </button>
            <p className="mt-2 text-center text-xs opacity-60">
              Hasil AI otomatis tersimpan sebagai versi baru {DOC_TYPE_INFO[docType].label}.
            </p>
          </div>
        )}
        </fieldset>

      </form>

      {/* GEL2: toast lokal sukses/gagal (pola DocumentRepository/PaketWorkspace) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-2xl shadow-xl text-[13.5px] font-medium max-w-[calc(100vw-2rem)] bg-[#1c1c1e] text-white dark:bg-white dark:text-black"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#30d158]" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 text-[#ff9d97]" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 rounded-full p-1 hover:bg-white/10 dark:hover:bg-black/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
