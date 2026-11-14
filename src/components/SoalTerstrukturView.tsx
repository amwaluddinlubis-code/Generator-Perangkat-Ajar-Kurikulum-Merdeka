/**
 * Viewer + editor inline untuk dokumen Paket Soal terstruktur (rgm-soal-v1) — F1-4 & F1-6.
 *
 * Dipakai DocumentViewer sebagai pengganti area render markdown bila
 * document.content diawali penanda <!--RGM-SOAL-V1-->. Komponen ini MURNI
 * terkendali: state edit (editItems/dirty) dipegang DocumentViewer.
 *
 * Catatan tampilan: komponen ini hidup di dalam `.doc-paper` (kertas putih).
 * Token warna di-reset oleh `.doc-paper` di index.css agar tetap terang dan
 * kontras tinggi saat dicetak, termasuk pada mode gelap.
 */
import {
  DAFTAR_BENTUK,
  DAFTAR_KOGNITIF,
  LABEL_BENTUK,
  LABEL_KOGNITIF,
  ringkasanDistribusiKognitif,
  type BentukSoal,
  type ButirSoal,
  type PaketSoalTerstruktur,
} from '@/shared/soalTerstruktur';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ClipboardList,
  Loader2,
  PencilLine,
  Plus,
  Save,
  Table2,
  Trash2,
  X,
} from 'lucide-react';

interface SoalTerstrukturViewProps {
  soal: PaketSoalTerstruktur;
  /** Butir yang sedang diedit (clone dari soal.items). */
  items: ButirSoal[];
  dirty: boolean;
  saving: boolean;
  /** Daftar error validasi dari validasiPaketSoal(). */
  errors: string[];
  onButirChange: (index: number, butir: ButirSoal) => void;
  onHapusButir: (index: number) => void;
  onSimpan: () => void;
}

const INP = 'apple-input !py-1.5 !text-[12px]';
const TXT = 'apple-input resize-y !text-[12.5px] leading-relaxed';
const LBL = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]';
const CARD = 'rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-4';
const HAPUS_BTN =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] cursor-pointer no-print';
const TAMBAH_BTN =
  'inline-flex items-center gap-1.5 rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] cursor-pointer no-print';

function hurufOpsi(i: number): string {
  return i < 26 ? String.fromCharCode(65 + i) : `O${i + 1}`;
}

