import React, { useEffect, useState } from 'react';
import { EducationalDocument, TeacherUser, SchoolConfig } from '../types';
import { 
  renderMarkdownToHtml, 
  downloadWordDocument, 
  exportToDocx,
  exportToPdf,
  copyToClipboard 
} from '../utils/exportUtils';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { getServerMessage } from '../utils/api';
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
  RefreshCw,
  ImagePlus
} from 'lucide-react';

interface DocumentViewerProps {
  document: EducationalDocument | null;
  currentUser: TeacherUser;
  school?: SchoolConfig | null;
  modelUsed?: string;
  quality?: { status: string; issues: string[] } | null;
  onSaveToRepository?: (doc: EducationalDocument) => void;
  onBackToGenerator?: () => void;
  isSaved?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  currentUser,
  school = null,
  modelUsed = '',
  quality = null,
  onSaveToRepository,
  onBackToGenerator,
  isSaved = false
}) => {
  const [activeView, setActiveView] = useState<'preview' | 'raw' | 'edit'>('preview');
  const [editableContent, setEditableContent] = useState<string>(document?.content || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(isSaved);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [showQuality, setShowQuality] = useState<boolean>(false);
  const [regenSection, setRegenSection] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [regenError, setRegenError] = useState<string>('');

  useEffect(() => {
    if (!document) return;
    setEditableContent(document.content);
    setActiveView('preview');
    setJustSaved(isSaved);
  }, [document?.id, document?.content, isSaved]);

  if (!document) {
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
      </div>
    );
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(editableContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportToDocx(document.title, editableContent, exportMeta);
    } catch (err) {
      console.error('Docx export failed, falling back to html doc:', err);
      downloadWordDocument(document.title, editableContent, exportMeta);
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
      }
    } catch (err) {
      console.error('PDF export failed, opening print dialog:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSave = () => {
    if (onSaveToRepository) {
      onSaveToRepository({
        ...document,
        content: editableContent
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
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
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt.trim(), aspectRatio: imgRatio })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(getServerMessage(data, 'Gagal membuat ilustrasi'));
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

  // Pecah konten menjadi bagian per heading (untuk regenerasi per bagian)
  const contentSections = (() => {
    const lines = editableContent.split('\n');
    const sections: Array<{ title: string; level: number; start: number }> = [];
    lines.forEach((line, idx) => {
      const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
      if (match) sections.push({ title: match[2].slice(0, 80), level: match[1].length, start: idx });
    });
    return sections;
  })();

  const handleRegenerateSection = async () => {
    if (!regenSection || isRegenerating) return;
    setIsRegenerating(true);
    setRegenError('');
    try {
      const res = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: document.docType,
          jenjang: document.jenjang,
          tingkat: document.tingkat,
          fase: document.fase,
          mataPelajaran: document.mataPelajaran,
          topik: document.topik,
          sectionTitle: regenSection,
          content: editableContent
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(getServerMessage(data, 'Gagal meregenerasi bagian'));
      setEditableContent(prev => {
        const lines = prev.split('\n');
        const idx = contentSections.findIndex(s => s.title === regenSection);
        if (idx < 0) return prev;
        const start = contentSections[idx].start;
        const level = contentSections[idx].level;
        let end = lines.length;
        for (let i = idx + 1; i < contentSections.length; i++) {
          if (contentSections[i].level <= level) {
            end = contentSections[i].start;
            break;
          }
        }
        return [...lines.slice(0, start), data.section.trim(), '', ...lines.slice(end)].join('\n');
      });
      setActiveView('preview');
    } catch (err: any) {
      setRegenError(err.message || 'Gagal meregenerasi bagian');
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderedHtml = renderMarkdownToHtml(editableContent);

  // Identitas kop & pengesahan: konfigurasi sekolah bila ada, fallback profil.
  const kop = {
    schoolName: school?.name || document.schoolName || currentUser.schoolName,
    npsn: school?.npsn || currentUser.npsn || '',
    accreditation: school?.accreditation || '',
    address: school?.address || '',
    city: school?.city || 'Jakarta',
    logoUrl: school?.logoUrl || '',
    principalName: school?.principalName || '',
    principalNip: school?.principalNip || ''
  };

  const exportMeta = {
    schoolName: kop.schoolName,
    authorName: document.authorName || currentUser.name,
    jenjang: document.jenjang,
    tingkat: document.tingkat,
    fase: document.fase,
    mapel: document.mataPelajaran,
    nip: currentUser.nip,
    npsn: kop.npsn,
    address: kop.address,
    accreditation: kop.accreditation,
    city: kop.city,
    logoUrl: kop.logoUrl,
    principalName: kop.principalName,
    principalNip: kop.principalNip
  };

  return (
    <div className="space-y-5">
      
      {/* Top Action Bar — menempel saat menggulir dokumen panjang */}
      <div className="glass-panel p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 no-print !rounded-[20px] sticky top-[68px] z-20">
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
              {quality ? (
                <button
                  onClick={() => setShowQuality(v => !v)}
                  title={quality.issues.length ? quality.issues.join('\n') : 'Struktur dokumen lengkap'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-medium cursor-pointer"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    quality.status === 'AI' ? 'bg-[#30b158]' :
                    quality.status === 'fallback' ? 'bg-[#86868b]' : 'bg-[#ff9f0a] animate-pulse'
                  }`} />
                  {quality.status === 'AI' ? 'AI • Struktur lengkap'
                    : quality.status === 'fallback' ? 'Template cadangan'
                    : `Perlu ditinjau (${quality.issues.length})`}
                </button>
              ) : modelUsed ? (
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
              ) : null}
            </div>
            <h1 className="mt-1 max-w-[280px] truncate text-base font-bold tracking-[-.02em] sm:max-w-md sm:text-lg">
              {document.title}
            </h1>
          </div>
        </div>

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
            className="btn-apple-secondary !min-h-[38px] !px-3.5 !text-[12.5px]"
            title="Salin isi dokumen ke clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-[#30b158]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          {/* Ilustrasi AI */}
          <button
            onClick={openImgModal}
            className="btn-apple !min-h-[38px] !px-3.5 !text-[12.5px]"
            title="Buat ilustrasi AI untuk dokumen ini (Gemini)"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Ilustrasi AI</span>
          </button>

          {/* Export to .DOCX Button */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="btn-apple-secondary !min-h-[38px] !px-3.5 !text-[12.5px]"
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
            className="rounded-full p-2.5 text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-muted)]"
            title="Cetak langsung melalui dialog browser"
          >
            <Printer className="w-[18px] h-[18px]" />
          </button>

          {/* Save to Repo */}
          {onSaveToRepository && (
            <button
              onClick={handleSave}
              className={`btn-apple-secondary !min-h-[38px] !px-3.5 !text-[12.5px] ${
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

      {/* Panel kualitas + regenerasi per bagian */}
      {(quality && (showQuality || quality.issues.length > 0) || contentSections.length > 0) && (
        <div className="apple-card p-4 sm:p-5 space-y-3 no-print">
          {quality && quality.issues.length > 0 && (
            <div>
              <button
                onClick={() => setShowQuality(v => !v)}
                className="flex items-center gap-2 text-[13.5px] font-semibold cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#ff9f0a] animate-pulse" />
                {quality.issues.length} catatan kualitas — {showQuality ? 'sembunyikan' : 'tampilkan'}
              </button>
              {showQuality && (
                <ul className="mt-2 space-y-1.5 text-[13px] text-[#424245] dark:text-[#c7c7cc]">
                  {quality.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 rounded-xl bg-black/[0.03] dark:bg-white/5 px-3 py-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {contentSections.length > 0 && (
            <div className={quality && quality.issues.length > 0 ? 'pt-3 border-t border-black/10 dark:border-white/10' : ''}>
              <p className="text-[13px] font-semibold mb-2">Susun ulang satu bagian</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={regenSection}
                  onChange={(e) => { setRegenSection(e.target.value); setRegenError(''); }}
                  className="apple-input flex-1"
                  aria-label="Pilih bagian dokumen"
                >
                  <option value="">— Pilih bagian —</option>
                  {contentSections.map((s, idx) => (
                    <option key={idx} value={s.title}>{s.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleRegenerateSection}
                  disabled={!regenSection || isRegenerating}
                  className="btn-apple !min-h-[44px] sm:w-auto w-full disabled:opacity-50"
                >
                  {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isRegenerating ? 'Menyusun...' : 'Susun ulang'}
                </button>
              </div>
              {regenError && (
                <p className="text-[13px] text-[#b3261e] dark:text-[#ff9d97] mt-2">{regenError}</p>
              )}
              <p className="text-[12px] text-[#86868b] mt-1.5">
                Hanya bagian terpilih yang ditulis ulang AI mengikuti konteks dokumen — sisanya tidak berubah.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Document Paper Display */}
      <div className="apple-card-solid overflow-hidden print-container">
        
        {/* EDIT VIEW */}
        {activeView === 'edit' && (
          <div className="p-5 sm:p-7 space-y-4 no-print">
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
              className="apple-input min-h-[520px] resize-y !rounded-[16px] font-mono text-xs leading-relaxed sm:text-sm"
            />
          </div>
        )}

        {/* RAW MARKDOWN VIEW */}
        {activeView === 'raw' && (
          <div className="no-print overflow-x-auto rounded-b-[var(--app-radius-lg)] bg-[#111113] p-5 text-slate-100 sm:p-7">
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

            {/* Kop resmi — dari konfigurasi sekolah */}
            <div className="doc-kop print-kop">
              <div className="kop-eyebrow">Kurikulum Merdeka • Permendikbudristek No. 12 Tahun 2024</div>
              {kop.logoUrl ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={kop.logoUrl} alt="Logo sekolah" className="w-16 h-16 object-contain shrink-0" />
                  <div className="text-left">
                    <h4>KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</h4>
                    <h4>DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</h4>
                    <div className="kop-school">{kop.schoolName}</div>
                  </div>
                </div>
              ) : (
                <>
                  <h4>KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</h4>
                  <h4>DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH</h4>
                  <div className="kop-school">{kop.schoolName}</div>
                </>
              )}
              <div className="kop-addr">
                {kop.address ? `${kop.address} • ` : ''}NPSN: {kop.npsn || '............'}{kop.accreditation ? ` • Akreditasi ${kop.accreditation}` : ''} • Tahun Ajaran 2026/2027
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
                      {kop.principalName || '........................................................'}
                    </p>
                  </div>
                  <p className="text-[10pt] mt-1">
                    NIP. {kop.principalNip || '................................'}
                  </p>
                </div>

                <div>
                  <p>
                    {kop.city}, {new Date(document.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p><b>Guru Mata Pelajaran / Kelas</b></p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold inline-block px-4" style={{ borderBottom: '1px solid #111' }}>
                      {document.authorName || currentUser.name}
                    </p>
                  </div>
                  <p className="text-[10pt] mt-1">
                    NIP. {currentUser.nip || '................................'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal Ilustrasi AI */}
      <Modal
        isOpen={imgModalOpen}
        onClose={() => setImgModalOpen(false)}
        size="md"
        title="Ilustrasi AI"
        subtitle="Dibuat dengan Gemini dari deskripsi Anda, lalu disisipkan ke dokumen."
        footer={
          <>
            <button onClick={() => setImgModalOpen(false)} className="btn-apple-secondary btn-sm flex-1">
              Batal
            </button>
            {imgResult ? (
              <button onClick={handleInsertImage} className="btn-apple btn-sm flex-1">
                Sisipkan ke dokumen
              </button>
            ) : (
              <button onClick={handleGenerateImage} disabled={imgLoading || !imgPrompt.trim()} className="btn-apple btn-sm flex-1">
                {imgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {imgLoading ? 'Membuat...' : 'Buat gambar'}
              </button>
            )}
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Deskripsi gambar" htmlFor="img-prompt">
            <textarea
              id="img-prompt"
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              rows={4}
              className="apple-input resize-none"
              placeholder="Contoh: ilustrasi siklus air untuk anak SD, gaya flat..."
            />
          </Field>

          <Field label="Rasio" htmlFor="img-ratio">
            <select id="img-ratio" value={imgRatio} onChange={(e) => setImgRatio(e.target.value)} className="apple-input">
              <option value="16:9">Lanskap 16:9</option>
              <option value="4:3">Lanskap 4:3</option>
              <option value="1:1">Persegi 1:1</option>
              <option value="3:4">Potret 3:4</option>
              <option value="9:16">Potret 9:16</option>
            </select>
          </Field>

          {imgError && (
            <p role="alert" className="field-error !mt-1">
              {imgError}
            </p>
          )}

          {imgResult && (
            <div className="overflow-hidden rounded-2xl border border-[var(--app-border)]">
              <img src={imgResult} alt="Pratinjau ilustrasi AI" className="block h-auto w-full" />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
