import React from 'react';
import { TeacherUser, DocType } from '../types';
import { NavigationTarget } from './Sidebar';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { useTheme } from '../theme';
import {
  Menu,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

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
  const isSuperAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'KEPALA_SEKOLAH';
  const isVerified = currentUser.status === 'VERIFIED';

  const getTitle = (): { section: string; title: string } => {
    if (activeTarget === 'beranda') return { section: 'Ruang kerja', title: 'Beranda' };
    if (activeTarget === 'paket') return { section: 'Ruang kerja', title: 'Paket Saya' };
    if (activeTarget === 'perpustakaan') return { section: 'Ruang kerja', title: 'Perpustakaan' };
    if (activeTarget === 'profile') return { section: 'Akun', title: 'Profil saya' };
    if (activeTarget === 'stats') return { section: 'Akun', title: 'Statistik' };
    if (activeTarget === 'repository') return { section: 'Arsip', title: 'Arsip dokumen' };
    if (activeTarget === 'admin') return { section: 'Administrasi', title: 'Verifikasi guru' };
    if (activeTarget === 'guide') return { section: 'Referensi', title: 'Panduan Kurikulum Merdeka' };
    const info = DOC_TYPE_INFO[activeTarget as DocType];
    return { section: 'Generator', title: info ? info.label : 'Buat perangkat' };
  };
  const t = getTitle();

  return (
    <header className="sticky top-0 z-30 apple-nav no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 -ml-1.5 rounded-md text-[var(--ink-soft)] hover:bg-[var(--surface-2)] cursor-pointer"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex items-baseline gap-2">
            <span className="hidden sm:inline text-[12.5px] text-[var(--muted)] whitespace-nowrap">
              {t.section}
            </span>
            <span className="hidden sm:inline text-[12.5px] text-[var(--line-strong)]">/</span>
            <h1 className="text-[14.5px] font-semibold tracking-[-0.01em] text-[var(--ink)] truncate">
              {t.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]">
            {isSuperAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> Admin
              </>
            ) : isVerified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)]" /> Terverifikasi
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-[var(--warn)]" /> Menunggu verifikasi
              </>
            )}
          </span>

          <button
            onClick={toggle}
            className="p-2 rounded-md text-[var(--ink-soft)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          >
            {theme === 'dark' ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
          </button>

          <div className="w-px h-5 bg-[var(--line)] mx-1.5" aria-hidden="true" />

          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            title="Profil"
            aria-label={`${currentUser.name} — buka pengaturan akun`}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold text-[12px]">
              {currentUser.name.charAt(0)}
            </div>
            <span className="hidden sm:block text-[13px] font-medium text-[var(--ink)] max-w-[130px] truncate">
              {currentUser.name}
            </span>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-md text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] transition-colors cursor-pointer"
            title="Keluar"
            aria-label="Keluar dari akun"
          >
            <LogOut className="w-[17px] h-[17px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
