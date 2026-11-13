import React, { useState, useMemo } from 'react';
import { Jenjang } from '../types';
import { getContextualTopics, CurriculumTopicItem } from '../data/topicCatalog';
import { 
  Lightbulb, 
  Check, 
  Search, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
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

  const semesterBtn = (value: 'all' | 1 | 2, label: string) => (
    <button
      type="button"
      onClick={() => setSelectedSemester(value)}
      data-active={selectedSemester === value}
      className="rounded-md px-2 py-1 text-[11px] font-medium text-[var(--muted)] transition-colors cursor-pointer data-[active=true]:bg-[var(--surface)] data-[active=true]:text-[var(--ink)] data-[active=true]:shadow-sm"
    >
      {label}
    </button>
  );

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
      
      {/* Suggester Header */}
      <div className="flex flex-col justify-between gap-2.5 border-b border-[var(--line)] px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5 sm:items-center">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] sm:mt-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[12.5px] font-semibold text-[var(--ink)]">
                Inspirasi topik &amp; materi pokok
              </h4>
              <span className="ds-badge !py-0 !text-[10px]">
                {fase} · {tingkat} · {jenjang}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Materi terstandar BSKAP 032/H/KR/2024 untuk <b className="text-[var(--ink-soft)]">{mataPelajaran}</b>. Pilih kartu untuk menerapkan ke formulir.
            </p>
          </div>
        </div>

        {/* Toggle Collapse & Semester Filter */}
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface-3)] p-0.5">
            {semesterBtn('all', 'Semua')}
            {semesterBtn(1, 'Sem 1')}
            {semesterBtn(2, 'Sem 2')}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer"
            title={isExpanded ? 'Tutup rekomendasi' : 'Buka rekomendasi'}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Tutup rekomendasi topik' : 'Buka rekomendasi topik'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Suggester Body */}
      {isExpanded && (
        <div className="space-y-3 p-4">
          
          {/* Quick Search in topics */}
          {matchingTopics.length > 3 && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Cari topik ${mataPelajaran}…`}
                aria-label="Cari topik materi"
                className="apple-input !py-1.5 !pl-8 !text-[12px]"
              />
            </div>
          )}

          {/* Contextual Topics Grid */}
          {matchingTopics.length === 0 ? (
            <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-center">
              <p className="text-[12px] text-[var(--muted)]">
                Belum ada topik untuk kata kunci ini. Ketik materi khusus atau pilih inspirasi berikut.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {[
                  `Penerapan kontekstual ${mataPelajaran} dalam kehidupan nyata`,
                  `Studi kasus & analisis fenomena berbasis masalah (${mataPelajaran})`,
                  `Projek kreatif & literasi numerasi (${mataPelajaran})`
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCustomSuggest(sug)}
                    className="rounded-md border border-[var(--line)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--accent-ink)] transition-colors hover:border-[var(--accent)]/40 cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {matchingTopics.map((item) => {
                const isSelected = currentTopik.trim().toLowerCase() === item.topik.trim().toLowerCase();

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onSelectTopic(item)}
                    aria-pressed={isSelected}
                    className={`flex w-full flex-col justify-between rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="mb-1.5 flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                          Semester {item.semester} · {item.tingkat}
                        </span>

                        <span className="text-[10px] font-medium text-[var(--muted)]">
                          {item.rekomendasiModel.split(' - ')[0]}
                        </span>
                      </div>

                      {/* Topic Title */}
                      <h5 className={`text-[12.5px] font-semibold leading-snug line-clamp-2 ${
                        isSelected ? 'text-[var(--accent-ink)]' : 'text-[var(--ink)]'
                      }`}>
                        {item.topik}
                      </h5>

                      {/* TP Preview */}
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">
                        {item.deskripsiTP}
                      </p>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-[var(--line)] pt-2 text-[10.5px]">
                      <span className="truncate font-medium text-[var(--muted)]">
                        {item.kataKunci.slice(0, 2).map(k => `#${k}`).join(' ')}
                      </span>

                      <span className="flex shrink-0 items-center gap-1 font-medium text-[var(--accent)]">
                        {isSelected ? (
                          <>
                            <Check className="w-3 h-3" />
                            Terpilih
                          </>
                        ) : (
                          <>
                            Pilih
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </span>
                    </div>

                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Notice footer */}
          <div className="flex items-center justify-between gap-2 pt-1 text-[10.5px] text-[var(--muted)]">
            <span>
              {matchingTopics.length} inspirasi materi untuk <b className="text-[var(--ink-soft)]">{mataPelajaran} {tingkat} ({fase})</b>
            </span>
            <span className="hidden sm:inline">Kurikulum Nasional · Permendikdasmen 13/2025</span>
          </div>

        </div>
      )}

    </div>
  );
};
