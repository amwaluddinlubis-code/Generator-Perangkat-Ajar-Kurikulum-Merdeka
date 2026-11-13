import React, { useEffect, useRef, useState } from 'react';
import { DocType, EducationalDocument, TeacherUser, VersiDokumen } from '../types';
import { 
  renderMarkdownToHtml, 
  downloadWordDocument, 
  exportToDocx,
  exportToPdf,
  copyToClipboard 
} from '../utils/exportUtils';
import { apiFetch } from '../utils/api';
// FITUR 2: ekspor Lembar Penilaian KKTP ke .xlsx
import { unduhLembarPenilaianXlsx } from '../utils/lembarPenilaianXlsx';
// FASE 1 (F1-4/F1-6): viewer soal terstruktur + edit inline
import {
  parseSoalTerstruktur,
  bungkusSoalTerstruktur,
  validasiPaketSoal,
  renderPaketSoalMarkdown,
  type ButirSoal,
  type PaketSoalTerstruktur,
} from '@/shared/soalTerstruktur';
import { SoalTerstrukturView } from './SoalTerstrukturView';
// FASE 2: kop & pengesahan (F2-1), nama file cerdas (F2-4), kertas A4/F4 (F2-5)
import { useKopPengesahan } from '../hooks/useKopPengesahan';
import { KopPengesahanModal } from './KopPengesahanModal';
import NamaFileModal from './NamaFileModal';
import KertasToggle from './KertasToggle';
import { bacaUkuranKertas, simpanUkuranKertas, terapkanUkuranKertas, type UkuranKertas } from '../utils/kertasCetak';
import { namaFileCerdas, type KopPengesahan } from '@/shared/kopPengesahan';
// FASE 2: naskah ujian siap cetak (F2-2) + paket admin ujian (F2-3)
import { susunNaskahUjian } from '../utils/naskahUjian';
import { AdminUjianModal } from './AdminUjianModal';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Bookmark, 
  Edit3,
  Eye,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  FileDown,
  Loader2,
  ImagePlus,
  ChevronDown,
  X,
  CheckCircle2,
  XCircle,
  Info,
  School,
  ClipboardList,
  Table2
} from 'lucide-react';

// F1-6: salin dalam butir soal agar state edit tidak memutasi hasil parse
const cloneButirSoal = (b: ButirSoal): ButirSoal => ({
  ...b,
  opsi: b.opsi ? [...b.opsi] : undefined,
  pasangan: b.pasangan ? b.pasangan.map((x) => ({ ...x })) : undefined,
  rubrik: b.rubrik ? b.rubrik.map((r) => ({ ...r })) : undefined,
});

