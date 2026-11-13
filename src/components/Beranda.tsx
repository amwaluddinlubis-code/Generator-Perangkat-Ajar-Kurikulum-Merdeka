// Beranda — dashboard ringkas berbasis paket.
import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Plus,
  FileText,
  Layers,
  HelpCircle,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
  Package,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { TeacherUser, DocType, Paket, DokumenPaket } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { apiFetch } from '../utils/api';
import { Maskot } from './Maskot';
import { salamHangat, ajakanAcak, pesanKosong } from '../utils/sapaan';

interface PaketTampil extends Paket {
  progress?: { totalDokumen: number; selesai: number };
}

interface DokumenPaketTampil extends DokumenPaket {
  title?: string;
  topik?: string;
}

interface BerandaProps {
  currentUser: TeacherUser;
  onBukaPaket: (id: string) => void;
  onBuatPaket: () => void;
}

const DOC_ICONS: Record<DocType, LucideIcon> = {
  modul_ajar: FileText,
  rpp: Layers,
  soal_ujian: HelpCircle,
  lkpd: BookOpen,
  kktp_atp: Target,
  prota_promes: Calendar,
  modul_p5: Sparkles,
};

function waktuRelatif(iso?: string): string {
  if (!iso) return '—';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '—';
  const diff = Date.now() - ts;
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return 'baru saja';
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ts));
}

