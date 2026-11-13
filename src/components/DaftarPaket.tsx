// DaftarPaket — daftar paket perangkat ajar dengan pencarian, filter, dan aksi.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Archive,
  ArchiveRestore,
  Copy,
  Trash2,
  Sparkles,
  AlertTriangle,
  X,
  ArrowRight,
} from 'lucide-react';
import { TeacherUser, Jenjang, Paket } from '../types';
import { JENJANG_CONFIGS } from '../data/curriculumData';
import { apiFetch, extractErrorMessage } from '../utils/api';
import { Maskot } from './Maskot';
import { pesanKosong } from '../utils/sapaan';

interface PaketTampil extends Paket {
  progress?: { totalDokumen: number; selesai: number };
}

interface DaftarPaketProps {
  currentUser: TeacherUser;
  onBukaPaket: (id: string) => void;
}

type StatusTab = 'aktif' | 'arsip';

const JENJANG_LIST: Jenjang[] = ['SD', 'SMP', 'SMA', 'SMK'];

interface BuatPaketForm {
  topik: string;
  mataPelajaran: string;
  jenjang: Jenjang;
  fase: string;
  tingkat: string;
}

export const DaftarPaket: React.FC<DaftarPaketProps> = ({
  currentUser,
  onBukaPaket,
}) => {
  const [pakets, setPakets] = useState<PaketTampil[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>('aktif');
  const [pencarian, setPencarian] = useState('');
  const [aksiId, setAksiId] = useState<string | null>(null);
  const [modalBuatTerbuka, setModalBuatTerbuka] = useState(false);
  const [targetHapus, setTargetHapus] = useState<PaketTampil | null>(null);

  const muatPakets = useCallback(async (status: StatusTab) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/pakets?status=${status}`);
      if (!res.ok) throw new Error('gagal memuat paket');
      const data = await res.json();
      const items: PaketTampil[] = Array.isArray(data) ? data : (data?.pakets ?? []);
      setPakets(items);
    } catch {
      setPakets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sertakan identitas pengguna: ganti akun harus memuat ulang daftar,
  // bukan menampilkan data akun sebelumnya.
  useEffect(() => {
    setPakets([]);
    muatPakets(tab);
  }, [tab, muatPakets, currentUser.id]);

  const tersaring = useMemo(() => {
    const q = pencarian.trim().toLowerCase();
    if (!q) return pakets;
    return pakets.filter(
      (p) =>
        p.topik.toLowerCase().includes(q) ||
        p.mataPelajaran.toLowerCase().includes(q) ||
        p.tingkat.toLowerCase().includes(q)
    );
  }, [pakets, pencarian]);

  const handleArsip = async (p: PaketTampil) => {
    setAksiId(p.id);
    try {
      const res = await apiFetch(`/api/pakets/${p.id}/arsip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arsip: tab === 'aktif' }),
      });
      if (!res.ok) throw new Error('gagal mengubah status arsip');
      await muatPakets(tab);
    } catch {
      /* daftar tetap seperti semula */
    } finally {
      setAksiId(null);
    }
  };

  const handleDuplikat = async (p: PaketTampil) => {
    setAksiId(p.id);
    try {
      const res = await apiFetch(`/api/pakets/${p.id}/duplikat`, { method: 'POST' });
      if (!res.ok) throw new Error('gagal menduplikat paket');
      await muatPakets(tab);
    } catch {
      /* daftar tetap seperti semula */
    } finally {
      setAksiId(null);
    }
  };

  const handleHapus = async () => {
    if (!targetHapus) return;
    setAksiId(targetHapus.id);
    try {
      const res = await apiFetch(`/api/pakets/${targetHapus.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('gagal menghapus paket');
      setTargetHapus(null);
      await muatPakets(tab);
    } catch {
      /* abaikan */
    } finally {
      setAksiId(null);
    }
  };

  const IconAction: React.FC<{
    onClick: () => void;
    label: string;
    danger?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }> = ({ onClick, label, danger, disabled, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-8 h-8 rounded-md border border-transparent flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 ${
        danger
          ? 'text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]'
          : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
            Paket perangkat ajar
          </h1>
          <p className="apple-sub mt-1">
            Satu paket berisi 7 dokumen Kurikulum Merdeka untuk satu topik.
          </p>
        </div>
        <button type="button" onClick={() => setModalBuatTerbuka(true)} className="btn-apple shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Paket baru</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            placeholder="Cari topik, mapel, atau kelas…"
            className="apple-input !pl-9"
            aria-label="Cari paket"
          />
        </div>
        <div className="apple-segment" role="tablist" aria-label="Filter status paket">
          {(['aktif', 'arsip'] as StatusTab[]).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={tab === s}
              data-active={tab === s}
              onClick={() => setTab(s)}
            >
              {s === 'aktif' ? 'Aktif' : 'Arsip'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="apple-card p-4">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/3 mt-3" />
              <div className="skeleton h-1.5 w-full mt-5" />
            </div>
          ))}
        </div>
      ) : tersaring.length === 0 ? (
        <div className="apple-card py-14 px-6 ux-pop-in">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            {!pencarian && <Maskot size={80} />}
            <h2 className="text-[16px] font-semibold text-[var(--ink)] mt-3">
              {pencarian
                ? 'Tidak ada paket yang cocok'
                : tab === 'aktif'
                  ? pesanKosong('paket')
                  : 'Arsip masih kosong'}
            </h2>
            <p className="apple-sub mt-1.5">
              {pencarian
                ? `Tidak ada paket yang cocok dengan “${pencarian}”. Coba kata kunci lain.`
                : tab === 'aktif'
                  ? 'Susun 7 dokumen Kurikulum Merdeka untuk satu topik, dibantu AI.'
                  : 'Paket yang diarsipkan akan muncul di sini dan bisa dikembalikan kapan saja.'}
            </p>
            {!pencarian && tab === 'aktif' && (
              <button type="button" onClick={() => setModalBuatTerbuka(true)} className="btn-apple mt-5">
                <Plus className="w-4 h-4" />
                Buat paket baru
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tersaring.map((p, i) => {
            const selesai = p.progress?.selesai ?? 0;
            const total = p.progress?.totalDokumen ?? 7;
            const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;
            const sibuk = aksiId === p.id;
            return (
              <div
                key={p.id}
                className="apple-card ux-lift ux-stagger p-4 flex flex-col"
                style={{ '--ux-delay': `${(i % 6) * 50}ms` } as React.CSSProperties}
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
                      {selesai}/{total} dokumen selesai
                    </span>
                    <span className="font-medium text-[var(--ink-soft)]">{persen}%</span>
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
                    <button
                      type="button"
                      onClick={() => onBukaPaket(p.id)}
                      className="btn-apple !min-h-[34px] !py-1.5 !px-3 !text-[12.5px]"
                      disabled={sibuk}
                    >
                      Buka
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-0.5">
                      <IconAction
                        onClick={() => handleArsip(p)}
                        disabled={sibuk}
                        label={tab === 'aktif' ? `Arsipkan ${p.topik}` : `Kembalikan ${p.topik}`}
                      >
                        {tab === 'aktif' ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                      </IconAction>
                      <IconAction onClick={() => handleDuplikat(p)} disabled={sibuk} label={`Duplikat ${p.topik}`}>
                        <Copy className="w-4 h-4" />
                      </IconAction>
                      <IconAction onClick={() => setTargetHapus(p)} disabled={sibuk} danger label={`Hapus ${p.topik}`}>
                        <Trash2 className="w-4 h-4" />
                      </IconAction>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalBuatTerbuka && (
        <BuatPaketModal
          currentUser={currentUser}
          onTutup={() => setModalBuatTerbuka(false)}
          onBerhasil={(idBaru) => {
            setModalBuatTerbuka(false);
            muatPakets('aktif');
            setTab('aktif');
            onBukaPaket(idBaru);
          }}
        />
      )}

      {targetHapus && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus paket">
          <div className="modal-box ux-pop-in">
            <h3 className="text-[15px] font-semibold flex items-center gap-2 text-[var(--ink)]">
              <span className="w-8 h-8 rounded-md bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </span>
              Hapus paket?
            </h3>
            <p className="py-4 text-[13px] leading-relaxed text-[var(--ink-soft)]">
              Paket <span className="font-semibold text-[var(--ink)]">“{targetHapus.topik}”</span> beserta
              seluruh dokumennya akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn-apple-secondary"
                onClick={() => setTargetHapus(null)}
                disabled={aksiId === targetHapus.id}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-apple !bg-[var(--danger)] hover:!bg-[var(--danger)] hover:!brightness-110"
                onClick={handleHapus}
                disabled={aksiId === targetHapus.id}
              >
                {aksiId === targetHapus.id ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Ya, hapus
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => (aksiId === targetHapus.id ? undefined : setTargetHapus(null))}
          />
        </div>
      )}
    </div>
  );
};

const BuatPaketModal: React.FC<{
  currentUser: TeacherUser;
  onTutup: () => void;
  onBerhasil: (idBaru: string) => void;
}> = ({ currentUser, onTutup, onBerhasil }) => {
  const jenjangAwal: Jenjang = JENJANG_LIST.includes(currentUser.jenjang)
    ? currentUser.jenjang
    : 'SMP';
  const faseAwal = JENJANG_CONFIGS[jenjangAwal].fases[0];

  const [form, setForm] = useState<BuatPaketForm>(() => {
    const daftarMapel = JENJANG_CONFIGS[jenjangAwal].defaultMapel;
    return {
      topik: '',
      mataPelajaran: daftarMapel.includes(currentUser.mataPelajaran)
        ? currentUser.mataPelajaran
        : daftarMapel[0],
      jenjang: jenjangAwal,
      fase: faseAwal.fase,
      tingkat: faseAwal.kelas[0],
    };
  });
  const [galat, setGalat] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    const tangani = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !menyimpan) onTutup();
    };
    window.addEventListener('keydown', tangani);
    return () => window.removeEventListener('keydown', tangani);
  }, [onTutup, menyimpan]);

  const daftarMapel = JENJANG_CONFIGS[form.jenjang].defaultMapel;
  const daftarFase = JENJANG_CONFIGS[form.jenjang].fases;
  const faseAktif = daftarFase.find((f) => f.fase === form.fase) ?? daftarFase[0];

  const ubahJenjang = (jenjang: Jenjang) => {
    const faseBaru = JENJANG_CONFIGS[jenjang].fases[0];
    setForm((s) => ({
      ...s,
      jenjang,
      fase: faseBaru.fase,
      tingkat: faseBaru.kelas[0],
      mataPelajaran: JENJANG_CONFIGS[jenjang].defaultMapel[0],
    }));
  };

  const ubahFase = (fase: string) => {
    const f = daftarFase.find((x) => x.fase === fase) ?? daftarFase[0];
    setForm((s) => ({ ...s, fase: f.fase, tingkat: f.kelas[0] }));
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topik.trim()) {
      setGalat('Topik wajib diisi.');
      return;
    }
    setGalat('');
    setMenyimpan(true);
    try {
      const res = await apiFetch('/api/pakets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topik: form.topik.trim(),
          mataPelajaran: form.mataPelajaran,
          jenjang: form.jenjang,
          fase: form.fase,
          tingkat: form.tingkat,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Gagal membuat paket'));
      }
      const paketBaru: Paket = (data as { paket?: Paket })?.paket ?? (data as Paket);
      if (!paketBaru?.id) throw new Error('Respons server tidak valid');
      onBerhasil(paketBaru.id);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : 'Gagal membuat paket');
    } finally {
      setMenyimpan(false);
    }
  };

  const labelCls = 'block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5';

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Buat paket baru">
      <div className="modal-box max-w-lg ux-pop-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold flex items-center gap-2 text-[var(--ink)]">
            <span className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            Buat paket baru
          </h3>
          <button
            type="button"
            className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center cursor-pointer"
            onClick={onTutup}
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="buatpaket-topik">
              Topik <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id="buatpaket-topik"
              type="text"
              value={form.topik}
              onChange={(e) => setForm((s) => ({ ...s, topik: e.target.value }))}
              placeholder="cth. Sistem Pencernaan Manusia"
              className={`apple-input ${galat && !form.topik.trim() ? '!border-[var(--danger)]' : ''}`}
              aria-invalid={!!(galat && !form.topik.trim())}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="buatpaket-mapel">Mata pelajaran</label>
              <select
                id="buatpaket-mapel"
                value={form.mataPelajaran}
                onChange={(e) => setForm((s) => ({ ...s, mataPelajaran: e.target.value }))}
                className="apple-input"
              >
                {daftarMapel.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="buatpaket-jenjang">Jenjang</label>
              <select
                id="buatpaket-jenjang"
                value={form.jenjang}
                onChange={(e) => ubahJenjang(e.target.value as Jenjang)}
                className="apple-input"
              >
                {JENJANG_LIST.map((j) => (
                  <option key={j} value={j}>{JENJANG_CONFIGS[j].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="buatpaket-fase">Fase</label>
              <select
                id="buatpaket-fase"
                value={form.fase}
                onChange={(e) => ubahFase(e.target.value)}
                className="apple-input"
              >
                {daftarFase.map((f) => (
                  <option key={f.fase} value={f.fase}>{f.fase}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="buatpaket-tingkat">Tingkat</label>
              <select
                id="buatpaket-tingkat"
                value={form.tingkat}
                onChange={(e) => setForm((s) => ({ ...s, tingkat: e.target.value }))}
                className="apple-input"
              >
                {faseAktif.kelas.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {galat && (
            <div
              className="flex items-center gap-2 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 text-[12.5px] text-[var(--danger)]"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {galat}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn-apple-secondary" onClick={onTutup} disabled={menyimpan}>
              Batal
            </button>
            <button type="submit" className="btn-apple" disabled={menyimpan}>
              {menyimpan && <span className="loading loading-spinner loading-xs" />}
              Simpan & buka paket
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => !menyimpan && onTutup()} />
    </div>
  );
};

export default DaftarPaket;
