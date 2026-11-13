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
import type { KomposisiKognitifState } from '../../shared/soalTerstruktur';
import { bagiKomposisiPreset, totalKognitif } from '../../shared/soalTerstruktur';
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
  X,
  Loader2
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
  // F1-4: komposisi kognitif (C1–C6) — default preset Lengkap mengikuti total butir.
  const [komposisiKognitif, setKomposisiKognitif] = useState<KomposisiKognitifState>(
    () => bagiKomposisiPreset('LENGKAP', jumlahSoal)
  );
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
        levelKognitif,
        // F1-4: komposisi kognitif (C1–C6) diteruskan ke server sebagai acuan validasi.
        komposisiKognitif: { ...komposisiKognitif }
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
    // F1-4: total C1–C6 harus sama dengan total butir soal
    if (docType === 'soal_ujian' && totalKognitif(komposisiKognitif) !== jumlahSoal) {
      setPesanValidasi('Jumlah komposisi kognitif (C1–C6) harus sama dengan total butir soal ya, Guru! 🧠');
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
    // F1-4: validasi komposisi soal — konsisten dengan mode lepas.
    if (docType === 'soal_ujian' && jumlahSoal < 1) {
      setPesanValidasi('Tambah minimal 1 butir soal pada komposisi di atas ya, Guru! 🎯');
      return;
    }
    if (docType === 'soal_ujian' && totalKognitif(komposisiKognitif) !== jumlahSoal) {
      setPesanValidasi('Jumlah komposisi kognitif (C1–C6) harus sama dengan total butir soal ya, Guru! 🧠');
      return;
    }
    setPesanValidasi(null);

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
        <div className="bg-[var(--warn-soft)] border-b border-[var(--line)] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--warn)]/15 flex items-center justify-center text-[var(--warn)] shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-[var(--ink)]">
                {currentUser.status === 'PENDING' ? 'Menunggu verifikasi admin' : 'Belum terverifikasi'}
              </h4>
              <p className="text-[12.5px] text-[var(--ink-soft)] mt-0.5">
                Profil {currentUser.email} belum disetujui. Anda tetap bisa menyusun draf, hubungi admin bila status tak berubah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Form */}
      <div className="px-5 sm:px-8 py-6 border-b border-[var(--line)]">
        <p className="apple-eyebrow">Draf berbantuan AI</p>
        <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.025em] mt-1 text-[var(--ink)]">
          Susun {DOC_TYPE_INFO[docType].label}
        </h2>
        <p className="apple-sub mt-1.5 max-w-xl">
          Tiga langkah singkat — pilih format dan kelas, isi materi, periksa lalu susun.
        </p>
      </div>

      {/* Mode paket — konteks terkunci */}
      {paketMode && (
        <div className="px-5 sm:px-8 pt-5">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 text-[var(--muted)]" />
              <p className="text-[12.5px] font-semibold text-[var(--ink)]">Konteks paket terkunci</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="ds-badge ds-badge-accent">{paketMode.paket.topik}</span>
              <span className="ds-badge">{paketMode.paket.mataPelajaran}</span>
              <span className="ds-badge">{paketMode.paket.jenjang}</span>
              <span className="ds-badge">{paketMode.paket.fase}</span>
              <span className="ds-badge">{paketMode.paket.tingkat}</span>
              <span className="ds-badge ds-badge-accent">{DOC_TYPE_INFO[paketMode.docType].label}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={paketMode ? handleSubmitPaket : handleSubmit} className="p-5 sm:p-8" aria-busy={isGenerating}>
        {/* Banner progres saat generate */}
        {isGenerating && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-3.5">
            <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin text-[var(--accent)]" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--accent-ink)]">
                Menyusun {DOC_TYPE_INFO[docType].label}…
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--accent-ink)] opacity-85">
                Jangan tutup halaman ini — biasanya selesai dalam 30–60 detik.
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
                className={`flex items-center gap-2 rounded-lg pl-1.5 pr-3.5 py-1.5 text-[12.5px] font-medium transition-colors min-h-[34px] ${
                  formStep === index ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)] border border-[var(--accent)]/25' :
                  formStep > index ? 'bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]' : 'text-[var(--muted)] border border-transparent'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  formStep === index ? 'bg-[var(--accent)] text-white' :
                  formStep > index ? 'bg-[var(--ok)] text-white' : 'bg-[var(--surface-3)] text-[var(--muted)]'
                }`}>
                  {formStep > index ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                {step.title}
              </button>
              {index < 2 && <span className="w-3 sm:w-6 h-px bg-[var(--line-strong)]" />}
            </li>
          ))}
        </ol>
        )}

        {!paketMode && (
        <div className="mb-6 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3.5">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            {formStep === 0 ? 'Mulai dari format dan kelas' : formStep === 1 ? 'Isi kebutuhan pembelajaran' : 'Periksa sebelum menyusun'}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
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
                  className={`p-3.5 rounded-xl border text-left transition-colors min-h-[100px] flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-ink)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}>
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
                  <p className={`text-[12px] mt-1 line-clamp-2 ${isSelected ? 'text-[var(--accent-ink)] opacity-80' : 'text-[var(--muted)]'}`}>
                    {info.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Jenjang, Fase, & Kelas */}
        <div className="bg-[var(--surface-2)] border border-[var(--line)] p-4 sm:p-5 rounded-xl space-y-3.5 mt-4">
          <p className="text-[13.5px] font-semibold text-[var(--ink)]">
            Kelas & fase
          </p>
          
          {/* Jenjang terkunci profil — 1 akun untuk 1 jenjang */}
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface)] border border-[var(--line)] px-3.5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-[12.5px] shrink-0">
                {jenjang}
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--ink)]">Jenjang {jenjang}</p>
                <p className="text-[12px] text-[var(--muted)]">
                  Mengikuti profil Anda{currentUser.role !== 'GURU' ? ' (admin bebas lintas jenjang)' : ''}.
                </p>
              </div>
            </div>
            <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-3)] text-[var(--ink-soft)] shrink-0">
              Terkunci
            </span>
          </div>

          {/* Fase & Tingkat Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5">
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
                className="apple-input"
              >
                {availableFases.map((f) => (
                  <option key={f.fase} value={f.fase}>
                    {f.fase} ({f.kelas.join(', ')}) - {f.deskripsi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5">
                Kelas
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                className="apple-input"
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
            <label className="block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5">
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
                  className={`apple-input ${fieldErrors.customMapel ? '!border-[var(--danger)]' : ''}`}
                />
              )}
              {/* UX: pesan error inline tepat di bawah field, bukan tooltip generik browser */}
              {fieldErrors.customMapel && (
                <p id="customMapel-error" role="alert" className="mt-1.5 text-[12px] font-medium text-[var(--danger)]">
                  {fieldErrors.customMapel}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5">
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
              placeholder="Contoh: Pecahan, Siklus Air, Hukum Newton — materi apa yang akan dibahas?"
              aria-invalid={!!fieldErrors.topik}
              aria-describedby={fieldErrors.topik ? 'topik-error' : undefined}
              className={`apple-input ${fieldErrors.topik ? '!border-[var(--danger)]' : ''}`}
            />
            {/* UX: pesan error inline tepat di bawah field, bukan tooltip generik browser */}
            {fieldErrors.topik && (
              <p id="topik-error" role="alert" className="mt-1.5 text-[12px] font-medium text-[var(--danger)]">
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
          <p role="status" className="mt-2 rounded-lg border border-[var(--ok)]/30 bg-[var(--ok-soft)] px-3 py-2 text-[12px] font-medium text-[var(--ok)]">
            {saranNotice}
          </p>
        )}

        {/* 5. Alokasi Waktu & Model Pembelajaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5">
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
                className={`apple-input ${fieldErrors.alokasiWaktu ? '!border-[var(--danger)]' : ''}`}
              />
            </div>
            {/* UX: pesan error inline tepat di bawah field, bukan tooltip generik browser */}
            {fieldErrors.alokasiWaktu && (
              <p id="alokasiWaktu-error" role="alert" className="mt-1.5 text-[12px] font-medium text-[var(--danger)]">
                {fieldErrors.alokasiWaktu}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5">
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
            <label className="block text-[13.5px] font-semibold text-[var(--ink)]">
              Dimensi Profil Lulusan (8 Dimensi)
            </label>
            <span className="text-[12px] text-[var(--muted)]">
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
                  className={`p-2.5 rounded-lg text-left text-[12.5px] font-medium flex items-center justify-between transition-colors border cursor-pointer min-h-[44px] ${
                    checked
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)]/35 text-[var(--accent-ink)]'
                      : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <span className="truncate pr-1">{dim}</span>
                  {checked ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--line-strong)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Dedicated Configuration Card per Document Type */}
        {docType === 'soal_ujian' && (
          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-3.5 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[var(--accent)] text-white">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-[13px] text-[var(--ink)]">
                    Konfigurasi Khusus Paket Soal Ujian (AKM & HOTS)
                  </h4>
                  <p className="text-[11.5px] text-[var(--muted)]">
                    Standar Asesmen Nasional Kemendikbudristek lengkap dengan Kisi-Kisi & Kunci Pembahasan
                  </p>
                </div>
              </div>
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-ink)]">
                Level Kognitif C1-C6
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 pt-1">
              <KomposisiSoal
                nilai={komposisiSoal}
                onUbah={(n) => { setKomposisiSoal(n); setPesanValidasi(null); }}
                kognitif={komposisiKognitif}
                onUbahKognitif={(n) => { setKomposisiKognitif(n); setPesanValidasi(null); }}
                totalButir={jumlahSoal}
              />

              <div>
                <label className="block text-[11.5px] font-semibold text-[var(--ink-soft)] mb-1.5">
                  Komposisi Level Berpikir Soal
                </label>
                <select
                  value={levelKognitif}
                  onChange={(e) => setLevelKognitif(e.target.value)}
                  className="apple-input"
                >
                  <option value="Kombinasi MOTS & HOTS (C3-C5)">Kombinasi MOTS & HOTS (C3-C5) - Rekomendasi PPA</option>
                  <option value="Dominan HOTS (C4-C6)">Dominan HOTS & AKM Penalaran Kritis Tinggi (C4-C6)</option>
                  <option value="Dasar ke Menengah (C1-C3)">Dasar ke Menengah (C1-C3) - Fase A / Diagnostik Awal</option>
                </select>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)] text-[11.5px] text-[var(--ink-soft)] space-y-1">
              <span className="font-semibold block text-[var(--ink)]">Bentuk soal otomatis</span>
              <p className="text-[11px] text-[var(--muted)]">
                Pilihan Ganda (PG), Pilihan Ganda Kompleks (Model AKM), Menjodohkan, Isian Singkat, dan Uraian Analitis HOTS berbasis stimulus wacana kontekstual Indonesia.
              </p>
            </div>
          </div>
        )}

        {docType === 'kktp_atp' && (
          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[var(--accent)] text-white">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[13px] text-[var(--ink)]">
                  Konfigurasi Alur Tujuan Pembelajaran & Kriteria KKTP
                </h4>
                <p className="text-[11.5px] text-[var(--muted)]">
                  Perencanaan ketuntasan belajar berbasis 3 Pendekatan Resmi PPA Kemendikbudristek 2024
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px] pt-1">
              <div className="p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--line)] text-[var(--ink-soft)]">
                <b className="text-[var(--ink)] block mb-0.5">1. Deskripsi Kriteria</b>
                Daftar kriteria ketercapaian tujuan esensial.
              </div>
              <div className="p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--line)] text-[var(--ink-soft)]">
                <b className="text-[var(--ink)] block mb-0.5">2. Rubrik Skala</b>
                4 level: Baru Berkembang, Layak, Cakap, Mahir.
              </div>
              <div className="p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--line)] text-[var(--ink-soft)]">
                <b className="text-[var(--ink)] block mb-0.5">3. Interval Nilai</b>
                Penetapan intervensi remedial & pengayaan.
              </div>
            </div>
          </div>
        )}

        {docType === 'rpp' && (
          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-3 mt-3">
            <div className="p-1.5 rounded-md bg-[var(--accent)] text-white shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-[13px] text-[var(--ink)]">
                Format RPP Ringkas 1-2 Lembar Siap Supervisi
              </h4>
              <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-relaxed">
                Menyajikan esensi pembelajaran secara padat, efisien, dan berorientasi murid: <b className="text-[var(--ink-soft)]">Tujuan Pembelajaran</b>, <b className="text-[var(--ink-soft)]">Langkah-Langkah Sintaks PBL/PjBL</b> (Pendahuluan, Inti, Penutup), dan <b className="text-[var(--ink-soft)]">Instrumen Asesmen Cepat</b>.
              </p>
            </div>
          </div>
        )}

        {docType === 'lkpd' && (
          <div className="mt-3 space-y-3">
            <div className="p-4 rounded-xl bg-[var(--ok-soft)] border border-[var(--ok)]/25 flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-[var(--ok)] text-white shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[13px] text-[var(--ink)]">
                  Format Lembar Kerja Peserta Didik (LKPD) Siap Cetak
                </h4>
                <p className="text-[11.5px] text-[var(--ink-soft)] mt-0.5 leading-relaxed">
                  Dilengkapi kop isian kelompok, instruksi keselamatan/petunjuk kerja, kasus stimulus fenomena nyata, tabel pengamatan, dan rubrik penilaian diri siswa.
                </p>
              </div>
            </div>
            {/* FITUR 1: sakelar 3 tingkat diferensiasi — hanya tampil untuk LKPD */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-dashed border-[var(--ok)]/45 bg-[var(--ok-soft)]/60 p-3.5 transition-colors hover:bg-[var(--ok-soft)]">
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm mt-0.5"
                checked={lkpdTiered}
                onChange={(e) => setLkpdTiered(e.target.checked)}
                aria-label="Buat 3 tingkat diferensiasi"
              />
              <span className="flex-1">
                <span className="block text-[12.5px] font-semibold text-[var(--ink)]">
                  Buat 3 tingkat diferensiasi (Diferensiasi Pembelajaran)
                </span>
                <span className="mt-1 block text-[11.5px] leading-relaxed text-[var(--ink-soft)]">
                  Satu dokumen berisi 3 lembar kerja berjenjang siap cetak: <strong>Perintis</strong> (butuh perancah/bimbingan), <strong>Reguler</strong> (mandiri &amp; analitis), <strong>Mahir</strong> (pengayaan HOTS &amp; studi kasus terbuka).
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
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="apple-card p-4" style={{ '--ux-delay': '60ms' } as React.CSSProperties}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Format & kelas</h4>
              {!paketMode && (
              <button type="button" onClick={() => setFormStep(0)} className="cursor-pointer text-[11.5px] font-medium text-[var(--accent)] hover:underline">
                Ubah
              </button>
              )}
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] text-[var(--muted)]">Format</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{DOC_TYPE_INFO[docType].label}</dd>
              </div>
              {docType === 'lkpd' && lkpdTiered && (
                <div>
                  <dt className="text-[11px] text-[var(--muted)]">Diferensiasi</dt>
                  <dd className="text-[13px] font-semibold text-[var(--ink)]">3 tingkat (Perintis · Reguler · Mahir)</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] text-[var(--muted)]">Kelas</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{jenjang} · {tingkat} · {fase}</dd>
              </div>
            </dl>
          </div>

          <div className="apple-card p-4" style={{ '--ux-delay': '140ms' } as React.CSSProperties}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Materi & kebutuhan</h4>
              {!paketMode && (
              <button type="button" onClick={() => setFormStep(1)} className="cursor-pointer text-[11.5px] font-medium text-[var(--accent)] hover:underline">
                Ubah
              </button>
              )}
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] text-[var(--muted)]">Mata pelajaran</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">
                  {docType === 'modul_p5' ? 'Projek Penguatan Profil Pelajar Pancasila (P5)' : (customMapel.trim() || mataPelajaran)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--muted)]">{docType === 'modul_p5' ? 'Judul / Topik Projek' : 'Topik'}</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{topik || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--muted)]">{docType === 'modul_p5' ? 'Sistem Pelaksanaan' : 'Model pembelajaran'}</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{docType === 'modul_p5' ? sistemWaktu : modelPembelajaran}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--muted)]">Alokasi waktu</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{alokasiWaktu}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] text-[var(--muted)]">Dimensi Profil Sasaran ({dimensiProfilLulusan.length})</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{dimensiProfilLulusan.join(', ')}</dd>
              </div>
              {docType === 'modul_p5' && (
                <>
                  <div>
                    <dt className="text-[11px] text-[var(--muted)]">Tema resmi projek</dt>
                    <dd className="text-[13px] font-semibold text-[var(--ink)]">{temaP5}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--muted)]">Bentuk aksi nyata</dt>
                    <dd className="text-[13px] font-semibold text-[var(--ink)]">{bentukAksi}</dd>
                  </div>
                  {isuKontekstual && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] text-[var(--muted)]">Isu kontekstual sekolah</dt>
                      <dd className="text-[13px] font-semibold text-[var(--ink)]">{isuKontekstual}</dd>
                    </div>
                  )}
                  {mitraProjek && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] text-[var(--muted)]">Narasumber / mitra luar</dt>
                      <dd className="text-[13px] font-semibold text-[var(--ink)]">{mitraProjek}</dd>
                    </div>
                  )}
                </>
              )}
              <div className="sm:col-span-2">
                <dt className="text-[11px] text-[var(--muted)]">Target peserta didik</dt>
                <dd className="text-[13px] font-semibold text-[var(--ink)]">{targetPeserta}</dd>
              </div>
            </dl>
          </div>

          <p className="sm:col-span-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[12px] text-[var(--ink-soft)]">
            Dokumen dibuat atas nama <b className="text-[var(--ink)]">{authorName || '—'}</b>{schoolName ? <> · {schoolName}</> : null}. Anda masih dapat mengubah identitas di pengaturan tambahan.
          </p>
        </div>

        {/* Advanced Options Accordion */}
        <div className="border border-[var(--line)] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] flex items-center justify-between text-[12.5px] font-semibold text-[var(--ink)] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-[var(--muted)]" />
              Sesuaikan identitas dan opsi tambahan
            </span>
            <span className="text-[var(--accent)] font-medium text-[11.5px] flex items-center gap-1">
              {showAdvanced ? 'Tutup pengaturan' : 'Buka pengaturan'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {showAdvanced && (
            <div className="p-4 sm:p-5 space-y-4 bg-[var(--surface)] border-t border-[var(--line)]">
              
              {/* Kop Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium text-[var(--ink-soft)] mb-1">
                    Nama Satuan Pendidikan (Sekolah)
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
                  <label className="block text-[11.5px] font-medium text-[var(--ink-soft)] mb-1">
                    Nama Guru Penyusun
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
                  <label className="block text-[11.5px] font-medium text-[var(--ink-soft)] mb-1">
                    NIP / NUPTK Guru (Opsional)
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

              {/* Soal Ujian Specific */}
              {docType === 'soal_ujian' && (
                <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-3">
                  <div className="font-semibold text-[12px] text-[var(--ink)] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                    Konfigurasi Khusus Paket Soal Ujian (AKM & HOTS)
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <KomposisiSoal
                      nilai={komposisiSoal}
                      onUbah={(n) => { setKomposisiSoal(n); setPesanValidasi(null); }}
                      kognitif={komposisiKognitif}
                      onUbahKognitif={(n) => { setKomposisiKognitif(n); setPesanValidasi(null); }}
                      totalButir={jumlahSoal}
                    />
                    <div>
                      <label className="block text-[11.5px] font-medium text-[var(--ink-soft)] mb-1">
                        Komposisi Level Berpikir
                      </label>
                      <select
                        value={levelKognitif}
                        onChange={(e) => setLevelKognitif(e.target.value)}
                        className="apple-input"
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
                <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-3">
                  <div className="font-semibold text-[12px] text-[var(--ink)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                    Parameter Tambahan Projek P5 (Kemendikdasmen)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--ink-soft)] mb-1">
                        Tema Resmi Projek P5
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
                      <label className="block text-[11px] font-medium text-[var(--ink-soft)] mb-1">
                        Bentuk Aksi Nyata / Gelar Karya
                      </label>
                      <input
                        type="text"
                        value={bentukAksi}
                        onChange={(e) => setBentukAksi(e.target.value)}
                        placeholder="Gelar Karya & Pameran Produk Siswa"
                        className="apple-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11.5px] font-medium text-[var(--ink-soft)] mb-1">
                  Target Peserta Didik & Kebutuhan Diferensiasi
                </label>
                <input
                  type="text"
                  value={targetPeserta}
                  onChange={(e) => setTargetPeserta(e.target.value)}
                  placeholder="Peserta didik reguler, dengan diferensiasi gaya belajar auditori, visual, dan kinestetik"
                  className="apple-input"
                />
              </div>
            </div>
          )}
        </div>
        </>}

        {/* FITUR soal kustom: pesan validasi komposisi */}
        {pesanValidasi && (
          <p role="alert" className="mt-3 text-[12px] font-medium text-[var(--danger)] bg-[var(--danger-soft)] border border-[var(--danger)]/30 rounded-lg px-3 py-2">
            {pesanValidasi}
          </p>
        )}

        {/* Bar navigasi — selalu tampil di langkah 1, 2, 3 (mode lepas saja) */}
        {/* GEL2: mode paket memakai tombol "Generate & Simpan sebagai Versi Baru" di bawah */}
        {!paketMode && (
        <div className="mt-8 sticky bottom-4 flex flex-col-reverse gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)]/92 p-2.5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setFormStep((step) => Math.max(step - 1, 0))}
            disabled={isGenerating}
            className={`btn-apple-ghost disabled:invisible ${formStep === 0 ? 'invisible' : ''}`}
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
        )}

        {/* GEL2: bilah aksi mode paket — sticky agar tombol selalu terlihat; cegah double-submit saat isGenerating/sedangSimpan */}
        {paketMode && (
          <div className="mt-8 sticky bottom-4 rounded-xl border border-[var(--line)] bg-[var(--surface)]/92 p-2.5 shadow-lg backdrop-blur-md">
            <button
              type="submit"
              disabled={isGenerating || sedangSimpan}
              className="btn-apple w-full"
            >
              {isGenerating || sedangSimpan ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating || sedangSimpan ? 'Menyusun & menyimpan…' : 'Generate & simpan sebagai versi baru'}
            </button>
            <p className="mt-2 text-center text-[11.5px] text-[var(--muted)]">
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
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2.5 pl-3.5 pr-2 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg text-[12.5px] font-medium max-w-[calc(100vw-2rem)] text-[var(--ink)]"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--ok)]" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 text-[var(--danger)]" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
