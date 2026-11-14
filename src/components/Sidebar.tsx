import React, { useEffect, useRef } from 'react';
import { TeacherUser } from '../types';
import { Avatar } from './ui/Avatar';
import {
  GraduationCap,
  Home,
  Package,
  Library,
  BookOpen,
  User,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  X,
  FileText,
  ClipboardList,
  HelpCircle,
  NotebookPen,
  Target,
  CalendarRange,
  Sparkles,
  Archive,
} from 'lucide-react';

export type NavigationTarget =
  | 'beranda'
  | 'paket'
  | 'perpustakaan'
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
  | 'guide';

interface SidebarProps {
  activeTarget: NavigationTarget;
  onSelectTarget: (target: NavigationTarget) => void;
  pendingCount: number;
  docsCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  currentUser?: TeacherUser | null;
  onLogout?: () => void;
}

const UserMenu: React.FC<{
  currentUser: TeacherUser | null | undefined;
  isCollapsed: boolean;
  pendingCount: number;
  onNavigate: (target: NavigationTarget) => void;
  onLogout?: () => void;
}> = ({ currentUser, isCollapsed, pendingCount, onNavigate, onLogout }) => {
  const isAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'KEPALA_SEKOLAH';

  return (
    <div className="dropdown dropdown-top dropdown-start w-full">
      <button
        tabIndex={0}
        role="button"
        onClick={(e) => e.currentTarget.focus()}
        className={`w-full flex items-center gap-2.5 rounded-[10px] border border-transparent p-1.5 hover:bg-[var(--surface-2)] hover:border-[var(--line)] transition-colors cursor-pointer ${
          isCollapsed ? 'justify-center' : ''
        }`}
        aria-label={`Menu pengguna ${currentUser?.name ?? ''}`}
        aria-haspopup="menu"
      >
        <span className="relative shrink-0">
          <Avatar name={currentUser?.name ?? '?'} size={32} />
          {isAdmin && pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--surface)]">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </span>
        {!isCollapsed && (
          <>
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-[13px] font-semibold truncate leading-tight text-[var(--ink)]">
                {currentUser?.name ?? 'Guru'}
              </span>
              <span className="block text-[11px] text-[var(--muted)] truncate leading-tight mt-0.5">
                {isAdmin ? 'Administrator' : 'Guru'}
              </span>
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          </>
        )}
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-xl z-[60] w-56 p-1.5 shadow-xl border border-[var(--line)] mb-2"
        aria-label="Menu pengguna"
      >
        <li>
          <button type="button" onClick={() => onNavigate('profile')} className="flex items-center gap-2.5 rounded-lg text-[13px]">
            <User className="w-4 h-4" /> Profil
          </button>
        </li>
        <li>
          <button type="button" onClick={() => onNavigate('stats')} className="flex items-center gap-2.5 rounded-lg text-[13px]">
            <BarChart3 className="w-4 h-4" /> Statistik Saya
          </button>
        </li>
        {isAdmin && (
          <li>
            <button type="button" onClick={() => onNavigate('admin')} className="flex items-center gap-2.5 rounded-lg text-[13px]">
              <ShieldCheck className="w-4 h-4" /> Admin
              {pendingCount > 0 && (
                <span className="ml-auto text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--danger)] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </li>
        )}
        <li aria-hidden="true" className="border-t border-[var(--line)] my-1" />
        <li>
          <button type="button" onClick={onLogout} className="flex items-center gap-2.5 rounded-lg text-[13px] text-error">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </li>
      </ul>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTarget,
  onSelectTarget,
  pendingCount,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  currentUser,
  onLogout,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, setMobileOpen]);

  useEffect(() => {
    if (mobileOpen) closeBtnRef.current?.focus();
  }, [mobileOpen]);

  const mainMenuItems: { target: NavigationTarget; label: string; sub: string; icon: React.ReactNode }[] = [
    { target: 'beranda', label: 'Beranda', sub: 'Ringkasan & mulai', icon: <Home className="w-[17px] h-[17px]" /> },
    { target: 'paket', label: 'Paket Saya', sub: 'Perangkat per kelas', icon: <Package className="w-[17px] h-[17px]" /> },
    { target: 'perpustakaan', label: 'Perpustakaan', sub: 'Bank perangkat sekolah', icon: <Library className="w-[17px] h-[17px]" /> },
    { target: 'guide', label: 'Panduan', sub: 'Kurikulum Merdeka', icon: <BookOpen className="w-[17px] h-[17px]" /> },
  ];

  // UI-06: semua NavigationTarget wajib punya pintu masuk. Grup generator
  // satuan + arsip melengkapi menu utama agar tidak ada view yatim.
  const generatorItems: { target: NavigationTarget; label: string; icon: React.ReactNode }[] = [
    { target: 'modul_ajar', label: 'Modul Ajar', icon: <FileText className="w-[17px] h-[17px]" /> },
    { target: 'rpp', label: 'RPP Ringkas', icon: <ClipboardList className="w-[17px] h-[17px]" /> },
    { target: 'soal_ujian', label: 'Soal AKM/HOTS', icon: <HelpCircle className="w-[17px] h-[17px]" /> },
    { target: 'lkpd', label: 'LKPD', icon: <NotebookPen className="w-[17px] h-[17px]" /> },
    { target: 'kktp_atp', label: 'ATP & KKTP', icon: <Target className="w-[17px] h-[17px]" /> },
    { target: 'prota_promes', label: 'Prota & Promes', icon: <CalendarRange className="w-[17px] h-[17px]" /> },
    { target: 'modul_p5', label: 'Modul P5', icon: <Sparkles className="w-[17px] h-[17px]" /> },
  ];

  const handleNavClick = (target: NavigationTarget) => {
    onSelectTarget(target);
    setMobileOpen(false);
  };

  const ariaCurrent = (active: boolean) => (active ? { 'aria-current': 'page' as const } : {});

  // Item aktif: latar aksen lembut + teks aksen + garis penanda kiri.
  // Kontras teks aksen di atas latar lembut ≥ 7:1 pada kedua tema.
  const itemCls = (active: boolean) =>
    `group relative w-full flex items-center gap-2.5 rounded-[10px] text-left transition-colors min-h-[42px] px-2.5 cursor-pointer ${
      active
        ? 'bg-[var(--accent-soft)] text-[var(--accent-ink)]'
        : 'text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
    } ${isCollapsed ? 'justify-center !px-0' : ''}`;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.4)] backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label="Navigasi utama"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-200 no-print border-r border-[var(--line)] bg-[var(--surface)] ${
          mobileOpen ? 'translate-x-0 w-[268px]' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[264px]'}`}
      >
        {/* Brand */}
        <div
          className={`h-[60px] flex items-center shrink-0 border-b border-[var(--line)] ${
            isCollapsed ? 'justify-center px-0' : 'px-3.5 justify-between'
          }`}
        >
          <button
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-2.5 overflow-hidden text-left cursor-pointer min-w-0"
            aria-label="Ruang Guru Merdeka — ke Beranda"
          >
            <div className="w-8 h-8 rounded-[9px] bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="w-[17px] h-[17px]" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight min-w-0">
                <p className="text-[13.5px] font-semibold text-[var(--ink)] truncate">Ruang Guru</p>
                <p className="text-[11px] text-[var(--muted)] truncate">Merdeka</p>
              </div>
            )}
          </button>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              title={isCollapsed ? 'Perluas' : 'Ciutkan'}
              aria-label={isCollapsed ? 'Perluas bilah navigasi' : 'Ciutkan bilah navigasi'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              ref={closeBtnRef}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Menu utama">
          {!isCollapsed && (
            <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              Menu
            </p>
          )}
          {mainMenuItems.map((item) => {
            const active = activeTarget === item.target;
            return (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={itemCls(active)}
                title={isCollapsed ? item.label : undefined}
                {...ariaCurrent(active)}
              >
                {active && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-[var(--accent)]" />
                )}
                <span className={`shrink-0 ${active ? 'text-[var(--accent)]' : ''}`}>{item.icon}</span>
                {!isCollapsed && (
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-medium leading-tight truncate">{item.label}</span>
                    <span
                      className={`block text-[11px] leading-tight truncate mt-0.5 ${
                        active ? 'text-[var(--accent-ink)] opacity-80' : 'text-[var(--muted)]'
                      }`}
                    >
                      {item.sub}
                    </span>
                  </span>
                )}
              </button>
            );
          })}

          {!isCollapsed && (
            <p className="px-2.5 pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              Generator Satuan
            </p>
          )}
          {isCollapsed && <div className="pt-3" />}
          {generatorItems.map((item) => {
            const active = activeTarget === item.target;
            return (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={itemCls(active)}
                title={isCollapsed ? item.label : undefined}
                {...ariaCurrent(active)}
              >
                {active && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-[var(--accent)]" />
                )}
                <span className={`shrink-0 ${active ? 'text-[var(--accent)]' : ''}`}>{item.icon}</span>
                {!isCollapsed && (
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-medium leading-tight truncate">{item.label}</span>
                  </span>
                )}
              </button>
            );
          })}

          {!isCollapsed && (
            <p className="px-2.5 pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              Arsip
            </p>
          )}
          {isCollapsed && <div className="pt-3" />}
          <button
            onClick={() => handleNavClick('repository')}
            className={itemCls(activeTarget === 'repository')}
            title={isCollapsed ? 'Arsip Dokumen' : undefined}
            {...ariaCurrent(activeTarget === 'repository')}
          >
            {activeTarget === 'repository' && !isCollapsed && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-[var(--accent)]" />
            )}
            <span className={`shrink-0 ${activeTarget === 'repository' ? 'text-[var(--accent)]' : ''}`}>
              <Archive className="w-[17px] h-[17px]" />
            </span>
            {!isCollapsed && (
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-medium leading-tight truncate">Arsip Dokumen</span>
              </span>
            )}
          </button>
        </nav>

        {/* Menu pengguna */}
        <div className="p-2 border-t border-[var(--line)] shrink-0">
          <UserMenu
            currentUser={currentUser}
            isCollapsed={isCollapsed}
            pendingCount={pendingCount}
            onNavigate={handleNavClick}
            onLogout={onLogout}
          />
        </div>
      </aside>
    </>
  );
};
