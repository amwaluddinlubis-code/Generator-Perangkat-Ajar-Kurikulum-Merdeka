import React, { useState } from 'react';
import { Modal } from './ui/Modal';
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
  X,
} from 'lucide-react';

interface TeacherVerificationPanelProps {
  users: TeacherUser[];
  currentUser: TeacherUser;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddUser: (user: Partial<TeacherUser>) => Promise<void>;
  onUpdateUser: (userId: string, fields: Partial<TeacherUser>) => Promise<void>;
}

const labelCls = 'block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5';

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

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'KEPALA_SEKOLAH';

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

  const kpi = [
    { label: 'Total guru', value: totalUsers, hint: 'SD · SMP · SMA · SMK', icon: GraduationCap, tone: 'neutral' },
    { label: 'Menunggu', value: pendingUsers.length, hint: 'Perlu persetujuan', icon: Clock, tone: 'warn' },
    { label: 'Terverifikasi', value: verifiedUsers.length, hint: 'Akses penuh generator', icon: CheckCircle2, tone: 'ok' },
    { label: 'Ditolak', value: rejectedUsers.length, hint: 'Tidak memenuhi syarat', icon: XCircle, tone: 'danger' },
  ] as const;

  const toneCls = (tone: string) =>
    tone === 'warn'
      ? 'bg-[var(--warn-soft)] text-[var(--warn)]'
      : tone === 'ok'
        ? 'bg-[var(--ok-soft)] text-[var(--ok)]'
        : tone === 'danger'
          ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
          : 'bg-[var(--surface-2)] text-[var(--muted)]';

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--ink)]">Verifikasi guru</h1>
          <p className="apple-sub mt-1 max-w-xl">
            Setujui akun Belajar.id sebelum guru menyusun dan mengunduh perangkat ajar.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {pendingUsers.length > 0 && (
            <button onClick={handleApproveAllPending} className="btn-apple">
              <CheckCircle2 className="w-4 h-4" />
              Setujui semua ({pendingUsers.length})
            </button>
          )}
          <button onClick={() => setShowAddModal(true)} className="btn-apple-secondary">
            <UserPlus className="w-4 h-4" />
            Tambah guru
          </button>
        </div>
      </div>

      {/* Ringkasan KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpi.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="apple-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-medium text-[var(--muted)]">{label}</p>
              <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${toneCls(tone)}`}>
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <p className="text-[26px] font-semibold tracking-[-0.03em] text-[var(--ink)] mt-1 leading-none">{value}</p>
            <p className="text-[11.5px] text-[var(--muted)] mt-1.5">{hint}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Cari guru, email, atau sekolah…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input !pl-9"
            aria-label="Cari guru"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
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

          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="apple-input !w-auto shrink-0 !py-2 !text-[12.5px]"
            aria-label="Filter jenjang"
          >
            <option value="ALL">Semua jenjang</option>
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
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
                <th className="py-2.5 px-4 font-semibold">Guru & email</th>
                <th className="py-2.5 px-4 font-semibold">Sekolah</th>
                <th className="py-2.5 px-4 font-semibold">Jenjang & mapel</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[12.5px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--muted)]">
                    Tidak ada guru yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((teacher) => {
                  const isUserSuperAdmin = teacher.role === 'SUPER_ADMIN';
                  const isCurrentTeacher = teacher.id === currentUser.id;

                  return (
                    <tr key={teacher.id} className="hover:bg-[var(--surface-2)] transition-colors">

                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent-ink)] flex items-center justify-center font-semibold text-[12px] shrink-0">
                            {teacher.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[var(--ink)]">{teacher.name}</span>
                              {isUserSuperAdmin && (
                                <span className="ds-badge ds-badge-accent !py-0.5 !text-[10px]">
                                  <Crown className="w-2.5 h-2.5" />
                                  Admin
                                </span>
                              )}
                              {isCurrentTeacher && (
                                <span className="ds-badge !py-0.5 !text-[10px]">Anda</span>
                              )}
                            </div>
                            <div className="text-[11.5px] text-[var(--muted)] flex items-center gap-1 truncate mt-0.5">
                              <Mail className="w-3 h-3 shrink-0" />
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                          <span className="truncate max-w-[190px]">{teacher.schoolName}</span>
                        </div>
                        {teacher.npsn && (
                          <div className="text-[11px] text-[var(--muted)] mt-0.5">NPSN {teacher.npsn}</div>
                        )}
                      </td>

                      {/* Jenjang & Mapel */}
                      <td className="py-3 px-4">
                        <span className="ds-badge">{teacher.jenjang}</span>
                        <div className="text-[11.5px] text-[var(--muted)] truncate max-w-[170px] mt-1">
                          {teacher.mataPelajaran}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {teacher.status === 'VERIFIED' ? (
                          <span className="ds-badge ds-badge-ok">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Terverifikasi
                          </span>
                        ) : teacher.status === 'PENDING' ? (
                          <span className="ds-badge ds-badge-warn">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Menunggu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)] text-[11.5px] font-semibold px-2.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Ditolak
                          </span>
                        )}

                        {teacher.verifiedBy && (
                          <div className="text-[11px] text-[var(--muted)] mt-1">
                            Oleh {teacher.verifiedBy}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(teacher)}
                            className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer"
                            title="Ubah profil & peran"
                            aria-label={`Ubah profil ${teacher.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {teacher.status !== 'VERIFIED' && (
                            <button
                              onClick={() => onUpdateStatus(teacher.id, 'VERIFIED')}
                              className="btn-apple !min-h-[30px] !py-1 !px-2.5 !text-[11.5px]"
                              title="Setujui dan beri akses penuh"
                            >
                              <Check className="w-3 h-3" />
                              Setujui
                            </button>
                          )}

                          {teacher.status !== 'REJECTED' && !isUserSuperAdmin && (
                            <button
                              onClick={() => onUpdateStatus(teacher.id, 'REJECTED')}
                              className="rounded-md border border-[var(--line)] px-2.5 py-1 min-h-[30px] text-[11.5px] font-semibold text-[var(--ink-soft)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
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
                              className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus data guru"
                              aria-label={`Hapus ${teacher.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        <Modal label="Ubah profil guru" onClose={() => setEditingUser(null)} boxClassName="max-w-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--ink)]">Ubah profil guru</h3>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 mt-4">
              <div>
                <label className={labelCls}>Nama lengkap & gelar</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="apple-input" />
              </div>
              <div>
                <label className={labelCls}>Sekolah</label>
                <input type="text" required value={editSchool} onChange={(e) => setEditSchool(e.target.value)} className="apple-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Jenjang</label>
                  <select value={editJenjang} onChange={(e) => setEditJenjang(e.target.value as Jenjang)} className="apple-input">
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Peran</label>
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
                <label className={labelCls}>Mata pelajaran</label>
                <input type="text" value={editMapel} onChange={(e) => setEditMapel(e.target.value)} className="apple-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>NIP / NUPTK</label>
                  <input type="text" value={editNip} onChange={(e) => setEditNip(e.target.value)} className="apple-input" />
                </div>
                <div>
                  <label className={labelCls}>NPSN</label>
                  <input type="text" value={editNpsn} onChange={(e) => setEditNpsn(e.target.value)} className="apple-input" />
                </div>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-apple-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-apple">
                  Simpan
                </button>
              </div>
            </form>
    </Modal>
      )}

      {/* Manual Add Teacher Modal */}
      {showAddModal && (
        <Modal label="Tambah guru baru" onClose={() => setShowAddModal(false)} boxClassName="max-w-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--ink)]">Tambah guru baru</h3>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">
                  Langsung terverifikasi dengan akun Belajar.id.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 mt-4">
              <div>
                <label className={labelCls}>
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
                <label className={labelCls}>
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
                <label className={labelCls}>
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
                  <label className={labelCls}>
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
                  <label className={labelCls}>
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

              <div className="modal-action">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-apple-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-apple">
                  Simpan
                </button>
              </div>
            </form>
    </Modal>
      )}

    </div>
  );
};
