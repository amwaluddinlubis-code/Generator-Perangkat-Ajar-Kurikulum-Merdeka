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
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="sm"
    title="Keluar dari akun?"
    subtitle={`Sesi ${currentUser.name} akan diakhiri.`}
    footer={
      <>
        <button type="button" onClick={onClose} className="btn-apple-secondary btn-sm flex-1">
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onConfirmLogout();
          }}
          className="btn-danger btn-sm flex-1"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </>
    }
  >
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3 text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[14px] font-semibold text-white dark:bg-white dark:text-black">
        {currentUser.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1 truncate">
        <div className="truncate text-[13.5px] font-semibold">
          {currentUser.name}
        </div>
        <div className="truncate text-[12px] text-[var(--app-text-secondary)]">
          {currentUser.email}
        </div>
      </div>
    </div>

    <p className="mt-3 text-[12.5px] leading-5 text-[var(--app-text-tertiary)]">
      Arsip yang tersimpan tetap aman dan bisa dibuka lagi nanti.
    </p>
  </Modal>
);
