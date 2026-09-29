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
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Archive className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bank Perangkat Ajar & Arsip Modul Guru
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kumpulan Modul Ajar, RPP, Soal Ujian, dan LKPD terverifikasi standar Kurikulum Merdeka 2024.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Susun Perangkat Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi, mata pelajaran, atau penyusun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada perangkat ajar ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau buat perangkat ajar baru dengan generator AI.
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
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      doc.jenjang === 'SD' ? 'bg-emerald-100 text-emerald-800' :
                      doc.jenjang === 'SMP' ? 'bg-blue-100 text-blue-800' :
                      doc.jenjang === 'SMA' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.jenjang} • {doc.tingkat} ({doc.fase})
                    </span>

                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {typeConfig.badge}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectDocument(doc)}
                    className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-sm sm:text-base leading-snug cursor-pointer line-clamp-2"
                  >
                    {doc.title}
                  </h3>

                  <div className="text-xs font-medium text-slate-600 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{doc.mataPelajaran}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Topik: {doc.topik}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span className="truncate max-w-[150px]">{doc.authorName}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Buka & Cetak
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
                      className="px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
