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

const labelCls = 'block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  documents,
  onUpdateSelf,
  onOpenAuthModal,
}) => {
  const { theme, toggle } = useTheme();
  const isVerified = currentUser.status === 'VERIFIED';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  const [name, setName] = useState(currentUser.name);
  const [school, setSchool] = useState(currentUser.schoolName);
  const [mapel, setMapel] = useState(currentUser.mataPelajaran);
  const [nip, setNip] = useState(currentUser.nip || '');
  const [npsn, setNpsn] = useState(currentUser.npsn || '');
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Hero profil */}
      <div className="apple-card p-5 sm:p-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-[22px] shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold tracking-[-0.025em] text-[var(--ink)] truncate">{currentUser.name}</h1>
            <p className="text-[12.5px] text-[var(--muted)] mt-0.5 truncate">{currentUser.email}</p>
            <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap sm:justify-start">
              <span className={`ds-badge ${isVerified || isSuperAdmin ? 'ds-badge-ok' : 'ds-badge-warn'}`}>
                {isVerified || isSuperAdmin ? (isSuperAdmin ? 'Admin' : 'Terverifikasi') : 'Menunggu verifikasi'}
              </span>
              <span className="ds-badge">
                {currentUser.jenjang} · {myDocs.length} dokumen
              </span>
            </div>
          </div>
          <button type="button" onClick={onOpenAuthModal} className="btn-apple-secondary shrink-0">
            <UserCircle2 className="w-4 h-4" />
            Ganti akun
          </button>
        </div>
        {currentUser.verifiedBy && (
          <p className="mt-3 border-t border-[var(--line)] pt-3 text-[11.5px] text-[var(--muted)]">
            Diverifikasi oleh {currentUser.verifiedBy}
            {currentUser.verifiedAt && ` · ${new Date(currentUser.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        )}
      </div>

      {/* Form profil mandiri */}
      <form onSubmit={handleSubmit} className="apple-card p-4 sm:p-5 space-y-3">
        <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">Data profil</h2>
        <div>
          <label className={labelCls}>Nama lengkap &amp; gelar</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="apple-input" />
        </div>
        <div>
          <label className={labelCls}>Sekolah</label>
          <input value={school} onChange={(e) => setSchool(e.target.value)} required className="apple-input" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Jenjang (terkunci)</label>
            <input value={currentUser.jenjang} disabled className="apple-input disabled:opacity-60" />
          </div>
          <div>
            <label className={labelCls}>Mata pelajaran</label>
            <input value={mapel} onChange={(e) => setMapel(e.target.value)} className="apple-input" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>NIP / NUPTK</label>
            <input value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Opsional" className="apple-input" />
          </div>
          <div>
            <label className={labelCls}>NPSN</label>
            <input value={npsn} onChange={(e) => setNpsn(e.target.value)} placeholder="Opsional" className="apple-input" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-apple w-full">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan…' : 'Simpan perubahan'}
        </button>
        <p className="text-center text-[11.5px] text-[var(--muted)]">
          Jenjang, peran, dan status hanya bisa diubah oleh admin.
        </p>
      </form>

      {/* Aktivitas & preferensi */}
      <div className="apple-card p-4 sm:p-5 space-y-2.5">
        <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">Akun &amp; tampilan</h2>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--ink-soft)]">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-[var(--muted)]" /> : <Sun className="w-4 h-4 text-[var(--muted)]" />}
            Mode {theme === 'dark' ? 'gelap' : 'terang'}
          </div>
          <button type="button" onClick={toggle} className="btn-apple-secondary !min-h-[32px] !py-1 !px-2.5 !text-[12px]">
            Ganti
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--ink-soft)]">
            <UserCircle2 className="w-4 h-4 text-[var(--muted)]" />
            {myDocs.length} perangkat tersusun
          </div>
          <button type="button" onClick={onOpenAuthModal} className="btn-apple-secondary !min-h-[32px] !py-1 !px-2.5 !text-[12px]">
            Ganti akun
          </button>
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-[var(--muted)]">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          Terdaftar sejak {new Date(currentUser.registeredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {!isVerified && !isSuperAdmin && (
          <div className="flex items-start gap-2 rounded-lg border border-[var(--warn)]/30 bg-[var(--warn-soft)] px-3.5 py-2.5 text-[12px] text-[var(--warn)]">
            <Clock className="w-4 h-4 shrink-0" />
            Akun Anda sedang menunggu verifikasi admin sebelum akses penuh.
          </div>
        )}
        {(isVerified || isSuperAdmin) && (
          <div className="flex items-start gap-2 rounded-lg border border-[var(--ok)]/30 bg-[var(--ok-soft)] px-3.5 py-2.5 text-[12px] text-[var(--ok)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Akun aktif — seluruh fitur generator terbuka.
          </div>
        )}
      </div>
    </div>
  );
};
