import React from 'react';
import { DocType } from '../types';
import {
  GraduationCap,
  FileText,
  Layers,
  HelpCircle,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
  BarChart3,
  Archive,
  ShieldCheck,
  Building2,
  FileCheck,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export type NavigationTarget =
  | 'modul_ajar'
  | 'rpp'
  | 'soal_ujian'
  | 'lkpd'
  | 'kktp_atp'
  | 'prota_promes'
  | 'modul_p5'
  | 'profile'
  | 'stats'
  | 'repository'
  | 'admin'
  | 'school'
  | 'guide';

interface SidebarProps {
  activeTarget: NavigationTarget;
  onSelectTarget: (target: NavigationTarget) => void;
  pendingCount: number;
  docsCount: number;
  isAdmin: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTarget,
  onSelectTarget,
  pendingCount,
  docsCount,
  isAdmin,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const docMenuItems: { type: DocType; label: string; sub: string; icon: React.ReactNode }[] = [
    { type: 'modul_ajar', label: 'Modul Ajar', sub: 'Lengkap · PPA', icon: <FileText className="h-[18px] w-[18px]" /> },
    { type: 'rpp', label: 'RPP Ringkas', sub: '1–2 lembar', icon: <Layers className="h-[18px] w-[18px]" /> },
    { type: 'soal_ujian', label: 'Soal & Asesmen', sub: 'AKM · HOTS', icon: <HelpCircle className="h-[18px] w-[18px]" /> },
    { type: 'lkpd', label: 'LKPD', sub: 'Siap cetak', icon: <BookOpen className="h-[18px] w-[18px]" /> },
    { type: 'kktp_atp', label: 'ATP & KKTP', sub: 'Matriks', icon: <Target className="h-[18px] w-[18px]" /> },
    { type: 'prota_promes', label: 'Prota & Promes', sub: 'Tahunan', icon: <Calendar className="h-[18px] w-[18px]" /> },
    { type: 'modul_p5', label: 'Modul P5', sub: 'Proyek', icon: <Sparkles className="h-[18px] w-[18px]" /> },
  ];

  const workspaceItems: { target: NavigationTarget; label: string; icon: React.ReactNode; count?: number }[] = [
    { target: 'profile', label: 'Profil saya', icon: <UserCircle2 className="h-[18px] w-[18px]" /> },
    { target: 'repository', label: 'Arsip dokumen', icon: <Archive className="h-[18px] w-[18px]" />, count: docsCount },
    { target: 'stats', label: 'Statistik', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    { target: 'guide', label: 'Panduan', icon: <FileCheck className="h-[18px] w-[18px]" /> },
  ];

  const handleNavClick = (target: NavigationTarget) => {
    onSelectTarget(target);
    setMobileOpen(false);
  };

  const navButton = (target: NavigationTarget, label: string, icon: React.ReactNode, count?: number) => {
    const active = activeTarget === target;
    return (
      <button
        key={target}
        type="button"
        onClick={() => handleNavClick(target)}
        data-active={active}
        aria-current={active ? 'page' : undefined}
        title={isCollapsed ? label : undefined}
        className="apple-sidebar-item"
      >
        <span className="shrink-0">{icon}</span>
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-[13.5px] font-semibold">{label}</span>
            {typeof count === 'number' && count > 0 && (
              <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5 text-[11px] font-bold text-[var(--app-text-secondary)]">
                {count}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          'apple-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-[width,transform] duration-300 no-print',
          mobileOpen ? 'translate-x-0 w-[292px]' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'lg:w-[78px]' : 'lg:w-[272px]',
        ].join(' ')}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--app-border)] px-4">
          <button
            type="button"
            onClick={() => handleNavClick('modul_ajar')}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--app-text)] text-[var(--app-bg)] shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            {!isCollapsed && (
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[14px] font750 font-bold tracking-[-.02em]">Ruang Guru</span>
                <span className="mt-0.5 block truncate text-[11.5px] font-medium text-[var(--app-text-tertiary)]">Merdeka</span>
              </span>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden rounded-full p-2 text-[var(--app-text-secondary)] transition-colors hover:bg-[var(--app-surface-muted)] lg:flex"
              title={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
              aria-label={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full p-2 text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)] lg:hidden"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="Navigasi utama">
          <section>
            {!isCollapsed && <p className="section-label px-3 pb-2.5">Buat perangkat</p>}
            <div className="space-y-1">
              {docMenuItems.map((item) => navButton(item.type, item.label, item.icon))}
            </div>
          </section>

          <div className="my-5 h-px bg-[var(--app-border)]" />

          <section>
            {!isCollapsed && <p className="section-label px-3 pb-2.5">Ruang kerja</p>}
            <div className="space-y-1">
              {workspaceItems.map((item) => navButton(item.target, item.label, item.icon, item.count))}
              {isAdmin && navButton(
                'admin',
                'Verifikasi guru',
                <ShieldCheck className="h-[18px] w-[18px]" />,
                pendingCount
              )}
              {isAdmin && navButton(
                'school',
                'Identitas sekolah',
                <Building2 className="h-[18px] w-[18px]" />
              )}
            </div>
          </section>
        </nav>

        <div className="shrink-0 border-t border-[var(--app-border)] p-3">
          <div className={isCollapsed ? 'flex justify-center' : 'rounded-[16px] bg-[var(--app-surface-muted)] px-3 py-3'}>
            {isCollapsed ? (
              <span className="h-2 w-2 rounded-full bg-[var(--app-accent)]" aria-hidden="true" />
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold">Ruang kerja</span>
                  <span className="status-chip !min-h-[24px] !px-2 !py-0 text-[10.5px]">
                    {docsCount} dokumen
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-[var(--app-text-tertiary)]">
                  Pilih perangkat dari menu untuk mulai menyusun.
                </p>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
