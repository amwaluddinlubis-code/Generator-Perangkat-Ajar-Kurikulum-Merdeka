import React, { useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import {
  GraduationCap,
  X,
  ArrowRight,
  School,
  Mail,
  User,
  LogOut
} from 'lucide-react';

interface BelajarIdAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeacherUser;
  onLogin: (data: { email: string; name?: string; schoolName?: string; jenjang?: Jenjang; mataPelajaran?: string }) => Promise<void>;
  onLogout?: () => void;
}

const labelCls = 'block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5';
const iconCls = 'w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none';

export const BelajarIdAuthModal: React.FC<BelajarIdAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [jenjang, setJenjang] = useState<Jenjang>('SD');
  const [mapel, setMapel] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Fast switch demo accounts
  const demoAccounts = [
    {
      roleDesc: 'Super Admin & Verifikator Utama (Amwaluddin Lubis)',
      name: 'Amwaluddin Lubis, M.Pd.',
      email: 'amwaluddin.lubis@gmail.com',
      school: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
      jenjang: 'SMA' as Jenjang,
      mapel: 'Pengawas Kurikulum & Bahasa',
      status: 'VERIFIED' as const,
      roleBadge: 'Super Admin (Verifikator)'
    },
    {
      roleDesc: 'Guru SD Terverifikasi (Fase B Kelas 4)',
      name: 'Siti Nurhaliza, S.Pd.SD',
      email: 'siti.nurhaliza@guru.sd.belajar.id',
      school: 'SD Negeri 01 Menteng Pagi',
      jenjang: 'SD' as Jenjang,
      mapel: 'Guru Kelas / IPAS',
      status: 'VERIFIED' as const,
      roleBadge: 'Guru SD Terverifikasi'
    },
    {
      roleDesc: 'Guru SMP Terverifikasi (Fase D Kelas 8)',
      name: 'Budi Santoso, M.Pd.',
      email: 'budi.santoso@guru.smp.belajar.id',
      school: 'SMP Negeri 5 Bandung',
      jenjang: 'SMP' as Jenjang,
      mapel: 'Matematika',
      status: 'VERIFIED' as const,
      roleBadge: 'Guru SMP Terverifikasi'
    },
    {
      roleDesc: 'Guru SMA Terverifikasi (Fase E & F Kelas 10-12)',
      name: 'Dra. Endang Sulistyowati',
      email: 'endang.sulistyowati@guru.sma.belajar.id',
      school: 'SMA Negeri 3 Yogyakarta',
      jenjang: 'SMA' as Jenjang,
      mapel: 'Biologi',
      status: 'VERIFIED' as const,
      roleBadge: 'Guru SMA Terverifikasi'
    },
    {
      roleDesc: 'Guru Baru Mendaftar (Menunggu Verifikasi Admin)',
      name: 'Rahmat Hidayat, S.Pd.',
      email: 'rahmat.hidayat@guru.smp.belajar.id',
      school: 'SMP Negeri 1 Padang',
      jenjang: 'SMP' as Jenjang,
      mapel: 'Bahasa Indonesia',
      status: 'PENDING' as const,
      roleBadge: 'Menunggu Verifikasi'
    }
  ];

  if (!isOpen) return null;

  const handleSelectPreset = async (acc: typeof demoAccounts[0]) => {
    setLoading(true);
    await onLogin({
      email: acc.email,
      name: acc.name,
      schoolName: acc.school,
      jenjang: acc.jenjang,
      mataPelajaran: acc.mapel
    });
    setLoading(false);
    onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await onLogin({
      email,
      name,
      schoolName,
      jenjang,
      mataPelajaran: mapel
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Ganti akun Belajar.id">
      <div className="modal-box max-w-xl p-0 overflow-hidden">
        
        {/* Header */}
        <div className="relative border-b border-[var(--line)] px-5 py-4">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="pr-10">
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                Ganti akun Belajar.id
              </h3>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">
                Akun baru berstatus menunggu verifikasi admin.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-4">
          <div className="apple-segment w-full grid grid-cols-2" role="tablist" aria-label="Pilih cara masuk">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              data-active={activeTab === 'presets'}
            >
              Akun demo cepat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              data-active={activeTab === 'custom'}
            >
              Akun lain
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <p className="text-[12px] text-[var(--muted)]">
                Pilih salah satu profil untuk beralih akun.
              </p>

              <div className="space-y-1.5">
                {demoAccounts.map((acc, idx) => {
                  const isCurrent = currentUser.email.toLowerCase() === acc.email.toLowerCase();
                  return (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => handleSelectPreset(acc)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors cursor-pointer disabled:opacity-60 ${
                        isCurrent
                          ? 'border-[var(--accent)]/45 bg-[var(--accent-soft)]'
                          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--surface-3)] text-[var(--ink-soft)] flex items-center justify-center font-semibold text-[12.5px] shrink-0">
                          {acc.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                              {acc.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
                              <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'VERIFIED' ? 'bg-[var(--ok)]' : 'bg-[var(--warn)]'}`} />
                              {acc.status === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu'}
                            </span>
                          </div>
                          <div className="truncate text-[11.5px] text-[var(--muted)]">
                            {acc.email}
                          </div>
                          <div className="truncate text-[11.5px] text-[var(--muted)]">
                            {acc.school} · {acc.mapel}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isCurrent ? (
                          <span className="ds-badge ds-badge-accent">Aktif</span>
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-[var(--surface-2)] text-[var(--muted)] flex items-center justify-center">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM LOGIN / REGISTRATION */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className={labelCls}>
                  Email Belajar.id
                </label>
                <div className="relative">
                  <Mail className={iconCls} />
                  <input
                    type="email"
                    required
                    placeholder="nama.guru@guru.sd.belajar.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="apple-input !pl-9"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  @guru.sd / @guru.smp / @guru.sma / @guru.smk.belajar.id
                </p>
              </div>

              <div>
                <label className={labelCls}>
                  Nama lengkap &amp; gelar
                </label>
                <div className="relative">
                  <User className={iconCls} />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dra. Nurhayati, M.Pd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="apple-input !pl-9"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Sekolah
                </label>
                <div className="relative">
                  <School className={iconCls} />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 2 Padang Panjang"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="apple-input !pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Jenjang
                  </label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as Jenjang)}
                    className="apple-input"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    Mata pelajaran
                  </label>
                  <input
                    type="text"
                    placeholder="Matematika"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="apple-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-apple w-full"
              >
                {loading ? 'Memproses…' : 'Masuk dengan akun ini'}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-3 text-[11.5px] text-[var(--muted)]">
          <div className="truncate">
            Aktif: <b className="text-[var(--ink-soft)]">{currentUser.name}</b>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>

      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};
