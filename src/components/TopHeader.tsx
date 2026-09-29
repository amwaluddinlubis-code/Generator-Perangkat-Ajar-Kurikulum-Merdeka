import React from 'react';
import { TeacherUser, DocType } from '../types';
import { NavigationTarget } from './Sidebar';
import { DOC_TYPE_INFO } from '../data/curriculumData';
import { 
  Menu, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  UserCircle2, 
  ChevronRight, 
  HelpCircle,
  FileCheck,
  Award,
  Layers,
  FileText,
  LogOut
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
  onOpenGuideModal,
  onLogout,
  pendingCount
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
  const isVerified = currentUser.status === 'VERIFIED';

  // Determine breadcrumb title
  const getBreadcrumbTitle = (): { category: string; title: string; badge?: string } => {
    if (activeTarget === 'stats') {
      return { category: 'Workspace Guru', title: 'Dashboard Statistik & Analitik (d3.js)' };
    }
    if (activeTarget === 'repository') {
      return { category: 'Workspace Guru', title: 'Bank Arsip Dokumen Perangkat Ajar' };
    }
    if (activeTarget === 'admin') {
      return { category: 'Pusat Kontrol', title: 'Verifikasi & Validasi Guru Belajar.id' };
    }
    if (activeTarget === 'guide') {
      return { category: 'Regulasi Kurikulum', title: 'Panduan Permendikbudristek No. 12 Tahun 2024' };
    }

    const docInfo = DOC_TYPE_INFO[activeTarget as DocType];
    return {
      category: 'Penyusun Perangkat Ajar',
      title: docInfo ? docInfo.label : 'Generator Perangkat Ajar',
      badge: docInfo?.badge
    };
  };

  const breadcrumb = getBreadcrumbTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs no-print">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white px-4 py-1 text-[11px] font-medium flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
            ✓ Permendikbudristek No. 12/2024
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:inline text-blue-100">
            Panduan Pembelajaran & Asesmen (PPA 2024)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Akun Belajar.id
          </span>
          <button
            onClick={onOpenGuideModal}
            className="text-white/80 hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Info Regulasi
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              {breadcrumb.category}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {breadcrumb.title}
              </h2>
              {breadcrumb.badge && (
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {breadcrumb.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick User Profile & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Status Badge */}
          {isSuperAdmin ? (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Super Admin
            </span>
          ) : isVerified ? (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Terverifikasi Belajar.id
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 text-xs font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Menunggu Verifikasi
            </span>
          )}

          {/* User Profile Trigger Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all text-left shadow-2xs group cursor-pointer"
            title="Kelola Profil / Ganti Akun Belajar.id"
          >
            <div className="relative">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                isSuperAdmin ? 'bg-purple-600' : isVerified ? 'bg-blue-600' : 'bg-amber-600'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {currentUser.schoolName}
              </p>
            </div>
          </button>

          {/* Quick Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-2xs"
            title="Keluar / Logout dari Sistem"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
