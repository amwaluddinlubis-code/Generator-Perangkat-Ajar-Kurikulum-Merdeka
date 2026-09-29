import React from 'react';
import { TeacherUser } from '../types';
import { 
  BookOpen, 
  Sparkles, 
  Archive, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  UserCircle2, 
  GraduationCap, 
  FileCheck,
  ChevronDown,
  Info
} from 'lucide-react';

interface NavbarProps {
  currentUser: TeacherUser;
  activeTab: 'generator' | 'repository' | 'admin' | 'guide' | 'stats';
  setActiveTab: (tab: 'generator' | 'repository' | 'admin' | 'guide' | 'stats') => void;
  onOpenAuthModal: () => void;
  pendingCount: number;
  docsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  pendingCount,
  docsCount
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
  const isVerified = currentUser.status === 'VERIFIED';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      {/* Top Compliance Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
            ✓ Permendikbudristek No. 12 Tahun 2024
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden md:inline text-slate-200">
            Panduan Pembelajaran & Asesmen (PPA 2024) • BSKAP No. 032/H/KR/2024
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Terintegrasi Akun Belajar.id
          </span>
          <button
            onClick={() => setActiveTab('guide')}
            className="text-white/80 hover:text-white underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3 h-3" />
            Panduan Regulasi
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Ruang Guru Merdeka
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Belajar.id
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Penyusun Modul Ajar, RPP, Soal Ujian & Perangkat Kelas SD • SMP • SMA
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Generator Ajar
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Statistik Profil
            </button>

            <button
              onClick={() => setActiveTab('repository')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'repository'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Archive className="w-4 h-4 text-indigo-500" />
              Bank Arsip
              {docsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-xs rounded-full font-bold">
                  {docsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 relative cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verifikasi Guru
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-xs rounded-full font-bold animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileCheck className="w-4 h-4 text-slate-500" />
              Regulasi
            </button>
          </nav>

          {/* User Account / Belajar.id Switcher & Quick Stats Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 transition-all shadow-2xs overflow-hidden">
              <button
                onClick={() => setActiveTab('stats')}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 text-left group cursor-pointer"
                title="Lihat Dashboard Statistik Profil Guru"
              >
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    isSuperAdmin ? 'bg-purple-600' : isVerified ? 'bg-blue-600' : 'bg-amber-600'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  {isVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 bg-white rounded-full absolute -bottom-0.5 -right-0.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500 bg-white rounded-full absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>

                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate max-w-[120px] md:max-w-[150px]">
                      {currentUser.name}
                    </p>
                    {isSuperAdmin && (
                      <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className="truncate max-w-[110px]">{currentUser.schoolName}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="px-2 py-3 border-l border-slate-100 hover:bg-blue-100/50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                title="Ganti Akun Belajar.id"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'generator' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generator Ajar
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Statistik Profil
          </button>

          <button
            onClick={() => setActiveTab('repository')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'repository' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Bank Arsip ({docsCount})
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verifikasi Guru {pendingCount > 0 && `(${pendingCount})`}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Regulasi 2024
          </button>
        </div>
      </div>
    </header>
  );
};
