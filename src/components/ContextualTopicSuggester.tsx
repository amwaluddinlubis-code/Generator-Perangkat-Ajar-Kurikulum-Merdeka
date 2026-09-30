import React, { useState, useMemo } from 'react';
import { Jenjang } from '../types';
import { getContextualTopics, CurriculumTopicItem, CURRICULUM_TOPICS } from '../data/topicCatalog';
import { Badge } from './ui/Badge';
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
    <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] transition-all">

      {/* Suggester Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--app-border)] p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5 sm:items-center">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] sm:mt-0">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-bold sm:text-sm">
                Inspirasi topik resmi (BSKAP 046/H/KR/2025)
              </h4>
              <Badge tone="info">{fase} • {tingkat} ({jenjang})</Badge>
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--app-text-secondary)]">
              Materi pokok terstandar untuk <b>{mataPelajaran}</b>. Pilih untuk menerapkan ke formulir.
            </p>
          </div>
        </div>

        {/* Toggle Collapse & Semester Filter */}
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <div className="apple-segment" role="group" aria-label="Filter semester">
            <button
              type="button"
              onClick={() => setSelectedSemester('all')}
              data-active={selectedSemester === 'all'}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(1)}
              data-active={selectedSemester === 1}
            >
              Sem 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(2)}
              data-active={selectedSemester === 2}
            >
              Sem 2
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-full p-2.5 text-[var(--app-text-secondary)] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            title={isExpanded ? 'Tutup Rekomendasi' : 'Buka Rekomendasi'}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Tutup rekomendasi topik' : 'Buka rekomendasi topik'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Suggester Body */}
      {isExpanded && (
        <div className="space-y-3.5 p-4 sm:p-5">

          {/* Quick Search in topics */}
          {matchingTopics.length > 3 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-tertiary)]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Cari topik ${mataPelajaran}...`}
                aria-label="Cari topik"
                className="apple-input !pl-10"
              />
            </div>
          )}

          {/* Contextual Topics Grid */}
          {matchingTopics.length === 0 ? (
            <div className="space-y-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4 text-center">
              <p className="text-[12.5px] text-[var(--app-text-secondary)]">
                Belum ada topik tersimpan untuk kata kunci ini. Ketik materi khusus atau pilih cepat:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {[
                  `Penerapan Kontekstual ${mataPelajaran} dalam Kehidupan Nyata`,
                  `Studi Kasus & Analisis Fenomena (${mataPelajaran})`,
                  `Projek Kreatif & Literasi Numerasi (${mataPelajaran})`
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCustomSuggest(sug)}
                    className="btn-apple-secondary btn-sm"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {matchingTopics.map((item) => {
                const isSelected = currentTopik.trim().toLowerCase() === item.topik.trim().toLowerCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTopic(item)}
                    aria-pressed={isSelected}
                    className={`group flex min-h-[44px] flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-[var(--app-border)] bg-[var(--app-surface-solid)] hover:border-[var(--app-border-strong)]'
                    }`}
                  >
                    <span>
                      {/* Top Badges */}
                      <span className="mb-1.5 flex items-center justify-between gap-1.5">
                        <Badge tone={isSelected ? 'neutral' : 'info'}>
                          Semester {item.semester} • {item.tingkat}
                        </Badge>

                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          isSelected ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' : 'bg-black/5 text-[var(--app-text-secondary)] dark:bg-white/10'
                        }`}>
                          {item.rekomendasiModel.split(' - ')[0]}
                        </span>
                      </span>

                      {/* Topic Title */}
                      <span className="line-clamp-2 block text-[13px] font-bold leading-snug sm:text-sm">
                        {item.topik}
                      </span>

                      {/* TP Preview */}
                      <span className={`mt-1.5 line-clamp-2 block text-[11.5px] leading-relaxed ${
                        isSelected ? 'opacity-75' : 'text-[var(--app-text-secondary)]'
                      }`}>
                        {item.deskripsiTP}
                      </span>
                    </span>

                    {/* Footer Action */}
                    <span className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-[11px] dark:border-white/10">
                      <span className={`font-medium ${isSelected ? 'opacity-75' : 'text-[var(--app-text-tertiary)]'}`}>
                        {item.kataKunci.slice(0, 2).map(k => `#${k}`).join(' ')}
                      </span>

                      <span className="flex items-center gap-1 font-bold">
                        {isSelected ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Terpilih
                          </>
                        ) : (
                          <>
                            Pilih
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </span>
                    </span>

                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Notice footer */}
          <div className="flex items-center justify-between pt-1 text-[11.5px] text-[var(--app-text-tertiary)]">
            <span>Ditemukan <b>{matchingTopics.length}</b> inspirasi untuk <b>{mataPelajaran} {tingkat}</b></span>
            <span className="hidden sm:inline">Permendikbudristek 12/2024</span>
          </div>

        </div>
      )}

    </div>
  );
};
