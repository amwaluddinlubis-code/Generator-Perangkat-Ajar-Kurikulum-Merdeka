/**
 * Viewer + editor inline untuk dokumen Paket Soal terstruktur (rgm-soal-v1) — F1-4 & F1-6.
 *
 * Dipakai DocumentViewer sebagai pengganti area render markdown bila
 * document.content diawali penanda <!--RGM-SOAL-V1-->. Komponen ini MURNI
 * terkendali: state edit (editItems/dirty) dipegang DocumentViewer.
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
import { AlertTriangle, Check, Loader2, Plus, Trash2, X } from 'lucide-react';

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

const INP = 'input input-bordered input-sm w-full';
const TXT = 'textarea textarea-bordered w-full text-sm leading-relaxed';
const LBL = 'label-text font-semibold text-xs block mb-1';

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
    <div className="font-sans p-4 sm:p-6 space-y-4 text-slate-800">
      {/* Bilah aksi simpan — tidak ikut tercetak */}
      <div className="no-print flex flex-wrap items-center gap-2 rounded-2xl border border-base-300 bg-base-200/70 p-3">
        <button
          onClick={onSimpan}
          disabled={saving || !dirty}
          className="btn btn-primary btn-sm"
          title="Validasi lalu simpan perubahan sebagai versi baru (riwayat lama tetap utuh)"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span aria-hidden>💾</span>}
          {saving ? 'Menyimpan...' : 'Simpan sebagai versi baru'}
        </button>
        {dirty ? (
          <span className="badge badge-warning badge-sm">Ada perubahan belum disimpan</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak ada perubahan</span>
        )}
        <span className="text-[11px] opacity-60 w-full sm:w-auto sm:ml-auto">
          Menyimpan membuat versi baru — versi sebelumnya tetap tersimpan di riwayat.
        </span>
      </div>

      {/* Daftar error validasi */}
      {errors.length > 0 && (
        <div role="alert" className="alert alert-error no-print">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Belum bisa disimpan — perbaiki dulu:</p>
            <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* a. Kartu identitas */}
      <section className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="card-title text-base">📋 Identitas Paket Soal</h3>
            {soal.diubahManual && (
              <span className="badge badge-warning badge-sm">✏️ Diubah manual oleh guru</span>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 font-semibold opacity-70">Satuan Pendidikan</dt>
              <dd className="flex-1">{identitas.satuanPendidikan || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 font-semibold opacity-70">Mata Pelajaran</dt>
              <dd className="flex-1">{identitas.mataPelajaran || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 font-semibold opacity-70">Kelas / Fase</dt>
              <dd className="flex-1">
                {identitas.kelas || '—'}
                {identitas.fase ? ` (${identitas.fase})` : ''}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 font-semibold opacity-70">Waktu</dt>
              <dd className="flex-1">{identitas.waktu || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 font-semibold opacity-70">Topik</dt>
              <dd className="flex-1">{identitas.topik || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 font-semibold opacity-70">Guru</dt>
              <dd className="flex-1">{identitas.guru || '—'}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* b. Kartu distribusi soal */}
      <section className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 sm:p-5">
          <h3 className="card-title text-base mb-1">📊 Distribusi Soal</h3>
          <p className="text-xs font-semibold opacity-60 mb-2">Jumlah per bentuk soal</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DAFTAR_BENTUK.map((b) => (
              <span key={b} className="badge badge-lg badge-outline gap-1.5 py-3">
                {LABEL_BENTUK[b]} <b className="tabular-nums">{perBentuk[b]}</b>
              </span>
            ))}
          </div>
          <p className="text-xs font-semibold opacity-60 mb-2">
            Level kognitif <span className="font-normal">(diminta vs aktual)</span>
          </p>
          <div className="space-y-2">
            {dist.map(({ level, diminta, aktual }) => {
              const pct =
                diminta > 0
                  ? Math.min(100, Math.round((aktual / diminta) * 100))
                  : aktual > 0
                    ? 100
                    : 0;
              const ok = diminta > 0 && aktual >= diminta;
              return (
                <div key={level} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="w-32 shrink-0 font-medium">{LABEL_KOGNITIF[level]}</span>
                  <div
                    className="flex-1 h-2.5 rounded-full bg-base-200 overflow-hidden"
                    role="img"
                    aria-label={`${LABEL_KOGNITIF[level]}: aktual ${aktual} dari diminta ${diminta}`}
                  >
                    <div
                      className={`h-full rounded-full ${ok ? 'bg-success' : diminta > 0 ? 'bg-warning' : 'bg-info'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right tabular-nums opacity-80">
                    {aktual} / {diminta}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] opacity-50 mt-2">
            Batang menunjukkan porsi aktual terhadap jumlah yang diminta. Hijau = tercapai.
          </p>
        </div>
      </section>

      {/* c. Tabel kisi-kisi */}
      <section className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 sm:p-5">
          <h3 className="card-title text-base mb-2">🗂️ Kisi-Kisi Soal</h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="table table-sm table-zebra">
              <thead>
                <tr>
                  <th className="w-10">No</th>
                  <th>Indikator</th>
                  <th>Level</th>
                  <th>Bentuk</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{it.nomor}</td>
                    <td className="min-w-48">
                      {it.indikator || <span className="opacity-50 italic">belum diisi</span>}
                    </td>
                    <td className="whitespace-nowrap" title={LABEL_KOGNITIF[it.levelKognitif]}>
                      {it.levelKognitif}
                    </td>
                    <td className="whitespace-nowrap">{LABEL_BENTUK[it.bentuk]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* d. Naskah soal — kartu per butir dengan edit inline */}
      <h3 className="text-base font-bold pt-1">📝 Naskah Soal &amp; Pembahasan</h3>
      {items.length === 0 && (
        <p className="text-sm opacity-60 italic">Belum ada butir soal dalam paket ini.</p>
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
      className="card bg-base-100 border border-base-300 shadow-sm break-inside-avoid"
      aria-label={`Butir soal ${butir.nomor}`}
    >
      <div className="card-body p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-bold text-[15px]">Soal {butir.nomor}</h4>
          <span className="badge badge-primary badge-sm">{LABEL_BENTUK[butir.bentuk]}</span>
          <span className="badge badge-secondary badge-sm" title={LABEL_KOGNITIF[butir.levelKognitif]}>
            {butir.levelKognitif}
          </span>
          <button
            onClick={onHapus}
            className="btn btn-ghost btn-xs text-error ml-auto no-print"
            title="Hapus butir soal ini"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus butir
          </button>
        </div>

        <div>
          <span className={LBL}>Pertanyaan</span>
          <textarea
            value={butir.pertanyaan}
            onChange={(e) => set({ pertanyaan: e.target.value })}
            rows={3}
            className={TXT}
          />
        </div>

        <details className="rounded-xl border border-base-300 px-3 py-2">
          <summary className="cursor-pointer text-sm font-semibold select-none">
            Stimulus (opsional)
          </summary>
          <textarea
            value={butir.stimulus ?? ''}
            onChange={(e) => set({ stimulus: e.target.value.trim() ? e.target.value : undefined })}
            rows={2}
            className={`${TXT} mt-2`}
            placeholder="Teks stimulus / bacaan yang dipakai butir ini…"
          />
        </details>

        {/* — Opsi untuk pg_biasa & pg_kompleks — */}
        {(butir.bentuk === 'pg_biasa' || butir.bentuk === 'pg_kompleks') && (
          <div className="space-y-2">
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
                      title={`Jadikan ${h} sebagai kunci jawaban`}
                      className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isKunci
                          ? 'border-success bg-success text-white'
                          : 'border-base-300 hover:border-primary'
                      }`}
                    >
                      {isKunci && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className="font-bold w-5 shrink-0 text-sm tabular-nums">{i + 1}.</span>
                  )}
                  {butir.bentuk === 'pg_biasa' && (
                    <span className="font-bold w-4 shrink-0 text-sm">{h}.</span>
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
                  />
                  <button
                    onClick={() => set({ opsi: opsi.filter((_, j) => j !== i) })}
                    className="btn btn-ghost btn-xs text-error shrink-0 no-print"
                    title="Hapus opsi ini"
                    aria-label="Hapus opsi"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => set({ opsi: [...opsi, ''] })}
              className="btn btn-outline btn-xs no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              {butir.bentuk === 'pg_biasa' ? 'Tambah opsi' : 'Tambah pernyataan'}
            </button>
          </div>
        )}

        {/* — Pasangan untuk menjodohkan — */}
        {butir.bentuk === 'menjodohkan' && (
          <div className="space-y-2">
            <span className={LBL}>Pasangan kiri ↔ kanan</span>
            {pasangan.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-bold w-5 shrink-0 text-sm tabular-nums">{i + 1}.</span>
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
                <span aria-hidden className="shrink-0 opacity-50 text-sm">
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
                  className="btn btn-ghost btn-xs text-error shrink-0 no-print"
                  title="Hapus pasangan ini"
                  aria-label="Hapus pasangan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => set({ pasangan: [...pasangan, { kiri: '', kanan: '' }] })}
              className="btn btn-outline btn-xs no-print"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah pasangan
            </button>
          </div>
        )}

        {/* — Kunci jawaban (selain pg_biasa yang memakai radio visual) — */}
        {butir.bentuk !== 'pg_biasa' && (
          <div>
            <span className={LBL}>
              Kunci jawaban
              {butir.bentuk === 'pg_kompleks' && (
                <span className="font-normal opacity-60"> (mis. 1-Benar, 2-Salah)</span>
              )}
              {butir.bentuk === 'menjodohkan' && (
                <span className="font-normal opacity-60"> (mis. 1-B, 2-A)</span>
              )}
            </span>
            <input
              value={butir.kunci}
              onChange={(e) => set({ kunci: e.target.value })}
              className={INP}
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
          <div className="space-y-2">
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
                  className="btn btn-ghost btn-xs text-error shrink-0 no-print"
                  title="Hapus kriteria ini"
                  aria-label="Hapus kriteria"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => set({ rubrik: [...rubrik, { skor: 0, deskriptor: '' }] })}
              className="btn btn-outline btn-xs no-print"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah kriteria
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
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className={LBL}>Indikator</span>
            <input
              value={butir.indikator}
              onChange={(e) => set({ indikator: e.target.value })}
              className={INP}
              placeholder="Indikator soal…"
            />
          </div>
          <div>
            <span className={LBL}>Level kognitif</span>
            <select
              value={butir.levelKognitif}
              onChange={(e) =>
                set({ levelKognitif: e.target.value as ButirSoal['levelKognitif'] })
              }
              className="select select-bordered select-sm w-full"
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
