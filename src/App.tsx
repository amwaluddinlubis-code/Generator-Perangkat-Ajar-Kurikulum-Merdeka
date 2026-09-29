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
import { ProfilePage } from './components/ProfilePage';
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
  // Identity is established by the server-side session cookie.
  // localStorage is intentionally not used as an authentication source.
  const [currentUser, setCurrentUser] = useState<TeacherUser | null>(null);

  const [users, setUsers] = useState<TeacherUser[]>([]);
  const [documents, setDocuments] = useState<EducationalDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<EducationalDocument | null>(null);
  const [showDocumentResult, setShowDocumentResult] = useState<boolean>(false);
  
  // Navigation State with dedicated sidebar targets
  const [activeTarget, setActiveTarget] = useState<NavigationTarget>('modul_ajar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastModelUsed, setLastModelUsed] = useState<string>('');
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
      const currentRes = await fetch('/api/users/current');
      if (!currentRes.ok) {
        setCurrentUser(null);
        setUsers([]);
        setDocuments([]);
        return;
      }

      const currentData = await currentRes.json();
      if (!currentData.user) {
        setCurrentUser(null);
        return;
      }

      const activeUser = currentData.user as TeacherUser;
      setCurrentUser(activeUser);

      if (activeUser.role === 'ADMIN' || activeUser.role === 'SUPER_ADMIN') {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData.users)) setUsers(usersData.users);
        }
      } else {
        setUsers([]);
      }

      const docsRes = await fetch('/api/documents');
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        if (Array.isArray(docsData.documents)) {
          setDocuments(docsData.documents);
          if (docsData.documents.length > 0) setCurrentDoc(prev => prev || docsData.documents[0]);
        }
      } else if (docsRes.status === 401 || docsRes.status === 403) {
        setDocuments([]);
      }
    } catch (err) {
      console.warn('Backend server connecting or loading offline defaults:', err);
      setCurrentUser(null);
      setUsers([]);
      setDocuments([]);
    }
  };

  useEffect(() => {
    loadInitialData();
    // Revalidasi tiap jendela kembali fokus (kembali dari tab admin, dsb.)
    const onFocus = () => loadInitialData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

      if (activeTeacher.role === 'ADMIN' || activeTeacher.role === 'SUPER_ADMIN') {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const uJson = await usersRes.json();
          setUsers(uJson.users);
        }
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
    setCurrentUser(null);
    setUsers([]);
    setDocuments([]);
    setCurrentDoc(null);
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
        body: JSON.stringify({
          ...params,
          authorId: undefined,
          authorName: undefined,
          schoolName: undefined
        })
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
        authorName: currentUser.name,
        schoolName: currentUser.schoolName,
        schoolId: currentUser.schoolId,
        isPublic: false,
        durationMinutes: data.durationMinutes || 3.2
      };

      const persistedDoc = await handleSaveDocument(newDoc);
      setCurrentDoc(persistedDoc || newDoc);
      setShowDocumentResult(true);
      const used = data.modelUsed || '';
      setLastModelUsed(used);
      if (/gemini/i.test(used)) {
        showToast('Perangkat ajar berhasil disusun AI dan siap diekspor .docx / .pdf!', 'success');
      } else {
        showToast('AI sedang sibuk — dokumen disusun dari template cadangan terverifikasi.', 'info');
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Generate error:', err);
      let friendlyMsg = 'Terjadi kesalahan saat menyusun dokumen. Silakan coba kembali.';
      const raw = String(err?.message || '');
      if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
        friendlyMsg = 'Server AI mengalami lonjakan antrean sesaat. Sistem telah mengoptimalkan koneksi alternatif, silakan klik tombol "Susun Perangkat Ajar" sekali lagi.';
      } else if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
        friendlyMsg = 'Batas frekuensi permintaan tercapai. Silakan tunggu beberapa detik lalu coba kembali.';
      } else if (raw.length > 0 && !raw.includes('{')) {
        friendlyMsg = raw;
      }
      showToast(friendlyMsg, 'error');
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
          status
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

  // Handle Update User (manajemen user dua level via PUT)
  const handleUpdateUser = async (userId: string, fields: Partial<TeacherUser>) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui profil');
      }
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(data.user);
      }
      showToast(data.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui profil', 'error');
    }
  };

  // Handle Save Document to Repository
  const handleSaveDocument = async (doc: EducationalDocument): Promise<EducationalDocument | null> => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      const data = await res.json();
      if (res.ok && data.success && data.document) {
        const persisted = data.document as EducationalDocument;
        setDocuments(prev => [persisted, ...prev.filter(d => d.id !== persisted.id)]);
        return persisted;
      }
    } catch (err) {
      console.error('Save doc error', err);
    }
    return null;
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
        {/* Toast Notification — Apple pill */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="px-5 py-3 rounded-full shadow-lg text-[13.5px] font-medium flex items-center gap-2 bg-black/85 text-white backdrop-blur-md">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#30d158]" />}
              {toast.type === 'error' && <Clock className="w-4 h-4 text-[#ff6961]" />}
              {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#ffd60a]" />}
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
              schoolId: 'school-demo-bpmp',
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
    <div className="min-h-screen text-[#1d1d1f] dark:text-[#f5f5f7] flex">
      
      {/* Toast Notification — Apple pill */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print">
          <div className="px-5 py-3 rounded-full shadow-lg text-[13.5px] font-medium flex items-center gap-2 bg-black/85 text-white backdrop-blur-md max-w-[92vw]">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />}
            {toast.type === 'error' && <Clock className="w-4 h-4 text-[#ff6961] shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#ffd60a] shrink-0" />}
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modern Collapsible Sidebar */}
      <Sidebar
        activeTarget={activeTarget}
        onSelectTarget={(target) => {
          setActiveTarget(target);
          setShowDocumentResult(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingCount={pendingUsersCount}
        docsCount={documents.length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main App Layout Area — offset mengikuti lebar sidebar Apple */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[280px]'
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

        {/* Content View Container — lega ala Apple */}
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-10 max-w-[1400px] w-full mx-auto">
          
          {/* VIEW 1: DEDICATED GENERATOR WORKSPACE (FOR EACH PERANGKAT AJAR) */}
          {isDocTypeTarget && (
            showDocumentResult && currentDoc ? (
              <DocumentViewer
                key={currentDoc.id}
                document={currentDoc}
                currentUser={currentUser}
                modelUsed={lastModelUsed}
                onSaveToRepository={handleSaveDocument}
                onBackToGenerator={() => {
                  setShowDocumentResult(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="mx-auto w-full max-w-6xl">
                <GeneratorForm
                  currentUser={currentUser}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  activeDocType={activeTarget as DocType}
                  onSelectDocType={(newType) => setActiveTarget(newType)}
                />
              </div>
            )
          )}

          {/* VIEW 2: PROFIL SAYA (semua peran) */}
          {activeTarget === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              documents={documents}
              onUpdateSelf={(fields) => handleUpdateUser(currentUser.id, fields)}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />
          )}

          {/* VIEW 2b: STATISTIK & PROFIL GURU (D3.JS) */}
          {activeTarget === 'stats' && (
            <UserProfileStatsDashboard
              currentUser={currentUser}
              documents={documents}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onSelectDocument={(doc) => {
                setCurrentDoc(doc);
                setActiveTarget(doc.docType);
                setShowDocumentResult(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCreateNew={() => {
                setActiveTarget('modul_ajar');
                setShowDocumentResult(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
                setShowDocumentResult(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeleteDocument={handleDeleteDocument}
              onCreateNew={() => {
                setActiveTarget('modul_ajar');
                setShowDocumentResult(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* VIEW 4: ADMIN VERIFICATION PANEL */}
          {activeTarget === 'admin' && (
            <TeacherVerificationPanel
              users={users}
              currentUser={currentUser}
              onUpdateStatus={handleVerifyTeacher}
              onDeleteUser={handleDeleteUser}
              onUpdateUser={handleUpdateUser}
              onAddUser={async (userData) => {
                try {
                  const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                  });
                  const data = await response.json();
                  if (!response.ok || !data.success) {
                    throw new Error(data?.error?.message || data?.message || 'Gagal menambahkan guru.');
                  }

                  const usersRes = await fetch('/api/users');
                  if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    if (Array.isArray(usersData.users)) setUsers(usersData.users);
                  }
                  showToast(data.message || 'Guru berhasil ditambahkan.', 'success');
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Gagal menambahkan guru.', 'error');
                  throw error;
                }
              }}
            />
          )}

          {/* VIEW 5: PANDUAN KURIKULUM MERDEKA */}
          {activeTarget === 'guide' && (
            <div className="space-y-4">
              <div className="text-center max-w-xl mx-auto mb-2">
                <p className="apple-eyebrow">Regulasi resmi</p>
                <h2 className="apple-headline !text-[28px] sm:!text-[34px] mt-1">Panduan Kurikulum Merdeka.</h2>
                <p className="apple-sub mt-2 !text-[15px]">Rujukan penyusunan Modul Ajar, RPP, Soal, dan perangkat kelas.</p>
              </div>
              <div className="apple-card p-6 sm:p-10 max-w-4xl mx-auto">
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

                <div className="prose-educational space-y-4">
                  <div className="p-5 rounded-2xl bg-[#f5f5f7]">
                    <h3 className="text-[14.5px] font-semibold mb-1">
                      Landasan hukum kurikulum nasional 2024
                    </h3>
                    <p className="!text-[13.5px] !text-[#424245]">
                      Berdasarkan <b>Permendikbudristek No. 12 Tahun 2024</b>, Kurikulum Merdeka menjadi kurikulum nasional. Pembelajaran berpusat pada peserta didik, berdiferensiasi, dan berorientasi Profil Pelajar Pancasila.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-5 rounded-2xl bg-[#f5f5f7]">
                      <h4 className="font-semibold text-[14px] mb-2">
                        Fase pembelajaran
                      </h4>
                      <ul className="!text-[13px] space-y-1.5 !text-[#424245]">
                        <li><b>Fase A</b>: Kelas 1–2 SD</li>
                        <li><b>Fase B</b>: Kelas 3–4 SD</li>
                        <li><b>Fase C</b>: Kelas 5–6 SD</li>
                        <li><b>Fase D</b>: Kelas 7–9 SMP</li>
                        <li><b>Fase E</b>: Kelas 10 SMA/SMK</li>
                        <li><b>Fase F</b>: Kelas 11–12 SMA/SMK</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#f5f5f7]">
                      <h4 className="font-semibold text-[14px] mb-2">
                        3 komponen esensial Modul Ajar
                      </h4>
                      <ol className="!text-[13px] space-y-1.5 !text-[#424245]">
                        <li>1. <b>Tujuan Pembelajaran</b> dari CP BSKAP 032/H/KR/2024.</li>
                        <li>2. <b>Langkah pembelajaran</b> berdiferensiasi.</li>
                        <li>3. <b>Rencana asesmen</b> + rubrik KKTP.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f5f5f7]">
                    <h4 className="font-semibold text-[14px] mb-1.5">
                      Alur verifikasi guru
                    </h4>
                    <p className="!text-[13px] !text-[#424245] leading-relaxed">
                      Guru dengan akun <code>@guru.sd/smp/sma.belajar.id</code> terdaftar otomatis, lalu divalidasi verifikator kurikulum sebelum mendapat akses penuh pembuatan perangkat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Global Footer — minimal */}
        <footer className="py-6 px-6 text-center text-[12.5px] text-[#6e6e73] dark:text-[#98989d] no-print mt-auto">
          <p><span className="font-semibold dark:text-[#f5f5f7]">Ruang Guru Merdeka</span> · Permendikbudristek No. 12 Tahun 2024 & PPA 2024</p>
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
