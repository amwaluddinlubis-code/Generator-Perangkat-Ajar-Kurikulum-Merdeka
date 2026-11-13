import React, { useEffect, useRef, useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import Maskot from './Maskot';
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

const FEATURES = [
  { icon: FileText, title: '7 format perangkat', desc: 'Modul Ajar, RPP, Soal AKM/HOTS, LKPD, ATP/KKTP, Prota-Promes, P5.' },
  { icon: Download, title: 'Siap cetak & edit', desc: 'Ekspor .docx asli dan .pdf dengan kop sekolah resmi.' },
  { icon: BookOpen, title: 'Katalog topik BSKAP', desc: 'Inspirasi materi otomatis mengikuti Fase dan Kelas.' },
  { icon: BarChart3, title: 'Arsip & statistik', desc: 'Semua dokumen tersimpan rapi dan terpantau.' },
];

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
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal masuk. Periksa kembali email Anda.');
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
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mendaftarkan akun guru.');
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
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal masuk dengan akun terpilih.');
    }
  };

  const labelCls = 'block text-[12.5px] font-medium text-[var(--ink-soft)] mb-1.5';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
      {/* ————— Panel kiri: identitas produk ————— */}
      <aside className="hidden lg:flex flex-col justify-between border-r border-[var(--line)] bg-[var(--surface)] px-12 py-10 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 300px at 20% 0%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[var(--accent)] text-white flex items-center justify-center">
              <GraduationCap className="w-[17px] h-[17px]" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
              Ruang Guru Merdeka
            </span>
          </div>

          <h1 className="mt-14 text-[32px] font-semibold tracking-[-0.03em] leading-[1.15] text-[var(--ink)] max-w-[18ch]">
            Perangkat ajar rapi, dalam hitungan menit.
          </h1>
          <p className="apple-sub mt-3 max-w-[46ch]">
            Susun Modul Ajar, RPP, Soal, dan perangkat kelas sesuai Permendikdasmen
            No. 13 Tahun 2025 — tanpa lembur di akhir pekan.
          </p>

          <ul className="mt-10 space-y-4 max-w-[46ch]">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-3">
                <span className="w-8 h-8 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink-soft)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--ink)]">{title}</p>
                  <p className="text-[12.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-end justify-between gap-4">
          <p className="flex items-center gap-2 text-[11.5px] text-[var(--muted)] max-w-[40ch]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Mode demo — akun Belajar.id resmi belum terhubung. Data tersimpan lokal di perangkat Anda.
          </p>
          <Maskot varian="wisuda" size={72} />
        </div>
      </aside>

      {/* ————— Panel kanan: formulir ————— */}
      <main className="flex flex-col min-h-screen bg-[var(--bg)]">
        <div className="lg:hidden px-5 py-4 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-semibold text-[var(--ink)]">Ruang Guru Merdeka</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:py-14">
          <div className="w-full max-w-[420px]">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
                {activeTab === 'login' ? 'Masuk ke ruang kerja' : 'Daftar sebagai guru'}
              </h2>
              <p className="apple-sub mt-1">
                {activeTab === 'login'
                  ? 'Gunakan email profil guru Anda untuk melanjutkan.'
                  : 'Ajukan akun baru — administrator akan memverifikasi.'}
              </p>
            </div>

            <div className="apple-card p-5 sm:p-6">
              <div className="flex justify-center">
                <div className="apple-segment w-full" role="tablist" aria-label="Masuk atau daftar">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'login'}
                    data-active={activeTab === 'login'}
                    className="flex-1"
                    onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'register'}
                    data-active={activeTab === 'register'}
                    className="flex-1"
                    onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                  >
                    Daftar
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  className="mt-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] text-[12.5px] font-medium px-3 py-2.5 focus:outline-none"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label className={labelCls} htmlFor="login-email">Email profil guru</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@sekolah.id"
                        className="apple-input !pl-9"
                        autoComplete="email"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['@guru.sd.belajar.id', '@guru.smp.belajar.id', '@guru.sma.belajar.id'].map((dom) => (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => setLoginEmail(`guru${dom}`)}
                          className="text-[11.5px] font-medium px-2 py-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)] hover:border-[var(--line-strong)] hover:text-[var(--ink)] transition-colors"
                        >
                          {dom}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11.5px] text-[var(--muted)] mt-2">
                      Hanya email sebagai identitas profil — tanpa kata sandi Belajar.id.
                    </p>
                  </div>

                  <button type="submit" disabled={isLoading} className="btn-apple w-full">
                    {isLoading ? 'Membuka ruang kerja…' : 'Lanjutkan'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <div className="pt-4 border-t border-[var(--line)]">
                    <p className="text-[12px] font-medium text-[var(--ink-soft)] mb-2">
                      Masuk cepat akun demo
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {demoUsers.slice(0, 4).map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(user)}
                          className="rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] transition-colors text-left p-2 flex items-center gap-2 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-[12px] shrink-0">
                            {user.name.charAt(0)}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[12.5px] font-semibold text-[var(--ink)] truncate">
                              {user.name}
                            </span>
                            <span className="block text-[11px] text-[var(--muted)] truncate">
                              {user.schoolName}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3">
                  <p className="text-[12px] bg-[var(--surface-2)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-[var(--ink-soft)]">
                    Profil baru berstatus <b className="text-[var(--ink)]">menunggu verifikasi</b> administrator
                    sebelum aktif penuh.
                  </p>
                  <div>
                    <label className={labelCls} htmlFor="reg-name">Nama lengkap & gelar *</label>
                    <input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Contoh: Rahmadani, S.Pd." className="apple-input" required autoComplete="name" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-email">Email Belajar.id *</label>
                    <input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="nama@guru.smp.belajar.id" className="apple-input" required autoComplete="email" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelCls} htmlFor="reg-jenjang">Jenjang</label>
                      <select id="reg-jenjang" value={regJenjang} onChange={(e) => setRegJenjang(e.target.value as Jenjang)} className="apple-input">
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                        <option value="SMK">SMK</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="reg-nip">
                        NIP <span className="font-normal text-[var(--muted)]">(opsional)</span>
                      </label>
                      <input id="reg-nip" value={regNip} onChange={(e) => setRegNip(e.target.value)} placeholder="19890412…" className="apple-input" inputMode="numeric" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-school">Sekolah *</label>
                    <input id="reg-school" value={regSchool} onChange={(e) => setRegSchool(e.target.value)} placeholder="SMP Negeri 1 Padang" className="apple-input" required autoComplete="organization" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="reg-mapel">Mata pelajaran</label>
                    <input id="reg-mapel" value={regMapel} onChange={(e) => setRegMapel(e.target.value)} placeholder="Matematika / IPA" className="apple-input" />
                  </div>
                  <button type="submit" disabled={isLoading} className="btn-apple w-full">
                    Daftarkan & ajukan verifikasi
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <p className="mt-5 text-center text-[11.5px] text-[var(--muted)] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Permendikdasmen No. 13 Tahun 2025 · Kurikulum Merdeka
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
