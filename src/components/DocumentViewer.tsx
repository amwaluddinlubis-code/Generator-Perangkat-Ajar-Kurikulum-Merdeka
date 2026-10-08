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
  Info
} from 'lucide-react';

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

  if (!document) {
    // GEL2: mode paket masih memuat riwayat versi
    if (isPaketMode && loadingVersi) {
      return (
        <div className="apple-card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-[14.5px] text-[#6e6e73]">Memuat riwayat versi dokumen...</p>
        </div>
      );
    }
    return (
      <div className="apple-card p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-[19px] font-semibold tracking-tight mb-1">
          Belum ada dokumen
        </h3>
        <p className="text-[14.5px] text-[#6e6e73] max-w-md mx-auto mb-6">
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

  // UX: beri tahu pengguna saat salin gagal (sebelumnya kegagalan terjadi diam-diam)
  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(editableContent);
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

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportToDocx(document.title, editableContent, {
        schoolName: document.schoolName || currentUser.schoolName,
        authorName: document.authorName || currentUser.name,
        jenjang: document.jenjang,
        tingkat: document.tingkat,
        fase: document.fase,
        mapel: document.mataPelajaran,
        nip: currentUser.nip
      });
      // UX: konfirmasi keberhasilan unduh agar pengguna tidak menebak-nebak
      showToast('File .docx berhasil diunduh', 'success');
    } catch (err) {
      console.error('Docx export failed, falling back to html doc:', err);
      downloadWordDocument(document.title, editableContent, {
        schoolName: document.schoolName || currentUser.schoolName,
        authorName: document.authorName || currentUser.name,
        jenjang: document.jenjang,
        tingkat: document.tingkat,
        fase: document.fase,
        mapel: document.mataPelajaran
      });
      // UX: beri tahu pengguna bahwa format cadangan yang diunduh (bukan .docx)
      showToast('Format .docx gagal, mengunduh format cadangan (.doc)', 'info');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      // Switch to preview if currently in edit/raw mode to capture full rendered layout
      if (activeView !== 'preview') {
        setActiveView('preview');
        // allow DOM update
        await new Promise(r => setTimeout(r, 200));
      }
      const success = await exportToPdf('printable-document-content', document.title);
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

  const renderedHtml = renderMarkdownToHtml(editableContent);

  return (
    <div className="space-y-4">
      
      {/* Top Action Bar — Apple frosted */}
      <div className="apple-card p-4 flex flex-wrap items-center justify-between gap-3 no-print !rounded-[20px]">
        <div className="flex items-center gap-2">
          {onBackToGenerator && (
            <button
              onClick={onBackToGenerator}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Kembali ke formulir"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-semibold">
                {document.jenjang} • {document.tingkat} ({document.fase})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-medium">
                {document.mataPelajaran}
              </span>
              {modelUsed && (
                <span
                  title={`Mesin penyusun: ${modelUsed}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-medium"
                >
                  {/gemini/i.test(modelUsed) ? (
                    <><Sparkles className="w-3 h-3" /> AI Gemini</>
                  ) : (
                    <><FileText className="w-3 h-3" /> Template cadangan</>
                  )}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate max-w-[280px] sm:max-w-md mt-0.5">
              {document.title}
            </h1>
          </div>
        </div>

        {/* GEL2: bilah versi — hanya dalam mode paket */}
        {isPaketMode && (
          <div className="flex items-center gap-2 flex-wrap no-print">
            {/* Pemilih versi (dropdown DaisyUI, terbaru dulu, versi aktif ditandai) */}
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-sm btn-outline gap-1" aria-label="Pilih versi dokumen">
                {loadingVersi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                {nomorTerpilih != null ? `v${nomorTerpilih}` : 'Pilih versi'}
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-20 w-72 p-2 shadow-lg border border-base-300 max-h-72 overflow-y-auto"
              >
                {versis.length === 0 && !loadingVersi && (
                  <li><span className="text-sm opacity-60">Belum ada versi tersimpan</span></li>
                )}
                {versis.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setNomorTerpilih(v.nomorVersi)}
                      className={`flex items-center gap-2 ${v.nomorVersi === nomorTerpilih ? 'active' : ''}`}
                    >
                      <span className="font-semibold shrink-0">v{v.nomorVersi}</span>
                      <span className="flex-1 truncate text-xs opacity-70">{v.title}</span>
                      {v.nomorVersi === versiAktifServer && (
                        <span className="badge badge-primary badge-sm shrink-0">Aktif</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badge status dokumen */}
            {statusDokumen === 'final' ? (
              <span className="badge badge-success gap-1"><Check className="w-3 h-3" /> Final</span>
            ) : statusDokumen === 'draf' ? (
              <span className="badge badge-warning">Draf</span>
            ) : statusDokumen ? (
              <span className="badge badge-ghost">{statusDokumen}</span>
            ) : null}

            {/* Aksi versi */}
            <button
              onClick={handleJadikanVersiAktif}
              disabled={aksiVersi || !versiTerpilih || versiTerpilih.nomorVersi === versiAktifServer}
              className="btn btn-sm btn-primary"
              title="Simpan versi yang sedang dilihat sebagai versi aktif yang baru"
            >
              {aksiVersi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Jadikan versi aktif
            </button>
            {statusDokumen !== 'final' && (
              <button
                onClick={handleTandaiFinal}
                disabled={aksiVersi || versis.length === 0}
                className="btn btn-sm btn-success"
                title="Tandai dokumen ini sebagai final"
              >
                {aksiVersi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tandai Final
              </button>
            )}
            {paketMode?.onTutup && (
              <button onClick={paketMode.onTutup} className="btn btn-sm btn-ghost">
                Tutup
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          
          {/* View Toggles */}
          <div className="apple-segment !rounded-full">
            <button
              onClick={() => setActiveView('preview')}
              data-active={activeView === 'preview'}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau
            </button>
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
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-full border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            title="Salin isi dokumen ke clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-[#30b158]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          {/* Ilustrasi AI */}
          <button
            onClick={openImgModal}
            className="px-4 py-2 rounded-full bg-black dark:bg-white dark:text-black text-white text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            title="Buat ilustrasi AI untuk dokumen ini (Gemini)"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Ilustrasi AI</span>
          </button>

          {/* Export to .DOCX Button */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] disabled:opacity-50"
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
            className="px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] disabled:opacity-50"
            title="Ekspor dokumen langsung ke format berkas PDF (.pdf) siap cetak"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPdf ? 'Menyusun .pdf...' : '.pdf'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="Cetak langsung melalui dialog browser"
          >
            <Printer className="w-[18px] h-[18px]" />
          </button>

          {/* Save to Repo */}
          {onSaveToRepository && (
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                justSaved
                  ? 'bg-black dark:bg-white dark:text-black text-white'
                  : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15'
              }`}
              title="Simpan dokumen ke bank arsip perangkat ajar"
            >
              <Bookmark className="w-4 h-4" />
              <span>{justSaved ? 'Tersimpan!' : 'Simpan'}</span>
            </button>
          )}

        </div>
      </div>

      {/* GEL2: peringatan bila riwayat versi gagal dimuat (mode paket) */}
      {isPaketMode && errorVersi && (
        <div role="alert" className="alert alert-error no-print">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm flex-1">{errorVersi}</span>
          <button onClick={() => muatVersi()} className="btn btn-sm btn-ghost">
            Coba lagi
          </button>
        </div>
      )}

      {/* Main Document Paper Display */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden print-container">
        
        {/* EDIT VIEW */}
        {activeView === 'edit' && (
          <div className="p-6 space-y-4 no-print">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Mode Editor Teks Langsung (Perubahan otomatis mempengaruhi tampilan pratinjau cetak dan unduhan Word / PDF)
              </span>
              <span>{editableContent.length} karakter</span>
            </div>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              rows={24}
              className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
            />
          </div>
        )}

        {/* RAW MARKDOWN VIEW */}
        {activeView === 'raw' && (
          <div className="p-6 bg-slate-900 text-slate-100 overflow-x-auto no-print">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
              <span className="font-mono">RAW MARKDOWN FORMAT</span>
              <button
                onClick={handleCopy}
                className="hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Semua
              </button>
            </div>
            <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-200">
              {editableContent}
            </pre>
          </div>
        )}

        {/* PREVIEW VIEW (DEFAULT) — kertas A4 formal */}
        {activeView === 'preview' && (
          <div className="doc-paper" id="printable-document-content">

            {/* Kop resmi */}
            <div className="doc-kop print-kop">
              <div className="kop-eyebrow">Kurikulum Merdeka • Permendikdasmen No. 13 Tahun 2025</div>
              <h4>KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</h4>
              <h4>DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</h4>
              <div className="kop-school">
                {document.schoolName || currentUser.schoolName || 'SATUAN PENDIDIKAN KURIKULUM MERDEKA'}
              </div>
              <div className="kop-addr">
                NPSN: {currentUser.npsn || '20104829'} • Akreditasi: A (Unggul) • Tahun Ajaran 2026/2027
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

            {/* Pengesahan */}
            <div className="doc-sign mt-10 avoid-break-inside">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p><b>Kepala Satuan Pendidikan</b></p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold inline-block px-4" style={{ borderBottom: '1px solid #111' }}>
                      Drs. H. Mulyadi, M.Pd.
                    </p>
                  </div>
                  <p className="text-[10pt] mt-1">
                    NIP. 19710318 199702 1 002
                  </p>
                </div>

                <div>
                  <p>
                    Jakarta, {new Date(document.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p><b>Guru Mata Pelajaran / Kelas</b></p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold inline-block px-4" style={{ borderBottom: '1px solid #111' }}>
                      {document.authorName || currentUser.name}
                    </p>
                  </div>
                  <p className="text-[10pt] mt-1">
                    NIP. {currentUser.nip || '19890412 201402 2 003'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal Ilustrasi AI */}
      {imgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="apple-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[17px] font-semibold tracking-tight">Ilustrasi AI</h3>
              <button
                onClick={() => setImgModalOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mb-4">
              Dibuat dengan Gemini dari deskripsi Anda, lalu disisipkan ke dokumen.
            </p>

            <label className="block text-[13px] font-semibold mb-1.5">Deskripsi gambar</label>
            <textarea
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              rows={4}
              className="apple-input resize-none"
              placeholder="Contoh: ilustrasi siklus air untuk anak SD, gaya flat..."
            />

            <div className="mt-3">
              <label className="block text-[13px] font-semibold mb-1.5">Rasio</label>
              <select value={imgRatio} onChange={(e) => setImgRatio(e.target.value)} className="apple-input">
                <option value="16:9">Lanskap 16:9</option>
                <option value="4:3">Lanskap 4:3</option>
                <option value="1:1">Persegi 1:1</option>
                <option value="3:4">Potret 3:4</option>
                <option value="9:16">Potret 9:16</option>
              </select>
            </div>

            {imgError && (
              <div className="mt-3 rounded-xl bg-[#fff1f1] dark:bg-[#3a1512] border border-[#ffcfcf] dark:border-[#6b231d] text-[#b3261e] dark:text-[#ff9d97] text-[13px] px-4 py-3">
                {imgError}
              </div>
            )}

            {imgResult && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15">
                <img src={imgResult} alt="Pratinjau ilustrasi AI" className="w-full h-auto block" />
              </div>
            )}

            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setImgModalOpen(false)} className="btn-apple-secondary flex-1">
                Batal
              </button>
              {imgResult ? (
                <button onClick={handleInsertImage} className="btn-apple flex-1">
                  Sisipkan ke dokumen
                </button>
              ) : (
                <button onClick={handleGenerateImage} disabled={imgLoading || !imgPrompt.trim()} className="btn-apple flex-1">
                  {imgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {imgLoading ? 'Membuat...' : 'Buat gambar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* UX: toast lokal — umpan balik salin / unduh / simpan */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] no-print flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-2xl shadow-xl text-[13.5px] font-medium max-w-[calc(100vw-2rem)] bg-[#1c1c1e] text-white dark:bg-white dark:text-black"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#30d158]" />
          ) : toast.kind === 'error' ? (
            <XCircle className="w-4 h-4 shrink-0 text-[#ff9d97]" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="p-1.5 rounded-full hover:bg-white/10 dark:hover:bg-black/10 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
