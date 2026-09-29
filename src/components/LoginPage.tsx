import React, { useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Check, 
  HelpCircle,
  FileText,
  School,
  FileCheck2,
  Download,
  BarChart3,
  Award,
  Layers,
  Clock
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (data: { 
    email: string; 
    name?: string; 
    schoolName?: string; 
    jenjang?: Jenjang; 
    mataPelajaran?: string; 
    nip?: string;
  }) => Promise<void>;
  demoUsers: TeacherUser[];
  isLoading?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  demoUsers,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState<string>('amwaluddin.lubis@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Register form states
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regSchool, setRegSchool] = useState<string>('');
  const [regJenjang, setRegJenjang] = useState<Jenjang>('SD');
  const [regMapel, setRegMapel] = useState<string>('Guru Kelas / IPAS');
  const [regNip, setRegNip] = useState<string>('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Silakan masukkan email Akun Belajar.id Anda');
      return;
    }

    try {
      await onLogin({
        email: loginEmail.trim()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Silakan periksa kembali email Anda.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regEmail.trim()) {
      setErrorMessage('Email Belajar.id wajib diisi');
      return;
    }
    if (!regName.trim()) {
      setErrorMessage('Nama lengkap guru wajib diisi');
      return;
    }

    try {
      await onLogin({
        email: regEmail.trim(),
        name: regName.trim(),
        schoolName: regSchool.trim() || 'Satuan Pendidikan Kurikulum Merdeka',
        jenjang: regJenjang,
        mataPelajaran: regMapel.trim() || 'Semua Mata Pelajaran',
        nip: regNip.trim()
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftarkan akun guru.');
    }
  };

  // Quick 1-click login with demo persona
  const handleQuickLogin = async (user: TeacherUser) => {
    setLoginEmail(user.email);
    setErrorMessage('');
    try {
      await onLogin({
        email: user.email,
        name: user.name,
        schoolName: user.schoolName,
        jenjang: user.jenjang,
        mataPelajaran: user.mataPelajaran
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk dengan akun terpilih');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Ministry Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800/80 px-4 sm:px-8 py-2.5 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
            🇮🇩
          </div>
          <span className="font-semibold text-white tracking-wide">
            KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Server SSO Belajar.id Aktif
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Permendikbudristek No. 12 Tahun 2024</span>
        </div>
      </div>

      {/* Main Login Workspace */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Branding, Value Proposition, Features (5-6 cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* App Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Portal Pembelajaran & Administrasi Guru 2026/2027
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 ring-2 ring-white/10">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-none">
                    Ruang Guru Merdeka
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-300 font-medium mt-1">
                    Generator AI Perangkat Ajar Terintegrasi Akun Belajar.id
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mt-4">
                Platform resmi penyusun perangkat ajar cerdas bagi guru SD, SMP, SMA, dan SMK. Rancang modul ajar berdiferensiasi, soal ujian AKM/HOTS, dan administrasi supervisi hanya dalam hitungan menit sesuai standar kurikulum nasional.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">7 Format Perangkat</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modul Ajar, RPP 1 Lembar, Bank Soal, LKPD, ATP, Prota, dan Modul P5.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ekspor .DOCX & .PDF</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Berkas Word asli yang dapat diedit & PDF siap cetak dengan kop sekolah.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Katalog Topik BSKAP</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Inspirasi materi pokok otomatis tersinkron dengan Fase & Kelas.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Statistik Guru D3.js</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Visualisasi produktivitas dan jam kerja administrasi yang dihemat.
                  </p>
                </div>
              </div>
            </div>

            {/* Official Compliance Statement */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-200">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>
                Diawasi & divalidasi oleh <b>BPMP & Verifikator Kurikulum</b> (Bpk. Amwaluddin Lubis, M.Pd.) demi keabsahan perangkat pembelajaran.
              </span>
            </div>

          </div>

          {/* Right Column: Authentication Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
              
              {/* Header Tabs: Masuk vs Daftar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                    className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Masuk Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                    className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Daftar Guru Baru
                  </button>
                </div>

                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SSO Aktif
                </span>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: FORM MASUK (LOGIN) */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Google Belajar.id Fast SSO Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(demoUsers[0] || {
                      id: 'user-admin-1',
                      name: 'Amwaluddin Lubis, M.Pd.',
                      email: 'amwaluddin.lubis@gmail.com',
                      schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
                      jenjang: 'SMA',
                      mataPelajaran: 'Pengawas Kurikulum',
                      role: 'SUPER_ADMIN',
                      status: 'VERIFIED',
                      registeredAt: new Date().toISOString()
                    })}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Masuk Instan dengan Akun Belajar.id (Google)</span>
                  </button>

                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      atau dengan kredensial
                    </span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email Akun Belajar.id
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="contoh: nama.guru@guru.smp.belajar.id"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      <span className="text-[10px] text-slate-400">Domain:</span>
                      {['@guru.sd.belajar.id', '@guru.smp.belajar.id', '@guru.sma.belajar.id'].map((dom) => (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => setLoginEmail(`guru${dom}`)}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                        >
                          {dom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Kata Sandi / PIN Belajar.id
                      </label>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('Untuk memulihkan kata sandi Belajar.id, silakan hubungi Kapten/Co-Kapten Belajar.id daerah atau kunjungi pusat bantuan belajar.id.'); }} className="text-[11px] text-blue-600 hover:underline">
                        Lupa sandi?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Ingat saya di perangkat ini</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{isLoading ? 'Memverifikasi Akun...' : 'Masuk ke Ruang Guru'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Quick Persona Access for Testing */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                      <span>Pilih Akun Demo / Pengujian Langsung:</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                        1-Klik Masuk
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {demoUsers.slice(0, 4).map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleQuickLogin(user)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all text-left flex items-start gap-2 group cursor-pointer"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5 ${
                            user.role === 'SUPER_ADMIN' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate leading-tight">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {user.schoolName}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </form>
              )}

              {/* TAB 2: FORM DAFTAR GURU BARU */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs">
                    Pendaftaran khusus Bapak/Ibu Pendidik untuk mendapatkan akun resmi penyusun modul ajar Kurikulum Merdeka.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Lengkap & Gelar Guru *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Rahmadani, S.Pd., M.Si."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email Belajar.id Guru *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@guru.smp.belajar.id"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Jenjang Sekolah
                      </label>
                      <select
                        value={regJenjang}
                        onChange={(e) => setRegJenjang(e.target.value as Jenjang)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                      >
                        <option value="SD">SD (Sekolah Dasar)</option>
                        <option value="SMP">SMP (Menengah Pertama)</option>
                        <option value="SMA">SMA (Menengah Atas)</option>
                        <option value="SMK">SMK (Kejuruan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        NIP / NUPTK (Opsional)
                      </label>
                      <input
                        type="text"
                        value={regNip}
                        onChange={(e) => setRegNip(e.target.value)}
                        placeholder="19890412..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Satuan Pendidikan (Sekolah) *
                    </label>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="SMP Negeri 1 Padang"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Mata Pelajaran yang Diampu
                    </label>
                    <input
                      type="text"
                      value={regMapel}
                      onChange={(e) => setRegMapel(e.target.value)}
                      placeholder="Contoh: Matematika / IPA"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>Daftarkan Akun & Ajukan Verifikasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Official Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>
          © 2026 Ruang Guru Merdeka • Dikelola sesuai Standar Kurikulum Nasional Permendikbudristek No. 12 Tahun 2024
        </p>
      </footer>

    </div>
  );
};
