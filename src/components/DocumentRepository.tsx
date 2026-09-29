import React, { useState } from 'react';
import { EducationalDocument, TeacherUser, DocType, Jenjang } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { 
  Archive, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  GraduationCap, 
  Clock, 
  Check, 
  Printer,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { downloadWordDocument, exportToDocx } from '../utils/exportUtils';

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
            <option value="modul_p5">Modul P5</option>
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

      {/* Grid Cards of Documents */}
      {filteredDocs.length === 0 ? (
        <div className="apple-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
          <h3 className="text-[16px] font-semibold">Tidak ada perangkat ditemukan</h3>
          <p className="text-[13.5px] text-[#6e6e73] dark:text-[#98989d] mt-1 max-w-sm mx-auto">
            Sesuaikan kata kunci pencarian atau buat perangkat baru dengan generator.
          </p>
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

                    <button
                      onClick={() => exportToDocx(doc.title, doc.content, {
                        schoolName: doc.schoolName,
                        authorName: doc.authorName,
                        jenjang: doc.jenjang,
                        tingkat: doc.tingkat,
                        fase: doc.fase,
                        mapel: doc.mataPelajaran
                      })}
                      className="px-3.5 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[13px] font-semibold transition-colors cursor-pointer flex items-center gap-1 min-h-[38px]"
                      title="Unduh Format Microsoft Word (.docx)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.docx</span>
                    </button>

                    {(isAuthor || currentUser.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus dokumen "${doc.title}"?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
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

    </div>
  );
};
