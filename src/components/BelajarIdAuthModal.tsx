import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { DemoUser, TeacherUser } from '../types';
import {
  GraduationCap,
  X,
  ArrowRight,
  Mail,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface BelajarIdAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeacherUser;
  /** Login akun demo — hanya tersedia di server pengembangan. */
  onDemoLogin: (userId: string) => Promise<void>;
  onLogin: (data: { email: string; password: string }) => Promise<{ pending?: boolean; message?: string } | void>;
  onLogout?: () => void;
  demoUsers: DemoUser[];
}

const labelCls = 'block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5';
const iconCls = 'w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none';

const LABEL_PERAN: Record<TeacherUser['role'], string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  KEPALA_SEKOLAH: 'Kepala Sekolah',
  GURU: 'Guru',
};

export const BelajarIdAuthModal: React.FC<BelajarIdAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDemoLogin,
  onLogin,
  onLogout,
  demoUsers,
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>(
    demoUsers.length > 0 ? 'presets' : 'custom'
  );

  // Bila daftar demo kosong (produksi), langsung arahkan ke formulir kredensial.
  useEffect(() => {
    if (isOpen && demoUsers.length === 0) setActiveTab('custom');
  }, [isOpen, demoUsers.length]);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = async (acc: DemoUser) => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await onDemoLogin(acc.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal beralih akun demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const hasil = await onLogin({ email: email.trim(), password });
      if (hasil && hasil.pending) {
        setError(hasil.message || 'Akun belum diverifikasi admin.');
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk dengan akun tersebut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal label="Ganti akun Belajar.id" onClose={onClose} boxClassName="max-w-xl p-0 overflow-hidden">
      {/* Header */}
      <div className="relative border-b border-[var(--line)] px-5 py-4">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="pr-10">
            <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              Ganti akun Belajar.id
            </h3>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">
              Masuk dengan akun lain memakai email dan kata sandi.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selection */}
      <div className="px-5 pt-4">
        <div className="apple-segment w-full grid grid-cols-2" role="tablist" aria-label="Pilih cara masuk">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'presets'}
            onClick={() => setActiveTab('presets')}
            data-active={activeTab === 'presets'}
            disabled={demoUsers.length === 0}
            title={demoUsers.length === 0 ? 'Tidak tersedia di server produksi' : undefined}
          >
            Akun demo cepat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'custom'}
            onClick={() => setActiveTab('custom')}
            data-active={activeTab === 'custom'}
          >
            Akun lain
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="max-h-[70vh] overflow-y-auto p-5">
        {error && (
          <div
            role="alert"
            className="mb-3 flex items-start gap-2 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2.5 text-[12px] text-[var(--danger)]"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-2.5">
            <p className="text-[12px] text-[var(--muted)]">
              Pilih salah satu profil demo untuk beralih akun. Hanya tersedia di server pengembangan.
            </p>

            <div className="space-y-1.5">
              {demoUsers.map((acc) => {
                const isCurrent = currentUser.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    disabled={loading}
                    onClick={() => handleSelectPreset(acc)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors cursor-pointer disabled:opacity-60 ${
                      isCurrent
                        ? 'border-[var(--accent)]/45 bg-[var(--accent-soft)]'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--surface-3)] text-[var(--ink-soft)] flex items-center justify-center font-semibold text-[12.5px] shrink-0">
                        {acc.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                            {acc.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ok)]" />
                            {LABEL_PERAN[acc.role]}
                          </span>
                        </div>
                        <div className="truncate text-[11.5px] text-[var(--muted)]">
                          {acc.schoolName} · {acc.mataPelajaran}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isCurrent ? (
                        <span className="ds-badge ds-badge-accent">Aktif</span>
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-[var(--surface-2)] text-[var(--muted)] flex items-center justify-center">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-[12px] font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] cursor-pointer"
              >
                Keluar dari akun ini
              </button>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOM LOGIN */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className={labelCls} htmlFor="switch-email">
                Email Belajar.id
              </label>
              <div className="relative">
                <Mail className={iconCls} />
                <input
                  id="switch-email"
                  type="email"
                  required
                  placeholder="nama.guru@guru.sd.belajar.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="apple-input !pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="switch-password">
                Kata sandi
              </label>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  id="switch-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="apple-input !pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-apple w-full"
            >
              {loading ? 'Memproses…' : 'Masuk dengan akun ini'}
            </button>

            <p className="text-[11px] text-[var(--muted)]">
              Akun yang baru mendaftar harus diverifikasi admin sebelum bisa masuk.
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
};
