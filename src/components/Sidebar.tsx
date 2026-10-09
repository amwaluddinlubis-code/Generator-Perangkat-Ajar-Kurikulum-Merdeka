import React, { useEffect, useRef } from 'react';
import { TeacherUser } from '../types';
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
  ChevronUp,
  X,
} from 'lucide-react';

// REDESIGN: NavigationTarget diperluas dengan 3 target utama baru.
// Target lama (7 docType + profile + stats + repository + admin) TIDAK dihapus dari
// tipe — view gelombang 1 tetap dirender App; item lama kini diakses via menu pengguna.
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
  // REDESIGN: menu pengguna membutuhkan info user & aksi keluar
  currentUser?: TeacherUser | null;
  onLogout?: () => void;
}

// REDESIGN: Menu pengguna — avatar di kaki sidebar membuka dropdown DaisyUI
// berisi Profil, Statistik Saya, Admin (bila admin), dan Keluar.
const UserMenu: React.FC<{
  currentUser: TeacherUser | null | undefined;
  isCollapsed: boolean;
  pendingCount: number;
  onNavigate: (target: NavigationTarget) => void;
  onLogout?: () => void;
}> = ({ currentUser, isCollapsed, pendingCount, onNavigate, onLogout }) => {
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const initial = (currentUser?.name || '?').trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="dropdown dropdown-top dropdown-start w-full">
      <button
        tabIndex={0}
        role="button"
        onClick={(e) => e.currentTarget.focus()}
        className={`w-full flex items-center gap-2.5 rounded-2xl p-2 hover:bg-orange-100 dark:hover:bg-white/10 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        aria-label={`Menu pengguna ${currentUser?.name ?? ''}`}
        aria-haspopup="menu"
      >
        <span className="relative shrink-0">
          {/* FRIENDLY: avatar lingkaran gradasi hangat */}
          <span className="w-9 h-9 rounded-full bg-linear-to-br from-amber-500 to-orange-400 text-white dark:from-amber-300 dark:to-orange-200 dark:text-amber-950 flex items-center justify-center font-semibold text-[14px]">
            {initial}
          </span>
          {/* UX: badge antrean verifikasi tetap terlihat untuk admin */}
          {isAdmin && pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff9f0a] text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </span>
        {!isCollapsed && (
          <>
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-[13.5px] font-semibold truncate leading-tight">
                {currentUser?.name ?? 'Guru'}
              </span>
              <span className="block text-[11.5px] text-[#6e6e73] dark:text-[#98989d] truncate leading-tight">
                {isAdmin ? 'Admin' : 'Guru'}
              </span>
            </span>
            <ChevronUp className="w-4 h-4 text-[#6e6e73] dark:text-[#98989d] shrink-0" />
          </>
        )}
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-3xl z-[60] w-56 p-2 shadow-xl border border-amber-200/70 dark:border-white/15 mb-2"
        role="menu"
        aria-label="Menu pengguna"
      >
        <li role="none">
          <button role="menuitem" onClick={() => onNavigate('profile')} className="flex items-center gap-2.5">
            <User className="w-4 h-4" /> Profil
          </button>
        </li>
        <li role="none">
          <button role="menuitem" onClick={() => onNavigate('stats')} className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4" /> Statistik Saya
          </button>
        </li>
        {isAdmin && (
          <li role="none">
            <button role="menuitem" onClick={() => onNavigate('admin')} className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" /> Admin
              {pendingCount > 0 && (
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ff9f0a] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </li>
        )}
        <li role="none" aria-hidden="true" className="border-t border-black/10 dark:border-white/10 my-1" />
        <li role="none">
          <button role="menuitem" onClick={onLogout} className="flex items-center gap-2.5 text-error">
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

  // UX: drawer mobile tertutup dengan tombol Escape (pengguna keyboard)
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, setMobileOpen]);

  // UX: pindahkan fokus ke dalam drawer saat dibuka (screen reader & keyboard)
  useEffect(() => {
    if (mobileOpen) closeBtnRef.current?.focus();
  }, [mobileOpen]);

  // REDESIGN: navigasi ramping — 4 item utama saja (ikon lucide + label)
  const mainMenuItems: { target: NavigationTarget; label: string; sub: string; icon: React.ReactNode }[] = [
    { target: 'beranda', label: 'Beranda', sub: 'Ringkasan & mulai', icon: <Home className="w-[18px] h-[18px]" /> },
    { target: 'paket', label: 'Paket Saya', sub: 'Perangkat per kelas', icon: <Package className="w-[18px] h-[18px]" /> },
    { target: 'perpustakaan', label: 'Perpustakaan', sub: 'Bank perangkat sekolah', icon: <Library className="w-[18px] h-[18px]" /> },
    { target: 'guide', label: 'Panduan', sub: 'Kurikulum Merdeka', icon: <BookOpen className="w-[18px] h-[18px]" /> },
  ];

  const handleNavClick = (target: NavigationTarget) => {
    onSelectTarget(target);
    setMobileOpen(false);
  };

  // UX: tandai item navigasi yang aktif untuk pembaca layar
  const ariaCurrent = (active: boolean) => (active ? { 'aria-current': 'page' as const } : {});

  // FRIENDLY: item aktif bergradasi hangat amber→oranye (bukan hitam polos);
  // hover bernuansa peach. Varian dark tetap terbaca (teks amber tua di gradasi terang).
  const itemCls = (active: boolean) =>
    `w-full flex items-center gap-3 rounded-2xl text-left transition-all min-h-[52px] px-3 cursor-pointer ${
      active
        ? 'bg-linear-to-r from-amber-500 to-orange-400 text-white shadow-md shadow-amber-500/25 dark:from-amber-300 dark:to-orange-200 dark:text-amber-950'
        : 'hover:bg-orange-100 dark:hover:bg-white/10'
    }`;

  return (
    <>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden" />
      )}

      <aside
        // UX: perlakukan drawer mobile sebagai dialog modal aksesibel
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label="Navigasi utama"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 no-print border-r border-black/10 dark:border-white/15 ${
          mobileOpen ? 'translate-x-0 w-[300px]' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[84px]' : 'lg:w-[280px]'}`}
        style={{ background: 'var(--apple-nav)', backdropFilter: 'saturate(180%) blur(20px)' }}
      >
        {/* Brand */}
        <div className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-black/10 dark:border-white/15">
          {/* UX: beri nama tombol brand untuk screen reader */}
          <button onClick={() => handleNavClick('beranda')} className="flex items-center gap-2.5 overflow-hidden text-left cursor-pointer" aria-label="Ruang Guru Merdeka — ke Beranda">
            {/* FRIENDLY: ikon brand dalam kotak gradasi amber→ungu */}
            <div className="w-8 h-8 rounded-[10px] bg-linear-to-br from-amber-500 to-purple-600 text-white dark:from-amber-400 dark:to-purple-500 flex items-center justify-center shrink-0">
              <GraduationCap className="w-[18px] h-[18px]" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <p className="text-[14px] font-semibold tracking-tight">Ruang Guru</p>
                <p className="text-[11.5px] text-[#6e6e73]">Merdeka</p>
              </div>
            )}
          </button>
          <div className="flex items-center gap-1">
            {/* UX: umumkan status ciut/perluas sidebar ke pembaca layar */}
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-2 rounded-full hover:bg-orange-100 dark:hover:bg-white/10 transition-colors cursor-pointer" title={isCollapsed ? 'Perluas' : 'Ciutkan'} aria-label={isCollapsed ? 'Perluas bilah navigasi' : 'Ciutkan bilah navigasi'} aria-expanded={!isCollapsed}>
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {/* UX: tombol tutup drawer mobile punya label aksesibel + menerima fokus awal */}
            <button ref={closeBtnRef} onClick={() => setMobileOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-orange-100 dark:hover:bg-white/10 cursor-pointer" aria-label="Tutup menu navigasi">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav — REDESIGN: 4 item utama */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Menu utama">
          {mainMenuItems.map((item) => {
            const active = activeTarget === item.target;
            return (
              <button key={item.target} onClick={() => handleNavClick(item.target)} className={itemCls(active)} title={isCollapsed ? item.label : undefined} {...ariaCurrent(active)}>
                <span className={`shrink-0 ${active ? 'text-white dark:text-amber-950' : ''}`}>{item.icon}</span>
                {!isCollapsed && (
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[14px] font-semibold leading-tight truncate ${active ? 'text-white dark:text-amber-950' : ''}`}>{item.label}</span>
                    <span className={`block text-[12px] leading-tight ${active ? 'text-white/80 dark:text-amber-950/70' : 'text-[#6e6e73] dark:text-[#98989d]'}`}>{item.sub}</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* REDESIGN: menu pengguna (avatar) — dropdown DaisyUI */}
        <div className="p-3 border-t border-black/10 dark:border-white/15 shrink-0">
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