function keTanggal(iso?: string): number {
  if (!iso) return 0;
  const ts = new Date(iso).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

/** Kartu metrik ringkas untuk baris statistik. */
const Metric: React.FC<{
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: LucideIcon;
  accent?: boolean;
}> = ({ label, value, hint, icon: Icon, accent }) => (
  <div className="apple-card p-4">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[12px] font-medium text-[var(--muted)]">{label}</p>
      <span
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
          accent
            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'bg-[var(--surface-2)] text-[var(--muted)]'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <p className="text-[26px] font-semibold tracking-[-0.03em] text-[var(--ink)] mt-1 leading-none">
      {value}
    </p>
    <p className="text-[11.5px] text-[var(--muted)] mt-1.5">{hint}</p>
  </div>
);

export const Beranda: React.FC<BerandaProps> = ({
  currentUser,
  onBukaPaket,
  onBuatPaket,
}) => {
  const [pakets, setPakets] = useState<PaketTampil[]>([]);
  const [dokumenTerbaru, setDokumenTerbaru] = useState<DokumenPaketTampil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let batal = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/pakets?status=aktif');
        if (!res.ok) throw new Error('gagal memuat paket');
        const data = await res.json();
        if (batal) return;
        const items: PaketTampil[] = Array.isArray(data) ? data : (data?.pakets ?? []);
        setPakets(items);

        const teratas = [...items]
          .sort((a, b) => keTanggal(b.dibukaTerakhir) - keTanggal(a.dibukaTerakhir))
          .slice(0, 3);

        const terkumpul: DokumenPaketTampil[] = [];
        for (const p of teratas) {
          try {
            const r = await apiFetch(`/api/pakets/${p.id}/dokumen`);
            if (!r.ok) continue;
            const json = await r.json();
            const list: unknown = Array.isArray(json)
              ? json
              : (json as { dokumen?: unknown }).dokumen ?? [];
            if (Array.isArray(list)) {
              for (const d of list as DokumenPaketTampil[]) {
                if (d && typeof d.id === 'string' && d.docType) {
                  terkumpul.push({ ...d, paketId: d.paketId ?? p.id });
                }
              }
            }
          } catch {
            /* paket yang gagal dilewati */
          }
          if (batal) return;
        }
        terkumpul.sort((a, b) => keTanggal(b.diperbaruiPada) - keTanggal(a.diperbaruiPada));
        setDokumenTerbaru(terkumpul.slice(0, 5));
      } catch {
        /* empty state */
      } finally {
        if (!batal) setLoading(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  const tanggalHariIni = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  const ajakan = useMemo(() => ajakanAcak(), []);

  const lanjutkan = useMemo(
    () =>
      [...pakets]
        .sort((a, b) => keTanggal(b.dibukaTerakhir) - keTanggal(a.dibukaTerakhir))
        .slice(0, 3),
    [pakets]
  );

  const statistik = useMemo(() => {
    const totalPaketAktif = pakets.length;
    let totalDokumen = 0;
    let dokumenSelesai = 0;
    for (const p of pakets) {
      totalDokumen += p.progress?.totalDokumen ?? 7;
      dokumenSelesai += p.progress?.selesai ?? 0;
    }
    const enamBulanLalu = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const semesterIni = dokumenTerbaru.filter(
      (d) => keTanggal(d.diperbaruiPada) >= enamBulanLalu
    ).length;
    return { totalPaketAktif, totalDokumen, dokumenSelesai, semesterIni };
  }, [pakets, dokumenTerbaru]);

  const judulDokumen = (d: DokumenPaketTampil): string =>
    d.title || `${DOC_TYPE_INFO[d.docType]?.label ?? d.docType}${d.topik ? ` — ${d.topik}` : ''}`;

  return (
    <div className="space-y-7">
      {/* ————— Header halaman ————— */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] text-[var(--muted)]">{tanggalHariIni}</p>
          <h1 className="apple-headline mt-1 truncate">{salamHangat(currentUser.name)}</h1>
          <p className="apple-sub mt-1.5 max-w-xl">
            {ajakan} Setiap paket berisi 7 dokumen Kurikulum Merdeka — dari Modul Ajar sampai Modul P5.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <Maskot varian="wisuda" size={64} />
          </div>
          <button type="button" onClick={onBuatPaket} className="btn-apple">
            <Plus className="w-4 h-4" />
            Buat paket baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="apple-card p-4">
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-6 w-1/3 mt-3" />
              <div className="skeleton h-2.5 w-1/2 mt-3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ————— Metrik ————— */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <Metric
              label="Paket aktif"
              value={statistik.totalPaketAktif}
              hint="sedang disusun"
              icon={Package}
              accent
            />
            <Metric
              label="Dokumen selesai"
              value={statistik.dokumenSelesai}
              hint={`dari ${statistik.totalDokumen} target`}
              icon={CheckCircle2}
            />
            <Metric
              label="Final semester ini"
              value={statistik.semesterIni}
              hint="6 bulan terakhir"
              icon={FolderOpen}
            />
            <Metric
              label="Jenis perangkat"
              value="7"
              hint="sesuai Permendikdasmen 13/2025"
              icon={FileText}
            />
          </div>

          {pakets.length === 0 ? (
            <div className="apple-card py-14 px-6 text-center">
              <div className="flex justify-center mb-4">
                <Maskot size={88} />
              </div>
              <h2 className="text-[18px] font-semibold text-[var(--ink)]">{pesanKosong('paket')}</h2>
              <p className="apple-sub mt-1.5 max-w-md mx-auto">
                Pilih topik, mata pelajaran, dan fase — lalu susun 7 dokumennya satu per satu dengan bantuan AI.
              </p>
              <button type="button" onClick={onBuatPaket} className="btn-apple mt-5">
                <Plus className="w-4 h-4" />
                Buat paket pertama
              </button>
            </div>
          ) : (
            <>
              {/* ————— Lanjutkan ————— */}
              <section aria-labelledby="beranda-lanjutkan">
                <div className="flex items-center justify-between mb-3">
                  <h2 id="beranda-lanjutkan" className="text-[15px] font-semibold text-[var(--ink)]">
                    Lanjutkan
                  </h2>
                  <span className="text-[12px] text-[var(--muted)]">{lanjutkan.length} paket terakhir</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lanjutkan.map((p, idx) => {
                    const selesai = p.progress?.selesai ?? 0;
                    const total = p.progress?.totalDokumen ?? 7;
                    const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;
                    return (
                      <div
                        key={p.id}
                        className="apple-card ux-lift ux-stagger p-4 flex flex-col"
                        style={{ '--ux-delay': `${idx * 60}ms` } as React.CSSProperties}
                      >
                        <h3 className="text-[14.5px] font-semibold text-[var(--ink)] line-clamp-2 leading-snug">
                          {p.topik}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="ds-badge">{p.mataPelajaran}</span>
                          <span className="ds-badge">{p.tingkat}</span>
                          <span className="ds-badge">{p.fase}</span>
                        </div>
                        <div className="mt-auto pt-4">
                          <div className="flex items-center justify-between text-[11.5px] text-[var(--muted)] mb-1.5">
                            <span>
                              {selesai}/{total} dokumen
                            </span>
                            <span>{waktuRelatif(p.dibukaTerakhir)}</span>
                          </div>
                          <div
                            className="h-1.5 w-full rounded-full bg-[var(--surface-3)] overflow-hidden"
                            role="progressbar"
                            aria-valuenow={selesai}
                            aria-valuemin={0}
                            aria-valuemax={total}
                            aria-label={`Progres ${selesai} dari ${total} dokumen`}
                          >
                            <div
                              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                              style={{ width: `${persen}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[11.5px] font-medium text-[var(--accent)]">{persen}%</span>
                            <button
                              type="button"
                              onClick={() => onBukaPaket(p.id)}
                              className="btn-apple-secondary !min-h-[32px] !py-1.5 !px-2.5 !text-[12.5px]"
                            >
                              Buka
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ————— Dokumen terbaru ————— */}
              <section aria-labelledby="beranda-dokumen-terbaru">
                <div className="flex items-center justify-between mb-3">
                  <h2 id="beranda-dokumen-terbaru" className="text-[15px] font-semibold text-[var(--ink)]">
                    Dokumen terbaru
                  </h2>
                </div>
                {dokumenTerbaru.length === 0 ? (
                  <div className="apple-card p-4 text-[13px] text-[var(--muted)]">
                    Belum ada dokumen yang diperbarui. Buka sebuah paket untuk mulai menyusun.
                  </div>
                ) : (
                  <ul className="apple-card overflow-hidden divide-y divide-[var(--line)]">
                    {dokumenTerbaru.map((d) => {
                      const Ikon = DOC_ICONS[d.docType] ?? FileText;
                      const label = DOC_TYPE_INFO[d.docType]?.label ?? d.docType;
                      const judul = judulDokumen(d);
                      return (
                        <li
                          key={`${d.paketId ?? ''}-${d.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-md bg-[var(--surface-2)] text-[var(--ink-soft)] flex items-center justify-center shrink-0">
                            <Ikon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                              {judul}
                            </p>
                            {judul !== label && (
                              <p className="text-[11.5px] text-[var(--muted)] truncate">{label}</p>
                            )}
                          </div>
                          <span className="text-[11.5px] text-[var(--muted)] shrink-0">
                            {waktuRelatif(d.diperbaruiPada)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Beranda;