interface DocumentViewerProps {
  document: EducationalDocument | null;
  currentUser: TeacherUser;
  modelUsed?: string;
  onSaveToRepository?: (doc: EducationalDocument) => void;
  onBackToGenerator?: () => void;
  isSaved?: boolean;
  // GEL2 — mode paket: viewer menampilkan riwayat versi dokumen dalam satu paket.
  paketMode?: {
    paketId: string;
    docType: DocType;
    onTutup?: () => void;
  };
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: documentProp,
  currentUser,
  modelUsed = '',
  onSaveToRepository,
  onBackToGenerator,
  isSaved = false,
  paketMode
}) => {
  // GEL2 — penanda mode paket; tanpa prop ini seluruh perilaku legacy tidak berubah.
  const isPaketMode = !!paketMode;
  const paketId = paketMode?.paketId;
  const docTypeMode = paketMode?.docType;

  // GEL2 — state riwayat versi (mode paket saja)
  const [versis, setVersis] = useState<VersiDokumen[]>([]);
  const [versiAktifServer, setVersiAktifServer] = useState<number>(0);
  const [statusDokumen, setStatusDokumen] = useState<string>('');
  const [nomorTerpilih, setNomorTerpilih] = useState<number | null>(null);
  const [loadingVersi, setLoadingVersi] = useState<boolean>(false);
  const [aksiVersi, setAksiVersi] = useState<boolean>(false);
  const [errorVersi, setErrorVersi] = useState<string | null>(null);

  // GEL2 — ambil riwayat versi dari server (GET /api/pakets/:id/dokumen/:docType/versi)
  const muatVersi = async (pilihNomor?: number) => {
    if (!paketId || !docTypeMode) return;
    setLoadingVersi(true);
    setErrorVersi(null);
    try {
      const res = await apiFetch(
        `/api/pakets/${encodeURIComponent(paketId)}/dokumen/${encodeURIComponent(docTypeMode)}/versi`
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat riwayat versi');
      const daftar: VersiDokumen[] = data.versis ?? [];
      setVersis(daftar);
      setStatusDokumen(data.status ?? '');
      const aktif: number = typeof data.versiAktif === 'number' ? data.versiAktif : 0;
      setVersiAktifServer(aktif);
      const tersedia = (n?: number | null) => n != null && daftar.some((v) => v.nomorVersi === n);
      setNomorTerpilih(tersedia(pilihNomor) ? pilihNomor! : tersedia(aktif) ? aktif : (daftar[0]?.nomorVersi ?? null));
    } catch (err) {
      setErrorVersi(err instanceof Error ? err.message : 'Gagal memuat riwayat versi');
    } finally {
      setLoadingVersi(false);
    }
  };

  // GEL2 — muat versi saat mount / berganti docType dalam mode paket
  useEffect(() => {
    if (!isPaketMode) return;
    muatVersi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaketMode, paketId, docTypeMode]);

  // GEL2 — versi yang sedang dilihat; konten yang dirender selalu dari sini, bukan prop document
  const versiTerpilih: VersiDokumen | null =
    nomorTerpilih != null ? (versis.find((v) => v.nomorVersi === nomorTerpilih) ?? null) : null;

  // GEL2 — dokumen efektif: mode paket menimpa title/content dengan versi terpilih
  // (metadata jenjang/tingkat/dst tetap dari prop agar kop & ekspor tetap utuh).
  const document: EducationalDocument | null = !isPaketMode
    ? documentProp
    : (documentProp
        ? { ...documentProp, title: versiTerpilih?.title ?? documentProp.title, content: versiTerpilih?.content ?? documentProp.content }
        : versiTerpilih
          ? {
              id: `paket-${paketId}-${docTypeMode}`,
              title: versiTerpilih.title,
              docType: docTypeMode as DocType,
              jenjang: currentUser.jenjang,
              tingkat: '',
              fase: '',
              mataPelajaran: currentUser.mataPelajaran,
              topik: '',
              content: versiTerpilih.content,
              createdAt: new Date().toISOString(),
              authorId: currentUser.id,
              authorName: currentUser.name,
              schoolName: currentUser.schoolName
            }
          : null);

  // F1-4/F1-6: dokumen soal terstruktur (format rgm-soal-v1); null untuk dokumen lama/markdown
  // sehingga seluruh perilaku legacy tidak tersentuh.
  const soal: PaketSoalTerstruktur | null = document?.content
    ? parseSoalTerstruktur(document.content)
    : null;

  // GEL2 — jadikan versi terpilih sebagai versi aktif: POST /generate dengan
  // {title, content} versi lama → tercatat sebagai versi BARU (riwayat tetap utuh).
  const handleJadikanVersiAktif = async () => {
    if (!paketId || !docTypeMode || !versiTerpilih || aksiVersi) return;
    setAksiVersi(true);
    try {
      const res = await apiFetch(
        `/api/pakets/${encodeURIComponent(paketId)}/dokumen/${encodeURIComponent(docTypeMode)}/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: versiTerpilih.title, content: versiTerpilih.content })
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menjadikan versi aktif');
      const nomorBaru: number | undefined = data.versi?.nomorVersi ?? data.dokumen?.versiAktif;
      setVersiAktifServer(typeof nomorBaru === 'number' ? nomorBaru : versiAktifServer);
      showToast(`v${versiTerpilih.nomorVersi} disimpan sebagai versi aktif${nomorBaru != null ? ` (v${nomorBaru})` : ''}`, 'success');
      await muatVersi(nomorBaru);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menjadikan versi aktif', 'error');
    } finally {
      setAksiVersi(false);
    }
  };

  // GEL2 — tandai dokumen sebagai final (PATCH /final), perbarui badge status
  const handleTandaiFinal = async () => {
    if (!paketId || !docTypeMode || aksiVersi) return;
    setAksiVersi(true);
    try {
      const res = await apiFetch(
        `/api/pakets/${encodeURIComponent(paketId)}/dokumen/${encodeURIComponent(docTypeMode)}/final`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menandai final');
      setStatusDokumen(data.dokumen?.status ?? 'final');
      showToast('Dokumen ditandai sebagai Final', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menandai final', 'error');
    } finally {
      setAksiVersi(false);
    }
  };

  const [activeView, setActiveView] = useState<'preview' | 'raw' | 'edit'>('preview');
  const [editableContent, setEditableContent] = useState<string>(document?.content || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(isSaved);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  // FITUR 2: status ekspor Lembar Penilaian (.xlsx)
  const [isExportingXlsx, setIsExportingXlsx] = useState<boolean>(false);
  // UX: toast lokal untuk umpan balik salin / unduh / simpan
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' | 'info' } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = (message: string, kind: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    if (!document) return;
    setEditableContent(document.content);
    setActiveView('preview');
    setJustSaved(isSaved);
  }, [document?.id, document?.content, isSaved]);

  // F1-6: state edit inline soal terstruktur — di-reset setiap ganti versi/dokumen
  const [editItems, setEditItems] = useState<ButirSoal[]>(() => (soal?.items ?? []).map(cloneButirSoal));
  const [dirty, setDirty] = useState<boolean>(false);
  const [soalErrors, setSoalErrors] = useState<string[]>([]);
  const [savingSoal, setSavingSoal] = useState<boolean>(false);

  // FASE 2 (F2-1): kop & pengesahan — default dari profil pengguna, tersimpan di localStorage
  const {
    kop,
    modalTerbuka: kopModalTerbuka,
    bukaModal: bukaKopModal,
    tutupModal: tutupKopModal,
    simpan: simpanKopBaru,
    kopSiap,
  } = useKopPengesahan({
    schoolName: currentUser.schoolName,
    name: currentUser.name,
    nip: currentUser.nip,
  });
  // Kop terakhir yang lengkap (ref agar aksi tertunda selalu dapat data terbaru)
  const kopRef = useRef<KopPengesahan | null>(null);
  // FASE 2 (F2-4): satu modal nama file dipakai semua tombol ekspor
  const [modalNama, setModalNama] = useState<null | {
    nilaiAwal: string;
    ekstensi: string;
    aksi: (namaFile: string, kopAktif?: KopPengesahan) => void | Promise<void>;
  }>(null);
  // Aksi ekspor yang menunggu pengisian kop & pengesahan
  const pendingKop = useRef<null | {
    aksi: (kopAktif: KopPengesahan) => void | Promise<void>;
  }>(null);
  // FASE 2 (F2-5): ukuran kertas cetak A4/F4
  const [kertas, setKertas] = useState<UkuranKertas>(() => bacaUkuranKertas());
  // FASE 2 (F2-3): modal paket admin ujian
  const [adminUjianTerbuka, setAdminUjianTerbuka] = useState(false);

  // F2-5: terapkan @page sesuai pilihan saat viewer dibuka
  useEffect(() => {
    terapkanUkuranKertas(bacaUkuranKertas());
  }, []);

  const ubahKertas = (u: UkuranKertas) => {
    setKertas(u);
    simpanUkuranKertas(u);
    terapkanUkuranKertas(u);
  };

  // F2-1 + F2-4: alur ekspor — (1) nama file, (2) kop bila belum lengkap, (3) aksi ekspor
  const mulaiEkspor = (
    nilaiAwal: string,
    ekstensi: string,
    aksi: (namaFile: string, kopAktif?: KopPengesahan) => void | Promise<void>
  ) => {
    setModalNama({ nilaiAwal, ekstensi, aksi });
  };

  const kopAktifSekarang = (): KopPengesahan | undefined =>
    kopRef.current ?? (kopSiap ? (kop as KopPengesahan) : undefined);

  const handleSimpanNamaFile = (namaFile: string) => {
    const m = modalNama;
    setModalNama(null);
    if (!m) return;
    const kopAktif = kopAktifSekarang();
    if (kopAktif) {
      void m.aksi(namaFile, kopAktif);
    } else {
      pendingKop.current = { aksi: (k) => m.aksi(namaFile, k) };
      bukaKopModal();
    }
  };

  const handleSimpanKop = (k: KopPengesahan) => {
    simpanKopBaru(k);
    kopRef.current = k;
    const p = pendingKop.current;
    pendingKop.current = null;
    if (p) void p.aksi(k);
  };

  useEffect(() => {
    setEditItems((soal?.items ?? []).map(cloneButirSoal));
    setDirty(false);
    setSoalErrors([]);
  }, [document?.content]);

  if (!document) {
    // GEL2: mode paket masih memuat riwayat versi
    if (isPaketMode && loadingVersi) {
      return (
        <div className="apple-card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--accent)]" />
          <p className="text-[13px] text-[var(--muted)]">Memuat riwayat versi dokumen…</p>
        </div>
      );
    }
    return (
      <div className="apple-card p-12 text-center">
        <div className="w-14 h-14 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--ink)] mb-1">
          Belum ada dokumen
        </h3>
        <p className="text-[13px] text-[var(--muted)] max-w-md mx-auto mb-6">
          Pilih format, tentukan kelas dan materi, lalu susun dokumen untuk ditinjau dan diekspor.
        </p>
        {/* UX: beri jalan keluar yang jelas — kembali ke generator untuk menyusun dokumen */}
        {onBackToGenerator && (
          <button onClick={onBackToGenerator} className="btn-apple">
            <Sparkles className="w-4 h-4" />
            Susun perangkat baru
          </button>
        )}
        {/* GEL2: dalam mode paket, tombol tutup memanggil onTutup */}
        {isPaketMode && paketMode?.onTutup && (
          <button onClick={paketMode.onTutup} className="btn btn-ghost ml-2">
            Tutup
          </button>
        )}
      </div>
    );
  }

  // F1-4: konten untuk salin & ekspor — dokumen soal selalu memakai markdown
  // deterministik dari renderPaketSoalMarkdown (versi edit bila dirty).
  const kontenEkspor = soal
    ? renderPaketSoalMarkdown({ ...soal, items: dirty ? editItems : soal.items })
    : editableContent;

  // F1-6: perubahan satu butir dari editor inline
  const handleButirChange = (index: number, butir: ButirSoal) => {
    setEditItems((prev) => prev.map((b, i) => (i === index ? butir : b)));
    setDirty(true);
  };

  // F1-6: hapus satu butir soal (dengan konfirmasi)
  const handleHapusButir = (index: number) => {
    const b = editItems[index];
    if (!b) return;
    if (!window.confirm(`Hapus butir soal nomor ${b.nomor}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setEditItems((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  // F1-6: validasi lalu simpan hasil edit inline sebagai versi baru
  const handleSimpanSoal = async () => {
    if (!soal || !document || savingSoal) return;
    const hasil = validasiPaketSoal({ ...soal, items: editItems });
    if (!hasil.valid) {
      setSoalErrors(hasil.errors);
      showToast(`Ada ${hasil.errors.length} masalah — perbaiki dulu sebelum menyimpan`, 'error');
      return;
    }
    setSoalErrors([]);
    const updated: PaketSoalTerstruktur = {
      ...soal,
      items: editItems.map((b, i) => ({ ...b, nomor: i + 1 })),
      diubahManual: true,
    };
    const content = bungkusSoalTerstruktur(updated);
    setSavingSoal(true);
    try {
      if (isPaketMode && paketId) {
        const res = await apiFetch(
          `/api/pakets/${encodeURIComponent(paketId)}/dokumen/soal_ujian/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: document.title, content })
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menyimpan versi baru');
        const nomorBaru: number | undefined = data.versi?.nomorVersi ?? data.dokumen?.versiAktif;
        showToast('Perubahan soal tersimpan sebagai versi baru', 'success');
        await muatVersi(nomorBaru);
        // useEffect [document?.content] akan mereset editItems & dirty dari versi baru
      } else {
        onSaveToRepository?.({ ...document, content });
        setDirty(false);
        showToast('Perubahan soal tersimpan', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan perubahan soal', 'error');
    } finally {
      setSavingSoal(false);
    }
  };

  // UX: beri tahu pengguna saat salin gagal (sebelumnya kegagalan terjadi diam-diam)
  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(kontenEkspor);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        showToast('Gagal menyalin teks. Coba lagi.', 'error');
      }
    } catch {
      showToast('Gagal menyalin teks. Coba lagi.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // F2-1 + F2-4: ekspor .docx — lewat modal nama file & kop pengesahan dulu
  const handleExportDocx = () => {
    if (!document) return;
    mulaiEkspor(namaFileCerdas(document.title, document.docType), '.docx', async (namaFile, kopAktif) => {
      setIsExportingDocx(true);
      try {
        await exportToDocx(namaFile, kontenEkspor, {
          schoolName: document.schoolName || currentUser.schoolName,
          authorName: document.authorName || currentUser.name,
          jenjang: document.jenjang,
          tingkat: document.tingkat,
          fase: document.fase,
          mapel: document.mataPelajaran,
          nip: currentUser.nip,
          kop: kopAktif,
        });
        // UX: konfirmasi keberhasilan unduh agar pengguna tidak menebak-nebak
        showToast('File .docx berhasil diunduh', 'success');
      } catch (err) {
        console.error('Docx export failed, falling back to html doc:', err);
        downloadWordDocument(namaFile, kontenEkspor, {
          schoolName: document.schoolName || currentUser.schoolName,
          authorName: document.authorName || currentUser.name,
          jenjang: document.jenjang,
          tingkat: document.tingkat,
          fase: document.fase,
          mapel: document.mataPelajaran,
          kop: kopAktif,
        });
        // UX: beri tahu pengguna bahwa format cadangan yang diunduh (bukan .docx)
        showToast('Format .docx gagal, mengunduh format cadangan (.doc)', 'info');
      } finally {
        setIsExportingDocx(false);
      }
    });
  };

  // F2-4 + F2-5: ekspor .pdf — nama file cerdas + ukuran kertas A4/F4 aktif
  const handleExportPdf = () => {
    if (!document) return;
    mulaiEkspor(namaFileCerdas(document.title, document.docType), '.pdf', async (namaFile) => {
      setIsExportingPdf(true);
      try {
        // Switch to preview if currently in edit/raw mode to capture full rendered layout
        if (activeView !== 'preview') {
          setActiveView('preview');
          // allow DOM update
          await new Promise(r => setTimeout(r, 200));
        }
        const success = await exportToPdf('printable-document-content', namaFile, kertas === 'F4' ? 'f4' : 'a4');
        if (!success) {
          window.print();
          // UX: jelaskan bahwa yang terbuka adalah dialog cetak browser
          showToast('Membuka dialog cetak browser', 'info');
        } else {
          // UX: konfirmasi keberhasilan unduh
          showToast('File .pdf berhasil diunduh', 'success');
        }
      } catch (err) {
        console.error('PDF export failed, opening print dialog:', err);
        window.print();
        showToast('PDF gagal dibuat, membuka dialog cetak browser', 'error');
      } finally {
        setIsExportingPdf(false);
      }
    });
  };

  // FITUR 2 + F2-4: unduh Lembar Penilaian KKTP (.xlsx) — 30 baris nama + rumus interval otomatis.
  const handleUnduhLembarXlsx = () => {
    if (!document) return;
    mulaiEkspor(namaFileCerdas(document.title, document.docType), '.xlsx', async (namaFile) => {
      setIsExportingXlsx(true);
      try {
        await unduhLembarPenilaianXlsx({
          judulDokumen: namaFile,
          mataPelajaran: document.mataPelajaran || '',
          kelas: document.tingkat || '',
          sekolah: document.schoolName || '',
        });
        showToast('Lembar penilaian .xlsx berhasil diunduh', 'success');
      } catch (err) {
        console.error(err);
        showToast('Gagal menyusun .xlsx', 'error');
      } finally {
        setIsExportingXlsx(false);
      }
    });
  };

  // F2-2: naskah ujian siap cetak — 2 file: naskah (tanpa kunci) + kunci rahasia guru
  const handleExportNaskahUjian = () => {
    if (!soal || !document) return;
    const { naskahMarkdown, kunciMarkdown } = susunNaskahUjian(soal);
    const meta = {
      schoolName: document.schoolName || currentUser.schoolName,
      authorName: document.authorName || currentUser.name,
      jenjang: document.jenjang,
      tingkat: document.tingkat,
      fase: document.fase,
      mapel: document.mataPelajaran,
      nip: currentUser.nip,
    };
    mulaiEkspor(namaFileCerdas(document.title, 'soal_ujian'), '.docx', async (namaNaskah, kopAktif) => {
      await exportToDocx(namaNaskah, naskahMarkdown, { ...meta, kop: kopAktif });
      showToast('Naskah ujian diunduh — berikutnya kunci jawaban', 'info');
      // Kunci jawaban: modal nama kedua dengan default turunan nama naskah
      mulaiEkspor(`${namaNaskah}_Kunci`, '.docx', async (namaKunci, kopAktif2) => {
        await exportToDocx(namaKunci, kunciMarkdown, { ...meta, kop: kopAktif2 });
        showToast('Kunci jawaban (RAHASIA GURU) diunduh', 'success');
      });
    });
  };

  // F2-3: buka modal paket admin ujian (hanya bila kop sudah lengkap)
  const bukaAdminUjian = () => {
    if (kopAktifSekarang()) {
      setAdminUjianTerbuka(true);
    } else {
      pendingKop.current = { aksi: () => setAdminUjianTerbuka(true) };
      bukaKopModal();
    }
  };

  const handleSave = () => {
    if (!onSaveToRepository) return;
    try {
      onSaveToRepository({
        ...document,
        content: editableContent
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch {
      // UX: jangan tampilkan "Tersimpan!" jika penyimpanan gagal
      showToast('Gagal menyimpan ke arsip. Coba lagi.', 'error');
    }
  };

  // Ilustrasi AI (Gemini image generation)
  const [imgModalOpen, setImgModalOpen] = useState<boolean>(false);
  const [imgPrompt, setImgPrompt] = useState<string>('');
  const [imgRatio, setImgRatio] = useState<string>('16:9');
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [imgError, setImgError] = useState<string>('');
  const [imgResult, setImgResult] = useState<string>('');

  const openImgModal = () => {
    setImgError('');
    setImgResult('');
    if (!imgPrompt) {
      setImgPrompt(
        `Ilustrasi pendidikan untuk ${document.mataPelajaran} ${document.tingkat}, topik ${document.topik}. Gaya flat vector bersih, warna lembut, cocok untuk modul ajar anak ${document.jenjang}, tanpa teks di dalam gambar.`
      );
    }
    setImgModalOpen(true);
  };

  const handleGenerateImage = async () => {
    if (!imgPrompt.trim() || imgLoading) return;
    setImgLoading(true);
    setImgError('');
    setImgResult('');
    try {
      const res = await apiFetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt.trim(), aspectRatio: imgRatio })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal membuat ilustrasi');
      setImgResult(data.imageUrl);
    } catch (err: any) {
      setImgError(err.message || 'Gagal membuat ilustrasi');
    } finally {
      setImgLoading(false);
    }
  };

  const handleInsertImage = () => {
    if (!imgResult) return;
    const caption = `Ilustrasi ${document.topik}`;
    setEditableContent(prev => `${prev}\n\n![${caption}](${imgResult})\n\n`);
    setImgModalOpen(false);
    setActiveView('preview');
  };

  // F1-4: pratinjau markdown legacy; dokumen soal memakai tampilan terstruktur
  const renderedHtml = soal ? '' : renderMarkdownToHtml(editableContent);

  return (
    <div className="space-y-4">
      
      {/* Top Action Bar */}
      <div className="apple-card p-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToGenerator && (
            <button
              onClick={onBackToGenerator}
              className="w-9 h-9 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Kembali ke formulir"
              aria-label="Kembali ke formulir"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="ds-badge !py-0.5 !text-[10.5px]">
                {document.jenjang} · {document.tingkat} · {document.fase}
              </span>
              <span className="ds-badge !py-0.5 !text-[10.5px]">
                {document.mataPelajaran}
              </span>
              {modelUsed && (
                <span
                  title={`Mesin penyusun: ${modelUsed}`}
                  className="ds-badge ds-badge-accent !py-0.5 !text-[10.5px]"
                >
                  {/gemini/i.test(modelUsed) ? (
                    <><Sparkles className="w-3 h-3" /> AI Gemini</>
                  ) : (
                    <><FileText className="w-3 h-3" /> Template cadangan</>
                  )}
                </span>
              )}
            </div>
            <h1 className="text-[15px] sm:text-[17px] font-semibold tracking-[-0.02em] text-[var(--ink)] truncate max-w-[280px] sm:max-w-md mt-1">
              {document.title}
            </h1>
          </div>
        </div>

        {/* GEL2: bilah versi — hanya dalam mode paket */}
        {isPaketMode && (
          <div className="flex items-center gap-2 flex-wrap no-print">
            {/* Pemilih versi */}
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn-apple-secondary !min-h-[34px] !py-1 !px-2.5 !text-[12px] gap-1" aria-label="Pilih versi dokumen">
                {loadingVersi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                {nomorTerpilih != null ? `v${nomorTerpilih}` : 'Pilih versi'}
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-20 w-72 p-1.5 shadow-lg border border-[var(--line)] bg-[var(--surface)] rounded-xl max-h-72 overflow-y-auto"
              >
                {versis.length === 0 && !loadingVersi && (
                  <li><span className="text-[12px] text-[var(--muted)] px-2 py-1.5 block">Belum ada versi tersimpan</span></li>
                )}
                {versis.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setNomorTerpilih(v.nomorVersi)}
                      className={`flex items-center gap-2 rounded-lg text-[12.5px] ${v.nomorVersi === nomorTerpilih ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)]' : ''}`}
                    >
                      <span className="font-semibold shrink-0">v{v.nomorVersi}</span>
                      <span className="flex-1 truncate text-[11.5px] text-[var(--muted)]">{v.title}</span>
                      {v.nomorVersi === versiAktifServer && (
                        <span className="ds-badge ds-badge-accent !py-0 !text-[10px] shrink-0">Aktif</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badge status dokumen */}
            {statusDokumen === 'final' ? (
              <span className="ds-badge ds-badge-ok"><Check className="w-3 h-3" /> Final</span>
            ) : statusDokumen === 'draf' ? (
              <span className="ds-badge ds-badge-warn">Draf</span>
            ) : statusDokumen ? (
              <span className="ds-badge">{statusDokumen}</span>
            ) : null}

            {/* Aksi versi */}
            <button
              onClick={handleJadikanVersiAktif}
              disabled={aksiVersi || !versiTerpilih || versiTerpilih.nomorVersi === versiAktifServer}
              className="btn-apple !min-h-[34px] !py-1 !px-2.5 !text-[12px]"
              title="Simpan versi yang sedang dilihat sebagai versi aktif yang baru"
            >
              {aksiVersi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Jadikan versi aktif
            </button>
            {statusDokumen !== 'final' && (
              <button
                onClick={handleTandaiFinal}
                disabled={aksiVersi || versis.length === 0}
                className="btn-apple-secondary !min-h-[34px] !py-1 !px-2.5 !text-[12px] !text-[var(--ok)] !border-[var(--ok)]/40 hover:!bg-[var(--ok-soft)]"
                title="Tandai dokumen ini sebagai final"
              >
                {aksiVersi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tandai final
              </button>
            )}
            {paketMode?.onTutup && (
              <button onClick={paketMode.onTutup} className="btn-apple-ghost !min-h-[34px] !py-1 !px-2.5 !text-[12px]">
                Tutup
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          
          {/* View Toggles */}
          <div className="apple-segment">
            <button
              onClick={() => setActiveView('preview')}
              data-active={activeView === 'preview'}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau
            </button>
            {/* F1-6: dokumen soal terstruktur diedit lewat editor inline di pratinjau,
                bukan lewat editor teks mentah (isinya JSON bermarka). */}
            {!soal && (
              <>
                <button
                  onClick={() => setActiveView('edit')}
                  data-active={activeView === 'edit'}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setActiveView('raw')}
                  data-active={activeView === 'raw'}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  Markdown
                </button>
              </>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px]"
            title="Salin isi dokumen ke clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--ok)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Ilustrasi AI */}
          <button
            onClick={openImgModal}
            className="btn-apple !min-h-[34px] !py-1.5 !px-3 !text-[12px]"
            title="Buat ilustrasi AI untuk dokumen ini (Gemini)"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>Ilustrasi AI</span>
          </button>

          {/* Export to .DOCX Button */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px] disabled:opacity-50"
            title="Ekspor dokumen Microsoft Word (.docx) siap diedit di Word / Google Docs"
          >
            {isExportingDocx ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isExportingDocx ? 'Menyusun .docx...' : '.docx'}</span>
          </button>

          {/* Export to .PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px] disabled:opacity-50"
            title="Ekspor dokumen langsung ke format berkas PDF (.pdf) siap cetak"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPdf ? 'Menyusun .pdf...' : '.pdf'}</span>
          </button>

          {/* F2-1: Kop & Pengesahan */}
          <button
            onClick={bukaKopModal}
            className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px]"
            title="Atur kop sekolah, logo, dan lembar pengesahan untuk ekspor & cetak"
          >
            <School className="w-3.5 h-3.5" />
            <span>Kop</span>
            {kopSiap && <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" aria-hidden />}
          </button>

          {/* F2-5: Pilihan ukuran kertas A4/F4 */}
          <KertasToggle nilai={kertas} onUbah={ubahKertas} />

          {/* F2-2: Naskah ujian siap cetak — hanya dokumen soal terstruktur */}
          {soal && (
            <button
              onClick={handleExportNaskahUjian}
              className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px]"
              title="Unduh naskah ujian siap cetak (tanpa kunci) + kunci jawaban rahasia guru"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Naskah Ujian</span>
            </button>
          )}

          {/* F2-3: Paket admin ujian — hanya dokumen soal terstruktur */}
          {soal && (
            <button
              onClick={bukaAdminUjian}
              className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px]"
              title="Susun Berita Acara, Daftar Hadir, dan Kartu Hasil ujian"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Admin Ujian</span>
            </button>
          )}

          {/* FITUR 2: Unduh Lembar Penilaian (.xlsx) — hanya dokumen KKTP */}
          {(document?.docType === 'kktp_atp' || (document?.title || '').toUpperCase().includes('KKTP')) && (
            <button
              onClick={handleUnduhLembarXlsx}
              disabled={isExportingXlsx}
              className="btn-apple-secondary !min-h-[34px] !py-1.5 !px-3 !text-[12px] disabled:opacity-50"
              title="Unduh lembar penilaian KKTP (.xlsx): 30 baris nama, rumus interval & rekomendasi otomatis"
            >
              {isExportingXlsx ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Table2 className="w-3.5 h-3.5" />
              )}
              <span>{isExportingXlsx ? 'Menyusun .xlsx…' : 'Lembar penilaian'}</span>
            </button>
          )}

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="w-9 h-9 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer"
            title="Cetak langsung melalui dialog browser"
            aria-label="Cetak dokumen"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Save to Repo */}
          {onSaveToRepository && (
            <button
              onClick={handleSave}
              className={`!min-h-[34px] !py-1.5 !px-3 !text-[12px] ${justSaved ? 'btn-apple' : 'btn-apple-secondary'}`}
              title="Simpan dokumen ke bank arsip perangkat ajar"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{justSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          )}

        </div>
      </div>

      {/* GEL2: peringatan bila riwayat versi gagal dimuat (mode paket) */}
      {isPaketMode && errorVersi && (
        <div role="alert" className="no-print flex items-start gap-2.5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3.5 py-3 text-[12.5px] text-[var(--danger)]">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorVersi}</span>
          <button
            onClick={() => muatVersi()}
            className="shrink-0 rounded-md border border-[var(--danger)]/35 px-2 py-1 text-[11.5px] font-semibold hover:bg-[var(--danger)]/10 cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Main Document Paper Display */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] shadow-sm overflow-hidden print-container p-3 sm:p-4">
        
        {/* EDIT VIEW */}
        {activeView === 'edit' && (
          <div className="space-y-3 no-print">
            <div className="flex items-center justify-between gap-3 text-[11.5px] text-[var(--muted)]">
              <span className="font-medium text-[var(--ink-soft)]">
                Editor teks — perubahan langsung memengaruhi pratinjau cetak dan unduhan Word / PDF.
              </span>
              <span className="shrink-0">{editableContent.length} karakter</span>
            </div>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              rows={24}
              className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)] p-3.5 font-mono text-[12px] sm:text-[12.5px] leading-relaxed text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45"
            />
          </div>
        )}

        {/* RAW MARKDOWN VIEW */}
        {activeView === 'raw' && (
          <div className="p-4 rounded-lg bg-[#0f172a] overflow-x-auto no-print">
            <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-[#8b94a3]">
              <span className="font-mono uppercase tracking-[0.08em]">Markdown mentah</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[#c7cdd8] hover:text-white cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin semua
              </button>
            </div>
            <pre className="font-mono text-[12px] whitespace-pre-wrap leading-relaxed text-[#e8eaed]">
              {editableContent}
            </pre>
          </div>
        )}

        {/* PREVIEW VIEW (DEFAULT) — kertas A4 formal */}
        {activeView === 'preview' && (
          <div className="doc-paper" id="printable-document-content">

            {/* F1-4/F1-6: dokumen soal terstruktur memakai tampilan terstruktur + edit inline */}
            {soal ? (
              <SoalTerstrukturView
                soal={soal}
                items={editItems}
                dirty={dirty}
                saving={savingSoal}
                errors={soalErrors}
                onButirChange={handleButirChange}
                onHapusButir={handleHapusButir}
                onSimpan={handleSimpanSoal}
              />
            ) : (
              <>

            {/* Kop resmi — F2-1: memakai data kop & pengesahan guru */}
            <div className="doc-kop print-kop">
              <div className="kop-eyebrow">Kurikulum Merdeka • Permendikdasmen No. 13 Tahun 2025</div>
              {kop.logoDataUrl && (
                <img src={kop.logoDataUrl} alt="Logo sekolah" className="mx-auto mb-2 max-h-16 w-auto" />
              )}
              <h4>KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</h4>
              <h4>DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</h4>
              <div className="kop-school">
                {kop.namaSekolah || document.schoolName || currentUser.schoolName || 'SATUAN PENDIDIKAN KURIKULUM MERDEKA'}
              </div>
              <div className="kop-addr">
                {kop.alamatSekolah && <>{kop.alamatSekolah}<br /></>}
                {kop.tahunAjaran ? (
                  <>Tahun Ajaran {kop.tahunAjaran}{kop.semester ? ` • Semester ${kop.semester}` : ''}</>
                ) : null}
              </div>
              {/* Ornamen geometris */}
              <svg className="mx-auto mt-2" width="180" height="12" viewBox="0 0 180 12" aria-hidden="true">
                <g fill="none" stroke="#111" strokeWidth="1.2">
                  <line x1="0" y1="6" x2="70" y2="6" />
                  <line x1="110" y1="6" x2="180" y2="6" />
                  <rect x="82" y="1" width="10" height="10" transform="rotate(45 87 6)" fill="#111" stroke="none" />
                  <circle cx="74" cy="6" r="1.6" fill="#111" stroke="none" />
                  <circle cx="106" cy="6" r="1.6" fill="#111" stroke="none" />
                </g>
              </svg>
              <hr className="doc-kop-rule" />
            </div>

            {/* Identitas dokumen */}
            <p className="doc-identity">
              <b>{document.title}</b><br />
              {document.mataPelajaran} • {document.jenjang} / {document.tingkat} ({document.fase})
            </p>

            {/* Isi dokumen */}
            <div
              className="prose-educational"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* Pengesahan — F2-1: nama/NIP asli dari kop; kosong = garis kosong (bukan dummy) */}
            <div className="doc-sign mt-10 avoid-break-inside">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p><b>Kepala Satuan Pendidikan</b></p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold inline-block px-4" style={{ borderBottom: '1px solid #111' }}>
                      {kop.namaKepsek || '....................'}
                    </p>
                  </div>
                  <p className="text-[10pt] mt-1">
                    NIP. {kop.nipKepsek || '....................'}
                  </p>
                </div>

                <div>
                  <p>
                    {kop.kotaTanggal || new Date(document.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p><b>Guru Mata Pelajaran / Kelas</b></p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold inline-block px-4" style={{ borderBottom: '1px solid #111' }}>
                      {kop.namaGuru || document.authorName || currentUser.name}
                    </p>
                  </div>
                  <p className="text-[10pt] mt-1">
                    NIP. {kop.nipGuru || currentUser.nip || '....................'}
                  </p>
                </div>
              </div>
            </div>

              </>
            )}

          </div>
        )}

      </div>

      {/* Modal Ilustrasi AI */}
      {imgModalOpen && (
        <div className="modal modal-open no-print" role="dialog" aria-modal="true" aria-label="Ilustrasi AI">
          <div className="modal-box max-w-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--ink)]">Ilustrasi AI</h3>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">
                  Dibuatkan Gemini dari deskripsi Anda, lalu disisipkan ke dokumen.
                </p>
              </div>
              <button
                onClick={() => setImgModalOpen(false)}
                className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Deskripsi gambar</label>
                <textarea
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  rows={4}
                  className="apple-input resize-none"
                  placeholder="Contoh: ilustrasi siklus air untuk anak SD, gaya flat…"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">Rasio</label>
                <select value={imgRatio} onChange={(e) => setImgRatio(e.target.value)} className="apple-input">
                  <option value="16:9">Lanskap 16:9</option>
                  <option value="4:3">Lanskap 4:3</option>
                  <option value="1:1">Persegi 1:1</option>
                  <option value="3:4">Potret 3:4</option>
                  <option value="9:16">Potret 9:16</option>
                </select>
              </div>

              {imgError && (
                <div className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3.5 py-2.5 text-[12.5px] text-[var(--danger)]">
                  {imgError}
                </div>
              )}

              {imgResult && (
                <div className="rounded-lg overflow-hidden border border-[var(--line)]">
                  <img src={imgResult} alt="Pratinjau ilustrasi AI" className="w-full h-auto block" />
                </div>
              )}
            </div>

            <div className="modal-action">
              <button onClick={() => setImgModalOpen(false)} className="btn-apple-secondary">
                Batal
              </button>
              {imgResult ? (
                <button onClick={handleInsertImage} className="btn-apple">
                  Sisipkan ke dokumen
                </button>
              ) : (
                <button onClick={handleGenerateImage} disabled={imgLoading || !imgPrompt.trim()} className="btn-apple">
                  {imgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {imgLoading ? 'Membuat…' : 'Buat gambar'}
                </button>
              )}
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setImgModalOpen(false)} />
        </div>
      )}
      {/* F2-1: modal editor kop & pengesahan */}
      <KopPengesahanModal
        terbuka={kopModalTerbuka}
        kopAwal={kop}
        onSimpan={handleSimpanKop}
        onBatal={tutupKopModal}
      />

      {/* F2-4: modal nama file — dipakai semua tombol ekspor */}
      <NamaFileModal
        terbuka={!!modalNama}
        nilaiAwal={modalNama?.nilaiAwal ?? ''}
        infoEkstensi={modalNama ? `File akan diunduh dengan ekstensi ${modalNama.ekstensi}` : undefined}
        onSimpan={handleSimpanNamaFile}
        onBatal={() => setModalNama(null)}
      />

      {/* F2-3: modal paket admin ujian (hanya bila kop lengkap) */}
      {kopSiap && soal && (
        <AdminUjianModal
          terbuka={adminUjianTerbuka}
          kop={kop as KopPengesahan}
          mapelAwal={soal.identitas.mataPelajaran}
          kelasAwal={soal.identitas.kelas}
          onBatal={() => setAdminUjianTerbuka(false)}
          onUnduh={async (docs) => {
            const kopAktif = kop as KopPengesahan;
            const meta = {
              schoolName: document?.schoolName || currentUser.schoolName,
              authorName: document?.authorName || currentUser.name,
              kop: kopAktif,
            };
            for (const d of docs) {
              await exportToDocx(d.judul, d.markdown, meta);
            }
            setAdminUjianTerbuka(false);
            showToast('3 dokumen admin ujian diunduh', 'success');
          }}
        />
      )}

      {/* UX: toast lokal — umpan balik salin / unduh / simpan */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] no-print flex items-center gap-2.5 pl-3.5 pr-2 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg text-[12.5px] font-medium max-w-[calc(100vw-2rem)] text-[var(--ink)]"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--ok)]" />
          ) : toast.kind === 'error' ? (
            <XCircle className="w-4 h-4 shrink-0 text-[var(--danger)]" />
          ) : (
            <Info className="w-4 h-4 shrink-0 text-[var(--muted)]" />
          )}
          <span className="truncate">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
