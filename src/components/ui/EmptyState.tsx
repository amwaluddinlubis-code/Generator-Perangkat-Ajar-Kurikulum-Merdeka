import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Keadaan kosong standar: ikon, judul, deskripsi, satu aksi. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3 className="mt-4 text-[16px] font-bold tracking-[-.02em]">{title}</h3>
    {description && (
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-5 text-[var(--app-text-secondary)]">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
