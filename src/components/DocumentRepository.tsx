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

  // UX: konfirmasi hapus bergaya aplikasi + loading + feedback
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
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--ink)]">Arsip dokumen</h1>
          <p className="apple-sub mt-1 max-w-2xl">
            Modul ajar, RPP, soal, dan LKPD tersimpan rapi — buka, cetak, atau unduh kapan pun.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isTrulyEmpty && (
            <span className="ds-badge">{documents.length} dokumen</span>
          )}
          <button onClick={onCreateNew} className="btn-apple">
            <Sparkles className="w-4 h-4" />
            Susun perangkat baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Cari materi, mata pelajaran, atau penyusun…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input !pl-9"
            aria-label="Cari dokumen"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="apple-input !w-auto shrink-0 !py-2 !text-[12.5px]"
            aria-label="Filter jenis perangkat"
          >
            <option value="ALL">Semua jenis</option>
            <option value="modul_ajar">Modul Ajar</option>
            <option value="rpp">RPP Ringkas</option>
            <option value="soal_ujian">Bank Soal Ujian</option>
            <option value="lkpd">LKPD</option>
            <option value="kktp_atp">ATP &amp; KKTP</option>
            <option value="prota_promes">Prota &amp; Promes</option>
            <option value="modul_p5">Modul Projek</option>
          </select>

          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="apple-input !w-auto shrink-0 !py-2 !text-[12.5px]"
            aria-label="Filter jenjang"
          >
            <option value="ALL">Semua jenjang</option>
            <option value="SD">SD (Fase A–C)</option>
            <option value="SMP">SMP (Fase D)</option>
            <option value="SMA">SMA (Fase E–F)</option>
            <option value="SMK">SMK</option>
          </select>
        </div>
      </div>

      {/* UX: jumlah hasil — pengguna tahu berapa dokumen yang sedang ditampilkan */}
      {!isTrulyEmpty && (
        <p className="text-[12px] text-[var(--muted)]" aria-live="polite">
          Menampilkan {filteredDocs.length} dari {documents.length} dokumen
        </p>
      )}

      {/* Grid Cards of Documents */}
      {isTrulyEmpty ? (
        <div className="apple-card px-6 py-14 text-center">
          <div className="w-14 h-14 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-semibold text-[var(--ink)]">Arsip Anda masih kosong</h3>
          <p className="text-[13px] text-[var(--muted)] mt-1.5 max-w-sm mx-auto">
            Setiap perangkat yang Anda susun dengan generator akan tersimpan otomatis di sini — siap dibuka, dicetak, atau diunduh kapan pun.
          </p>
          <button onClick={onCreateNew} className="btn-apple mt-6">
            <Sparkles className="w-4 h-4" />
            Buat perangkat pertama
          </button>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="apple-card px-6 py-14 text-center">
          <BookOpen className="w-6 h-6 text-[var(--muted)] mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-[var(--ink)]">Tidak ada perangkat ditemukan</h3>
          <p className="text-[12.5px] text-[var(--muted)] mt-1 max-w-sm mx-auto">
            Coba kata kunci lain, atau bersihkan pencarian dan filter untuk melihat semua dokumen.
          </p>
          <button onClick={resetFilters} className="btn-apple-secondary mt-5">
            <X className="w-4 h-4" />
            Bersihkan pencarian &amp; filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredDocs.map((doc) => {
            const typeConfig = DOC_TYPE_INFO[doc.docType] || DOC_TYPE_INFO.modul_ajar;
            const isAuthor = doc.authorId === currentUser.id;

            return (
              <div key={doc.id} className="apple-card ux-lift p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="ds-badge">
                      {doc.jenjang} · {doc.tingkat} · {doc.fase}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--muted)] shrink-0">
                      {typeConfig.badge}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectDocument(doc)}
                    className="text-[14.5px] font-semibold leading-snug text-[var(--ink)] cursor-pointer line-clamp-2 hover:text-[var(--accent)]"
                  >
                    {doc.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-[var(--ink-soft)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                    <span className="truncate">{doc.mataPelajaran}</span>
                  </div>

                  <p className="mt-1 text-[12px] text-[var(--muted)] line-clamp-2">
                    Topik: {doc.topik}
                  </p>
                </div>

                <div className="mt-4 border-t border-[var(--line)] pt-3">
                  <div className="mb-3 flex items-center justify-between text-[11.5px] text-[var(--muted)]">
                    <span className="truncate max-w-[150px]">{doc.authorName}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="btn-apple !min-h-[32px] !py-1 !px-3 !text-[12px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Buka
                    </button>

                    <button
                      onClick={() => handleDownloadDocx(doc)}
                      disabled={downloadingId === doc.id}
                      className="btn-apple-secondary !min-h-[32px] !py-1 !px-2.5 !text-[12px]"
                      title="Unduh format Microsoft Word (.docx)"
                    >
                      {downloadingId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{downloadingId === doc.id ? 'Menyiapkan…' : '.docx'}</span>
                    </button>

                    {(isAuthor || currentUser.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus dokumen"
                        aria-label={`Hapus ${doc.title}`}
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

      {/* UX: dialog konfirmasi hapus bergaya aplikasi */}
      {docToDelete && (
        <div
          className="modal modal-open"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-doc-title"
        >
          <div className="modal-box max-w-sm">
            <div className="w-10 h-10 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center mb-3">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 id="delete-doc-title" className="text-[15px] font-semibold text-[var(--ink)]">
              Hapus dokumen?
            </h3>
            <p className="mt-1.5 text-[12.5px] text-[var(--muted)] line-clamp-3">
              &ldquo;{docToDelete.title}&rdquo; akan dihapus permanen dari arsip dan tidak dapat dikembalikan.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="btn-apple-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[var(--danger)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Menghapus…' : 'Hapus'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { if (!isDeleting) setDocToDelete(null); }} />
        </div>
      )}

      {/* UX: toast lokal — umpan balik unduh & hapus */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[70] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 pl-3.5 pr-2 text-[12.5px] font-medium text-[var(--ink)] shadow-lg"
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
            className="ml-1 shrink-0 cursor-pointer rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
