import React from 'react';
import { TeacherUser, DocType } from '../types';
import { DOC_TYPE_INFO } from '../data/curriculumData';
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
  ChevronLeft, 
  ChevronRight, 
  UserCircle2, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  X,
  Compass,
  Award
} from 'lucide-react';

export type NavigationTarget = 
  | 'modul_ajar' 
  | 'rpp' 
  | 'soal_ujian' 
  | 'lkpd' 
  | 'kktp_atp' 
  | 'prota_promes' 
  | 'modul_p5' 
  | 'stats' 
  | 'repository' 
  | 'admin' 
  | 'guide';

interface SidebarProps {
  currentUser: TeacherUser;
  activeTarget: NavigationTarget;
  onSelectTarget: (target: NavigationTarget) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  pendingCount: number;
  docsCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTarget,
  onSelectTarget,
  onOpenAuthModal,
  onLogout,
  pendingCount,
  docsCount,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
  const isVerified = currentUser.status === 'VERIFIED';

  const docMenuItems: { type: DocType; label: string; badge: string; color: string; icon: React.ReactNode }[] = [
    {
      type: 'modul_ajar',
      label: 'Modul Ajar Lengkap',
      badge: 'PPA 2024',
      color: 'text-blue-600 bg-blue-50',
      icon: <FileText className="w-4 h-4 shrink-0 text-blue-600" />
    },
    {
      type: 'rpp',
      label: 'RPP Ringkas (1-2 Lembar)',
      badge: 'Supervisi',
      color: 'text-sky-600 bg-sky-50',
      icon: <Layers className="w-4 h-4 shrink-0 text-sky-600" />
    },
    {
      type: 'soal_ujian',
      label: 'Bank Soal & Asesmen Ujian',
      badge: 'AKM/HOTS',
      color: 'text-amber-600 bg-amber-50',
      icon: <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
    },
    {
      type: 'lkpd',
      label: 'Lembar Kerja Siswa (LKPD)',
      badge: 'Interaktif',
      color: 'text-emerald-600 bg-emerald-50',
      icon: <BookOpen className="w-4 h-4 shrink-0 text-emerald-600" />
    },
    {
      type: 'kktp_atp',
      label: 'ATP & Kriteria KKTP',
      badge: 'Matriks',
      color: 'text-indigo-600 bg-indigo-50',
      icon: <Target className="w-4 h-4 shrink-0 text-indigo-600" />
    },
    {
      type: 'prota_promes',
      label: 'Prota & Promes',
      badge: 'Tahunan',
      color: 'text-teal-600 bg-teal-50',
      icon: <Calendar className="w-4 h-4 shrink-0 text-teal-600" />
    },
    {
      type: 'modul_p5',
      label: 'Modul Projek P5',
      badge: '8 Tema',
      color: 'text-purple-600 bg-purple-50',
      icon: <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
    }
  ];

  const handleNavClick = (target: NavigationTarget) => {
    onSelectTarget(target);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/90 shadow-sm flex flex-col transition-all duration-300 ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-68'} no-print`}
      >
        
        {/* Brand & App Title Header */}
        <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleNavClick('modul_ajar')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shrink-0 ring-2 ring-white/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                    Ruang Guru
                  </span>
                  <span className="px-1.5 py-0.2 bg-blue-500/30 text-sky-200 text-[10px] font-bold rounded">
                    Merdeka
                  </span>
                </div>
                <p className="text-[10px] text-blue-200 font-medium truncate mt-0.5">
                  Belajar.id Kurikulum 2024
                </p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'Perluas Menu Sidebar' : 'Perkecil Menu Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          
          {/* SECTION 1: PERANGKAT AJAR (KATEGORI SPESIFIK) */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Perangkat Ajar</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded">
                  7 Format
                </span>
              </div>
            ) : (
              <div className="h-2 border-b border-slate-100 mb-2" />
            )}

            <div className="space-y-1">
              {docMenuItems.map((item) => {
                const isActive = activeTarget === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleNavClick(item.type)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all group cursor-pointer text-left ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : item.color}`}>
                      <span className={`inline-flex ${isActive ? 'text-white [&>svg]:text-white' : ''}`}>
                        {item.icon}
                      </span>
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 truncate flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: WORKSPACE & ARSIP */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Workspace & Analitik
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('stats')}
                title={isCollapsed ? 'Statistik Profil Guru' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTarget === 'stats'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTarget === 'stats' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                  <BarChart3 className="w-4 h-4 shrink-0" />
                </div>
                {!isCollapsed && (
                  <span className="truncate flex-1">Statistik & Profil D3</span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('repository')}
                title={isCollapsed ? 'Bank Arsip Perangkat' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTarget === 'repository'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTarget === 'repository' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Archive className="w-4 h-4 shrink-0" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 truncate flex items-center justify-between">
                    <span className="truncate">Bank Arsip Modul</span>
                    {docsCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        activeTarget === 'repository' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {docsCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 3: ADMINISTRASI & REGULASI */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Pusat Kontrol & Regulasi
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('admin')}
                title={isCollapsed ? 'Verifikasi Guru Belajar.id' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTarget === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTarget === 'admin' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 truncate flex items-center justify-between">
                    <span className="truncate">Verifikasi Guru Belajar.id</span>
                    {pendingCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500 text-white rounded-full animate-bounce">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                )}
              </button>

              <button
                onClick={() => handleNavClick('guide')}
                title={isCollapsed ? 'Panduan Regulasi 2024' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTarget === 'guide'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTarget === 'guide' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <FileCheck className="w-4 h-4 shrink-0" />
                </div>
                {!isCollapsed && (
                  <span className="truncate flex-1">Panduan PPA 2024</span>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* User Profile Footer Snapshot */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0">
          <div 
            onClick={onOpenAuthModal}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-white transition-all cursor-pointer text-left group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Klik untuk melihat profil atau ganti akun Belajar.id"
          >
            <div className="relative shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                isSuperAdmin ? 'bg-purple-600' : isVerified ? 'bg-blue-600' : 'bg-amber-600'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              {isVerified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 bg-white rounded-full absolute -bottom-1 -right-1" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-500 bg-white rounded-full absolute -bottom-1 -right-1" />
              )}
            </div>

            {!isCollapsed && (
              <div className="flex-1 truncate">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                    {currentUser.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser.email}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-[10px] font-semibold text-slate-600 truncate">
                    {isSuperAdmin ? 'Admin Verifikator' : isVerified ? 'Belajar.id Aktif' : 'Menunggu Admin'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Logout Button */}
          {!isCollapsed ? (
            <button
              type="button"
              onClick={onLogout}
              className="w-full mt-2 py-1.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group"
              title="Keluar dari akun Belajar.id"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Keluar / Logout</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              className="w-full mt-2 p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Keluar dari akun Belajar.id"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
            </button>
          )}
        </div>

      </aside>
    </>
  );
};
