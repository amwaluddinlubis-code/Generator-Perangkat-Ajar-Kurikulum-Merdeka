// REDESIGN: Beranda baru berbasis paket (Worker B) — rancang ulang "Ruang Guru Merdeka".
// Hero sapaan, "Lanjutkan", "Dokumen terbaru", dan statistik — semuanya DaisyUI.
import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Plus,
  FolderOpen,
  FileText,
  Layers,
  HelpCircle,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TeacherUser, DocType, Paket, DokumenPaket, VersiDokumen } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { apiFetch } from '../utils/api';

// GEL2: duplikasi tipe lokal (tech debt Gelombang 1) dihapus — pakai tipe
// kanonik dari ../types. Respons API menyertakan kolom ringkasan opsional
// (progress / info versi aktif) yang tidak ada di tipe penyimpanan kanonik,
// jadi ditambah via interface turunan yang sempit.
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

// REDESIGN: ikon per jenis dokumen mengikuti DOC_TYPE_INFO dari curriculumData.
const DOC_ICONS: Record<DocType, LucideIcon> = {
  modul_ajar: FileText,
  rpp: Layers,
  soal_ujian: HelpCircle,
  lkpd: BookOpen,
  kktp_atp: Target,
  prota_promes: Calendar,
  modul_p5: Sparkles,
};

// REDESIGN: label waktu relatif berbahasa Indonesia.
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

