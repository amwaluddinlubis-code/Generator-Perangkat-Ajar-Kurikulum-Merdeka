import React, { useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  School,
  Mail,
  User,
  Info,
  LogOut
} from 'lucide-react';

interface BelajarIdAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeacherUser;
  onLogin: (data: { email: string; name?: string; schoolName?: string; jenjang?: Jenjang; mataPelajaran?: string }) => Promise<void>;
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
      name,
      schoolName,
      jenjang,
      mataPelajaran: mapel
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header Belajar.id Branding */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-700 flex items-center justify-center shadow-lg font-bold">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">
                  Masuk dengan Akun Belajar.id
                </h3>
              </div>
              <p className="text-xs text-blue-100">
                Kementerian Pendidikan Dasar dan Menengah Republik Indonesia
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-xs text-blue-50 mt-3 flex items-start gap-2 border border-white/20">
            <Info className="w-4 h-4 shrink-0 text-blue-200 mt-0.5" />
            <p>
              Akun guru baru yang mendaftar akan berstatus <b>Menunggu Verifikasi</b> sampai disetujui oleh Admin Kurikulum (<b>Bpk. Amwaluddin Lubis, M.Pd.</b>).
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50/60">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pilihan Akun Demo Cepat
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk / Daftar Akun Belajar.id Lain
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Pilih salah satu profil di bawah ini untuk menguji sistem verifikasi dan pembuatan modul ajar:
              </p>

              <div className="space-y-2.5">
                {demoAccounts.map((acc, idx) => {
                  const isCurrent = currentUser.email.toLowerCase() === acc.email.toLowerCase();
                  return (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => handleSelectPreset(acc)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                          acc.status === 'VERIFIED' && acc.email.includes('amwaluddin')
                            ? 'bg-purple-600'
                            : acc.status === 'VERIFIED'
                            ? 'bg-blue-600'
                            : 'bg-amber-600'
                        }`}>
                          {acc.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700">
                              {acc.name}
                            </span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              acc.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {acc.roleBadge}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {acc.email}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {acc.school} • {acc.mapel}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold">
                            Aktif
                          </span>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Akun Belajar.id
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama.guru@guru.sd.belajar.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Contoh: @guru.sd.belajar.id, @guru.smp.belajar.id, @guru.sma.belajar.id, @guru.smk.belajar.id
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Guru (dengan gelar)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dra. Nurhayati, M.Pd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Satuan Pendidikan (Sekolah)
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 2 Padang Panjang"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenjang Sekolah
                  </label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as Jenjang)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    <option value="SD">SD (Sekolah Dasar)</option>
                    <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                    <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran Diampu
                  </label>
                  <input
                    type="text"
                    placeholder="Matematika / Guru Kelas"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses Masuk...' : 'Masuk dengan Akun Belajar.id'}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Akun Aktif: <b className="text-slate-800">{currentUser.name}</b></span>
            <span className="ml-2 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{currentUser.status}</span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar Akun (Logout)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
