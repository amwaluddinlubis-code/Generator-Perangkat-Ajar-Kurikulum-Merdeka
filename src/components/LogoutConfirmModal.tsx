import React from 'react';
import { TeacherUser } from '../types';
import { LogOut } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="apple-card max-w-sm w-full p-6 text-center">
        
        <div className="w-12 h-12 rounded-full bg-black/[0.05] dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-[17px] font-semibold tracking-tight">
          Keluar dari akun?
        </h3>
        
        <p className="text-[13.5px] text-[#6e6e73] dark:text-[#98989d] mt-1.5">
          Sesi {currentUser.name} akan diakhiri.
        </p>

        <div className="mt-4 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 text-left flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black dark:bg-white dark:text-black text-white font-semibold flex items-center justify-center text-[14px] shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="truncate flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold truncate">
              {currentUser.name}
            </div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#98989d] truncate">
              {currentUser.email}
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[#86868b] mt-3">
          Arsip yang tersimpan tetap aman dan bisa dibuka lagi nanti.
        </p>

        <div className="flex items-center gap-2 mt-5">
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
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#ff3b30] hover:bg-[#e5342c] text-white font-semibold text-[14.5px] rounded-[980px] min-h-[44px] px-5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
