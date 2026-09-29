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
  onLogin: (data: { email: string; password?: string; name?: string; schoolName?: string; jenjang?: Jenjang; mataPelajaran?: string }) => Promise<void>;
  onLogout?: () => void;
}

export const BelajarIdAuthModal: React.FC<BelajarIdAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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
      password: password || undefined,
      name,
      schoolName,
      jenjang,
      mataPelajaran: mapel
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="apple-card max-w-xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-5 relative border-b border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white dark:text-black text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="pr-10">
              <h3 className="text-[19px] font-semibold tracking-tight">
                Ganti akun Belajar.id
              </h3>
              <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d]">
                Akun baru berstatus menunggu verifikasi admin.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4">
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d]">
                Ketuk salah satu profil untuk beralih akun:
              </p>

              <div className="space-y-2">
                {demoAccounts.map((acc, idx) => {
                  const isCurrent = currentUser.email.toLowerCase() === acc.email.toLowerCase();
                  return (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => handleSelectPreset(acc)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/5'
                          : 'border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-semibold text-[14px] shrink-0">
                          {acc.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[13.5px]">
                              {acc.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11.5px] text-[#6e6e73] dark:text-[#98989d]">
                              <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'VERIFIED' ? 'bg-[#30b158]' : 'bg-[#ff9f0a]'}`} />
                              {acc.status === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu'}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#6e6e73] dark:text-[#98989d] truncate">
                            {acc.email}
                          </div>
                          <div className="text-[12px] text-[#86868b] truncate">
                            {acc.school} • {acc.mapel}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded-full bg-black dark:bg-white dark:text-black text-white text-[12px] font-semibold">
                            Aktif
                          </span>
                        ) : (
                          <div className="p-2 rounded-full bg-black/5 dark:bg-white/10">
                            <ArrowRight className="w-4 h-4" />
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
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Email Belajar.id
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="nama.guru@guru.sd.belajar.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="apple-input !pl-10"
                  />
                </div>
                <p className="text-[12px] text-[#86868b] mt-1.5">
                  @guru.sd / @guru.smp / @guru.sma / @guru.smk.belajar.id
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Kata sandi (bila sudah diatur)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="apple-input"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Nama lengkap & gelar
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dra. Nurhayati, M.Pd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="apple-input !pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Sekolah
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 2 Padang Panjang"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="apple-input !pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">
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
                  <label className="block text-[13px] font-semibold mb-1.5">
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
                className="btn-apple w-full !bg-black dark:!bg-white dark:!text-black"
              >
                {loading ? 'Memproses...' : 'Masuk dengan akun ini'}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
          <div className="truncate">
            Aktif: <b>{currentUser.name}</b>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#ff3b30] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
