import React from 'react';

// UI-14: satu-satunya komponen avatar — dipakai header & sidebar agar warna,
// bentuk, dan cara menghitung inisial tidak pernah berbeda lagi.
export const Avatar: React.FC<{
  name: string;
  size?: number;
  className?: string;
}> = ({ name, size = 32, className = '' }) => {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={`rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
};
