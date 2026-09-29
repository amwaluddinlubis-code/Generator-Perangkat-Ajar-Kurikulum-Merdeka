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
  ChevronRight,
  LogOut,
  Sun,
  Moon,
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
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const isVerified = currentUser.status === 'VERIFIED';

  const getTitle = (): { kicker: string; title: string } => {
    if (activeTarget === 'profile') return { kicker: 'Ruang kerja', title: 'Profil saya' };
    if (activeTarget === 'stats') return { kicker: 'Ruang kerja', title: 'Statistik' };
    if (activeTarget === 'repository') return { kicker: 'Ruang kerja', title: 'Arsip dokumen' };
    if (activeTarget === 'admin') return { kicker: 'Administrasi', title: 'Verifikasi guru' };
    if (activeTarget === 'school') return { kicker: 'Administrasi', title: 'Identitas sekolah' };
    if (activeTarget === 'guide') return { kicker: 'Referensi', title: 'Panduan Kurikulum' };
    const info = DOC_TYPE_INFO[activeTarget as DocType];
    return { kicker: 'Buat perangkat', title: info?.label || 'Generator' };
  };

  const page = getTitle();

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-5 lg:px-7 no-print">
      <div className="apple-nav mx-auto flex h-[58px] max-w-[1440px] items-center justify-between gap-3 rounded-[18px] border px-3 shadow-sm sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="rounded-full p-2.5 text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-muted)] lg:hidden"
            aria-label="Buka navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--app-text-tertiary)]">
              <span>{page.kicker}</span>
              <ChevronRight className="h-3 w-3" />
            </div>
            <h1 className="truncate text-[16px] font-bold tracking-[-.025em]">{page.title}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="status-chip hidden sm:inline-flex">
            {isAdmin ? (
              <><ShieldCheck className="h-3.5 w-3.5" /> Administrator</>
            ) : isVerified ? (
              <><CheckCircle2 className="h-3.5 w-3.5 text-[var(--app-success)]" /> Terverifikasi</>
            ) : (
              <><Clock className="h-3.5 w-3.5 text-[var(--app-warning)]" /> Menunggu</>
            )}
          </div>

          <button
            type="button"
            onClick={toggle}
            className="rounded-full p-2.5 text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-muted)]"
            title={theme === 'dark' ? 'Gunakan mode terang' : 'Gunakan mode gelap'}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 rounded-full p-1.5 pr-3 transition-colors hover:bg-[var(--app-surface-muted)]"
            title="Buka profil"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-text)] text-[12px] font-bold text-[var(--app-bg)]">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-[160px] truncate text-[13px] font-semibold sm:block">
              {currentUser.name}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-full p-2.5 text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-danger)]"
            title="Keluar"
            aria-label="Keluar"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
