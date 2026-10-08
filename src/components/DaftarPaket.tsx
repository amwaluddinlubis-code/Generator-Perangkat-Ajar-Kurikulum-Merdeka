// REDESIGN: DaftarPaket baru (Worker B) — pencarian, filter Aktif/Arsip,
// kartu paket dengan aksi, modal "Buat Paket", dan modal konfirmasi hapus.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Archive,
  ArchiveRestore,
  Copy,
  Trash2,
  ArrowRight,
  X,
} from 'lucide-react';
import { TeacherUser, Jenjang, Paket, DokumenPaket, VersiDokumen } from '../types';
import { JENJANG_CONFIGS } from '../data/curriculumData';
import { apiFetch, extractErrorMessage } from '../utils/api';

// GEL2: duplikasi tipe lokal (tech debt Gelombang 1) dihapus — pakai tipe
// kanonik dari ../types. GET /api/pakets menyertakan ringkasan progress per
// paket, jadi ditambah via interface turunan yang sempit.
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

  useEffect(() => {
    muatPakets(tab);
  }, [tab, muatPakets]);

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

  // REDESIGN: arsipkan / kembalikan paket via kontrak API.
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
      /* REDESIGN: kegagalan aksi tidak menutup daftar — biarkan data lama tampil */
    } finally {
      setAksiId(null);
    }
  };

  // REDESIGN: duplikat paket via kontrak API.
  const handleDuplikat = async (p: PaketTampil) => {
    setAksiId(p.id);
    try {
      const res = await apiFetch(`/api/pakets/${p.id}/duplikat`, { method: 'POST' });
      if (!res.ok) throw new Error('gagal menduplikat paket');
      await muatPakets(tab);
    } catch {
      /* abaikan — daftar tetap seperti semula */
    } finally {
      setAksiId(null);
    }
  };

  // REDESIGN: hapus paket — konfirmasi lewat modal DaisyUI, tanpa window.confirm.
  const handleHapus = async () => {
    if (!targetHapus) return;
    setAksiId(targetHapus.id);
    try {
      const res = await apiFetch(`/api/pakets/${targetHapus.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('gagal menghapus paket');
      setTargetHapus(null);
      await muatPakets(tab);
    } catch {
      /* abaikan — daftar tetap seperti semula */
    } finally {
      setAksiId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 ux-view-enter">
      {/* REDESIGN: baris judul + pencarian + filter tab + CTA */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Paket Perangkat Ajar
          </h1>
          <button
            type="button"
            onClick={() => setModalBuatTerbuka(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Buat Paket</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="input input-bordered flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 opacity-60 shrink-0" />
            <input
              type="search"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Cari topik, mapel, atau kelas…"
              className="grow bg-transparent outline-none"
              aria-label="Cari paket"
            />
          </label>
          {/* REDESIGN: filter Aktif | Arsip sebagai tabs DaisyUI */}
          <div className="tabs tabs-box" role="tablist" aria-label="Filter status paket">
            {(['aktif', 'arsip'] as StatusTab[]).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={tab === s}
                onClick={() => setTab(s)}
                className={`tab ${tab === s ? 'tab-active' : ''}`}
              >
                {s === 'aktif' ? 'Aktif' : 'Arsip'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2 mt-2" />
                <div className="skeleton h-2 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : tersaring.length === 0 ? (
        <div className="hero rounded-3xl border border-dashed border-base-300 py-12">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h2 className="text-xl font-black tracking-tight">
                {pencarian
                  ? 'Tidak ada paket yang cocok'
                  : tab === 'aktif'
                    ? 'Belum ada paket aktif'
                    : 'Arsip masih kosong'}
              </h2>
              <p className="py-3 text-sm opacity-70">
                {pencarian
                  ? 'Coba kata kunci lain, atau buat paket baru dengan topik tersebut.'
                  : tab === 'aktif'
                    ? 'Buat paket pertama Anda dan susun 7 dokumen Kurikulum Merdeka dengan bantuan AI.'
                    : 'Paket yang diarsipkan akan muncul di sini dan bisa dikembalikan kapan saja.'}
              </p>
              {!pencarian && tab === 'aktif' && (
                <button
                  type="button"
                  onClick={() => setModalBuatTerbuka(true)}
                  className="btn btn-primary mt-2"
                >
                  <Plus className="w-5 h-5" />
                  Buat Paket Baru
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* REDESIGN: grid kartu responsif */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tersaring.map((p) => {
            const selesai = p.progress?.selesai ?? 0;
            const total = p.progress?.totalDokumen ?? 7;
            const sibuk = aksiId === p.id;
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
                    <div className="text-xs opacity-70 mb-1">
                      {selesai}/{total} dokumen
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={selesai}
                      max={total}
                      aria-label={`Progres ${selesai} dari ${total} dokumen`}
                    />
                  </div>
                  <div className="card-actions flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => onBukaPaket(p.id)}
                      className="btn btn-primary btn-sm"
                      disabled={sibuk}
                    >
                      Buka
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArsip(p)}
                      className="btn btn-ghost btn-sm"
                      disabled={sibuk}
                      title={tab === 'aktif' ? 'Arsipkan paket' : 'Kembalikan ke aktif'}
                    >
                      {tab === 'aktif' ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        <ArchiveRestore className="w-4 h-4" />
                      )}
                      <span className="hidden md:inline">
                        {tab === 'aktif' ? 'Arsipkan' : 'Kembalikan'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplikat(p)}
                      className="btn btn-ghost btn-sm"
                      disabled={sibuk}
                      title="Duplikat paket"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden md:inline">Duplikat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetHapus(p)}
                      className="btn btn-ghost btn-sm text-error"
                      disabled={sibuk}
                      title="Hapus paket"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden md:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REDESIGN: modal "Buat Paket" DaisyUI */}
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

      {/* REDESIGN: modal konfirmasi hapus DaisyUI (tanpa window.confirm) */}
      {targetHapus && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus paket">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hapus paket?</h3>
            <p className="py-4 text-sm opacity-80">
              Paket <span className="font-semibold">“{targetHapus.topik}”</span> beserta
              seluruh dokumennya akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setTargetHapus(null)}
                disabled={aksiId === targetHapus.id}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleHapus}
                disabled={aksiId === targetHapus.id}
              >
                {aksiId === targetHapus.id ? (
                  <span className="loading loading-spinner loading-sm" />
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

// REDESIGN: form buat paket — mapel dari JENJANG_CONFIGS, prefill dari currentUser.
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
    // REDESIGN: validasi — topik wajib diisi.
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

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Buat paket baru">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Buat Paket Baru</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onTutup}
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="label" htmlFor="buatpaket-topik">
              <span className="label-text font-semibold">
                Topik <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="buatpaket-topik"
              type="text"
              value={form.topik}
              onChange={(e) => setForm((s) => ({ ...s, topik: e.target.value }))}
              placeholder="cth. Sistem Pencernaan Manusia"
              className={`input input-bordered w-full ${galat && !form.topik.trim() ? 'input-error' : ''}`}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="buatpaket-mapel">
                <span className="label-text font-semibold">Mata pelajaran</span>
              </label>
              <select
                id="buatpaket-mapel"
                value={form.mataPelajaran}
                onChange={(e) => setForm((s) => ({ ...s, mataPelajaran: e.target.value }))}
                className="select select-bordered w-full"
              >
                {daftarMapel.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="buatpaket-jenjang">
                <span className="label-text font-semibold">Jenjang</span>
              </label>
              <select
                id="buatpaket-jenjang"
                value={form.jenjang}
                onChange={(e) => ubahJenjang(e.target.value as Jenjang)}
                className="select select-bordered w-full"
              >
                {JENJANG_LIST.map((j) => (
                  <option key={j} value={j}>
                    {JENJANG_CONFIGS[j].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="buatpaket-fase">
                <span className="label-text font-semibold">Fase</span>
              </label>
              <select
                id="buatpaket-fase"
                value={form.fase}
                onChange={(e) => ubahFase(e.target.value)}
                className="select select-bordered w-full"
              >
                {daftarFase.map((f) => (
                  <option key={f.fase} value={f.fase}>
                    {f.fase}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="buatpaket-tingkat">
                <span className="label-text font-semibold">Tingkat</span>
              </label>
              <select
                id="buatpaket-tingkat"
                value={form.tingkat}
                onChange={(e) => setForm((s) => ({ ...s, tingkat: e.target.value }))}
                className="select select-bordered w-full"
              >
                {faseAktif.kelas.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {galat && (
            <div className="alert alert-error py-2.5 text-sm" role="alert">
              {galat}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn" onClick={onTutup} disabled={menyimpan}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={menyimpan}>
              {menyimpan && <span className="loading loading-spinner loading-sm" />}
              Simpan & Buka Paket
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => !menyimpan && onTutup()} />
    </div>
  );
};

export default DaftarPaket;
