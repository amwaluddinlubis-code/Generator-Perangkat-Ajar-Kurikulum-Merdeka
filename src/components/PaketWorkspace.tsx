// REDESIGN: Halaman workspace satu paket perangkat ajar — pipeline 7 dokumen,
// REDESIGN: timeline aktivitas, tab Dokumen/Versi, aksi generate/tandai-final/arsip.
// REDESIGN: Dikerjakan sesuai KONTRAK API (Worker A, paralel); endpoint bundle belum ada di Gelombang 1.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// GEL2: hapus interface Paket lokal (tech debt) — pakai tipe kanonik dari '../types'.
import { DocType, GeneratorParams, Paket, TeacherUser } from '../types';
import { GeneratorForm } from './GeneratorForm';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { apiFetch } from '../utils/api';
import {
  ArrowLeft,
  FileText,
  Layers,
  HelpCircle,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
  Download,
  Archive,
  ArchiveRestore,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  X,
  Loader2,
  History,
  PackageOpen,
  AlertTriangle,
  FileDown,
  Clock,
} from 'lucide-react';

// REDESIGN: tipe lokal VersiDokumen/DokumenPaket (view-model workspace);
// REDESIGN: dipetakan dari respons API server di muatVersi & selesaiGenerate.
export type StatusDokumen = 'belum' | 'draf' | 'final';

export interface VersiDokumen {
  id: string;
  docType: DocType;
  /** nomor versi: 1, 2, 3 … */
  nomor: number;
  title: string;
  content: string;
  status: 'draf' | 'final';
  dibuatPada: string; // ISO
}

export interface DokumenPaket {
  docType: DocType;
  status: StatusDokumen;
  /** nomor versi aktif; 0 = belum ada versi */
  versiAktif: number;
}

interface PaketWorkspaceProps {
  paketId: string;
  onKembali: () => void;
  currentUser?: TeacherUser | null;
}

// REDESIGN: urutan pipeline 7 jenis dokumen sesuai kontrak DocType
const URUTAN_DOC: DocType[] = [
  'modul_ajar',
  'rpp',
  'soal_ujian',
  'lkpd',
  'kktp_atp',
  'prota_promes',
  'modul_p5',
];

// REDESIGN: DOC_TYPE_INFO menyimpan nama ikon sebagai string — petakan ke komponen lucide
const PETA_IKON: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Layers,
  HelpCircle,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
};

// REDESIGN: format waktu relatif Bahasa Indonesia, mis. "2 jam lalu"
function waktuRelatif(iso: string): string {
  const lalu = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(lalu)) return '';
  const menit = Math.floor(lalu / 60000);
  if (menit < 1) return 'baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  const bulan = Math.floor(hari / 30);
  if (bulan < 12) return `${bulan} bulan lalu`;
  return `${Math.floor(bulan / 12)} tahun lalu`;
}

type ModalKind = 'generate' | 'lihat' | 'arsip' | null;

interface ToastState {
  message: string;
  kind: 'success' | 'error' | 'info';
}

