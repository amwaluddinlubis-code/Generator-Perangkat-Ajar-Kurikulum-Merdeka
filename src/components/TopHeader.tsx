import React from 'react';
import { TeacherUser, DocType } from '../types';
import { NavigationTarget } from './Sidebar';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { useTheme } from '../theme';
import { Menu, CheckCircle2, Clock, ShieldCheck, ChevronRight, LogOut, Sun, Moon } from 'lucide-react';

interface TopHeaderProps {
  currentUser: TeacherUser;
  activeTarget: NavigationTarget;
  onOpenAuthModal: () => void;
  onOpenMobileSidebar: () => void;
  onOpenGuideModal: () => void;
  onLogout: () => void;
  pendingCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  activeTarget,
  onOpenAuthModal,
  onOpenMobileSidebar,
  onLogout,
}) => {
  const { theme, toggle } = useTheme();
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
  const isVerified = currentUser.status === 'VERIFIED';

  const getTitle = (): { kicker: string; title: string } => {
    // REDESIGN: judul untuk target navigasi baru Gelombang 1
    if (activeTarget === 'beranda') return { kicker: 'Ruang Guru Merdeka', title: 'Beranda' };
    if (activeTarget === 'paket') return { kicker: 'Ruang kerja', title: 'Paket Saya' };
    if (activeTarget === 'perpustakaan') return { kicker: 'Ruang kerja', title: 'Perpustakaan' };
    if (activeTarget === 'profile') return { kicker: 'Ruang kerja', title: 'Profil saya' };
    if (activeTarget === 'stats') return { kicker: 'Ruang kerja', title: 'Statistik' };
    if (activeTarget === 'repository') return { kicker: 'Ruang kerja', title: 'Arsip dokumen' };
    if (activeTarget === 'admin') return { kicker: 'Admin', title: 'Verifikasi guru' };
    if (activeTarget === 'guide') return { kicker: 'Regulasi', title: 'Panduan Kurikulum Merdeka' };
    const info = DOC_TYPE_INFO[activeTarget as DocType];
    return { kicker: 'Buat perangkat', title: info ? info.label : 'Generator' };
  };
  const t = getTitle();

  return (
    <header className="sticky top-0 z-30 apple-nav no-print">
      <div className="px-4 sm:px-8 lg:px-12 h-[60px] flex items-center justify-between gap-3 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onOpenMobileSidebar} className="lg:hidden p-2.5 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" aria-label="Buka menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#6e6e73] dark:text-[#98989d] flex items-center gap-1 leading-none">
              {t.kicker} <ChevronRight className="w-3 h-3" />
            </p>
            <h2 className="text-[17px] font-semibold tracking-tight truncate leading-tight">{t.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10">
            {isSuperAdmin ? <><ShieldCheck className="w-3.5 h-3.5" /> Admin</>
            : isVerified ? <><CheckCircle2 className="w-3.5 h-3.5 text-[#30b158]" /> Terverifikasi</>
            : <><Clock className="w-3.5 h-3.5 text-[#ff9f0a]" /> Menunggu verifikasi</>}
          </span>

          {/* Toggle tema */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px] text-[#424245] dark:text-[#f5f5f7]" />}
          </button>

          {/* UX: label aksesibel eksplisit (title saja tak selalu dibaca screen reader) */}
          <button onClick={onOpenAuthModal} className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer" title="Profil" aria-label={`Profil ${currentUser.name} — buka pengaturan akun`}>
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-semibold text-[13px]">
              {currentUser.name.charAt(0)}
            </div>
            <span className="hidden sm:block text-[13.5px] font-semibold max-w-[140px] truncate">{currentUser.name}</span>
          </button>
          {/* UX: label aksesibel eksplisit untuk tombol keluar */}
          <button onClick={onLogout} className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer" title="Keluar" aria-label="Keluar dari akun">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
