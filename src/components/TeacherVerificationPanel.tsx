import React, { useEffect, useState } from 'react';
import { TeacherUser, Jenjang } from '../types';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { Field } from './ui/Field';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  UserPlus,
  School,
  Mail,
  GraduationCap,
  Check,
  Trash2,
  Crown,
  Pencil,
  UserSearch,
} from 'lucide-react';

interface TeacherVerificationPanelProps {
  users: TeacherUser[];
  currentUser: TeacherUser;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddUser: (user: Partial<TeacherUser>) => Promise<void>;
  onUpdateUser: (userId: string, fields: Partial<TeacherUser>) => Promise<void>;
}

export const TeacherVerificationPanel: React.FC<TeacherVerificationPanelProps> = ({
  users,
  currentUser,
  loading = false,
  error = null,
  onRetry,
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

  // Bulk selection (hanya baris yang tampil & bisa diverifikasi)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectableIds = filteredUsers
    .filter(u => u.role !== 'SUPER_ADMIN' && u.id !== currentUser.id)
    .map(u => u.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedIds.includes(id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : selectableIds);
  };

  // Seleksi hangus bila filter berubah — predictable
  useEffect(() => {
    setSelectedIds([]);
  }, [statusFilter, jenjangFilter, searchTerm]);

  const [bulkWorking, setBulkWorking] = useState(false);
  const handleBulkStatus = async (status: 'VERIFIED' | 'REJECTED') => {
    if (selectedIds.length === 0 || bulkWorking) return;
    setBulkWorking(true);
    try {
      for (const id of selectedIds) {
        await onUpdateStatus(id, status);
      }
      setSelectedIds([]);
    } finally {
      setBulkWorking(false);
    }
  };

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

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="apple-card flex flex-wrap items-center gap-2 p-3.5" role="toolbar" aria-label="Aksi massal">
          <Badge tone="info" dot>{selectedIds.length} dipilih</Badge>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="btn-apple-secondary btn-sm"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus('REJECTED')}
              disabled={bulkWorking}
              className="btn-apple-secondary btn-sm"
            >
              Tolak terpilih
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus('VERIFIED')}
              disabled={bulkWorking}
              className="btn-apple btn-sm"
            >
              <Check className="h-3.5 w-3.5" />
              {bulkWorking ? 'Memproses…' : 'Setujui terpilih'}
            </button>
          </div>
        </div>
      )}

      {/* Teachers List */}
      <div
        className="data-table-wrap data-table-sticky-first"
        role="region"
        aria-label="Daftar guru, dapat digulir horizontal"
        tabIndex={0}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th className="!py-3 w-10">
                <label className="check-hit">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={selectableIds.length === 0}
                    aria-label="Pilih semua yang tampil"
                  />
                </label>
              </th>
              <th>Guru & email</th>
              <th>Sekolah</th>
              <th>Jenjang & mapel</th>
              <th>Status</th>
              <th className="!text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} aria-hidden="true">
                  <td><div className="skeleton h-4 w-4 !rounded" /></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="skeleton h-9 w-9 !rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-2/3" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td><div className="skeleton h-4 w-3/4" /></td>
                  <td><div className="skeleton h-4 w-1/2" /></td>
                  <td><div className="skeleton h-6 w-24 !rounded-full" /></td>
                  <td><div className="skeleton ms-auto h-8 w-24 !rounded-full" /></td>
                </tr>
              ))
            ) : error && users.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={<AlertCircle className="h-6 w-6" />}
                    title="Data guru tidak dapat dimuat"
                    description={error}
                    action={
                      <button type="button" onClick={onRetry} className="btn-apple btn-sm">
                        <RefreshCw className="h-4 w-4" />
                        Coba lagi
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={<UserSearch className="h-6 w-6" />}
                    title="Tidak ada guru yang cocok"
                    description="Ubah kata kunci atau filter status/jenjang untuk menemukan guru."
                  />
                </td>
              </tr>
            ) : (
              filteredUsers.map((teacher) => {
                const isUserSuperAdmin = teacher.role === 'SUPER_ADMIN';
                const isCurrentTeacher = teacher.id === currentUser.id;
                const selectable = !isUserSuperAdmin && !isCurrentTeacher;

                return (
                  <tr key={teacher.id}>

                    <td className="!py-3">
                      <label className="check-hit">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(teacher.id)}
                          onChange={() => toggleSelect(teacher.id)}
                          disabled={!selectable}
                          aria-label={`Pilih ${teacher.name}`}
                        />
                      </label>
                    </td>

                    {/* Name & Email */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[13px] font-semibold text-white dark:bg-white dark:text-black">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{teacher.name}</span>
                            {isUserSuperAdmin && (
                              <Badge tone="neutral">
                                <Crown className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                            {isCurrentTeacher && (
                              <Badge tone="info">Anda</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 truncate text-[12px] text-[var(--app-text-secondary)]">
                            <Mail className="h-3 w-3 shrink-0" />
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td>
                      <div className="flex items-center gap-1.5 font-medium">
                        <School className="h-3.5 w-3.5 shrink-0 text-[var(--app-text-tertiary)]" />
                        <span className="max-w-[200px] truncate">{teacher.schoolName}</span>
                      </div>
                      {teacher.npsn && (
                        <div className="text-[11.5px] text-[var(--app-text-tertiary)]">NPSN: {teacher.npsn}</div>
                      )}
                    </td>

                    {/* Jenjang & Mapel */}
                    <td>
                      <Badge tone="neutral">{teacher.jenjang}</Badge>
                      <div className="mt-1 max-w-[180px] truncate text-[12.5px] text-[var(--app-text-secondary)]">
                        {teacher.mataPelajaran}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      {teacher.status === 'VERIFIED' ? (
                        <Badge tone="success" dot>Terverifikasi</Badge>
                      ) : teacher.status === 'PENDING' ? (
                        <Badge tone="warning" dot>Menunggu</Badge>
                      ) : (
                        <Badge tone="danger" dot>Ditolak</Badge>
                      )}

                      {teacher.verifiedBy && (
                        <div className="mt-1 text-[11px] text-[var(--app-text-tertiary)]">
                          Oleh: {teacher.verifiedBy}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="!text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(teacher)}
                          className="rounded-full p-2 text-[var(--app-text-tertiary)] transition-colors hover:bg-black/5 hover:text-[var(--app-text)] dark:hover:bg-white/10"
                          title="Ubah profil & peran"
                          aria-label={`Ubah ${teacher.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {teacher.status !== 'VERIFIED' && (
                          <button
                            onClick={() => onUpdateStatus(teacher.id, 'VERIFIED')}
                            className="btn-apple btn-sm"
                            title="Setujui dan beri akses penuh"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}

                        {teacher.status !== 'REJECTED' && !isUserSuperAdmin && (
                          <button
                            onClick={() => onUpdateStatus(teacher.id, 'REJECTED')}
                            className="btn-apple-secondary btn-sm"
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
                            className="rounded-full p-2 text-[var(--app-text-tertiary)] transition-colors hover:bg-black/5 hover:text-[var(--app-danger)] dark:hover:bg-white/10"
                            title="Hapus data guru"
                            aria-label={`Hapus ${teacher.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Teacher Modal (admin) */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        size="md"
        title="Ubah profil guru"
        subtitle={editingUser?.email}
        footer={
          <>
            <button type="button" onClick={() => setEditingUser(null)} className="btn-apple-secondary btn-sm">
              Batal
            </button>
            <button type="submit" form="edit-teacher-form" className="btn-apple btn-sm">
              Simpan perubahan
            </button>
          </>
        }
      >
        {editingUser && (
          <form id="edit-teacher-form" onSubmit={handleEditSubmit} className="space-y-4">
            <Field label="Nama lengkap & gelar" htmlFor="edit-name" required>
              <input id="edit-name" type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="apple-input" />
            </Field>
            <Field label="Sekolah" htmlFor="edit-school" required hint={!canChangeTenant ? 'Hanya Super Admin yang dapat memindahkan guru antar sekolah.' : undefined}>
              <input id="edit-school" type="text" required value={editSchool} onChange={(e) => setEditSchool(e.target.value)} disabled={!canChangeTenant} className="apple-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jenjang" htmlFor="edit-jenjang">
                <select id="edit-jenjang" value={editJenjang} onChange={(e) => setEditJenjang(e.target.value as Jenjang)} className="apple-input">
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>
              </Field>
              <Field
                label="Peran"
                htmlFor="edit-role"
                hint={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser.id ? 'Peran ini tidak dapat diubah.' : undefined}
              >
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'GURU' | 'ADMIN')}
                  disabled={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser.id}
                  className="apple-input"
                  title={editingUser.role === 'SUPER_ADMIN' || editingUser.id === currentUser.id ? 'Peran ini tidak dapat diubah' : 'Ubah peran'}
                >
                  <option value="GURU">Guru</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </Field>
            </div>
            <Field label="Mata pelajaran" htmlFor="edit-mapel">
              <input id="edit-mapel" type="text" value={editMapel} onChange={(e) => setEditMapel(e.target.value)} className="apple-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="NIP / NUPTK" htmlFor="edit-nip">
                <input id="edit-nip" type="text" value={editNip} onChange={(e) => setEditNip(e.target.value)} className="apple-input" />
              </Field>
              <Field label="NPSN" htmlFor="edit-npsn">
                <input id="edit-npsn" type="text" value={editNpsn} onChange={(e) => setEditNpsn(e.target.value)} className="apple-input" />
              </Field>
            </div>
          </form>
        )}
      </Modal>

      {/* Manual Add Teacher Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
        title="Tambah guru baru"
        subtitle="Langsung terverifikasi dengan akun Belajar.id."
        footer={
          <>
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-apple-secondary btn-sm">
              Batal
            </button>
            <button type="submit" form="add-teacher-form" className="btn-apple btn-sm">
              Simpan guru
            </button>
          </>
        }
      >
        <form id="add-teacher-form" onSubmit={handleCreateTeacher} className="space-y-4">
          <Field label="Nama lengkap & gelar" htmlFor="add-name" required>
            <input
              id="add-name"
              type="text"
              required
              placeholder="Contoh: Budi Prasetyo, S.Pd."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="apple-input"
            />
          </Field>

          <Field label="Email Belajar.id" htmlFor="add-email" required hint="@guru.sd / @guru.smp / @guru.sma / @guru.smk.belajar.id">
            <input
              id="add-email"
              type="email"
              required
              placeholder="budi.prasetyo@guru.smp.belajar.id"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="apple-input"
            />
          </Field>

          <Field label="Sekolah" htmlFor="add-school">
            <input
              id="add-school"
              type="text"
              placeholder="SMP Negeri 1 Surabaya"
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
              className="apple-input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenjang" htmlFor="add-jenjang">
              <select
                id="add-jenjang"
                value={newJenjang}
                onChange={(e) => setNewJenjang(e.target.value as Jenjang)}
                className="apple-input"
              >
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>
            </Field>

            <Field label="Mata pelajaran" htmlFor="add-mapel">
              <input
                id="add-mapel"
                type="text"
                value={newMapel}
                onChange={(e) => setNewMapel(e.target.value)}
                placeholder="Matematika"
                className="apple-input"
              />
            </Field>
          </div>
        </form>
      </Modal>

    </div>
  );
};
