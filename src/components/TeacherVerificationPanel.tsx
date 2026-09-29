import React, { useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  UserPlus,
  School,
  Mail,
  GraduationCap,
  Check,
  Trash2,
  Crown,
  Pencil,
} from 'lucide-react';

interface TeacherVerificationPanelProps {
  users: TeacherUser[];
  currentUser: TeacherUser;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddUser: (user: Partial<TeacherUser>) => Promise<void>;
  onUpdateUser: (userId: string, fields: Partial<TeacherUser>) => Promise<void>;
}

export const TeacherVerificationPanel: React.FC<TeacherVerificationPanelProps> = ({
  users,
  currentUser,
  onUpdateStatus,
  onDeleteUser,
  onAddUser,
  onUpdateUser
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

  // Edit teacher form state
  const [editingUser, setEditingUser] = useState<TeacherUser | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editSchool, setEditSchool] = useState<string>('');
  const [editJenjang, setEditJenjang] = useState<Jenjang>('SD');
  const [editMapel, setEditMapel] = useState<string>('');
  const [editNip, setEditNip] = useState<string>('');
  const [editNpsn, setEditNpsn] = useState<string>('');
  const [editRole, setEditRole] = useState<'GURU' | 'ADMIN'>('GURU');
  const canChangeTenant = currentUser.role === 'SUPER_ADMIN';

  const openEdit = (t: TeacherUser) => {
    setEditingUser(t);
    setEditName(t.name);
    setEditSchool(t.schoolName);
    setEditJenjang(t.jenjang);
    setEditMapel(t.mataPelajaran);
    setEditNip(t.nip || '');
    setEditNpsn(t.npsn || '');
    setEditRole(t.role === 'ADMIN' ? 'ADMIN' : 'GURU');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await onUpdateUser(editingUser.id, {
      name: editName,
      schoolName: editSchool,
      jenjang: editJenjang,
      mataPelajaran: editMapel,
      nip: editNip,
      npsn: editNpsn,
      role: editRole
    });
    setEditingUser(null);
  };

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
    <div className="space-y-4">
      
      {/* Header — Apple hero */}
      <div className="text-center max-w-xl mx-auto">
        <p className="apple-eyebrow">Admin</p>
        <h2 className="apple-headline !text-[28px] sm:!text-[34px] mt-1">Verifikasi guru.</h2>
        <p className="apple-sub mt-2 !text-[15px]">
          Setujui akun Belajar.id sebelum guru menyusun dan mengunduh perangkat ajar.
        </p>
        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
          {pendingUsers.length > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="btn-apple !min-h-[40px] !py-2.5 !text-[13.5px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Setujui semua ({pendingUsers.length})
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-apple-secondary"
          >
            <UserPlus className="w-4 h-4" />
            Tambah guru
          </button>
        </div>
      </div>

      {/* Ringkasan KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Total guru</span>
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-[28px] font-bold tracking-tight">{totalUsers}</div>
          <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">SD · SMP · SMA · SMK</p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Menunggu</span>
            <Clock className="w-5 h-5 text-[#ff9f0a]" />
          </div>
          <div className="text-[28px] font-bold tracking-tight">{pendingUsers.length}</div>
          <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">Perlu persetujuan</p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Terverifikasi</span>
            <CheckCircle2 className="w-5 h-5 text-[#30b158]" />
          </div>
          <div className="text-[28px] font-bold tracking-tight">{verifiedUsers.length}</div>
          <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">Akses penuh generator</p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#98989d]">Ditolak</span>
            <XCircle className="w-5 h-5 text-[#ff6961]" />
          </div>
          <div className="text-[28px] font-bold tracking-tight">{rejectedUsers.length}</div>
          <p className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] mt-0.5">Tidak memenuhi syarat</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari guru, email, atau sekolah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input !pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="apple-segment shrink-0" role="tablist" aria-label="Filter status">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              data-active={statusFilter === 'ALL'}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              data-active={statusFilter === 'PENDING'}
            >
              Menunggu{pendingUsers.length > 0 && ` (${pendingUsers.length})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VERIFIED')}
              data-active={statusFilter === 'VERIFIED'}
            >
              Terverifikasi
            </button>
          </div>

          {/* Jenjang Filter */}
          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="apple-input !w-auto !py-2.5 text-[13.5px] font-semibold"
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
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-[11.5px] font-semibold text-[#6e6e73] dark:text-[#98989d]">
                <th className="py-3.5 px-4 sm:px-6 font-semibold">Guru & email</th>
                <th className="py-3.5 px-4 font-semibold">Sekolah</th>
                <th className="py-3.5 px-4 font-semibold">Jenjang & mapel</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-[13.5px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6e6e73] dark:text-[#98989d]">
                    Tidak ada guru yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((teacher) => {
                  const isUserSuperAdmin = teacher.role === 'SUPER_ADMIN';
                  const isCurrentTeacher = teacher.id === currentUser.id;

                  return (
                    <tr key={teacher.id} className="hover:bg-black/[0.025] dark:hover:bg-white/5 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-black dark:bg-white dark:text-black text-white flex items-center justify-center font-semibold text-[13px] shrink-0">
                            {teacher.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">{teacher.name}</span>
                              {isUserSuperAdmin && (
                                <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 text-[10.5px] font-semibold rounded-full flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" />
                                  Admin
                                </span>
                              )}
                              {isCurrentTeacher && (
                                <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 text-[10.5px] font-semibold rounded-full">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[12px] text-[#6e6e73] dark:text-[#98989d] flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School */}
                      <td className="py-4 px-4">
                        <div className="font-medium flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                          <span className="truncate max-w-[200px]">{teacher.schoolName}</span>
                        </div>
                        {teacher.npsn && (
                          <div className="text-[11.5px] text-[#86868b]">NPSN: {teacher.npsn}</div>
                        )}
                      </td>

                      {/* Jenjang & Mapel */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/10">
                            {teacher.jenjang}
                          </span>
                        </div>
                        <div className="text-[12.5px] text-[#6e6e73] dark:text-[#98989d] truncate max-w-[180px] mt-0.5">
                          {teacher.mataPelajaran}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {teacher.status === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[12.5px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#30b158]" />
                            Terverifikasi
                          </span>
                        ) : teacher.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[12.5px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a] animate-pulse" />
                            Menunggu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[12.5px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6961]" />
                            Ditolak
                          </span>
                        )}

                        {teacher.verifiedBy && (
                          <div className="text-[11px] text-[#86868b] mt-1">
                            Oleh: {teacher.verifiedBy}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(teacher)}
                            className="p-2 rounded-full text-[#86868b] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Ubah profil & peran"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {teacher.status !== 'VERIFIED' && (
                            <button
                              onClick={() => onUpdateStatus(teacher.id, 'VERIFIED')}
                              className="px-3.5 py-1.5 rounded-full bg-black dark:bg-white dark:text-black text-white text-[12.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer min-h-[34px]"
                              title="Setujui dan beri akses penuh"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                          )}

                          {teacher.status !== 'REJECTED' && !isUserSuperAdmin && (
                            <button
                              onClick={() => onUpdateStatus(teacher.id, 'REJECTED')}
                              className="px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[12.5px] font-semibold transition-all cursor-pointer min-h-[34px]"
                              title="Tolak akses akun"
                            >
                              Tolak
                            </button>
                          )}

                          {!isUserSuperAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data guru ${teacher.name}?`)) {
                                  onDeleteUser(teacher.id);
                                }
                              }}
                              className="p-2 rounded-full text-[#86868b] hover:text-[#ff6961] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* Edit Teacher Modal (admin) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="apple-card max-w-md w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[19px] font-semibold tracking-tight mb-1">
              Ubah profil guru
            </h3>
            <p className="text-[13.5px] text-[#6e6e73] dark:text-[#98989d] mb-5">
              {editingUser.email}
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Nama lengkap & gelar</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="apple-input" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Sekolah</label>
                <input type="text" required value={editSchool} onChange={(e) => setEditSchool(e.target.value)} disabled={!canChangeTenant} className="apple-input disabled:opacity-60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Jenjang</label>
                  <select value={editJenjang} onChange={(e) => setEditJenjang(e.target.value as Jenjang)} className="apple-input">
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Peran</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'GURU' | 'ADMIN')}
                    disabled={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser.id}
                    className="apple-input disabled:opacity-50"
                    title={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser.id ? 'Peran ini tidak dapat diubah' : 'Ubah peran'}
                  >
                    <option value="GURU">Guru</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">Mata pelajaran</label>
                <input type="text" value={editMapel} onChange={(e) => setEditMapel(e.target.value)} className="apple-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">NIP / NUPTK</label>
                  <input type="text" value={editNip} onChange={(e) => setEditNip(e.target.value)} className="apple-input" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">NPSN</label>
                  <input type="text" value={editNpsn} onChange={(e) => setEditNpsn(e.target.value)} className="apple-input" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-apple-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-apple">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="apple-card max-w-md w-full p-6 sm:p-7">
            <h3 className="text-[19px] font-semibold tracking-tight mb-1">
              Tambah guru baru
            </h3>
            <p className="text-[13.5px] text-[#6e6e73] dark:text-[#98989d] mb-5">
              Langsung terverifikasi dengan akun Belajar.id.
            </p>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Nama lengkap & gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Prasetyo, S.Pd."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="apple-input"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Email Belajar.id
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi.prasetyo@guru.smp.belajar.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="apple-input"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1.5">
                  Sekolah
                </label>
                <input
                  type="text"
                  placeholder="SMP Negeri 1 Surabaya"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="apple-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">
                    Jenjang
                  </label>
                  <select
                    value={newJenjang}
                    onChange={(e) => setNewJenjang(e.target.value as Jenjang)}
                    className="apple-input"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">
                    Mata pelajaran
                  </label>
                  <input
                    type="text"
                    value={newMapel}
                    onChange={(e) => setNewMapel(e.target.value)}
                    placeholder="Matematika"
                    className="apple-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-apple-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-apple"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
