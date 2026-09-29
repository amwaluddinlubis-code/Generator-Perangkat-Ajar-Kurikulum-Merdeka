import React, { useState } from 'react';
import { EducationalDocument, TeacherUser } from '../types';
import { 
  renderMarkdownToHtml, 
  downloadWordDocument, 
  exportToDocx,
  exportToPdf,
  copyToClipboard 
} from '../utils/exportUtils';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Bookmark, 
  Edit3, 
  Eye, 
  Share2, 
  GraduationCap, 
  FileText, 
  Clock, 
  Sparkles,
  ArrowLeft,
  School,
  FileCheck2,
  FileDown,
  Loader2
} from 'lucide-react';

interface DocumentViewerProps {
  document: EducationalDocument | null;
  currentUser: TeacherUser;
  onSaveToRepository?: (doc: EducationalDocument) => void;
  onBackToGenerator?: () => void;
  isSaved?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  currentUser,
  onSaveToRepository,
  onBackToGenerator,
  isSaved = false
}) => {
  if (!document) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Belum Ada Dokumen yang Dibuat
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Gunakan formulir Generator Ajar di sebelah kiri untuk menyusun Modul Ajar, RPP, Soal Ujian, atau LKPD sesuai standar Permendikbudristek No. 12 Tahun 2024.
        </p>
      </div>
    );
  }

  const [activeView, setActiveView] = useState<'preview' | 'raw' | 'edit'>('preview');
  const [editableContent, setEditableContent] = useState<string>(document.content);
  const [copied, setCopied] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(isSaved);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

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
      await exportToDocx(document.title, editableContent, {
        schoolName: document.schoolName || currentUser.schoolName,
        authorName: document.authorName || currentUser.name,
        jenjang: document.jenjang,
        tingkat: document.tingkat,
        fase: document.fase,
        mapel: document.mataPelajaran,
        nip: currentUser.nip
      });
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

  const renderedHtml = renderMarkdownToHtml(editableContent);

  return (
    <div className="space-y-4">
      
      {/* Top Action Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          {onBackToGenerator && (
            <button
              onClick={onBackToGenerator}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Kembali ke formulir"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase">
                {document.jenjang} • {document.tingkat} ({document.fase})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                {document.mataPelajaran}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate max-w-[280px] sm:max-w-md mt-0.5">
              {document.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          
          {/* View Toggles */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold mr-1">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeView === 'preview' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Kop Dokumen
            </button>
            <button
              onClick={() => setActiveView('edit')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeView === 'edit' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Teks
            </button>
            <button
              onClick={() => setActiveView('raw')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeView === 'raw' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Markdown
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Salin isi dokumen ke clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          {/* Export to .DOCX Button */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
            title="Ekspor dokumen Microsoft Word (.docx) siap diedit di Word / Google Docs"
          >
            {isExportingDocx ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileDown className="w-4 h-4 text-white" />
            )}
            <span>{isExportingDocx ? 'Menyusun .docx...' : 'Ekspor .docx'}</span>
          </button>

          {/* Export to .PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/20 disabled:opacity-50"
            title="Ekspor dokumen langsung ke format berkas PDF (.pdf) siap cetak"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>{isExportingPdf ? 'Menyusun .pdf...' : 'Ekspor .pdf'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Cetak langsung melalui dialog browser"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak</span>
          </button>

          {/* Save to Repo */}
          {onSaveToRepository && (
            <button
              onClick={handleSave}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                justSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title="Simpan dokumen ke bank arsip perangkat ajar"
            >
              <Bookmark className="w-4 h-4" />
              <span>{justSaved ? 'Tersimpan!' : 'Simpan Arsip'}</span>
            </button>
          )}

        </div>
      </div>

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

        {/* PREVIEW VIEW (DEFAULT) */}
        {activeView === 'preview' && (
          <div className="p-6 sm:p-10 md:p-14 bg-white max-w-4xl mx-auto" id="printable-document-content">
            
            {/* Kop Surat Sekolah Resmi Indonesia */}
            <div className="border-b-4 border-double border-slate-900 pb-4 mb-8 text-center relative print-kop">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-900 font-extrabold text-xs">
                  <GraduationCap className="w-8 h-8 text-blue-900" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800 leading-tight">
                    KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
                  </h4>
                  <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800 leading-tight">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH
                  </h4>
                  <h2 className="text-lg sm:text-2xl font-black uppercase text-blue-950 tracking-tight mt-0.5">
                    {document.schoolName || currentUser.schoolName || 'SATUAN PENDIDIKAN KURIKULUM MERDEKA'}
                  </h2>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 italic">
                Implementasi Kurikulum Merdeka Terintegrasi Platform Belajar.id • Permendikbudristek No. 12 Tahun 2024
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                NPSN: {currentUser.npsn || '20104829'} • Akreditasi: A (Unggul) • Tahun Ajaran 2026/2027
              </p>
            </div>

            {/* Document Rendered Content */}
            <div 
              className="prose-educational text-slate-900"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* Official Signature Section (Pengesahan) */}
            <div className="mt-14 pt-8 border-t border-slate-200 avoid-break-inside">
              <div className="grid grid-cols-2 gap-8 text-center text-xs sm:text-sm text-slate-900">
                <div>
                  <p className="font-medium">Mengetahui,</p>
                  <p className="font-bold">Kepala Satuan Pendidikan</p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold border-b border-slate-900 pb-0.5 px-4 inline-block">
                      Drs. H. Mulyadi, M.Pd.
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    NIP. 19710318 199702 1 002
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Jakarta, {new Date(document.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-bold">Guru Mata Pelajaran / Kelas</p>
                  <div className="h-20 flex items-end justify-center">
                    <p className="font-bold border-b border-slate-900 pb-0.5 px-4 inline-block">
                      {document.authorName || currentUser.name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    NIP. {currentUser.nip || '19890412 201402 2 003'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
