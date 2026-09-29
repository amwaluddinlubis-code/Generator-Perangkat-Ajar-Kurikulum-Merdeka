import React, { useState, useMemo } from 'react';
import { Jenjang } from '../types';
import { getContextualTopics, CurriculumTopicItem, CURRICULUM_TOPICS } from '../data/topicCatalog';
import { 
  Lightbulb, 
  Sparkles, 
  Check, 
  Search, 
  BookOpen, 
  Layers, 
  Target, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BookmarkPlus
} from 'lucide-react';

interface ContextualTopicSuggesterProps {
  jenjang: Jenjang;
  fase: string;
  tingkat: string;
  mataPelajaran: string;
  currentTopik: string;
  onSelectTopic: (topic: CurriculumTopicItem) => void;
}

export const ContextualTopicSuggester: React.FC<ContextualTopicSuggesterProps> = ({
  jenjang,
  fase,
  tingkat,
  mataPelajaran,
  currentTopik,
  onSelectTopic
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSemester, setSelectedSemester] = useState<'all' | 1 | 2>('all');

  // Query matching topics based on selected jenjang, fase, tingkat, and mataPelajaran
  const matchingTopics = useMemo(() => {
    let list = getContextualTopics(jenjang, fase, tingkat, mataPelajaran);

    if (selectedSemester !== 'all') {
      list = list.filter(t => t.semester === selectedSemester);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.topik.toLowerCase().includes(q) || 
        t.deskripsiTP.toLowerCase().includes(q) ||
        t.kataKunci.some(k => k.toLowerCase().includes(q))
      );
    }

    return list;
  }, [jenjang, fase, tingkat, mataPelajaran, selectedSemester, searchTerm]);

  // Generate dynamic custom topic prompt for fallback
  const handleQuickCustomSuggest = (customTitle: string) => {
    onSelectTopic({
      id: `custom-${Date.now()}`,
      jenjang,
      fase,
      tingkat,
      mataPelajaranKey: mataPelajaran.toLowerCase(),
      mataPelajaranName: mataPelajaran,
      topik: customTitle,
      semester: 1,
      deskripsiTP: `Peserta didik mampu memahami dan menganalisis ${customTitle} secara komprehensif.`,
      rekomendasiModel: 'Problem Based Learning (PBL)',
      alokasiWaktuDefault: '2 JP - 1 Pertemuan',
      kataKunci: [customTitle.toLowerCase()]
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-indigo-50/40 rounded-2xl border border-blue-200/90 shadow-2xs overflow-hidden transition-all">
      
      {/* Suggester Header */}
      <div className="p-4 sm:p-4.5 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Lightbulb className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                Inspirasi Topik & Materi Pokok Resmi (BSKAP 046/H/KR/2025)
              </h4>
              <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {fase} • {tingkat} ({jenjang})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Materi pokok terstandar untuk mata pelajaran <b>{mataPelajaran}</b>. Klik kartu topik untuk menerapkan langsung ke formulir.
            </p>
          </div>
        </div>

        {/* Toggle Collapse & Semester Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setSelectedSemester('all')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                selectedSemester === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(1)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                selectedSemester === 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sem 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(2)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                selectedSemester === 2 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sem 2
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title={isExpanded ? 'Tutup Rekomendasi' : 'Buka Rekomendasi'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Suggester Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3.5">
          
          {/* Quick Search in topics */}
          {matchingTopics.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Cari topik khusus ${mataPelajaran}...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Contextual Topics Grid */}
          {matchingTopics.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-600">
                Belum ada topik tersimpan untuk kata kunci pencarian. Anda dapat mengetik materi khusus atau memilih topik populer di bawah:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {[
                  `Penerapan Kontekstual ${mataPelajaran} dalam Kehidupan Nyata`,
                  `Studi Kasus & Analisis Fenomena Berbasis Masalah (${mataPelajaran})`,
                  `Projek Kreatif & Literasi Numerasi (${mataPelajaran})`
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCustomSuggest(sug)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {matchingTopics.map((item) => {
                const isSelected = currentTopik.trim().toLowerCase() === item.topik.trim().toLowerCase();

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectTopic(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                        : 'bg-white hover:bg-blue-50/60 border-slate-200/90 hover:border-blue-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                        }`}>
                          Semester {item.semester} • {item.tingkat}
                        </span>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.rekomendasiModel.split(' - ')[0]}
                        </span>
                      </div>

                      {/* Topic Title */}
                      <h5 className={`font-bold text-xs sm:text-sm leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : 'text-slate-900 group-hover:text-blue-700'
                      }`}>
                        {item.topik}
                      </h5>

                      {/* TP Preview */}
                      <p className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {item.deskripsiTP}
                      </p>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-3 pt-2 border-t border-slate-100/50 flex items-center justify-between text-[11px]">
                      <span className={`font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.kataKunci.slice(0, 2).map(k => `#${k}`).join(' ')}
                      </span>

                      <span className={`font-bold flex items-center gap-1 ${
                        isSelected ? 'text-white' : 'text-blue-600 group-hover:translate-x-0.5 transition-transform'
                      }`}>
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Topik Terpilih
                          </>
                        ) : (
                          <>
                            Pilih Topik
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Notice footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Ditemukan <b>{matchingTopics.length}</b> inspirasi materi pokok sesuai <b>{mataPelajaran} {tingkat} ({fase})</b></span>
            <span className="hidden sm:inline">Kurikulum Nasional Permendikbudristek 12/2024</span>
          </div>

        </div>
      )}

    </div>
  );
};
