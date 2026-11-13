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
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  X,
  Loader2,
  History,
  PackageOpen,
  FileDown,
  Clock,
  Compass,
  Presentation,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';
// FRIENDLY: maskot Owi + sapaan hangat untuk empty state
import { Maskot } from './Maskot';
import { pesanKosong } from '../utils/sapaan';
// FITUR 3: presenter slide tayang (dokumen turunan Modul Ajar)
import { SlidePresenter, Slide } from './SlidePresenter';
// FITUR 4: modal asesmen diagnostik 5 menit
import { DiagnostikModal } from './DiagnostikModal';
// FITUR 2: ekspor Lembar Penilaian KKTP ke .xlsx
import { unduhLembarPenilaianXlsx } from '../utils/lembarPenilaianXlsx';
// F2-4: modal nama file cerdas untuk unduhan .md
import NamaFileModal from './NamaFileModal';
import { namaFileCerdas } from '@/shared/kopPengesahan';

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
  // FITUR 3: slide tayang (turunan Modul Ajar)
  const [slideTerbuka, setSlideTerbuka] = useState(false);
  const [slideDeck, setSlideDeck] = useState<Slide[]>([]);
  const [memuatSlide, setMemuatSlide] = useState(false);
  // FITUR 4: modal asesmen diagnostik 5 menit
  const [modalDiagnostik, setModalDiagnostik] = useState<boolean>(false);
  // FITUR 2: status ekspor Lembar Penilaian (.xlsx)
  const [mengunduhXlsx, setMengunduhXlsx] = useState(false);
  // F2-4: modal nama file untuk unduhan .md per dokumen
  const [mdModal, setMdModal] = useState<null | { docType: DocType; nilaiAwal: string }>(null);

  // F2-4: ambil judul versi aktif dulu agar default nama file cerdas
  const mintaNamaMd = async (docType: DocType) => {
    const daftar = await muatVersi(docType);
    const aktif = daftar[0];
    if (!aktif) {
      showToast('Belum ada versi untuk diunduh', 'info');
      return;
    }
    setMdModal({ docType, nilaiAwal: `${namaFileCerdas(aktif.title, docType)}_v${aktif.nomor}` });
  };

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

  // FRIENDLY: tutup modal Generate dengan Escape (jangan tutup saat AI sedang generate)
  useEffect(() => {
    if (modal !== 'generate') return;
    const tangani = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sedangGenerate) setModal(null);
    };
    window.addEventListener('keydown', tangani);
    return () => window.removeEventListener('keydown', tangani);
  }, [modal, sedangGenerate]);

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

  // FITUR 3: buka slide tayang — GET dulu, bila 404 generate dari isi Modul Ajar aktif.
  // Slide adalah DOKUMEN TURUNAN Modul Ajar, bukan kartu ke-8.
  const bukaSlideTayang = async () => {
    if (memuatSlide) return;
    setMemuatSlide(true);
    try {
      const resGet = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/slide`);
      if (resGet.ok) {
        const data = await resGet.json();
        const slides: Slide[] = data.slide?.slides ?? data.slides ?? [];
        if (slides.length > 0) {
          setSlideDeck(slides);
          setSlideTerbuka(true);
          return;
        }
      }
      // Belum ada → generate dari teks Modul Ajar versi aktif
      const daftar = await muatVersi('modul_ajar');
      const aktif = daftar[0];
      if (!aktif?.content) {
        showToast('Modul Ajar belum punya isi untuk dijadikan slide', 'info');
        return;
      }
      const resPost = await apiFetch(`/api/pakets/${encodeURIComponent(paketId)}/slide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sumberTeks: aktif.content }),
      });
      const dataPost = await resPost.json();
      if (!resPost.ok || !dataPost.success) {
        throw new Error(dataPost.message || `Server menjawab ${resPost.status}`);
      }
      const slides: Slide[] = dataPost.slide?.slides ?? [];
      if (slides.length === 0) throw new Error('Server tidak mengembalikan slide');
      setSlideDeck(slides);
      setSlideTerbuka(true);
      if (dataPost.dariFallback) {
        showToast('AI sedang sibuk — slide dibuat dari template cadangan 🌤️', 'info');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal membuat slide tayang', 'error');
    } finally {
      setMemuatSlide(false);
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
  // F2-4: namaFile opsional dari NamaFileModal; bila tidak diberikan pakai default lama.
  const unduhDokumen = async (docType: DocType, namaFile?: string) => {
    try {
      const daftar = await muatVersi(docType);
      const aktif = daftar[0];
      if (!aktif) {
        showToast('Belum ada versi untuk diunduh', 'info');
        return;
      }
      const nama = namaFile || `${aktif.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || docType}-v${aktif.nomor}.md`;
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

  // FRIENDLY: "Draf" memakai badge hangat khas RGM; "Final" tetap success
  const badgeStatus = (status: StatusDokumen): string => {
    if (status === 'final') return 'badge-success';
    if (status === 'draf') return 'rgm-badge-warm';
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
      <div className="space-y-4" aria-busy="true" aria-label="Memuat workspace paket">
        <div className="skeleton h-8 w-1/3" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {URUTAN_DOC.map((dt) => (
            <div key={dt} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // REDESIGN: error state ringkas
  if (galat || !paket) {
    return (
      <div className="flex justify-center py-10">
        <div className="apple-card max-w-md w-full p-6 ux-pop-in text-center">
          <Maskot size={72} className="mx-auto mb-3" />
          <h2 className="text-[16px] font-semibold text-[var(--ink)]">Paket tidak ditemukan</h2>
          <p className="apple-sub mt-1.5">
            {galat ?? 'Data paket tidak tersedia.'} Periksa koneksi lalu coba lagi.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <button type="button" className="btn-apple" onClick={muatPaket}>
              Coba lagi
            </button>
            <button type="button" className="btn-apple-secondary" onClick={onKembali}>
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
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
    <div className="space-y-5">
      {/* Header workspace */}
      <div className="space-y-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          onClick={onKembali}
          aria-label="Kembali ke daftar paket"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Paket Saya
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--ink)] leading-tight flex items-start gap-2">
              <PackageOpen className="w-5 h-5 mt-1 shrink-0 text-[var(--accent)]" />
              <span className="min-w-0">{paket.topik}</span>
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="ds-badge ds-badge-accent">{paket.mataPelajaran}</span>
              <span className="ds-badge">{paket.jenjang}</span>
              <span className="ds-badge">{paket.fase}</span>
              <span className="ds-badge">{paket.tingkat}</span>
              {paketDiarsip && <span className="ds-badge ds-badge-warn">Diarsipkan</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              className="btn-apple-secondary"
              onClick={() => setModalDiagnostik(true)}
              aria-label="Buka generator asesmen diagnostik 5 menit"
              title="Buatkan pertanyaan diagnostik kilat untuk 5 menit pertama"
            >
              <Compass className="w-4 h-4" />
              Diagnostik
            </button>
            <button
              type="button"
              className="btn-apple-secondary"
              onClick={unduhBundle}
              disabled={mengunduhBundle}
            >
              {mengunduhBundle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Unduh bundle
            </button>
            <button
              type="button"
              className="btn-apple-ghost"
              onClick={() => setModal('arsip')}
            >
              {paketDiarsip ? (
                <>
                  <ArchiveRestore className="w-4 h-4" /> Keluarkan dari arsip
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" /> Arsipkan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Dokumen | Versi */}
      <div className="apple-segment" role="tablist" aria-label="Tampilan workspace">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'dokumen'}
          data-active={tab === 'dokumen'}
          onClick={() => setTab('dokumen')}
        >
          Dokumen
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'versi'}
          data-active={tab === 'versi'}
          onClick={bukaTabVersi}
        >
          Versi
        </button>
      </div>

      {tab === 'dokumen' && (
        <>
          {/* Pipeline 7 kartu dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {dokumen.map((d, idx) => {
              const info = DOC_TYPE_INFO[d.docType];
              const Ikon = PETA_IKON[info.icon] ?? FileText;
              const adaVersi = d.versiAktif > 0;
              const sibuk = aksiDoc === d.docType;
              const statusStyle =
                d.status === 'final'
                  ? 'ds-badge-ok'
                  : d.status === 'draf'
                    ? 'ds-badge-warn'
                    : '';
              return (
                <div
                  key={d.docType}
                  className="apple-card ux-lift ux-stagger p-3.5 flex flex-col"
                  style={{ '--ux-delay': `${(idx % 7) * 40}ms` } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-8 h-8 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink-soft)] flex items-center justify-center shrink-0">
                        <Ikon className="w-4 h-4" />
                      </span>
                      <h2 className="text-[13px] font-semibold text-[var(--ink)] leading-tight line-clamp-2">
                        {info.label}
                      </h2>
                    </div>
                    <span className={`ds-badge shrink-0 ${statusStyle}`}>{labelStatus(d.status)}</span>
                  </div>

                  <p className="text-[11.5px] text-[var(--muted)] line-clamp-2 mt-2 leading-relaxed">{info.desc}</p>
                  {adaVersi && (
                    <p className="text-[11px] font-medium text-[var(--ink-soft)] mt-1.5">
                      Versi aktif v{d.versiAktif}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-3">
                    {(!adaVersi || d.status === 'draf') && (
                      <button
                        type="button"
                        className="btn-apple !min-h-[32px] !py-1.5 !px-2.5 !text-[12px]"
                        onClick={() => bukaModalGenerate(d.docType)}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {adaVersi ? 'Versi baru' : 'Generate'}
                      </button>
                    )}
                    {adaVersi && (
                      <button
                        type="button"
                        className="btn-apple-secondary !min-h-[32px] !py-1.5 !px-2.5 !text-[12px]"
                        onClick={() => bukaModalLihat(d.docType)}
                      >
                        <Eye className="w-3.5 h-3.5" /> Buka
                      </button>
                    )}
                    {d.docType === 'modul_ajar' && adaVersi && (
                      <button
                        type="button"
                        className="btn-apple-ghost !min-h-[32px] !py-1.5 !px-2 !text-[12px]"
                        onClick={() => bukaSlideTayang()}
                        disabled={memuatSlide}
                        title="Buat slide tayang kelas dari Modul Ajar ini"
                      >
                        {memuatSlide ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Presentation className="w-3.5 h-3.5" />
                        )}
                        Slide
                      </button>
                    )}
                    {d.status === 'draf' && (
                      <button
                        type="button"
                        className="btn-apple-ghost !min-h-[32px] !py-1.5 !px-2 !text-[12px] !text-[var(--ok)] hover:!bg-[var(--ok-soft)]"
                        disabled={sibuk}
                        onClick={() => tandaiFinal(d.docType)}
                      >
                        {sibuk ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Final
                      </button>
                    )}
                    {adaVersi && (
                      <button
                        type="button"
                        className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer ml-auto"
                        onClick={() => mintaNamaMd(d.docType)}
                        aria-label={`Unduh ${info.label}`}
                        title="Unduh sebagai .md"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline aktivitas */}
          <section aria-label="Aktivitas terbaru">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[14px] font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[var(--muted)]" /> Aktivitas terbaru
              </h2>
            </div>
            {timeline.length === 0 ? (
              <div className="apple-card p-4">
                <div className="flex items-center gap-3">
                  <Maskot size={56} className="shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--ink)]">{pesanKosong('aktivitas')}</p>
                    <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                      Buat versi pertama lewat tombol Generate di salah satu kartu dokumen.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="apple-card divide-y divide-[var(--line)] overflow-hidden">
                {timeline.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        e.final ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 'bg-[var(--surface-2)] text-[var(--muted)]'
                      }`}
                    >
                      {e.final ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-[var(--ink)] truncate">{e.judul}</p>
                      <p className="text-[11.5px] text-[var(--muted)] truncate">{e.deskripsi}</p>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {waktuRelatif(e.waktu)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {tab === 'versi' && (
        <section aria-label="Semua versi dokumen">
          <h2 className="text-[14px] font-semibold mb-2.5 text-[var(--ink)]">Semua versi</h2>
          {memuatVersi ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : semuaVersi.length === 0 ? (
            <div className="apple-card p-4">
              <div className="flex items-center gap-3">
                <Maskot size={56} className="shrink-0" />
                <p className="text-[13px] font-medium text-[var(--ink)]">{pesanKosong('dokumen')}</p>
              </div>
            </div>
          ) : (
            <div className="apple-card overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="border-[var(--line)]">
                    <th className="text-[11.5px] font-medium text-[var(--muted)]">Dokumen</th>
                    <th className="text-[11.5px] font-medium text-[var(--muted)]">Versi</th>
                    <th className="text-[11.5px] font-medium text-[var(--muted)]">Judul</th>
                    <th className="text-[11.5px] font-medium text-[var(--muted)]">Tanggal</th>
                    <th className="text-[11.5px] font-medium text-[var(--muted)]">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {semuaVersi.map(({ docType, versi }) => (
                    <tr key={versi.id} className="border-[var(--line)] hover:bg-[var(--surface-2)]">
                      <td className="text-[12.5px] font-medium text-[var(--ink)]">{DOC_TYPE_INFO[docType].label}</td>
                      <td>
                        <span className="ds-badge">v{versi.nomor}</span>
                      </td>
                      <td className="max-w-64 truncate text-[12.5px] text-[var(--ink-soft)]">{versi.title}</td>
                      <td className="text-[12px] whitespace-nowrap text-[var(--muted)]" title={new Date(versi.dibuatPada).toLocaleString('id-ID')}>
                        {waktuRelatif(versi.dibuatPada)}
                      </td>
                      <td>
                        <span className={`ds-badge ${versi.status === 'final' ? 'ds-badge-ok' : 'ds-badge-warn'}`}>
                          {versi.status === 'final' ? 'Final' : 'Draf'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-apple-ghost !min-h-[28px] !py-1 !px-2 !text-[12px]"
                          onClick={() => {
                            setModalDoc(docType);
                            setJudulVersi(versi.title);
                            setIsiVersi(versi.content);
                            setModal('lihat');
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat
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

      {/* Modal generate — GeneratorForm dalam paketMode */}
      {modal === 'generate' && modalDoc && infoModal && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label={`Generate ${infoModal.label}`}>
          <div className="modal-box max-w-4xl p-0 ux-pop-in">
            <div className="flex items-center justify-between gap-2 px-4 sm:px-5 h-14 border-b border-[var(--line)]">
              <h3 className="text-[14px] font-semibold flex items-center gap-2 text-[var(--ink)]">
                <span className="w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <IkonModal className="w-4 h-4" />
                </span>
                Generate {infoModal.label}
              </h3>
              <button
                type="button"
                className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center cursor-pointer"
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

      {/* Dokumen: tampilan baca layar penuh memakai DocumentViewer (A4 + ekspor) */}
      {modal === 'lihat' && modalDoc && pengguna && (
        <div
          className="fixed inset-0 z-50 bg-[var(--bg)] overflow-y-auto no-print"
          role="dialog"
          aria-modal="true"
          aria-label={`Dokumen ${DOC_TYPE_INFO[modalDoc].label}`}
        >
          <div className="sticky top-0 z-10 h-[52px] border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-2 px-3 sm:px-5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] px-2 py-1.5 rounded-md hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>
              <span className="w-px h-4 bg-[var(--line)]" aria-hidden="true" />
              <span className="text-[13px] font-medium text-[var(--ink)] truncate">
                {judulVersi || DOC_TYPE_INFO[modalDoc].label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {modalDoc === 'kktp_atp' && (
                <button
                  type="button"
                  className="btn-apple-secondary !min-h-[32px] !py-1.5 !px-2.5 !text-[12px]"
                  disabled={mengunduhXlsx}
                  title="Unduh lembar penilaian KKTP (.xlsx): 30 baris nama, rumus interval & rekomendasi otomatis"
                  onClick={async () => {
                    if (mengunduhXlsx) return;
                    setMengunduhXlsx(true);
                    try {
                      await unduhLembarPenilaianXlsx({
                        judulDokumen: judulVersi || 'ATP & KKTP',
                        mataPelajaran: paket.mataPelajaran,
                        kelas: paket.tingkat,
                        sekolah: '',
                      });
                      showToast('Lembar penilaian (.xlsx) berhasil diunduh', 'success');
                    } catch {
                      showToast('Gagal menyusun .xlsx', 'error');
                    } finally {
                      setMengunduhXlsx(false);
                    }
                  }}
                >
                  {mengunduhXlsx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                  Lembar nilai
                </button>
              )}
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center cursor-pointer"
                aria-label="Tutup dokumen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-w-[1120px] mx-auto px-3 sm:px-6 py-5">
            <DocumentViewer
              document={null}
              currentUser={pengguna}
              paketMode={{
                paketId,
                docType: modalDoc,
                onTutup: () => setModal(null),
              }}
            />
          </div>
        </div>
      )}

      {/* Modal konfirmasi arsip */}
      {modal === 'arsip' && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Konfirmasi arsip">
          <div className="modal-box max-w-md ux-pop-in">
            <h3 className="text-[15px] font-semibold flex items-center gap-2 text-[var(--ink)]">
              <span className="w-8 h-8 rounded-md bg-[var(--surface-2)] text-[var(--ink-soft)] flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </span>
              {paketDiarsip ? 'Keluarkan dari arsip?' : 'Arsipkan paket?'}
            </h3>
            <p className="text-[13px] text-[var(--ink-soft)] mt-2.5 leading-relaxed">
              {paketDiarsip
                ? 'Paket akan kembali aktif di daftar paket Anda.'
                : 'Paket akan disembunyikan dari daftar aktif, tetapi dokumennya tetap tersimpan.'}
            </p>
            <div className="modal-action">
              <button type="button" className="btn-apple-secondary" onClick={() => setModal(null)}>
                Batal
              </button>
              <button
                type="button"
                className="btn-apple"
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

      {/* FITUR 4: modal asesmen diagnostik 5 menit */}
      {modalDiagnostik && paket && (
        <DiagnostikModal paket={paket} onClose={() => setModalDiagnostik(false)} />
      )}

      {/* FITUR 3: presenter slide tayang (turunan Modul Ajar) */}
      {slideTerbuka && (
        <SlidePresenter
          slides={slideDeck}
          judulKonteks={paket.topik}
          infoKonteks={`${paket.mataPelajaran} · ${paket.tingkat}`}
          onTutup={() => setSlideTerbuka(false)}
        />
      )}

      {/* F2-4: modal nama file untuk unduhan .md */}
      <NamaFileModal
        terbuka={!!mdModal}
        nilaiAwal={mdModal?.nilaiAwal ?? ''}
        infoEkstensi="File akan diunduh dengan ekstensi .md"
        onSimpan={(nama) => {
          const m = mdModal;
          setMdModal(null);
          if (m) void unduhDokumen(m.docType, `${nama}.md`);
        }}
        onBatal={() => setMdModal(null)}
      />

      {/* REDESIGN: toast lokal */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2.5 pl-3.5 pr-2 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg text-[13px] font-medium max-w-[calc(100vw-2rem)] text-[var(--ink)] ux-pop-in"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--ok)]" />
          ) : toast.kind === 'error' ? (
            <XCircle className="w-4 h-4 shrink-0 text-[var(--danger)]" />
          ) : (
            <Info className="w-4 h-4 shrink-0 text-[var(--accent)]" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaketWorkspace;
