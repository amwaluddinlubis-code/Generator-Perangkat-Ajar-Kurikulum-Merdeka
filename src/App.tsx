import React, { useState, useEffect } from 'react';
import { 
  TeacherUser, 
  EducationalDocument, 
  GeneratorParams, 
  DocType,
  Jenjang 
} from './types';
import { Sidebar, NavigationTarget } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { GeneratorForm } from './components/GeneratorForm';
import { DocumentViewer } from './components/DocumentViewer';
import { TeacherVerificationPanel } from './components/TeacherVerificationPanel';
import { DocumentRepository } from './components/DocumentRepository';
import { BelajarIdAuthModal } from './components/BelajarIdAuthModal';
import { CurriculumGuideModal } from './components/CurriculumGuideModal';
import { UserProfileStatsDashboard } from './components/UserProfileStatsDashboard';
import { LoginPage } from './components/LoginPage';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  BookOpen,
  BarChart3,
  Layers,
  Target,
  Calendar,
  LogOut
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<TeacherUser | null>(() => {
    // Check if user previously logged out
    const isLoggedOut = localStorage.getItem('ruang_guru_logged_out');
    if (isLoggedOut === 'true') {
      return null;
    }
    // Check if cached user session exists
    const cachedUser = localStorage.getItem('ruang_guru_current_user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        // ignore
      }
    }
    // Default fallback
    return {
      id: 'user-admin-1',
      name: 'Amwaluddin Lubis, M.Pd.',
      email: 'amwaluddin.lubis@gmail.com',
      schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
      nip: '19820514 200801 1 008',
      jenjang: 'SMA',
      mataPelajaran: 'Pengawas Kurikulum & Bahasa',
      role: 'SUPER_ADMIN',
      status: 'VERIFIED',
      registeredAt: '2026-01-10T08:00:00.000Z',
      verifiedAt: '2026-01-10T08:00:00.000Z',
      verifiedBy: 'Sistem Pusat Belajar.id'
    };
  });

  const [users, setUsers] = useState<TeacherUser[]>([]);
  const [documents, setDocuments] = useState<EducationalDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<EducationalDocument | null>(null);
  
  // Navigation State with dedicated sidebar targets
  const [activeTarget, setActiveTarget] = useState<NavigationTarget>('modul_ajar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data from server
  const loadInitialData = async () => {
    try {
      // 1. Current user (if not logged out)
      const isLoggedOut = localStorage.getItem('ruang_guru_logged_out');
      if (isLoggedOut !== 'true') {
        const userRes = await fetch('/api/users/current');
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user && !currentUser) {
            setCurrentUser(userData.user);
            localStorage.setItem('ruang_guru_current_user', JSON.stringify(userData.user));
          }
        }
      }

      // 2. All users list
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.users) setUsers(usersData.users);
      }

      // 3. Documents
      const docsRes = await fetch('/api/documents');
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        if (docsData.documents) {
          setDocuments(docsData.documents);
          if (docsData.documents.length > 0 && !currentDoc) {
            setCurrentDoc(docsData.documents[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server connecting or loading offline defaults:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle Login / Belajar.id Switcher
  const handleLogin = async (data: { 
    email: string; 
    name?: string; 
    schoolName?: string; 
    jenjang?: Jenjang; 
    mataPelajaran?: string;
    nip?: string;
  }) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login-belajar-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Gagal masuk akun');
      }

      const activeTeacher: TeacherUser = resData.user;
      setCurrentUser(activeTeacher);
      localStorage.removeItem('ruang_guru_logged_out');
      localStorage.setItem('ruang_guru_current_user', JSON.stringify(activeTeacher));

      // Reload users list
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const uJson = await usersRes.json();
        setUsers(uJson.users);
      }

      showToast(resData.message || `Selamat datang, ${activeTeacher.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal masuk akun', 'error');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // offline logout ok
    }
    localStorage.setItem('ruang_guru_logged_out', 'true');
    localStorage.removeItem('ruang_guru_current_user');
    setCurrentUser(null);
    setLogoutModalOpen(false);
    setAuthModalOpen(false);
    showToast('Anda telah berhasil keluar dari akun Ruang Guru Merdeka', 'info');
  };

  // Handle Generate with Gemini 3.8 Flash
  const handleGenerate = async (params: GeneratorParams) => {
    if (!currentUser) {
      showToast('Silakan masuk akun terlebih dahulu', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghasilkan perangkat ajar');
      }

      const newDoc: EducationalDocument = {
        id: `doc-${Date.now()}`,
        title: data.title,
        docType: params.docType,
        jenjang: params.jenjang,
        tingkat: params.tingkat,
        fase: params.fase,
        mataPelajaran: params.mataPelajaran,
        topik: params.topik,
        content: data.content,
        createdAt: new Date().toISOString(),
        authorId: currentUser.id,
        authorName: params.authorName || currentUser.name,
        schoolName: params.schoolName || currentUser.schoolName,
        isPublic: true,
        durationMinutes: data.durationMinutes || 3.2
      };

      setCurrentDoc(newDoc);
      // Auto-save to documents list
      await handleSaveDocument(newDoc);
      showToast('Perangkat ajar berhasil disusun dan siap diekspor .docx / .pdf!', 'success');
      
      // Scroll to document viewer smoothly
      window.scrollTo({ top: 350, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Generate error:', err);
      showToast(err.message || 'Terjadi kesalahan saat menyusun dokumen', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Verify Teacher (Admin Action)
  const handleVerifyTeacher = async (userId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status,
          adminName: currentUser.name
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengubah status');
      }

      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      showToast(data.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui status', 'error');
    }
  };

  // Handle Delete Teacher
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast('Data guru berhasil dihapus', 'info');
      }
    } catch (err: any) {
      showToast('Gagal menghapus user', 'error');
    }
  };

  // Handle Save Document to Repository
  const handleSaveDocument = async (doc: EducationalDocument) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments(prev => [data.document, ...prev.filter(d => d.id !== doc.id)]);
      }
    } catch (err) {
      console.error('Save doc error', err);
    }
  };

  // Handle Delete Document
  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        if (currentDoc?.id === docId) {
          setCurrentDoc(documents.find(d => d.id !== docId) || null);
        }
        showToast('Dokumen berhasil dihapus dari bank arsip', 'info');
      }
    } catch (err) {
      showToast('Gagal menghapus dokumen', 'error');
    }
  };

  // IF NOT LOGGED IN: Render prestigious Login Page
  if (!currentUser) {
    return (
      <>
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
              toast.type === 'success' ? 'bg-slate-900 text-white border-slate-700' :
              toast.type === 'error' ? 'bg-rose-600 text-white border-rose-700' :
              'bg-blue-600 text-white border-blue-700'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <Clock className="w-5 h-5 text-rose-200" />}
              {toast.type === 'info' && <Sparkles className="w-5 h-5 text-amber-300" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <LoginPage
          onLogin={handleLogin}
          demoUsers={users.length > 0 ? users : [
            {
              id: 'user-admin-1',
              name: 'Amwaluddin Lubis, M.Pd.',
              email: 'amwaluddin.lubis@gmail.com',
              schoolName: 'Balai Penjaminan Mutu Pendidikan (BPMP)',
              nip: '19820514 200801 1 008',
              jenjang: 'SMA',
              mataPelajaran: 'Pengawas Kurikulum & Bahasa',
              role: 'SUPER_ADMIN',
              status: 'VERIFIED',
              registeredAt: '2026-01-10T08:00:00.000Z'
            }
          ]}
          isLoading={isAuthLoading}
        />
      </>
    );
  }

  const pendingUsersCount = users.filter(u => u.status === 'PENDING').length;
  const isDocTypeTarget = [
    'modul_ajar', 
    'rpp', 
    'soal_ujian', 
    'lkpd', 
    'kktp_atp', 
    'prota_promes', 
    'modul_p5'
  ].includes(activeTarget);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 no-print">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            toast.type === 'success' ? 'bg-slate-900 text-white border-slate-700' :
            toast.type === 'error' ? 'bg-rose-600 text-white border-rose-700' :
            'bg-blue-600 text-white border-blue-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <Clock className="w-5 h-5 text-rose-200" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-amber-300" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modern Collapsible Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTarget={activeTarget}
        onSelectTarget={(target) => setActiveTarget(target)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={() => setLogoutModalOpen(true)}
        pendingCount={pendingUsersCount}
        docsCount={documents.length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main App Layout Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-68'
      }`}>
        
        {/* Streamlined Top Header */}
        <TopHeader
          currentUser={currentUser}
          activeTarget={activeTarget}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenGuideModal={() => setGuideModalOpen(true)}
          onLogout={() => setLogoutModalOpen(true)}
          pendingCount={pendingUsersCount}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* VIEW 1: DEDICATED GENERATOR WORKSPACE (FOR EACH PERANGKAT AJAR) */}
          {isDocTypeTarget && (
            <div className="space-y-6 sm:space-y-8">
              
              {/* Quick Hero Banner with Contextual Perangkat Ajar Info */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden no-print">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-8">
                  <BookOpen className="w-96 h-96 text-white" />
                </div>

                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Standar Kemendikdasmen RI 2024
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                      SD • SMP • SMA • SMK
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                    Studio Penyusun Perangkat Ajar & Modul Belajar.id
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1.5 font-medium leading-relaxed">
                    Menghasilkan dokumen lengkap dengan Capaian Pembelajaran BSKAP 032/H/KR/2024, Pembelajaran Berdiferensiasi, Asesmen & Rubrik KKTP, serta dapat diekspor langsung ke format <b>.docx</b> dan <b>.pdf</b>.
                  </p>
                </div>
              </div>

              {/* Generator Form and Preview Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Left Column: Generator Form (5 Cols) */}
                <div className="lg:col-span-6 xl:col-span-5 no-print">
                  <GeneratorForm
                    currentUser={currentUser}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    activeDocType={activeTarget as DocType}
                    onSelectDocType={(newType) => setActiveTarget(newType)}
                    onSwitchToVerifiedUser={() => {
                      const adminAcc = users.find(u => u.role === 'SUPER_ADMIN') || users[0];
                      if (adminAcc) setCurrentUser(adminAcc);
                      showToast('Beralih ke akun Admin Verifikator (Amwaluddin Lubis, M.Pd.)', 'success');
                    }}
                  />
                </div>

                {/* Right Column: Document Viewer (7 Cols) */}
                <div className="lg:col-span-6 xl:col-span-7">
                  <DocumentViewer
                    document={currentDoc}
                    currentUser={currentUser}
                    onSaveToRepository={handleSaveDocument}
                    onBackToGenerator={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  />
                </div>

              </div>

            </div>
          )}

          {/* VIEW 2: STATISTIK & PROFIL GURU (D3.JS) */}
          {activeTarget === 'stats' && (
            <UserProfileStatsDashboard
              currentUser={currentUser}
              documents={documents}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onSelectDocument={(doc) => {
                setCurrentDoc(doc);
                setActiveTarget(doc.docType);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onCreateNew={() => setActiveTarget('modul_ajar')}
            />
          )}

          {/* VIEW 3: BANK ARSIP DOKUMEN */}
          {activeTarget === 'repository' && (
            <DocumentRepository
              documents={documents}
              currentUser={currentUser}
              onSelectDocument={(doc) => {
                setCurrentDoc(doc);
                setActiveTarget(doc.docType);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onDeleteDocument={handleDeleteDocument}
              onCreateNew={() => setActiveTarget('modul_ajar')}
            />
          )}

          {/* VIEW 4: ADMIN VERIFICATION PANEL */}
          {activeTarget === 'admin' && (
            <TeacherVerificationPanel
              users={users}
              currentUser={currentUser}
              onUpdateStatus={handleVerifyTeacher}
              onDeleteUser={handleDeleteUser}
              onAddUser={async (userData) => {
                await handleLogin({
                  email: userData.email || '',
                  name: userData.name,
                  schoolName: userData.schoolName,
                  jenjang: userData.jenjang,
                  mataPelajaran: userData.mataPelajaran
                });
              }}
            />
          )}

          {/* VIEW 5: PANDUAN KURIKULUM MERDEKA */}
          {activeTarget === 'guide' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Panduan & Regulasi Kurikulum Merdeka Terbaru
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Rujukan resmi penyusunan Modul Ajar, RPP, Soal Ujian, dan Perangkat Kelas untuk Guru Indonesia
                    </p>
                  </div>
                </div>

                <div className="prose-educational space-y-6">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">
                      Landasan Hukum Kurikulum Nasional 2024
                    </h3>
                    <p className="text-xs text-blue-950">
                      Berdasarkan <b>Permendikbudristek No. 12 Tahun 2024</b>, Kurikulum Merdeka telah resmi menjadi kurikulum nasional tunggal. Sekolah di seluruh jenjang (SD, SMP, SMA, SMK) diwajibkan menggunakan paradigma pembelajaran berpusat pada peserta didik, berdiferensiasi, serta berorientasi pada Profil Pelajar Pancasila.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <h4 className="font-bold text-slate-900 text-sm mb-2">
                        Fase Pembelajaran
                      </h4>
                      <ul className="text-xs space-y-1.5 text-slate-600">
                        <li>• <b>Fase A</b>: Kelas 1 & 2 SD (Fondasi awal literasi/numerasi)</li>
                        <li>• <b>Fase B</b>: Kelas 3 & 4 SD (Pengembangan IPAS & konsep)</li>
                        <li>• <b>Fase C</b>: Kelas 5 & 6 SD (Pemantapan kesiapan transisi)</li>
                        <li>• <b>Fase D</b>: Kelas 7, 8, 9 SMP (Penyelidikan ilmiah & analitis)</li>
                        <li>• <b>Fase E</b>: Kelas 10 SMA/SMK (Eksplorasi minat dan bakat)</li>
                        <li>• <b>Fase F</b>: Kelas 11 & 12 SMA/SMK (Peminatan mendalam & karir)</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <h4 className="font-bold text-slate-900 text-sm mb-2">
                        3 Komponen Esensial Modul Ajar (PPA 2024)
                      </h4>
                      <ol className="text-xs space-y-1.5 text-slate-600">
                        <li>1. <b>Tujuan Pembelajaran</b> (Menjabarkan CP BSKAP 032/H/KR/2024).</li>
                        <li>2. <b>Langkah-Langkah Pembelajaran</b> (Pendahuluan, Inti PBL/PjBL dengan diferensiasi, Penutup reflektif).</li>
                        <li>3. <b>Rencana Asesmen</b> (Diagnostik, Formatif, Sumatif, serta rubrik KKTP).</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <h4 className="font-bold text-amber-900 text-sm mb-1.5">
                      Alur Verifikasi Guru Belajar.id
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Setiap guru yang login menggunakan akun <code>@guru.sd.belajar.id</code>, <code>@guru.smp.belajar.id</code>, atau <code>@guru.sma.belajar.id</code> akan didaftarkan ke sistem. Demi menjaga keabsahan data dan integritas dokumen administrasi, Verifikator Kurikulum (Bpk. Amwaluddin Lubis, M.Pd.) memvalidasi dan memberikan lisensi penuh pembuatan perangkat ajar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-xs text-slate-500 no-print mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Ruang Guru Merdeka</span>
              <span>•</span>
              <span>Terintegrasi Akun Belajar.id</span>
            </div>
            <div>
              Sesuai Permendikbudristek No. 12 Tahun 2024 & PPA 2024 Kemendikdasmen RI
            </div>
          </div>
        </footer>

      </div>

      {/* Belajar.id Modal */}
      <BelajarIdAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={() => {
          setAuthModalOpen(false);
          setLogoutModalOpen(true);
        }}
      />

      {/* Curriculum Guide Modal */}
      <CurriculumGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirmLogout={handleLogout}
        currentUser={currentUser}
      />

    </div>
  );
}
