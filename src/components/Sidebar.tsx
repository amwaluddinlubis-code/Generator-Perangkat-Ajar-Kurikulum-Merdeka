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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTarget,
  onSelectTarget,
  pendingCount,
  docsCount,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {

  const docMenuItems: { type: DocType; label: string; sub: string; icon: React.ReactNode }[] = [
    { type: 'modul_ajar', label: 'Modul Ajar', sub: 'Lengkap · PPA', icon: <FileText className="w-[18px] h-[18px]" /> },
    { type: 'rpp', label: 'RPP Ringkas', sub: '1–2 lembar', icon: <Layers className="w-[18px] h-[18px]" /> },
    { type: 'soal_ujian', label: 'Soal & Asesmen', sub: 'AKM · HOTS', icon: <HelpCircle className="w-[18px] h-[18px]" /> },
    { type: 'lkpd', label: 'LKPD', sub: 'Siap cetak', icon: <BookOpen className="w-[18px] h-[18px]" /> },
    { type: 'kktp_atp', label: 'ATP & KKTP', sub: 'Matriks', icon: <Target className="w-[18px] h-[18px]" /> },
    { type: 'prota_promes', label: 'Prota & Promes', sub: 'Tahunan', icon: <Calendar className="w-[18px] h-[18px]" /> },
    { type: 'modul_p5', label: 'Modul Projek', sub: '8 tema', icon: <Sparkles className="w-[18px] h-[18px]" /> },
  ];

  const handleNavClick = (target: NavigationTarget) => {
    onSelectTarget(target);
    setMobileOpen(false);
  };

  const itemCls = (active: boolean) =>
    `w-full flex items-center gap-3 rounded-2xl text-left transition-all min-h-[52px] px-3 cursor-pointer ${
      active
        ? 'bg-black text-white dark:bg-white dark:text-black'
        : 'hover:bg-black/5 dark:hover:bg-white/10'
    }`;

  return (
    <>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden" />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 no-print border-r border-black/10 dark:border-white/15 ${
          mobileOpen ? 'translate-x-0 w-[300px]' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[84px]' : 'lg:w-[280px]'}`}
        style={{ background: 'var(--apple-nav)', backdropFilter: 'saturate(180%) blur(20px)' }}
      >
        {/* Brand */}
        <div className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-black/10 dark:border-white/15">
          <button onClick={() => handleNavClick('modul_ajar')} className="flex items-center gap-2.5 overflow-hidden text-left cursor-pointer">
            <div className="w-8 h-8 rounded-[10px] bg-black dark:bg-white dark:text-black text-white flex items-center justify-center shrink-0">
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
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer" title={isCollapsed ? 'Perluas' : 'Ciutkan'}>
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          <div>
            {!isCollapsed && <p className="px-3 pb-2 text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Buat perangkat</p>}
            <div className="space-y-1">
              {docMenuItems.map((item) => {
                const active = activeTarget === item.type;
                return (
                  <button key={item.type} onClick={() => handleNavClick(item.type)} className={itemCls(active)} title={isCollapsed ? item.label : undefined}>
                    <span className={`shrink-0 ${active ? 'text-white dark:text-black' : ''}`}>{item.icon}</span>
                    {!isCollapsed && (
                      <span className="flex-1 min-w-0">
                        <span className={`block text-[14px] font-semibold leading-tight truncate ${active ? 'text-white dark:text-black' : ''}`}>{item.label}</span>
                        <span className={`block text-[12px] leading-tight ${active ? 'text-white/70 dark:text-black/60' : 'text-[#6e6e73] dark:text-[#98989d]'}`}>{item.sub}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            {!isCollapsed && <p className="px-3 pb-2 text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Ruang kerja</p>}
            <div className="space-y-1">
              <button onClick={() => handleNavClick('profile')} className={itemCls(activeTarget === 'profile')} title={isCollapsed ? 'Profil saya' : undefined}>
                <UserCircle2 className="w-[18px] h-[18px] shrink-0" />
                {!isCollapsed && <span className="text-[14px] font-semibold">Profil saya</span>}
              </button>
              <button onClick={() => handleNavClick('repository')} className={itemCls(activeTarget === 'repository')} title={isCollapsed ? 'Arsip' : undefined}>
                <Archive className="w-[18px] h-[18px] shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 flex items-center justify-between text-[14px] font-semibold">
                    Arsip
                    {docsCount > 0 && <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/15">{docsCount}</span>}
                  </span>
                )}
              </button>
              <button onClick={() => handleNavClick('stats')} className={itemCls(activeTarget === 'stats')} title={isCollapsed ? 'Statistik' : undefined}>
                <BarChart3 className="w-[18px] h-[18px] shrink-0" />
                {!isCollapsed && <span className="text-[14px] font-semibold">Statistik</span>}
              </button>
              <button onClick={() => handleNavClick('admin')} className={itemCls(activeTarget === 'admin')} title={isCollapsed ? 'Verifikasi' : undefined}>
                <ShieldCheck className="w-[18px] h-[18px] shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 flex items-center justify-between text-[14px] font-semibold">
                    Verifikasi
                    {pendingCount > 0 && <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-[#ff9f0a] text-white">{pendingCount}</span>}
                  </span>
                )}
              </button>
              <button onClick={() => handleNavClick('guide')} className={itemCls(activeTarget === 'guide')} title={isCollapsed ? 'Panduan' : undefined}>
                <FileCheck className="w-[18px] h-[18px] shrink-0" />
                {!isCollapsed && <span className="text-[14px] font-semibold">Panduan</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Catatan kecil — profil & keluar tersedia di bilah atas */}
        <div className="p-3 border-t border-black/10 dark:border-white/15 shrink-0">
          {!isCollapsed && (
            <p className="text-[11.5px] text-center text-[#86868b]">
              Profil & keluar via bilah atas
            </p>
          )}
        </div>
      </aside>
    </>
  );
};