export const PaketWorkspace: React.FC<PaketWorkspaceProps> = ({ paketId, onKembali, currentUser }) => {
  // REDESIGN: state data paket + dokumen
  const [paket, setPaket] = useState<Paket | null>(null);
  const [dokumen, setDokumen] = useState<DokumenPaket[]>([]);
  const [memuat, setMemuat] = useState<boolean>(true);
  const [galat, setGalat] = useState<string | null>(null);

  // REDESIGN: cache versi per jenis dokumen (diisi malas/lazy saat dibutuhkan)
  const [versiCache, setVersiCache] = useState<Record<string, VersiDokumen[]>>({});
  const [memuatVersi, setMemuatVersi] = useState<boolean>(false);

  // REDESIGN: tab Dokumen | Versi
  const [tab, setTab] = useState<'dokumen' | 'versi'>('dokumen');

  // REDESIGN: modal kontekstual
  const [modal, setModal] = useState<ModalKind>(null);
  const [modalDoc, setModalDoc] = useState<DocType | null>(null);
  const [judulVersi, setJudulVersi] = useState<string>('');
  const [isiVersi, setIsiVersi] = useState<string>('');
  const [menyimpan, setMenyimpan] = useState<boolean>(false);
  const [aksiDoc, setAksiDoc] = useState<DocType | null>(null); // loading per tombol aksi
  // GEL2: loading unduh bundle .docx
  const [mengunduhBundle, setMengunduhBundle] = useState<boolean>(false);
  // GEL2: profil user & status generate untuk GeneratorForm (paketMode)
  const [pengguna, setPengguna] = useState<TeacherUser | null>(currentUser || null);
  const [sedangGenerate, setSedangGenerate] = useState<boolean>(false);

  // REDESIGN: toast lokal mengikuti pola DocumentRepository
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((message: string, kind: ToastState['kind'] = 'success') => {
    setToast({ message, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  // REDESIGN: normalisasi respons GET /api/pakets/:id — terima bentuk
  // REDESIGN: { ...paket, dokumen: [...] } maupun { paket, dokumen }
  const muatPaket = useCallback(async () => {
    setMemuat(true);
    setGalat(null);
    try {
      const res = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}`);
      if (!res.ok) throw new Error(`Server menjawab ${res.status}`);
      const data = await res.json();
      const p: Paket = data.paket ?? data;
      const daftar: DokumenPaket[] = data.dokumen ?? data.paket?.dokumen ?? [];
      if (!p || !p.id) throw new Error('Data paket tidak lengkap dari server');
      setPaket(p);
      // REDESIGN: pastikan selalu ada 7 entri (yang belum ada → status "belum")
      const peta = new Map(daftar.map((d) => [d.docType, d]));
      setDokumen(
        URUTAN_DOC.map(
          (dt) => peta.get(dt) ?? { docType: dt, status: 'belum', versiAktif: 0 }
        )
      );
    } catch (err) {
      setGalat(err instanceof Error ? err.message : 'Gagal memuat paket');
    } finally {
      setMemuat(false);
    }
  }, [paketId]);

  useEffect(() => {
    muatPaket();
  }, [muatPaket]);

  // GEL2: server mengembalikan { success, versiAktif, status, versis: [...] }
  // GEL2: (bentuk VersiDokumen server memakai nomorVersi/dokumenPaketId) —
  // GEL2: petakan ke view-model lokal. Status final adalah milik DokumenPaket,
  // GEL2: jadi hanya versi teratas yang mewarisi status envelope.
  const muatVersi = useCallback(
    async (docType: DocType): Promise<VersiDokumen[]> => {
      if (versiCache[docType]) return versiCache[docType];
      const res = await apiFetch(
        `/api/pakets/${encodeURIComponent(paketId)}/dokumen/${docType}/versi`
      );
      if (!res.ok) throw new Error(`Gagal memuat versi (${res.status})`);
      const data = await res.json();
      const mentah: Array<{
        id: string;
        nomorVersi: number;
        title: string;
        content: string;
        dibuatPada: string;
      }> = data.versis ?? (Array.isArray(data) ? data : []);
      const urut: VersiDokumen[] = mentah
        .slice()
        .sort((a, b) => b.nomorVersi - a.nomorVersi)
        .map((v, i) => ({
          id: v.id,
          docType,
          nomor: v.nomorVersi,
          title: v.title,
          content: v.content,
          status: (i === 0 && data.status === 'final' ? 'final' : 'draf') as 'draf' | 'final',
          dibuatPada: v.dibuatPada,
        }));
      setVersiCache((prev) => ({ ...prev, [docType]: urut }));
      return urut;
    },
    [paketId, versiCache]
  );

  // REDESIGN: saat tab "Versi" dibuka, muat versi semua dokumen sekaligus
  const bukaTabVersi = useCallback(async () => {
    setTab('versi');
    setMemuatVersi(true);
    try {
      await Promise.all(
        URUTAN_DOC.map((dt) =>
          muatVersi(dt).catch(() => [] as VersiDokumen[])
        )
      );
    } finally {
      setMemuatVersi(false);
    }
  }, [muatVersi]);

  const perbaruiDokumen = useCallback((docType: DocType, patch: Partial<DokumenPaket>) => {
    setDokumen((prev) =>
      prev.map((d) => (d.docType === docType ? { ...d, ...patch } : d))
    );
  }, []);

  // GEL2: modal generate kini merender GeneratorForm (paketMode) — AI asli,
  // GEL2: hasil tersimpan sebagai versi baru oleh GeneratorForm, lalu onSelesai
  // GEL2: dipanggil untuk menyegarkan state workspace.
  const bukaModalGenerate = (docType: DocType) => {
    setModalDoc(docType);
    setModal('generate');
    // GEL2: ambil profil user secara malas (lazy) untuk prop currentUser GeneratorForm.
    if (!pengguna) {
      apiFetch('/api/users/current')
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((data) => {
          if (data?.user) setPengguna(data.user as TeacherUser);
        })
        .catch((err) =>
          showToast(err instanceof Error ? err.message : 'Gagal memuat profil', 'error')
        );
    }
  };

  // GEL2: handler onGenerate minimal untuk GeneratorForm. Dalam paketMode,
  // GEL2: GeneratorForm TIDAK memanggil onGenerate (ia memakai handleSubmitPaket
  // GEL2: internal: /api/generate → simpan versi → onSelesai). Handler ini hanya
  // GEL2: cadangan bila dipanggil di luar paketMode.
  const generateLokal = useCallback(
    async (params: GeneratorParams): Promise<void> => {
      setSedangGenerate(true);
      try {
        const res = await apiFetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal menghasilkan perangkat ajar');
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Gagal menghasilkan perangkat ajar', 'error');
      } finally {
        setSedangGenerate(false);
      }
    },
    [showToast]
  );

  // GEL2: dipanggil GeneratorForm (paketMode.onSelesai) setelah versi baru tersimpan —
  // GEL2: tutup modal, segarkan daftar dokumen dari server, buang cache versi docType tsb.
  // GEL2: (toast sukses sudah ditampilkan GeneratorForm sendiri).
  const selesaiGenerate = useCallback(
    async (docType: DocType) => {
      setModal(null);
      setModalDoc(null);
      setVersiCache((prev) => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
      try {
        const res = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/dokumen`);
        if (!res.ok) throw new Error(`Server menjawab ${res.status}`);
        const data = await res.json();
        const daftar: DokumenPaket[] = (data.dokumen ?? []).map(
          (d: { docType: DocType; status: StatusDokumen; versiAktif: number }) => ({
            docType: d.docType,
            status: d.status,
            versiAktif: d.versiAktif,
          })
        );
        const peta = new Map(daftar.map((d) => [d.docType, d]));
        setDokumen(
          URUTAN_DOC.map(
            (dt) => peta.get(dt) ?? { docType: dt, status: 'belum' as StatusDokumen, versiAktif: 0 }
          )
        );
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Gagal menyegarkan dokumen', 'error');
      }
    },
    [paketId, showToast]
  );

  // REDESIGN: buka isi versi aktif di modal baca
  const bukaModalLihat = async (docType: DocType) => {
    setModalDoc(docType);
    setModal('lihat');
    try {
      const daftar = await muatVersi(docType);
      const aktif = daftar[0];
      setJudulVersi(aktif ? aktif.title : DOC_TYPE_INFO[docType].label);
      setIsiVersi(aktif ? aktif.content : '');
      if (!aktif) showToast('Belum ada versi untuk dokumen ini', 'info');
    } catch (err) {
      setJudulVersi(DOC_TYPE_INFO[docType].label);
      setIsiVersi('');
      showToast(err instanceof Error ? err.message : 'Gagal memuat versi', 'error');
    }
  };

  const tandaiFinal = async (docType: DocType) => {
    setAksiDoc(docType);
    try {
      const res = await apiFetch(
        `/api/pakets/${encodeURIComponent(paketId)}/dokumen/${docType}/final`,
        { method: 'PATCH' }
      );
      if (!res.ok) throw new Error(`Server menjawab ${res.status}`);
      perbaruiDokumen(docType, { status: 'final' });
      // REDESIGN: segarkan cache versi agar status final tercermin
      setVersiCache((prev) => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
      showToast(`${DOC_TYPE_INFO[docType].label} ditandai final`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menandai final', 'error');
    } finally {
      setAksiDoc(null);
    }
  };

  // REDESIGN: Wave 1 — unduh per dokumen sebagai .md client-side (tanpa docx)
  const unduhDokumen = async (docType: DocType) => {
    try {
      const daftar = await muatVersi(docType);
      const aktif = daftar[0];
      if (!aktif) {
        showToast('Belum ada versi untuk diunduh', 'info');
        return;
      }
      const nama = `${aktif.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || docType}-v${aktif.nomor}.md`;
      const blob = new Blob([`# ${aktif.title}\n\n${aktif.content}`], {
        type: 'text/markdown;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nama;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Dokumen diunduh sebagai .md', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengunduh', 'error');
    }
  };

  // GEL2: unduh bundle .docx dari GET /api/pakets/:id/bundle (server merakit satu .docx).
  const unduhBundle = async () => {
    if (mengunduhBundle) return;
    setMengunduhBundle(true);
    try {
      const res = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/bundle`);
      if (!res.ok) {
        let pesan = `Server menjawab ${res.status}`;
        try {
          const data = await res.json();
          if (data?.message) pesan = data.message;
        } catch {
          /* abaikan — pakai pesan default */
        }
        throw new Error(pesan);
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const cocok = cd.match(/filename="([^"]+)"/);
      const nama = cocok?.[1] || `bundle-${paketId}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nama;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Bundle .docx berhasil diunduh', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengunduh bundle', 'error');
    } finally {
      setMengunduhBundle(false);
    }
  };

  // GEL2: arsipkan memanggil POST /api/pakets/:id/arsip — memakai status kanonik dari '../types'.
  const arsipkan = async () => {
    if (!paket) return;
    const akanDiarsipkan = paket.status !== 'arsip';
    setMenyimpan(true);
    try {
      const res = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/arsip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arsip: akanDiarsipkan }),
      });
      if (!res.ok) throw new Error(`Server menjawab ${res.status}`);
      setPaket({ ...paket, status: akanDiarsipkan ? 'arsip' : 'aktif' });
      setModal(null);
      showToast(akanDiarsipkan ? 'Paket diarsipkan' : 'Paket dikeluarkan dari arsip', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status arsip', 'error');
    } finally {
      setMenyimpan(false);
    }
  };

  // REDESIGN: semua versi dari cache untuk tab "Versi"
  const semuaVersi = useMemo(() => {
    const hasil: { docType: DocType; versi: VersiDokumen }[] = [];
    for (const dt of URUTAN_DOC) {
      for (const v of versiCache[dt] ?? []) hasil.push({ docType: dt, versi: v });
    }
    return hasil.sort(
      (a, b) => new Date(b.versi.dibuatPada).getTime() - new Date(a.versi.dibuatPada).getTime()
    );
  }, [versiCache]);

  // REDESIGN: timeline — gabung event versi (dibuatPada) + penandaan final; 10 terbaru
  const timeline = useMemo(() => {
    const events: { id: string; waktu: string; judul: string; deskripsi: string; final: boolean }[] = [];
    for (const dt of URUTAN_DOC) {
      for (const v of versiCache[dt] ?? []) {
        events.push({
          id: `buat-${v.id}`,
          waktu: v.dibuatPada,
          judul: `${DOC_TYPE_INFO[dt].label} v${v.nomor} dibuat`,
          deskripsi: v.title,
          final: false,
        });
        if (v.status === 'final') {
          events.push({
            id: `final-${v.id}`,
            waktu: v.dibuatPada,
            judul: `${DOC_TYPE_INFO[dt].label} v${v.nomor} ditandai final`,
            deskripsi: v.title,
            final: true,
          });
        }
      }
    }
    return events
      .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime())
      .slice(0, 10);
  }, [versiCache]);

  const badgeStatus = (status: StatusDokumen): string => {
    if (status === 'final') return 'badge-success';
    if (status === 'draf') return 'badge-warning';
    return 'badge-neutral';
  };

  const labelStatus = (status: StatusDokumen): string => {
    if (status === 'final') return 'Final';
    if (status === 'draf') return 'Draf';
    return 'Belum dibuat';
  };

  // REDESIGN: loading awal — skeleton
  if (memuat) {
    return (
      <div className="p-4 md:p-6 space-y-4" aria-busy="true" aria-label="Memuat workspace paket">
        <div className="skeleton h-10 w-2/3" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {URUTAN_DOC.map((dt) => (
            <div key={dt} className="skeleton h-44" />
          ))}
        </div>
      </div>
    );
  }

  // REDESIGN: error state ramah dengan tombol coba lagi
  if (galat || !paket) {
    return (
      <div className="p-4 md:p-6 flex justify-center">
        <div className="card bg-base-100 shadow max-w-md w-full">
          <div className="card-body items-center text-center">
            <AlertTriangle className="w-10 h-10 text-warning" />
            <h2 className="card-title">Paket tidak dapat dimuat</h2>
            <p className="text-sm opacity-70">
              {galat ?? 'Data paket tidak ditemukan.'} Periksa koneksi lalu coba lagi.
            </p>
            <div className="card-actions mt-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={muatPaket}>
                Coba lagi
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onKembali}>
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const infoModal = modalDoc ? DOC_TYPE_INFO[modalDoc] : null;
  const IkonModal = modalDoc ? PETA_IKON[infoModal?.icon ?? 'FileText'] ?? FileText : FileText;
  // GEL2: status arsip memakai field kanonik dari '../types'.
  const paketDiarsip = paket.status === 'arsip';

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* REDESIGN: header workspace */}
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          className="btn btn-ghost btn-sm mt-1"
          onClick={onKembali}
          aria-label="Kembali ke daftar paket"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex-1 min-w-52">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <PackageOpen className="w-6 h-6 shrink-0 text-primary" />
            {paket.topik}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge badge-outline">{paket.jenjang}</span>
            <span className="badge badge-outline">{paket.fase}</span>
            <span className="badge badge-outline">{paket.tingkat}</span>
            <span className="badge badge-outline">{paket.mataPelajaran}</span>
            {paketDiarsip && <span className="badge badge-neutral">Diarsipkan</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={unduhBundle}
            disabled={mengunduhBundle}
          >
            {mengunduhBundle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Unduh Bundle
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setModal('arsip')}
          >
            {paketDiarsip ? (
              <>
                <ArchiveRestore className="w-4 h-4" /> Keluarkan dari Arsip
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" /> Arsipkan
              </>
            )}
          </button>
        </div>
      </div>

      {/* REDESIGN: tab Dokumen | Versi */}
      <div role="tablist" className="tabs tabs-boxed w-fit">
        <button
          type="button"
          role="tab"
          className={`tab ${tab === 'dokumen' ? 'tab-active' : ''}`}
          onClick={() => setTab('dokumen')}
        >
          Dokumen
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${tab === 'versi' ? 'tab-active' : ''}`}
          onClick={bukaTabVersi}
        >
          Versi
        </button>
      </div>

      {tab === 'dokumen' && (
        <>
          {/* REDESIGN: pipeline 7 kartu dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {dokumen.map((d) => {
              const info = DOC_TYPE_INFO[d.docType];
              const Ikon = PETA_IKON[info.icon] ?? FileText;
              const adaVersi = d.versiAktif > 0;
              const sibuk = aksiDoc === d.docType;
              return (
                <div key={d.docType} className="card bg-base-100 shadow-sm border border-base-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Ikon className="w-5 h-5" />
                        </span>
                        <h2 className="font-semibold text-sm leading-tight">{info.label}</h2>
                      </div>
                      <span className={`badge ${badgeStatus(d.status)} badge-sm shrink-0`}>
                        {labelStatus(d.status)}
                      </span>
                    </div>
                    <p className="text-xs opacity-60 line-clamp-2 mt-1">{info.desc}</p>
                    {adaVersi && (
                      <p className="text-xs font-medium mt-1">v{d.versiAktif}</p>
                    )}
                    <div className="card-actions flex-wrap gap-2 mt-3">
                      {(!adaVersi || d.status === 'draf') && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => bukaModalGenerate(d.docType)}
                        >
                          <Plus className="w-4 h-4" />
                          {adaVersi ? 'Versi baru' : 'Generate'}
                        </button>
                      )}
                      {adaVersi && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => bukaModalLihat(d.docType)}
                        >
                          <Eye className="w-4 h-4" /> Buka
                        </button>
                      )}
                      {d.status === 'draf' && (
                        <button
                          type="button"
                          className="btn btn-success btn-outline btn-sm"
                          disabled={sibuk}
                          onClick={() => tandaiFinal(d.docType)}
                        >
                          {sibuk ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Tandai Final
                        </button>
                      )}
                      {adaVersi && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => unduhDokumen(d.docType)}
                          aria-label={`Unduh ${info.label}`}
                          title="Unduh sebagai .md"
                        >
                          <FileDown className="w-4 h-4" /> Unduh
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* REDESIGN: timeline aktivitas vertikal */}
          <section aria-label="Aktivitas terbaru">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <History className="w-5 h-5" /> Aktivitas Terbaru
            </h2>
            {timeline.length === 0 ? (
              <div className="alert">
                <Info className="w-5 h-5 shrink-0" />
                <span className="text-sm">
                  Belum ada aktivitas. Buat versi pertama lewat tombol Generate di salah satu kartu dokumen.
                </span>
              </div>
            ) : (
              <ul className="timeline timeline-vertical">
                {timeline.map((e, i) => (
                  <li key={e.id}>
                    {i > 0 && <hr />}
                    <div className="timeline-start text-xs opacity-60 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      {waktuRelatif(e.waktu)}
                    </div>
                    <div className="timeline-middle">
                      {e.final ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="timeline-end timeline-box text-sm">
                      <p className="font-medium">{e.judul}</p>
                      <p className="text-xs opacity-60 truncate">{e.deskripsi}</p>
                    </div>
                    {i < timeline.length - 1 && <hr />}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {tab === 'versi' && (
        <section aria-label="Semua versi dokumen">
          <h2 className="text-lg font-semibold mb-3">Semua Versi</h2>
          {memuatVersi ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          ) : semuaVersi.length === 0 ? (
            <div className="alert">
              <Info className="w-5 h-5 shrink-0" />
              <span className="text-sm">Belum ada versi tersimpan untuk paket ini.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Jenis Dokumen</th>
                    <th>Versi</th>
                    <th>Judul</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {semuaVersi.map(({ docType, versi }) => (
                    <tr key={versi.id}>
                      <td className="font-medium">{DOC_TYPE_INFO[docType].label}</td>
                      <td>
                        <span className="badge badge-outline badge-sm">v{versi.nomor}</span>
                      </td>
                      <td className="max-w-64 truncate">{versi.title}</td>
                      <td className="text-sm whitespace-nowrap" title={new Date(versi.dibuatPada).toLocaleString('id-ID')}>
                        {waktuRelatif(versi.dibuatPada)}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${versi.status === 'final' ? 'badge-success' : 'badge-warning'}`}>
                          {versi.status === 'final' ? 'Final' : 'Draf'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setModalDoc(docType);
                            setJudulVersi(versi.title);
                            setIsiVersi(versi.content);
                            setModal('lihat');
                          }}
                        >
                          <Eye className="w-4 h-4" /> Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* GEL2: modal generate — GeneratorForm dalam paketMode: AI asli, docType &
          konteks paket terkunci, hasil otomatis tersimpan sebagai versi baru,
          lalu onSelesai menyegarkan state workspace. */}
      {modal === 'generate' && modalDoc && infoModal && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label={`Generate ${infoModal.label}`}>
          <div className="modal-box max-w-4xl p-0">
            <div className="flex items-start justify-between gap-2 p-4 md:p-6 pb-0 md:pb-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <IkonModal className="w-5 h-5 text-primary" />
                Generate — {infoModal.label}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setModal(null)}
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {pengguna ? (
              <GeneratorForm
                currentUser={pengguna}
                onGenerate={generateLokal}
                isGenerating={sedangGenerate}
                paketMode={{
                  paket,
                  docType: modalDoc,
                  onSelesai: () => selesaiGenerate(modalDoc),
                }}
              />
            ) : (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" aria-label="Memuat profil pengguna" />
              </div>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => setModal(null)} />
        </div>
      )}

      {/* REDESIGN: modal baca isi versi aktif */}
      {modal === 'lihat' && modalDoc && infoModal && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Lihat dokumen">
          <div className="modal-box max-w-3xl">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <IkonModal className="w-5 h-5 text-primary" />
                {judulVersi || infoModal.label}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setModal(null)}
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isiVersi ? (
              <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg bg-base-200 p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans">{isiVersi}</pre>
              </div>
            ) : (
              <div className="mt-4 flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" aria-label="Memuat konten" />
              </div>
            )}
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => modalDoc && unduhDokumen(modalDoc)}
              >
                <FileDown className="w-4 h-4" /> Unduh .md
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setModal(null)}>
                Tutup
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModal(null)} />
        </div>
      )}

      {/* REDESIGN: modal konfirmasi arsip */}
      {modal === 'arsip' && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Konfirmasi arsip">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Archive className="w-5 h-5" />
              {paketDiarsip ? 'Keluarkan dari arsip?' : 'Arsipkan paket?'}
            </h3>
            <p className="text-sm opacity-70 mt-2">
              {paketDiarsip
                ? 'Paket akan kembali aktif di daftar paket Anda.'
                : 'Paket akan disembunyikan dari daftar aktif, tetapi dokumennya tetap tersimpan.'}
            </p>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={menyimpan}
                onClick={arsipkan}
              >
                {menyimpan && <Loader2 className="w-4 h-4 animate-spin" />}
                {paketDiarsip ? 'Keluarkan' : 'Arsipkan'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !menyimpan && setModal(null)} />
        </div>
      )}

      {/* REDESIGN: toast lokal */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-2xl shadow-xl text-[13.5px] font-medium max-w-[calc(100vw-2rem)] bg-[#1c1c1e] text-white dark:bg-white dark:text-black"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#30d158]" />
          ) : toast.kind === 'error' ? (
            <XCircle className="w-4 h-4 shrink-0 text-[#ff9d97]" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 rounded-full p-1 hover:bg-white/10 dark:hover:bg-black/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaketWorkspace;
