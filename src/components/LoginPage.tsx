import React, { useEffect, useRef, useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Mail,
  CheckCircle2,
  FileText,
  Download,
  BookOpen,
  BarChart3,
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
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regSchool, setRegSchool] = useState<string>('');
  const [regJenjang, setRegJenjang] = useState<Jenjang>('SD');
  const [regMapel, setRegMapel] = useState<string>('Guru Kelas / IPAS');
  const [regNip, setRegNip] = useState<string>('');
  const errorRef = useRef<HTMLDivElement>(null);

  // UX: pindahkan fokus ke kotak error saat muncul agar tak terlewat pengguna keyboard/SR
  useEffect(() => {
    if (errorMessage) errorRef.current?.focus();
  }, [errorMessage]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Masukkan email profil guru Anda untuk melanjutkan.');
      return;
    }
    try {
      await onLogin({ email: loginEmail.trim() });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali email Anda.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regEmail.trim()) { setErrorMessage('Email Belajar.id wajib diisi.'); return; }
    if (!regName.trim()) { setErrorMessage('Nama lengkap guru wajib diisi.'); return; }
    try {
      await onLogin({
        email: regEmail.trim(),
        name: regName.trim(),
        schoolName: regSchool.trim() || 'Satuan Pendidikan Kurikulum Merdeka',
        jenjang: regJenjang,
        mataPelajaran: regMapel.trim() || 'Semua Mata Pelajaran',
        nip: regNip.trim(),
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftarkan akun guru.');
    }
  };

  const handleQuickLogin = async (user: TeacherUser) => {
    setErrorMessage('');
    try {
      await onLogin({
        email: user.email,
        name: user.name,
        schoolName: user.schoolName,
        jenjang: user.jenjang,
        mataPelajaran: user.mataPelajaran,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk dengan akun terpilih.');
    }
  };

  const features = [
    { icon: <FileText className="w-5 h-5" />, title: '7 format perangkat', desc: 'Modul Ajar, RPP, Soal AKM/HOTS, LKPD, ATP/KKTP, Prota-Promes, P5.' },
    { icon: <Download className="w-5 h-5" />, title: 'Siap cetak & edit', desc: 'Ekspor .docx asli dan .pdf dengan kop sekolah resmi.' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'Katalog topik BSKAP', desc: 'Inspirasi materi otomatis mengikuti Fase dan Kelas.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Arsip & statistik', desc: 'Semua dokumen tersimpan rapi dan terpantau.' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav tipis ala Apple */}
      <nav className="apple-nav sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-black dark:bg-white dark:text-black text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Ruang Guru Merdeka</span>
          </div>
          <span className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">Kurikulum Merdeka · 2026/2027</span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 pt-12 pb-16 sm:pt-16">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="apple-eyebrow mb-2">Generator Perangkat Ajar</p>
          <h1 className="apple-headline">Ruang Guru Merdeka.</h1>
          <p className="apple-sub mt-3">
            Susun Modul Ajar, RPP, Soal, dan perangkat kelas sesuai Permendikbudristek No.&nbsp;12&nbsp;Tahun&nbsp;2024 — dalam hitungan menit, bukan akhir pekan.
          </p>
        </div>

        {/* Kartu auth */}
        <div className="apple-card mt-10 max-w-xl mx-auto p-6 sm:p-8">
          <div className="flex justify-center">
            <div className="apple-segment" role="tablist" aria-label="Masuk atau daftar">
              {/* UX: tandai tab aktif untuk pembaca layar */}
              <button type="button" role="tab" aria-selected={activeTab === 'login'} data-active={activeTab === 'login'} onClick={() => { setActiveTab('login'); setErrorMessage(''); }}>Masuk</button>
              <button type="button" role="tab" aria-selected={activeTab === 'register'} data-active={activeTab === 'register'} onClick={() => { setActiveTab('register'); setErrorMessage(''); }}>Daftar Guru</button>
            </div>
          </div>

          {errorMessage && (
            // UX: kotak error bisa difokuskan + konsisten di dark mode
            <div ref={errorRef} tabIndex={-1} className="mt-5 rounded-xl bg-[#fff1f1] dark:bg-[#3a1f1f] border border-[#ffcfcf] dark:border-[#7a3b3b] text-[#b3261e] dark:text-[#ffb4ab] text-[13.5px] font-medium px-4 py-3 focus:outline-none" role="alert">
              {errorMessage}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="login-email">Email profil guru</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@sekolah.id"
                    className="apple-input !pl-10"
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['@guru.sd.belajar.id', '@guru.smp.belajar.id', '@guru.sma.belajar.id'].map((dom) => (
                    <button key={dom} type="button" onClick={() => setLoginEmail(`guru${dom}`)}
                      className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-[#f5f5f7] dark:bg-white/10 text-[#424245] dark:text-[#e8e8ed] hover:bg-[#e8e8ed] dark:hover:bg-white/15 transition-colors">
                      {dom}
                    </button>
                  ))}
                </div>
                <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-2">Hanya email sebagai identitas profil — tanpa kata sandi Belajar.id.</p>
              </div>

              <button type="submit" disabled={isLoading} className="btn-apple w-full">
                {isLoading ? 'Membuka ruang kerja…' : 'Lanjutkan'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-5 border-t border-black/10">
                <p className="text-[13px] font-semibold text-[#424245] mb-2.5">Coba sekali ketuk</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoUsers.slice(0, 4).map((user) => (
                    // UX: nonaktifkan saat proses login berjalan agar tak terkirim ganda
                    <button key={user.id} type="button" disabled={isLoading} onClick={() => handleQuickLogin(user)}
                      className="rounded-2xl border border-black/10 dark:border-white/15 hover:border-[#0071e3] hover:bg-[#f5f9ff] dark:hover:bg-white/5 transition-all text-left p-3 flex items-center gap-2.5 min-h-[56px] disabled:opacity-60 disabled:cursor-not-allowed">
                      <div className="w-9 h-9 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-semibold text-[14px] shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold truncate">{user.name}</p>
                        <p className="text-[12px] text-[#6e6e73] dark:text-[#98989d] truncate">{user.schoolName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-3.5">
              <p className="text-[13.5px] bg-[#f5f5f7] dark:bg-white/10 rounded-xl px-4 py-3">
                Profil baru berstatus <b>menunggu verifikasi</b> administrator sebelum aktif penuh.
              </p>
              <div>
                {/* UX: label terhubung ke input agar bisa diklik & dibaca screen reader */}
                <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="reg-name">Nama lengkap & gelar *</label>
                <input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Contoh: Rahmadani, S.Pd." className="apple-input" required autoComplete="name" />
              </div>
              <div>
                <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="reg-email">Email Belajar.id *</label>
                <input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="nama@guru.smp.belajar.id" className="apple-input" required autoComplete="email" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="reg-jenjang">Jenjang</label>
                  <select id="reg-jenjang" value={regJenjang} onChange={(e) => setRegJenjang(e.target.value as Jenjang)} className="apple-input">
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="reg-nip">NIP <span className="font-normal text-[#86868b]">(opsional)</span></label>
                  <input id="reg-nip" value={regNip} onChange={(e) => setRegNip(e.target.value)} placeholder="19890412…" className="apple-input" inputMode="numeric" />
                </div>
              </div>
              <div>
                <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="reg-school">Sekolah *</label>
                <input id="reg-school" value={regSchool} onChange={(e) => setRegSchool(e.target.value)} placeholder="SMP Negeri 1 Padang" className="apple-input" required autoComplete="organization" />
              </div>
              <div>
                <label className="block text-[13.5px] font-semibold mb-1.5" htmlFor="reg-mapel">Mata pelajaran</label>
                <input id="reg-mapel" value={regMapel} onChange={(e) => setRegMapel(e.target.value)} placeholder="Matematika / IPA" className="apple-input" />
              </div>
              <button type="submit" disabled={isLoading} className="btn-apple w-full">
                Daftarkan & ajukan verifikasi <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Fitur — grid lega */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="apple-card p-5 text-left">
              <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] dark:bg-white/10 flex items-center justify-center mb-3">{f.icon}</div>
              <h3 className="text-[14.5px] font-semibold">{f.title}</h3>
              <p className="text-[13px] text-[#6e6e73] dark:text-[#98989d] mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto mt-6 flex items-center gap-2.5 justify-center text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Mode demo — akun Belajar.id resmi belum terhubung. Data tersimpan lokal di perangkat Anda.</span>
        </div>
      </main>

      <footer className="border-t border-black/10 dark:border-white/15 py-5 text-center text-[12.5px] text-[#6e6e73] dark:text-[#98989d]">
        Ruang Guru Merdeka · Alat bantu penyusunan perangkat ajar · <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Permendikbudristek No. 12/2024</span>
      </footer>
    </div>
  );
};