export const Beranda: React.FC<BerandaProps> = ({
  currentUser,
  onBukaPaket,
  onBuatPaket,
}) => {
  const [pakets, setPakets] = useState<PaketTampil[]>([]);
  const [dokumenTerbaru, setDokumenTerbaru] = useState<DokumenPaketTampil[]>([]);
  const [loading, setLoading] = useState(true);

  // REDESIGN: ambil paket aktif; dokumen terbaru diambil dari 3 paket
  // teratas saja agar tidak membanjiri API dengan puluhan request.
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
            /* REDESIGN: paket individual yang gagal dilewati, lanjut ke berikutnya */
          }
          if (batal) return;
        }
        terkumpul.sort((a, b) => keTanggal(b.diperbaruiPada) - keTanggal(a.diperbaruiPada));
        setDokumenTerbaru(terkumpul.slice(0, 5));
      } catch {
        /* REDESIGN: kegagalan fetch menampilkan empty state, bukan crash */
      } finally {
        if (!batal) setLoading(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  // REDESIGN: sapaan berdasarkan jam + tanggal hari ini (id-ID).
  const { sapaanWaktu, tanggalHariIni, namaDepan } = useMemo(() => {
    const now = new Date();
    const jam = now.getHours();
    const sapaanWaktu =
      jam < 11 ? 'pagi' : jam < 15 ? 'siang' : jam < 18 ? 'sore' : 'malam';
    const tanggalHariIni = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);
    const namaDepan = currentUser.name.trim().split(/\s+/)[0] || currentUser.name;
    return { sapaanWaktu, tanggalHariIni, namaDepan };
  }, [currentUser.name]);

  const lanjutkan = useMemo(
    () =>
      [...pakets]
        .sort((a, b) => keTanggal(b.dibukaTerakhir) - keTanggal(a.dibukaTerakhir))
        .slice(0, 3),
    [pakets]
  );

  // REDESIGN: statistik dihitung dari ringkasan progress kontrak API.
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
    <div className="space-y-6 sm:space-y-8 ux-view-enter">
      {/* REDESIGN: hero sapaan + CTA buat paket */}
      <div className="hero rounded-3xl bg-base-200">
        <div className="hero-content flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full text-left py-8 sm:py-10 px-6 sm:px-10">
          <div className="flex-1 min-w-0">
            <p className="text-sm opacity-70">
              Selamat {sapaanWaktu} · {tanggalHariIni}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              Halo, {namaDepan} 👋
            </h1>
            <p className="text-sm sm:text-base opacity-70 mt-2 max-w-xl">
              Siap menyusun perangkat ajar hari ini? Setiap paket berisi 7 dokumen
              Kurikulum Merdeka — dari Modul Ajar sampai Modul P5.
            </p>
          </div>
          <button
            type="button"
            onClick={onBuatPaket}
            className="btn btn-primary btn-lg shrink-0"
          >
            <Plus className="w-5 h-5" />
            Buat Paket Baru
          </button>
        </div>
      </div>

      {loading ? (
        /* REDESIGN: skeleton saat memuat */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2 mt-2" />
                <div className="skeleton h-2 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : pakets.length === 0 ? (
        /* REDESIGN: empty state — hero dengan CTA */
        <div className="hero rounded-3xl border border-dashed border-base-300 py-12">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Belum ada paket perangkat ajar
              </h2>
              <p className="py-3 text-sm opacity-70">
                Buat paket pertama Anda — pilih topik, mata pelajaran, dan fase,
                lalu susun 7 dokumennya satu per satu dengan bantuan AI.
              </p>
              <button
                type="button"
                onClick={onBuatPaket}
                className="btn btn-primary btn-lg mt-2"
              >
                <Plus className="w-5 h-5" />
                Buat Paket Baru
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* REDESIGN: "Lanjutkan" — 3 paket terakhir dibuka */}
          <section aria-labelledby="beranda-lanjutkan">
            <div className="flex items-center justify-between mb-3">
              <h2 id="beranda-lanjutkan" className="text-lg sm:text-xl font-black tracking-tight">
                Lanjutkan
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lanjutkan.map((p) => {
                const selesai = p.progress?.selesai ?? 0;
                const total = p.progress?.totalDokumen ?? 7;
                return (
                  <div key={p.id} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                    <div className="card-body">
                      <h3 className="card-title text-base line-clamp-2">{p.topik}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="badge badge-outline">{p.mataPelajaran}</span>
                        <span className="badge badge-outline">{p.tingkat}</span>
                        <span className="badge badge-outline">{p.fase}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                          <span>
                            {selesai}/{total} dokumen
                          </span>
                          <span>{waktuRelatif(p.dibukaTerakhir)}</span>
                        </div>
                        <progress
                          className="progress progress-primary w-full"
                          value={selesai}
                          max={total}
                          aria-label={`Progres ${selesai} dari ${total} dokumen`}
                        />
                      </div>
                      <div className="card-actions justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => onBukaPaket(p.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Buka
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* REDESIGN: "Dokumen terbaru" — 5 versi/dokumen terbaru */}
          <section aria-labelledby="beranda-dokumen-terbaru">
            <h2 id="beranda-dokumen-terbaru" className="text-lg sm:text-xl font-black tracking-tight mb-3">
              Dokumen terbaru
            </h2>
            {dokumenTerbaru.length === 0 ? (
              <div className="card bg-base-100 shadow">
                <div className="card-body text-sm opacity-70">
                  Belum ada dokumen yang diperbarui. Buka sebuah paket untuk mulai menyusun.
                </div>
              </div>
            ) : (
              <ul className="card bg-base-100 shadow divide-y divide-base-200">
                {dokumenTerbaru.map((d) => {
                  const Ikon = DOC_ICONS[d.docType] ?? FileText;
                  return (
                    <li key={`${d.paketId ?? ''}-${d.id}`} className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Ikon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{judulDokumen(d)}</p>
                        <p className="text-xs opacity-60 truncate">
                          {DOC_TYPE_INFO[d.docType]?.label ?? d.docType}
                        </p>
                      </div>
                      <span className="text-xs opacity-60 shrink-0">
                        {waktuRelatif(d.diperbaruiPada)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* REDESIGN: statistik paket & dokumen */}
          <section aria-label="Statistik perangkat ajar">
            <div className="stats stats-vertical sm:stats-horizontal shadow w-full bg-base-100">
              <div className="stat">
                <div className="stat-title">Paket aktif</div>
                <div className="stat-value text-primary">{statistik.totalPaketAktif}</div>
                <div className="stat-desc">paket sedang disusun</div>
              </div>
              <div className="stat">
                <div className="stat-title">Dokumen final semester ini</div>
                <div className="stat-value">{statistik.semesterIni}</div>
                <div className="stat-desc">diperbarui 6 bulan terakhir</div>
              </div>
              <div className="stat">
                <div className="stat-title">Total dokumen</div>
                <div className="stat-value">{statistik.dokumenSelesai}</div>
                <div className="stat-desc">dari {statistik.totalDokumen} target dokumen</div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Beranda;
