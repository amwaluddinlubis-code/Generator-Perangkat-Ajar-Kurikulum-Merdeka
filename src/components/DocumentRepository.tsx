import React, { useState } from 'react';
import { EducationalDocument, TeacherUser } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import {
  Archive,
  Search,
  Filter,
  FileText,
  Eye,
  Download,
  Trash2,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { exportToDocx } from '../utils/exportUtils';
import { EmptyState } from './ui/EmptyState';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DocumentRepositoryProps {
  documents: EducationalDocument[];
  currentUser: TeacherUser;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectDocument: (doc: EducationalDocument) => void;
  onDeleteDocument: (docId: string) => Promise<void>;
  onCreateNew: () => void;
}

export const DocumentRepository: React.FC<DocumentRepositoryProps> = ({
  documents,
  currentUser,
  loading = false,
  error = null,
  onRetry,
  onSelectDocument,
  onDeleteDocument,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [jenjangFilter, setJenjangFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const filteredDocs = documents
    .filter((doc) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        doc.title.toLowerCase().includes(q) ||
        doc.mataPelajaran.toLowerCase().includes(q) ||
        doc.topik.toLowerCase().includes(q) ||
        doc.authorName.toLowerCase().includes(q);

      const matchesType = docTypeFilter === 'ALL' || doc.docType === docTypeFilter;
      const matchesJenjang = jenjangFilter === 'ALL' || doc.jenjang === jenjangFilter;
      return matchesSearch && matchesType && matchesJenjang;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'id');
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? -diff : diff;
    });

  const ownDocs = documents.filter((doc) => doc.authorId === currentUser.id);
  const recentCount = documents.filter((doc) => {
    const age = Date.now() - new Date(doc.createdAt).getTime();
    return age <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-6">
      <section className="hero-surface p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <Archive className="h-[18px] w-[18px]" />
              </span>
              <span className="section-label">Ruang kerja</span>
            </div>
            <h2 className="page-title mt-3">Arsip dokumen.</h2>
            <p className="page-subtitle mt-3 max-w-xl">
              Semua perangkat yang pernah disusun berada di satu tempat. Cari, buka kembali, atau ekspor tanpa mengulang pekerjaan.
            </p>
          </div>

          <button onClick={onCreateNew} className="btn-apple self-start lg:self-auto">
            <Sparkles className="h-4 w-4" />
            Susun perangkat baru
          </button>
        </div>

        <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 border-t border-[var(--app-border)] pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[24px] font-bold tracking-[-.04em]">{documents.length}</p>
            <p className="text-[11.5px] text-[var(--app-text-tertiary)]">Total perangkat</p>
          </div>
          <div>
            <p className="text-[24px] font-bold tracking-[-.04em]">{ownDocs.length}</p>
            <p className="text-[11.5px] text-[var(--app-text-tertiary)]">Karya saya</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[24px] font-bold tracking-[-.04em]">{recentCount}</p>
            <p className="text-[11.5px] text-[var(--app-text-tertiary)]">7 hari terakhir</p>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[20px] p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-tertiary)]" />
            <input
              type="search"
              placeholder="Cari judul, mata pelajaran, topik, atau penyusun…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apple-input !pl-10"
              aria-label="Cari dokumen"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:min-w-[205px]">
              <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-tertiary)]" />
              <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} className="apple-input !pl-10 !text-[13px] !font-semibold">
                <option value="ALL">Semua jenis perangkat</option>
                <option value="modul_ajar">Modul Ajar</option>
                <option value="rpp">RPP Ringkas</option>
                <option value="soal_ujian">Bank Soal Ujian</option>
                <option value="lkpd">LKPD</option>
                <option value="kktp_atp">ATP & KKTP</option>
                <option value="prota_promes">Prota & Promes</option>
                <option value="modul_p5">Modul P5</option>
              </select>
            </label>

            <select value={jenjangFilter} onChange={(e) => setJenjangFilter(e.target.value)} className="apple-input !w-auto !min-w-[160px] !text-[13px] !font-semibold" aria-label="Filter jenjang">
              <option value="ALL">Semua jenjang</option>
              <option value="SD">SD (Fase A–C)</option>
              <option value="SMP">SMP (Fase D)</option>
              <option value="SMA">SMA (Fase E–F)</option>
              <option value="SMK">SMK</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')} className="apple-input !w-auto !min-w-[150px] !text-[13px] !font-semibold" aria-label="Urutkan">
              <option value="newest">Terbaru dulu</option>
              <option value="oldest">Terlama dulu</option>
              <option value="title">Judul A–Z</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-[11.5px] text-[var(--app-text-tertiary)]">
          <span>{filteredDocs.length} perangkat ditampilkan</span>
          {(searchTerm || docTypeFilter !== 'ALL' || jenjangFilter !== 'ALL' || sortBy !== 'newest') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setDocTypeFilter('ALL'); setJenjangFilter('ALL'); setSortBy('newest'); }}
              className="font-semibold text-[var(--app-accent)] hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Memuat arsip">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="apple-card min-h-[285px] space-y-3 p-5" aria-hidden="true">
              <div className="skeleton h-10 w-10 !rounded-[13px]" />
              <div className="skeleton h-5 w-4/5" />
              <div className="skeleton h-4 w-3/5" />
              <div className="skeleton h-4 w-2/5" />
              <div className="!mt-8 flex gap-2">
                <div className="skeleton h-9 flex-1 !rounded-full" />
                <div className="skeleton h-9 w-20 !rounded-full" />
              </div>
            </div>
          ))}
        </section>
      ) : error && documents.length === 0 ? (
        <section className="apple-card">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Arsip tidak dapat dimuat"
            description={error}
            action={
              <button type="button" onClick={onRetry} className="btn-apple btn-sm">
                <RefreshCw className="h-4 w-4" />
                Coba lagi
              </button>
            }
          />
        </section>
      ) : filteredDocs.length === 0 ? (
        <section className="apple-card">
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Belum ada perangkat yang cocok."
            description="Coba ubah kata kunci atau filter. Jika belum memiliki dokumen, mulai dari generator."
            action={
              <button onClick={onCreateNew} className="btn-apple">
                <Sparkles className="h-4 w-4" />
                Mulai menyusun
              </button>
            }
          />
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((doc) => {
            const typeConfig = DOC_TYPE_INFO[doc.docType] || DOC_TYPE_INFO.modul_ajar;
            const isAuthor = doc.authorId === currentUser.id;

            return (
              <article key={doc.id} className="apple-card group flex min-h-[285px] flex-col p-5 hover:-translate-y-0.5 hover:shadow-[var(--app-shadow-md)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    <FileText className="h-[18px] w-[18px]" />
                  </span>
                  <span className="status-chip !min-h-[26px] !px-2.5 !py-0 text-[10.5px]">{typeConfig.badge}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDocument(doc)}
                  className="mt-4 text-left"
                >
                  <h3 className="line-clamp-2 text-[16px] font-bold leading-snug tracking-[-.02em] group-hover:text-[var(--app-accent)]">
                    {doc.title}
                  </h3>
                </button>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="status-chip !min-h-[25px] !px-2 !py-0 text-[10.5px]">{doc.jenjang}</span>
                  <span className="status-chip !min-h-[25px] !px-2 !py-0 text-[10.5px]">{doc.tingkat}</span>
                  <span className="status-chip !min-h-[25px] !px-2 !py-0 text-[10.5px]">{doc.fase}</span>
                </div>

                <div className="mt-4 min-h-0 flex-1">
                  <p className="line-clamp-1 text-[12.5px] font-semibold text-[var(--app-text-secondary)]">{doc.mataPelajaran}</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-[var(--app-text-tertiary)]">
                    {doc.topik}
                  </p>
                </div>

                <div className="mt-5 border-t border-[var(--app-border)] pt-4">
                  <div className="mb-3 flex items-center justify-between gap-2 text-[11.5px] text-[var(--app-text-tertiary)]">
                    <span className="flex min-w-0 items-center gap-1.5 truncate">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-accent)]" />
                      <span className="truncate">{doc.authorName}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="btn-apple flex-1 !min-h-[38px] !px-3 !text-[12.5px]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Buka
                    </button>

                    <button
                      onClick={() => exportToDocx(doc.title, doc.content, {
                        schoolName: doc.schoolName,
                        authorName: doc.authorName,
                        jenjang: doc.jenjang,
                        tingkat: doc.tingkat,
                        fase: doc.fase,
                        mapel: doc.mataPelajaran,
                      })}
                      className="btn-apple-secondary !min-h-[38px] !px-3 !text-[12.5px]"
                      title="Unduh Format Microsoft Word (.docx)"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>.docx</span>
                    </button>

                    {(isAuthor || currentUser.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus dokumen "${doc.title}"?`)) onDeleteDocument(doc.id);
                        }}
                        className="rounded-full p-2.5 text-[var(--app-text-tertiary)] transition-colors hover:bg-[color-mix(in_srgb,var(--app-danger)_9%,transparent)] hover:text-[var(--app-danger)]"
                        title="Hapus dokumen"
                        aria-label={`Hapus ${doc.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
