import React, { useState, useRef, useEffect } from 'react';
import { EducationalDocument, TeacherUser } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import {
  Archive,
  Search,
  Eye,
  Download,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Info,
  X,
  Loader2
} from 'lucide-react';
import { exportToDocx } from '../utils/exportUtils';

interface DocumentRepositoryProps {
  documents: EducationalDocument[];
  currentUser: TeacherUser;
  onSelectDocument: (doc: EducationalDocument) => void;
  onDeleteDocument: (docId: string) => Promise<void>;
  onCreateNew: () => void;
}

export const DocumentRepository: React.FC<DocumentRepositoryProps> = ({
  documents,
  currentUser,
  onSelectDocument,
  onDeleteDocument,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('ALL');
  const [jenjangFilter, setJenjangFilter] = useState<string>('ALL');
  // UX: state untuk dialog konfirmasi hapus (pengganti confirm bawaan browser)
  const [docToDelete, setDocToDelete] = useState<EducationalDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // UX: id dokumen yang sedang diunduh .docx — indikator loading per kartu
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  // UX: toast lokal untuk umpan balik aksi (unduh / hapus / salin)
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' | 'info' } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = (message: string, kind: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  };
  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.mataPelajaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.topik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = docTypeFilter === 'ALL' || doc.docType === docTypeFilter;
    const matchesJenjang = jenjangFilter === 'ALL' || doc.jenjang === jenjangFilter;

    return matchesSearch && matchesType && matchesJenjang;
  });

  const isTrulyEmpty = documents.length === 0;

  // UX: kembalikan pencarian & filter ke awal dari empty state hasil filter
  const resetFilters = () => {
    setSearchTerm('');
    setDocTypeFilter('ALL');
    setJenjangFilter('ALL');
  };

  // UX: unduh .docx dengan loading per kartu + feedback sukses/gagal
  const handleDownloadDocx = async (doc: EducationalDocument) => {
    setDownloadingId(doc.id);
    try {
      await exportToDocx(doc.title, doc.content, {
        schoolName: doc.schoolName,
        authorName: doc.authorName,
        jenjang: doc.jenjang,
        tingkat: doc.tingkat,
        fase: doc.fase,
        mapel: doc.mataPelajaran
      });
      showToast('File .docx berhasil diunduh', 'success');
    } catch {
      showToast('Gagal mengunduh .docx. Coba lagi.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // UX: konfirmasi hapus bergaya aplikasi + loading + feedback (menggantikan confirm bawaan browser)
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteDocument(docToDelete.id);
      showToast('Dokumen dihapus dari arsip', 'info');
    } catch {
      showToast('Gagal menghapus dokumen. Coba lagi.', 'error');
    } finally {
      setIsDeleting(false);
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <p className="apple-eyebrow">Bank perangkat</p>
        <h2 className="apple-headline !text-[28px] sm:!text-[34px] mt-1">Arsip dokumen.</h2>
        <p className="apple-sub mt-2 !text-[15px]">
          Modul Ajar, RPP, Soal, dan LKPD tersimpan rapi — buka, cetak, atau unduh kapan pun.
        </p>
        <button
          onClick={onCreateNew}
          className="btn-apple mt-5"
        >
          <Sparkles className="w-4 h-4" />
          Susun perangkat baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari materi, mata pelajaran, atau penyusun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input !pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="apple-input !w-auto !py-2.5 text-[13.5px] font-semibold"
          >
            <option value="ALL">Semua Jenis Perangkat</option>
            <option value="modul_ajar">Modul Ajar</option>
            <option value="rpp">RPP Ringkas</option>
            <option value="soal_ujian">Bank Soal Ujian</option>
            <option value="lkpd">LKPD</option>
            <option value="kktp_atp">ATP & KKTP</option>
            <option value="prota_promes">Prota & Promes</option>
            <option value="modul_p5">Modul Projek</option>
          </select>

          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="apple-input !w-auto !py-2.5 text-[13.5px] font-semibold"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">SD (Fase A-C)</option>
            <option value="SMP">SMP (Fase D)</option>
            <option value="SMA">SMA (Fase E-F)</option>
            <option value="SMK">SMK</option>
          </select>
        </div>
      </div>

      {/* UX: jumlah hasil — pengguna tahu berapa dokumen yang sedang ditampilkan */}
      {!isTrulyEmpty && (
        <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] -mt-4" aria-live="polite">
          Menampilkan {filteredDocs.length} dari {documents.length} dokumen
        </p>
      )}

      {/* Grid Cards of Documents */}
      {/* UX: bedakan arsip kosong total (empty state ramah + CTA) dari hasil filter yang kosong */}
      {isTrulyEmpty ? (
        <div className="apple-card p-10 sm:p-14 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#e8f0ff] to-[#f3e8ff] dark:from-[#1c2b4a] dark:to-[#2b1c4a] flex items-center justify-center mx-auto mb-4">
            <Archive className="w-9 h-9 text-[#0a84ff]" />
          </div>
          <h3 className="text-[18px] font-semibold tracking-tight">Arsip Anda masih kosong</h3>
          <p className="text-[14px] text-[#6e6e73] dark:text-[#98989d] mt-1.5 max-w-sm mx-auto">
            Setiap perangkat yang Anda susun dengan generator akan tersimpan otomatis di sini — siap dibuka, dicetak, atau diunduh kapan pun.
          </p>
          <button
            onClick={onCreateNew}
            className="btn-apple mt-6"
          >
            <Sparkles className="w-4 h-4" />
            Buat perangkat pertama saya
          </button>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="apple-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
          <h3 className="text-[16px] font-semibold">Tidak ada perangkat ditemukan</h3>
          <p className="text-[13.5px] text-[#6e6e73] dark:text-[#98989d] mt-1 max-w-sm mx-auto">
            Coba kata kunci lain, atau bersihkan pencarian dan filter untuk melihat semua dokumen.
          </p>
          <button
            onClick={resetFilters}
            className="btn-apple-secondary mt-5"
          >
            <X className="w-4 h-4" />
            Bersihkan pencarian &amp; filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const typeConfig = DOC_TYPE_INFO[doc.docType] || DOC_TYPE_INFO.modul_ajar;
            const isAuthor = doc.authorId === currentUser.id;

            return (
              <div
                key={doc.id}
                className="apple-card p-5 flex flex-col justify-between group hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10">
                      {doc.jenjang} • {doc.tingkat} ({doc.fase})
                    </span>

                    <span className="text-[11px] font-semibold text-[#6e6e73] dark:text-[#98989d]">
                      {typeConfig.badge}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectDocument(doc)}
                    className="font-semibold text-[15px] leading-snug cursor-pointer line-clamp-2"
                  >
                    {doc.title}
                  </h3>

                  <div className="text-[13px] font-medium mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0" />
                    <span>{doc.mataPelajaran}</span>
                  </div>

                  <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mt-1 line-clamp-2">
                    Topik: {doc.topik}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between text-[12px] text-[#6e6e73] dark:text-[#98989d] mb-3">
                    <span className="truncate max-w-[150px]">{doc.authorName}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-4 py-2 rounded-full bg-black dark:bg-white dark:text-black text-white text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Buka
                    </button>

                    {/* UX: tombol unduh dengan loading per kartu + toast sukses/gagal */}
                    <button
                      onClick={() => handleDownloadDocx(doc)}
                      disabled={downloadingId === doc.id}
                      className="px-3.5 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[13px] font-semibold transition-colors cursor-pointer flex items-center gap-1 min-h-[38px] disabled:opacity-60"
                      title="Unduh Format Microsoft Word (.docx)"
                    >
                      {downloadingId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{downloadingId === doc.id ? 'Menyiapkan...' : '.docx'}</span>
                    </button>

                    {/* UX: buka dialog konfirmasi hapus bergaya aplikasi (bukan confirm bawaan browser) */}
                    {(isAuthor || currentUser.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* UX: dialog konfirmasi hapus bergaya aplikasi — klik backdrop untuk batal */}
      {docToDelete && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-doc-title"
          onClick={() => { if (!isDeleting) setDocToDelete(null); }}
        >
          <div
            className="apple-card max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fff1f1] dark:bg-[#3a1512] flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-[#b3261e] dark:text-[#ff9d97]" />
            </div>
            <h3 id="delete-doc-title" className="text-[17px] font-semibold tracking-tight">
              Hapus dokumen?
            </h3>
            <p className="text-[13.5px] text-[#6e6e73] dark:text-[#98989d] mt-1.5 line-clamp-3">
              &ldquo;{docToDelete.title}&rdquo; akan dihapus permanen dari arsip dan tidak dapat dikembalikan.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="btn-apple-secondary flex-1 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#b3261e] hover:bg-[#9c1f18] text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UX: toast lokal — umpan balik unduh & hapus */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-2xl shadow-xl text-[13.5px] font-medium max-w-[calc(100vw-2rem)] bg-[#1c1c1e] text-white dark:bg-white dark:text-black"
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
