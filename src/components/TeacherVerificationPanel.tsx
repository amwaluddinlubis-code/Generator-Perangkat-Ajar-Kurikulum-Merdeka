import React, { useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  UserPlus, 
  School, 
  Mail, 
  GraduationCap, 
  AlertCircle, 
  Check, 
  Trash2, 
  Crown,
  Sparkles
} from 'lucide-react';

interface TeacherVerificationPanelProps {
  users: TeacherUser[];
  currentUser: TeacherUser;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddUser: (user: Partial<TeacherUser>) => Promise<void>;
}

export const TeacherVerificationPanel: React.FC<TeacherVerificationPanelProps> = ({
  users,
  currentUser,
  onUpdateStatus,
  onDeleteUser,
  onAddUser
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [jenjangFilter, setJenjangFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New teacher form state
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newSchool, setNewSchool] = useState<string>('');
  const [newJenjang, setNewJenjang] = useState<Jenjang>('SD');
  const [newMapel, setNewMapel] = useState<string>('Guru Kelas');

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  // Stats
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const verifiedUsers = users.filter(u => u.status === 'VERIFIED');
  const rejectedUsers = users.filter(u => u.status === 'REJECTED');

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesJenjang = jenjangFilter === 'ALL' || u.jenjang === jenjangFilter;

    return matchesSearch && matchesStatus && matchesJenjang;
  });

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    await onAddUser({
      name: newName,
      email: newEmail,
      schoolName: newSchool || 'Satuan Pendidikan',
      jenjang: newJenjang,
      mataPelajaran: newMapel,
      role: 'GURU',
      status: 'VERIFIED' // admin manually adding is verified
    });
    setNewName('');
    setNewEmail('');
    setNewSchool('');
    setShowAddModal(false);
  };

  const handleApproveAllPending = async () => {
    for (const u of pendingUsers) {
      await onUpdateStatus(u.id, 'VERIFIED');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Authorization Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  Panel Verifikasi Akun Belajar.id & Manajemen Guru
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Anda memiliki hak prerogatif untuk menyetujui akun guru dari seluruh Indonesia yang masuk melalui Google Belajar.id sebelum mereka dapat menyusun dan mengunduh perangkat ajar Kurikulum Merdeka.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {pendingUsers.length > 0 && (
              <button
                onClick={handleApproveAllPending}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui Semua ({pendingUsers.length} Guru)
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Guru
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Guru</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalUsers}</div>
          <p className="text-xs text-slate-500 mt-1">SD, SMP, SMA, SMK se-Indonesia</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Menunggu Verifikasi</span>
            <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingUsers.length}</div>
          <p className="text-xs text-amber-700 mt-1">Memerlukan persetujuan Admin</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Terverifikasi Aktif</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{verifiedUsers.length}</div>
          <p className="text-xs text-emerald-700 mt-1">Akses penuh generator ajar</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ditolak</span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{rejectedUsers.length}</div>
          <p className="text-xs text-slate-500 mt-1">Tidak memenuhi syarat</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari guru, email Belajar.id, atau sekolah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Menunggu {pendingUsers.length > 0 && `(${pendingUsers.length})`}
            </button>
            <button
              onClick={() => setStatusFilter('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'VERIFIED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terverifikasi
            </button>
          </div>

          {/* Jenjang Filter */}
          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="SMK">SMK</option>
          </select>
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Nama Guru & Belajar.id</th>
                <th className="py-3.5 px-4">Satuan Pendidikan</th>
                <th className="py-3.5 px-4">Jenjang & Mapel</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada guru yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((teacher) => {
                  const isUserSuperAdmin = teacher.role === 'SUPER_ADMIN';
                  const isCurrentTeacher = teacher.id === currentUser.id;

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            isUserSuperAdmin ? 'bg-purple-600' :
                            teacher.status === 'VERIFIED' ? 'bg-blue-600' : 'bg-amber-600'
                          }`}>
                            {teacher.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{teacher.name}</span>
                              {isUserSuperAdmin && (
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" />
                                  Admin
                                </span>
                              )}
                              {isCurrentTeacher && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{teacher.schoolName}</span>
                        </div>
                        {teacher.npsn && (
                          <div className="text-[11px] text-slate-400">NPSN: {teacher.npsn}</div>
                        )}
                      </td>

                      {/* Jenjang & Mapel */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            teacher.jenjang === 'SD' ? 'bg-emerald-100 text-emerald-800' :
                            teacher.jenjang === 'SMP' ? 'bg-blue-100 text-blue-800' :
                            teacher.jenjang === 'SMA' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {teacher.jenjang}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 truncate max-w-[180px] mt-0.5">
                          {teacher.mataPelajaran}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {teacher.status === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Terverifikasi
                          </span>
                        ) : teacher.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-xs font-semibold animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Menunggu Verifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Ditolak
                          </span>
                        )}

                        {teacher.verifiedBy && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Oleh: {teacher.verifiedBy}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {teacher.status !== 'VERIFIED' && (
                            <button
                              onClick={() => onUpdateStatus(teacher.id, 'VERIFIED')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="Setujui dan beri akses penuh modul ajar"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                          )}

                          {teacher.status !== 'REJECTED' && !isUserSuperAdmin && (
                            <button
                              onClick={() => onUpdateStatus(teacher.id, 'REJECTED')}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer"
                              title="Tolak akses akun"
                            >
                              Tolak
                            </button>
                          )}

                          {!isUserSuperAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus data guru ${teacher.name}?`)) {
                                  onDeleteUser(teacher.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus data guru"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Tambah Guru Terverifikasi Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Daftarkan guru dengan akun Google Belajar.id langsung dengan status terverifikasi.
            </p>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru (beserta gelar)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Prasetyo, S.Pd."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun Belajar.id
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi.prasetyo@guru.smp.belajar.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan Pendidikan (Sekolah)
                </label>
                <input
                  type="text"
                  placeholder="SMP Negeri 1 Surabaya"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenjang
                  </label>
                  <select
                    value={newJenjang}
                    onChange={(e) => setNewJenjang(e.target.value as Jenjang)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={newMapel}
                    onChange={(e) => setNewMapel(e.target.value)}
                    placeholder="Matematika"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                >
                  Simpan & Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
