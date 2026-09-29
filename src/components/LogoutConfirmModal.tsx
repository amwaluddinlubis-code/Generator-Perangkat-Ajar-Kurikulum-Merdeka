import React from 'react';
import { TeacherUser } from '../types';
import { LogOut, X, AlertTriangle, ShieldAlert } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50">
            <LogOut className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Konfirmasi Keluar Akun
          </h3>
          
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Apakah Anda yakin ingin mengakhiri sesi dan keluar dari akun Belajar.id atas nama:
          </p>

          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentUser.email}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {currentUser.schoolName}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 italic">
            * Seluruh perangkat ajar yang telah tersimpan di bank arsip tetap aman dan dapat diakses kembali saat Anda masuk.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmLogout();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Keluar Akun</span>
          </button>
        </div>

      </div>
    </div>
  );
};