export const SoalTerstrukturView: React.FC<SoalTerstrukturViewProps> = ({
  soal,
  items,
  dirty,
  saving,
  errors,
  onButirChange,
  onHapusButir,
  onSimpan,
}) => {
  const { identitas } = soal;
  const dist = ringkasanDistribusiKognitif({ ...soal, items });

  const perBentuk = DAFTAR_BENTUK.reduce((acc, b) => {
    acc[b] = 0;
    return acc;
  }, {} as Record<BentukSoal, number>);
  for (const it of items) {
    if (perBentuk[it.bentuk] !== undefined) perBentuk[it.bentuk] += 1;
  }

  return (
    <div className="space-y-3 font-sans text-[var(--ink)]">
      {/* Bilah aksi simpan — tidak ikut tercetak */}
      <div className="no-print flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2.5">
        <button
          onClick={onSimpan}
          disabled={saving || !dirty}
          className="btn-apple !min-h-[32px] !py-1 !px-3 !text-[12px]"
          title="Validasi lalu simpan perubahan sebagai versi baru (riwayat lama tetap utuh)"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Menyimpan…' : 'Simpan sebagai versi baru'}
        </button>
        {dirty ? (
          <span className="ds-badge ds-badge-warn">Ada perubahan belum disimpan</span>
        ) : (
          <span className="ds-badge">Tidak ada perubahan</span>
        )}
        <span className="w-full text-[10.5px] text-[var(--muted)] sm:ml-auto sm:w-auto">
          Menyimpan membuat versi baru — versi sebelumnya tetap tersimpan di riwayat.
        </span>
      </div>

      {/* Daftar error validasi */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="no-print flex items-start gap-2.5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2.5 text-[var(--danger)]"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold">Belum bisa disimpan — perbaiki dulu:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px]">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* a. Kartu identitas */}
      <section className={CARD}>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
            <ClipboardList className="w-3.5 h-3.5 text-[var(--muted)]" />
            Identitas paket soal
          </h3>
          {soal.diubahManual && (
            <span className="ds-badge ds-badge-warn">
              <PencilLine className="w-3 h-3" />
              Diubah manual oleh guru
            </span>
          )}
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[11.5px] sm:grid-cols-2">
          {[
            ['Satuan pendidikan', identitas.satuanPendidikan],
            ['Mata pelajaran', identitas.mataPelajaran],
            ['Kelas / fase', `${identitas.kelas || '—'}${identitas.fase ? ` (${identitas.fase})` : ''}`],
            ['Waktu', identitas.waktu],
            ['Topik', identitas.topik],
            ['Guru', identitas.guru],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-32 shrink-0 font-medium text-[var(--muted)]">{label}</dt>
              <dd className="min-w-0 flex-1 text-[var(--ink)]">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* b. Kartu distribusi soal */}
      <section className={CARD}>
        <h3 className="mb-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
          <BarChart3 className="w-3.5 h-3.5 text-[var(--muted)]" />
          Distribusi soal
        </h3>
        <p className="mb-2 text-[10.5px] text-[var(--muted)]">Jumlah per bentuk soal</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {DAFTAR_BENTUK.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[11px] text-[var(--ink-soft)]"
            >
              {LABEL_BENTUK[b]} <b className="tabular-nums text-[var(--ink)]">{perBentuk[b]}</b>
            </span>
          ))}
        </div>

        <p className="mb-1.5 text-[10.5px] text-[var(--muted)]">
          Level kognitif <span className="font-normal">(diminta vs aktual)</span>
        </p>
        <div className="space-y-1.5">
          {dist.map(({ level, diminta, aktual }) => {
            const pct =
              diminta > 0
                ? Math.min(100, Math.round((aktual / diminta) * 100))
                : aktual > 0
                  ? 100
                  : 0;
            const ok = diminta > 0 && aktual >= diminta;
            return (
              <div key={level} className="flex items-center gap-2 text-[11.5px]">
                <span className="w-32 shrink-0 font-medium text-[var(--ink-soft)]">
                  {LABEL_KOGNITIF[level]}
                </span>
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]"
                  role="img"
                  aria-label={`${LABEL_KOGNITIF[level]}: aktual ${aktual} dari diminta ${diminta}`}
                >
                  <div
                    className={`h-full rounded-full ${
                      ok
                        ? 'bg-[var(--ok)]'
                        : diminta > 0
                          ? 'bg-[var(--warn)]'
                          : 'bg-[var(--accent)]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right tabular-nums text-[var(--ink-soft)]">
                  {aktual} / {diminta}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10.5px] text-[var(--muted)]">
          Batang menunjukkan porsi aktual terhadap jumlah yang diminta. Hijau = tercapai.
        </p>
      </section>

      {/* c. Tabel kisi-kisi */}
      <section className={CARD}>
        <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
          <Table2 className="w-3.5 h-3.5 text-[var(--muted)]" />
          Kisi-kisi soal
        </h3>
        <div className="-mx-3.5 overflow-x-auto px-3.5 sm:mx-0 sm:px-0">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr className="border-b border-[var(--line-strong)] text-left text-[var(--muted)]">
                <th className="w-10 py-1.5 pr-2 font-medium">No</th>
                <th className="py-1.5 pr-2 font-medium">Indikator</th>
                <th className="py-1.5 pr-2 font-medium">Level</th>
                <th className="py-1.5 font-medium">Bentuk</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--line)] align-top even:bg-[var(--surface-2)]"
                >
                  <td className="py-1.5 pr-2 font-semibold tabular-nums">{it.nomor}</td>
                  <td className="min-w-48 py-1.5 pr-2 text-[var(--ink-soft)]">
                    {it.indikator || (
                      <span className="italic text-[var(--muted)]">belum diisi</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-2" title={LABEL_KOGNITIF[it.levelKognitif]}>
                    {it.levelKognitif}
                  </td>
                  <td className="whitespace-nowrap py-1.5 text-[var(--ink-soft)]">
                    {LABEL_BENTUK[it.bentuk]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* d. Naskah soal — kartu per butir dengan edit inline */}
      <h3 className="flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-[var(--ink)]">
        <PencilLine className="w-3.5 h-3.5 text-[var(--muted)]" />
        Naskah soal &amp; pembahasan
      </h3>
      {items.length === 0 && (
        <p className="text-[11.5px] italic text-[var(--muted)]">Belum ada butir soal dalam paket ini.</p>
      )}
      {items.map((butir, i) => (
        <ButirCard
          key={i}
          butir={butir}
          onChange={(b) => onButirChange(i, b)}
          onHapus={() => onHapusButir(i)}
        />
      ))}
    </div>
  );
};

/* ————————————————— Kartu edit inline per butir soal ————————————————— */

interface ButirCardProps {
  butir: ButirSoal;
  onChange: (b: ButirSoal) => void;
  onHapus: () => void;
}

const ButirCard: React.FC<ButirCardProps> = ({ butir, onChange, onHapus }) => {
  const set = (patch: Partial<ButirSoal>) => onChange({ ...butir, ...patch });
  const opsi = butir.opsi ?? [];
  const pasangan = butir.pasangan ?? [];
  const rubrik = butir.rubrik ?? [];

  const kunciPg = butir.kunci.trim().toUpperCase();

  return (
    <section
      className="break-inside-avoid rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-4"
      aria-label={`Butir soal ${butir.nomor}`}
    >
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="text-[12.5px] font-semibold text-[var(--ink)]">Soal {butir.nomor}</h4>
          <span className="ds-badge ds-badge-accent">{LABEL_BENTUK[butir.bentuk]}</span>
          <span className="ds-badge" title={LABEL_KOGNITIF[butir.levelKognitif]}>
            {butir.levelKognitif}
          </span>
          <button
            onClick={onHapus}
            className="no-print ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] cursor-pointer"
            title="Hapus butir soal ini"
          >
            <Trash2 className="w-3 h-3" /> Hapus butir
          </button>
        </div>

        <div>
          <span className={LBL}>Pertanyaan</span>
          <textarea
            value={butir.pertanyaan}
            onChange={(e) => set({ pertanyaan: e.target.value })}
            rows={3}
            className={TXT}
            aria-label={`Pertanyaan butir ${butir.nomor}`}
          />
        </div>

        <details className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2">
          <summary className="cursor-pointer select-none text-[11.5px] font-medium text-[var(--ink-soft)]">
            Stimulus (opsional)
          </summary>
          <textarea
            value={butir.stimulus ?? ''}
            onChange={(e) => set({ stimulus: e.target.value.trim() ? e.target.value : undefined })}
            rows={2}
            className={`${TXT} mt-2`}
            placeholder="Teks stimulus / bacaan yang dipakai butir ini…"
            aria-label={`Stimulus butir ${butir.nomor}`}
          />
        </details>

        {/* — Opsi untuk pg_biasa & pg_kompleks — */}
        {(butir.bentuk === 'pg_biasa' || butir.bentuk === 'pg_kompleks') && (
          <div className="space-y-1.5">
            <span className={LBL}>
              {butir.bentuk === 'pg_biasa'
                ? 'Opsi jawaban — klik lingkaran untuk menetapkan kunci'
                : 'Daftar pernyataan'}
            </span>
            {opsi.map((o, i) => {
              const h = hurufOpsi(i);
              const isKunci = butir.bentuk === 'pg_biasa' && kunciPg === h;
              return (
                <div key={i} className="flex items-center gap-2">
                  {butir.bentuk === 'pg_biasa' ? (
                    <button
                      type="button"
                      onClick={() => set({ kunci: h })}
                      aria-pressed={isKunci}
                      aria-label={`Jadikan ${h} sebagai kunci jawaban`}
                      title={`Jadikan ${h} sebagai kunci jawaban`}
                      className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${
                        isKunci
                          ? 'border-[var(--ok)] bg-[var(--ok)] text-white'
                          : 'border-[var(--line-strong)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {isKunci && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className="w-5 shrink-0 text-[11.5px] font-semibold tabular-nums text-[var(--muted)]">
                      {i + 1}.
                    </span>
                  )}
                  {butir.bentuk === 'pg_biasa' && (
                    <span className="w-4 shrink-0 text-[11.5px] font-semibold text-[var(--ink-soft)]">
                      {h}.
                    </span>
                  )}
                  <input
                    value={o}
                    onChange={(e) =>
                      set({ opsi: opsi.map((x, j) => (j === i ? e.target.value : x)) })
                    }
                    className={INP}
                    placeholder={
                      butir.bentuk === 'pg_biasa' ? `Teks opsi ${h}…` : `Pernyataan ${i + 1}…`
                    }
                    aria-label={
                      butir.bentuk === 'pg_biasa' ? `Teks opsi ${h}` : `Pernyataan ${i + 1}`
                    }
                  />
                  <button
                    onClick={() => set({ opsi: opsi.filter((_, j) => j !== i) })}
                    className={HAPUS_BTN}
                    title="Hapus opsi ini"
                    aria-label="Hapus opsi"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <button onClick={() => set({ opsi: [...opsi, ''] })} className={TAMBAH_BTN}>
              <Plus className="w-3 h-3" />
              {butir.bentuk === 'pg_biasa' ? 'Tambah opsi' : 'Tambah pernyataan'}
            </button>
          </div>
        )}

        {/* — Pasangan untuk menjodohkan — */}
        {butir.bentuk === 'menjodohkan' && (
          <div className="space-y-1.5">
            <span className={LBL}>Pasangan kiri ↔ kanan</span>
            {pasangan.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-[11.5px] font-semibold tabular-nums text-[var(--muted)]">
                  {i + 1}.
                </span>
                <input
                  value={p.kiri}
                  onChange={(e) =>
                    set({
                      pasangan: pasangan.map((x, j) =>
                        j === i ? { ...x, kiri: e.target.value } : x
                      ),
                    })
                  }
                  className={INP}
                  placeholder="Kolom kiri…"
                  aria-label={`Pasangan ${i + 1} kiri`}
                />
                <span aria-hidden className="shrink-0 text-[12px] text-[var(--muted)]">
                  ↔
                </span>
                <input
                  value={p.kanan}
                  onChange={(e) =>
                    set({
                      pasangan: pasangan.map((x, j) =>
                        j === i ? { ...x, kanan: e.target.value } : x
                      ),
                    })
                  }
                  className={INP}
                  placeholder="Kolom kanan…"
                  aria-label={`Pasangan ${i + 1} kanan`}
                />
                <button
                  onClick={() => set({ pasangan: pasangan.filter((_, j) => j !== i) })}
                  className={HAPUS_BTN}
                  title="Hapus pasangan ini"
                  aria-label="Hapus pasangan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => set({ pasangan: [...pasangan, { kiri: '', kanan: '' }] })}
              className={TAMBAH_BTN}
            >
              <Plus className="w-3 h-3" /> Tambah pasangan
            </button>
          </div>
        )}

        {/* — Kunci jawaban (selain pg_biasa yang memakai radio visual) — */}
        {butir.bentuk !== 'pg_biasa' && (
          <div>
            <span className={LBL}>
              Kunci jawaban
              {butir.bentuk === 'pg_kompleks' && (
                <span className="font-normal normal-case tracking-normal text-[var(--muted)]">
                  {' '}(mis. 1-Benar, 2-Salah)
                </span>
              )}
              {butir.bentuk === 'menjodohkan' && (
                <span className="font-normal normal-case tracking-normal text-[var(--muted)]">
                  {' '}(mis. 1-B, 2-A)
                </span>
              )}
            </span>
            <input
              value={butir.kunci}
              onChange={(e) => set({ kunci: e.target.value })}
              className={INP}
              aria-label={`Kunci jawaban butir ${butir.nomor}`}
              placeholder={
                butir.bentuk === 'uraian'
                  ? 'Jawaban model…'
                  : butir.bentuk === 'isian'
                    ? 'Teks jawaban yang benar…'
                    : 'Kunci jawaban…'
              }
            />
          </div>
        )}

        {/* — Rubrik untuk uraian — */}
        {butir.bentuk === 'uraian' && (
          <div className="space-y-1.5">
            <span className={LBL}>Rubrik penskoran</span>
            {rubrik.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={r.skor}
                  onChange={(e) =>
                    set({
                      rubrik: rubrik.map((x, j) =>
                        j === i ? { ...x, skor: Number(e.target.value) || 0 } : x
                      ),
                    })
                  }
                  className={`${INP} !w-20 shrink-0`}
                  aria-label={`Skor kriteria ${i + 1}`}
                />
                <input
                  value={r.deskriptor}
                  onChange={(e) =>
                    set({
                      rubrik: rubrik.map((x, j) =>
                        j === i ? { ...x, deskriptor: e.target.value } : x
                      ),
                    })
                  }
                  className={INP}
                  placeholder="Deskriptor kriteria…"
                  aria-label={`Deskriptor kriteria ${i + 1}`}
                />
                <button
                  onClick={() => set({ rubrik: rubrik.filter((_, j) => j !== i) })}
                  className={HAPUS_BTN}
                  title="Hapus kriteria ini"
                  aria-label="Hapus kriteria"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => set({ rubrik: [...rubrik, { skor: 0, deskriptor: '' }] })}
              className={TAMBAH_BTN}
            >
              <Plus className="w-3 h-3" /> Tambah kriteria
            </button>
          </div>
        )}

        <div>
          <span className={LBL}>Pembahasan</span>
          <textarea
            value={butir.pembahasan}
            onChange={(e) => set({ pembahasan: e.target.value })}
            rows={2}
            className={TXT}
            placeholder="Mengapa kunci itu benar… (1–2 kalimat)"
            aria-label={`Pembahasan butir ${butir.nomor}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className={LBL}>Indikator</span>
            <input
              value={butir.indikator}
              onChange={(e) => set({ indikator: e.target.value })}
              className={INP}
              placeholder="Indikator soal…"
              aria-label={`Indikator butir ${butir.nomor}`}
            />
          </div>
          <div>
            <span className={LBL}>Level kognitif</span>
            <select
              value={butir.levelKognitif}
              onChange={(e) =>
                set({ levelKognitif: e.target.value as ButirSoal['levelKognitif'] })
              }
              className={INP}
              aria-label={`Level kognitif butir ${butir.nomor}`}
            >
              {DAFTAR_KOGNITIF.map((lv) => (
                <option key={lv} value={lv}>
                  {LABEL_KOGNITIF[lv]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
