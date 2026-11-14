import React from 'react';
import { TeacherUser } from '../types';
import { LogOut } from 'lucide-react';
import { Modal } from './ui/Modal';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  currentUser: TeacherUser;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser
}) => {
  if (!isOpen) return null;

  return (
    <Modal label="Keluar dari akun" onClose={onClose} boxClassName="max-w-sm text-center">
        
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
          <LogOut className="w-5 h-5" />
        </div>

        <h3 className="text-[15px] font-semibold text-[var(--ink)]">
          Keluar dari akun?
        </h3>
        
        <p className="mt-1.5 text-[12.5px] text-[var(--muted)]">
          Sesi {currentUser.name} akan diakhiri.
        </p>

        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3 text-left">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[12.5px] font-semibold text-[var(--accent-ink)]">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1 truncate">
            <div className="truncate text-[12.5px] font-semibold text-[var(--ink)]">
              {currentUser.name}
            </div>
            <div className="truncate text-[11.5px] text-[var(--muted)]">
              {currentUser.email}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11.5px] text-[var(--muted)]">
          Arsip yang tersimpan tetap aman dan bisa dibuka lagi nanti.
        </p>

        <div className="modal-action">
          <button
            type="button"
            onClick={onClose}
            className="btn-apple-secondary flex-1"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmLogout();
            }}
            className="flex-1 inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[var(--danger)] px-4 text-[13px] font-semibold text-white transition-colors hover:opacity-90"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>

    </Modal>
  );
};
