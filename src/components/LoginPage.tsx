import React, { useState } from 'react';
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
  Sparkles,
  LockKeyhole,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (data: {
    email: string;
    password?: string;
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regJenjang, setRegJenjang] = useState<Jenjang>('SD');
  const [regMapel, setRegMapel] = useState('Guru Kelas / IPAS');
  const [regNip, setRegNip] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Masukkan email profil guru Anda untuk melanjutkan.');
      return;
    }
    try {
      await onLogin({ email: loginEmail.trim(), password: loginPassword || undefined });
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

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error?.message || 'Login Google belum dikonfigurasi. Hubungi admin sekolah.'
        );
      }
      window.location.href = data.url as string;
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulai login Google.');
      setGoogleLoading(false);
    }
  };

  const features = [
    { icon: <FileText className="h-5 w-5" />, title: '7 format perangkat', desc: 'Modul Ajar, RPP, asesmen, LKPD, ATP/KKTP, Prota-Promes, dan proyek.' },
    { icon: <Download className="h-5 w-5" />, title: 'Siap cetak & edit', desc: 'Ekspor Word dan PDF dengan identitas sekolah yang rapi.' },
    { icon: <BookOpen className="h-5 w-5" />, title: 'Referensi kurikulum', desc: 'Fase, kelas, dan topik membantu menjaga konteks pembelajaran.' },
    { icon: <BarChart3 className="h-5 w-5" />, title: 'Arsip & statistik', desc: 'Dokumen tersimpan teratur agar mudah dilanjutkan kembali.' },
  ];

  return (
    <div className="login-shell min-h-screen text-[var(--app-text)]">
      <header className="apple-nav sticky top-0 z-40 border-x-0">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[var(--app-text)] text-[var(--app-bg)]">
              <GraduationCap className="h-[17px] w-[17px]" />
            </span>
            <span className="text-[14px] font-bold tracking-[-.02em]">Ruang Guru Merdeka</span>
          </div>
          <span className="hidden text-[12px] font-medium text-[var(--app-text-tertiary)] sm:block">
            Perangkat Ajar · 2026/2027
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-6 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:py-16">
        <section className="hero-surface overflow-hidden p-7 sm:p-10 lg:p-14">
          <div className="relative z-10 max-w-[650px]">
            <div className="status-chip mb-7 !bg-[var(--app-surface-solid)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--app-accent)]" />
              Generator perangkat ajar berbantuan AI
            </div>

            <p className="apple-eyebrow">Ruang kerja guru</p>
            <h1 className="apple-headline mt-2 max-w-[620px] !text-[32px] sm:!text-[42px] lg:!text-[50px]">
              Lebih sedikit pekerjaan administratif. Lebih banyak waktu untuk murid.
            </h1>
            <p className="apple-sub mt-6 max-w-[570px] !text-[17px] sm:!text-[18px]">
              Susun perangkat pembelajaran dengan struktur yang rapi, konteks kurikulum yang jelas, dan alur kerja yang terasa sederhana.
            </p>

            <div className="mt-6 flex flex-wrap gap-2" aria-label="Landasan regulasi">
              {['Permendikbudristek 12/2024', 'BSKAP 046/2025', 'BKPDM 020/2026'].map((ref) => (
                <span key={ref} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-[12px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#30b158]" />
                  {ref}
                </span>
              ))}
            </div>

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="login-feature">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    {feature.icon}
                  </div>
                  <h2 className="text-[13.5px] font-bold tracking-[-.01em]">{feature.title}</h2>
                  <p className="mt-1 text-[12.5px] leading-5 text-[var(--app-text-secondary)]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="apple-card-solid rounded-[28px] p-6 shadow-[var(--app-shadow-lg)] sm:p-8 lg:p-9">
          <div className="mb-6">
            <p className="section-label">Akses ruang kerja</p>
            <h2 className="mt-1 text-[28px] font-bold tracking-[-.04em]">
              {activeTab === 'login' ? 'Selamat datang kembali.' : 'Buat profil guru.'}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--app-text-secondary)]">
              {activeTab === 'login'
                ? 'Masuk dengan profil guru Anda untuk melanjutkan pekerjaan.'
                : 'Lengkapi identitas dasar untuk mengajukan akses.'}
            </p>
          </div>

          <div className="apple-segment w-full" role="tablist" aria-label="Akses akun">
            <button
              type="button"
              className="flex-1"
              data-active={activeTab === 'login'}
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            >
              Masuk
            </button>
            <button
              type="button"
              className="flex-1"
              data-active={activeTab === 'register'}
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            >
              Daftar Guru
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-[14px] border border-[color-mix(in_srgb,var(--app-danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--app-danger)_8%,transparent)] px-4 py-3 text-[13px] font-medium text-[var(--app-danger)]" role="alert">
              {errorMessage}
            </div>
          )}

          {activeTab === 'login' ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || googleLoading}
                className="btn-apple-secondary w-full"
              >
                {googleLoading ? 'Menghubungkan ke Google…' : 'Masuk dengan Google Belajar.id'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-center text-[11.5px] text-[var(--app-text-tertiary)]">
                Disarankan untuk akun @belajar.id — kepemilikan email diverifikasi Google.
              </p>
              <div className="my-4 flex items-center gap-3 text-[11px] font-semibold text-[var(--app-text-tertiary)]" aria-hidden="true">
                <span className="h-px flex-1 bg-[var(--app-border)]" />
                atau masuk manual
                <span className="h-px flex-1 bg-[var(--app-border)]" />
              </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold" htmlFor="login-email">Email profil guru</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-tertiary)]" />
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
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['@guru.sd.belajar.id', '@guru.smp.belajar.id', '@guru.sma.belajar.id'].map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => setLoginEmail(`guru${domain}`)}
                      className="rounded-full bg-[var(--app-surface-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-[13px] font-semibold" htmlFor="login-password">Kata sandi</label>
                  <span className="text-[11px] text-[var(--app-text-tertiary)]">Opsional untuk akun lama</span>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="apple-input"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-apple w-full">
                {isLoading ? 'Membuka ruang kerja…' : 'Lanjutkan'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 pt-1 text-[11.5px] text-[var(--app-text-tertiary)]">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
                Sesi akun dikelola server dan tidak disimpan sebagai identitas di browser.
              </div>

              {demoUsers.length > 0 && (
                <div className="mt-5 border-t border-[var(--app-border)] pt-5">
                  <p className="mb-2.5 text-[12px] font-bold text-[var(--app-text-secondary)]">Profil contoh</p>
                  <div className="grid grid-cols-1 gap-2">
                    {demoUsers.slice(0, 4).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        className="flex min-h-[54px] items-center gap-3 rounded-[15px] border border-[var(--app-border)] p-2.5 text-left transition-all hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--app-accent)_35%,transparent)] hover:bg-[var(--app-accent-soft)]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-text)] text-[13px] font-bold text-[var(--app-bg)]">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold">{user.name}</span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-[var(--app-text-tertiary)]">{user.schoolName}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-3.5">
              <div className="rounded-[14px] bg-[var(--app-accent-soft)] px-4 py-3 text-[12.5px] leading-5">
                Profil baru berstatus <b>menunggu verifikasi</b> administrator sebelum aktif penuh.
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">Nama lengkap & gelar *</label>
                <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Contoh: Rahmadani, S.Pd." className="apple-input" required />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">Email Belajar.id *</label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="nama@guru.smp.belajar.id" className="apple-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Jenjang</label>
                  <select value={regJenjang} onChange={(e) => setRegJenjang(e.target.value as Jenjang)} className="apple-input">
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">NIP <span className="font-normal text-[var(--app-text-tertiary)]">(opsional)</span></label>
                  <input value={regNip} onChange={(e) => setRegNip(e.target.value)} placeholder="19890412…" className="apple-input" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">Sekolah *</label>
                <input value={regSchool} onChange={(e) => setRegSchool(e.target.value)} placeholder="SMP Negeri 1 Padang" className="apple-input" required />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold">Mata pelajaran</label>
                <input value={regMapel} onChange={(e) => setRegMapel(e.target.value)} placeholder="Matematika / IPA" className="apple-input" />
              </div>
              <button type="submit" disabled={isLoading} className="btn-apple w-full">
                Daftarkan & ajukan verifikasi
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <div className="mt-7 flex items-start gap-2.5 border-t border-[var(--app-border)] pt-5 text-[11.5px] leading-5 text-[var(--app-text-tertiary)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Login Google memverifikasi kepemilikan email @belajar.id. Akun baru tetap menunggu verifikasi admin sebelum aktif penuh. Tanpa konfigurasi Google, gunakan masuk manual atau profil contoh.</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--app-border)] px-5 py-6 text-center text-[11.5px] text-[var(--app-text-tertiary)]">
        <span className="font-semibold text-[var(--app-text-secondary)]">Ruang Guru Merdeka</span>
        <span className="mx-2 opacity-40">·</span>
        Alat bantu penyusunan perangkat ajar
        <span className="mx-2 opacity-40">·</span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Permendikbudristek No. 12/2024
        </span>
      </footer>
    </div>
  );
};
