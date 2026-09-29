import React, { useEffect, useState } from 'react';
import { TeacherUser, EducationalDocument } from '../types';
import { useTheme } from '../theme';
import {
  UserCircle2,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Save,
  Sun,
  Moon,
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: TeacherUser;
  documents: EducationalDocument[];
  onUpdateSelf: (fields: Partial<TeacherUser>) => Promise<void>;
  onOpenAuthModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  documents,
  onUpdateSelf,
  onOpenAuthModal,
}) => {
  const { theme, toggle } = useTheme();
  const isVerified = currentUser.status === 'VERIFIED';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
  const canChangeSchool = currentUser.role === 'SUPER_ADMIN';

  const [name, setName] = useState(currentUser.name);
  const [school, setSchool] = useState(currentUser.schoolName);
  const [mapel, setMapel] = useState(currentUser.mataPelajaran);
  const [nip, setNip] = useState(currentUser.nip || '');
  const [npsn, setNpsn] = useState(currentUser.npsn || '');
  const [saving, setSaving] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  // Sinkron bila profil diubah admin dari perangkat lain
  useEffect(() => {
    setName(currentUser.name);
    setSchool(currentUser.schoolName);
    setMapel(currentUser.mataPelajaran);
    setNip(currentUser.nip || '');
    setNpsn(currentUser.npsn || '');
  }, [currentUser.id, currentUser.name, currentUser.schoolName, currentUser.mataPelajaran, currentUser.nip, currentUser.npsn]);

  const myDocs = documents.filter(
    d => d.authorId === currentUser.id || d.authorName === currentUser.name
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateSelf({ name, schoolName: school, mataPelajaran: mapel, nip, npsn });
    setSaving(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwNew.length < 8) {
      setPwMsg({ ok: false, text: 'Kata sandi baru minimal 8 karakter.' });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwCurrent || undefined, newPassword: pwNew })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || data.message || 'Gagal memperbarui kata sandi');
      setPwMsg({ ok: true, text: 'Kata sandi berhasil diperbarui.' });
      setPwCurrent('');
      setPwNew('');
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message || 'Gagal memperbarui kata sandi' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Hero profil */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-semibold text-[28px] mx-auto">
          {currentUser.name.charAt(0)}
        </div>
        <h2 className="apple-headline !text-[26px] sm:!text-[32px] mt-3">{currentUser.name}</h2>
        <p className="apple-sub !text-[14.5px] mt-1">{currentUser.email}</p>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[12.5px] font-medium">
            {isVerified || isSuperAdmin ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-[#30b158]" /> {isSuperAdmin ? 'Admin' : 'Terverifikasi'}</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a] animate-pulse" /> Menunggu verifikasi</>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[12.5px] font-medium">
            {currentUser.jenjang} • {myDocs.length} dokumen
          </span>
        </div>
        {currentUser.verifiedBy && (
          <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-2">
            Diverifikasi oleh {currentUser.verifiedBy}
            {currentUser.verifiedAt && ` • ${new Date(currentUser.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        )}
      </div>

      {/* Form profil mandiri */}
      <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-3.5">
        <h3 className="font-semibold text-[15px]">Data profil</h3>
        <div>
          <label className="block text-[13px] font-semibold mb-1.5">Nama lengkap & gelar</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="apple-input" />
        </div>
        <div>
          <label className="block text-[13px] font-semibold mb-1.5">Sekolah</label>
          <input value={school} onChange={(e) => setSchool(e.target.value)} required disabled={!canChangeSchool} className="apple-input disabled:opacity-60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5">Jenjang (terkunci)</label>
            <input value={currentUser.jenjang} disabled className="apple-input disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5">Mata pelajaran</label>
            <input value={mapel} onChange={(e) => setMapel(e.target.value)} className="apple-input" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5">NIP / NUPTK</label>
            <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Opsional" className="apple-input" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5">NPSN</label>
            <input value={npsn} onChange={(e) => setNpsn(e.target.value)} placeholder="Opsional" className="apple-input" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-apple w-full">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : 'Simpan perubahan'}
        </button>
        <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] text-center">
          Jenjang, peran, dan status hanya bisa diubah oleh admin. Sekolah hanya dapat dipindahkan oleh Super Admin.
        </p>
      </form>

      {/* Keamanan */}
      <form onSubmit={handlePasswordSubmit} className="apple-card p-6 sm:p-8 space-y-3.5">
        <h3 className="font-semibold text-[15px]">Kata sandi</h3>
        <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d]">
          Lindungi akun dengan kata sandi. Setelah diatur, masuk wajib memakai kata sandi.
        </p>
        <div>
          <label className="block text-[13px] font-semibold mb-1.5">Kata sandi saat ini (bila sudah ada)</label>
          <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} autoComplete="current-password" className="apple-input" />
        </div>
        <div>
          <label className="block text-[13px] font-semibold mb-1.5">Kata sandi baru (min. 8 karakter)</label>
          <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} autoComplete="new-password" className="apple-input" />
        </div>
        {pwMsg && (
          <div className={`rounded-xl px-4 py-3 text-[13px] ${pwMsg.ok ? 'bg-[#30b158]/10' : 'bg-[#ff3b30]/10'}`}>
            {pwMsg.text}
          </div>
        )}
        <button type="submit" disabled={pwSaving} className="btn-apple w-full">
          {pwSaving ? 'Menyimpan...' : 'Perbarui kata sandi'}
        </button>
      </form>

      {/* Aktivitas & preferensi */}
      <div className="apple-card p-6 sm:p-8 space-y-3">
        <h3 className="font-semibold text-[15px]">Akun & tampilan</h3>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2.5 text-[14px] font-medium">
            {theme === 'dark' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            Mode {theme === 'dark' ? 'gelap' : 'terang'}
          </div>
          <button type="button" onClick={toggle} className="btn-apple-secondary !min-h-[38px] !py-2">
            Ganti
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2.5 text-[14px] font-medium">
            <UserCircle2 className="w-[18px] h-[18px]" />
            {myDocs.length} perangkat tersusun
          </div>
          <button type="button" onClick={onOpenAuthModal} className="btn-apple-secondary !min-h-[38px] !py-2">
            Ganti akun
          </button>
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
          <FileText className="w-4 h-4 shrink-0" />
          Terdaftar sejak {new Date(currentUser.registeredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {!isVerified && !isSuperAdmin && (
          <div className="flex items-center gap-2 text-[13px] rounded-2xl bg-[#ff9f0a]/10 px-4 py-3">
            <Clock className="w-4 h-4 text-[#ff9f0a] shrink-0" />
            Akun Anda sedang menunggu verifikasi admin sebelum akses penuh.
          </div>
        )}
        {(isVerified || isSuperAdmin) && (
          <div className="flex items-center gap-2 text-[13px] rounded-2xl bg-[#30b158]/10 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-[#30b158] shrink-0" />
            Akun aktif — seluruh fitur generator terbuka.
          </div>
        )}
      </div>
    </div>
  );
};
