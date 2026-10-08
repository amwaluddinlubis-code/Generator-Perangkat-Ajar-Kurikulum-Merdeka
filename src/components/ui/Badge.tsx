import React from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
  title?: string;
}

/** Badge status standar — satu bahasa di seluruh aplikasi. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', dot = false, children, title }) => (
  <span className={`badge badge-${tone}`} title={title}>
    {dot && <span className="badge-dot" aria-hidden="true" />}
    {children}
  </span>
);
