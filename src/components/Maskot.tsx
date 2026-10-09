// FRIENDLY: maskot burung hantu "Owi" — karakter ramah Ruang Guru Merdeka.
// Dipakai di hero Beranda, halaman login, dan empty state. SVG murni, tanpa aset eksternal.
import React from 'react';

interface MaskotProps {
  /** diameter dalam px */
  size?: number;
  /** 'biasa' | 'wisuda' (pakai topi toga — untuk login/hero) */
  varian?: 'biasa' | 'wisuda';
  /** animasi melayang lembut */
  melayang?: boolean;
  className?: string;
  /** label aksesibilitas */
  label?: string;
}

export const Maskot: React.FC<MaskotProps> = ({
  size = 96,
  varian = 'biasa',
  melayang = true,
  className = '',
  label = 'Maskot burung hantu Owi',
}) => {
  return (
    <div
      role="img"
      aria-label={label}
      className={`${melayang ? 'ux-float' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        {/* lingkaran latar hangat */}
        <circle cx="60" cy="60" r="56" fill="#FFEFD9" />
        <circle cx="60" cy="60" r="56" fill="none" stroke="#F5C77E" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" opacity="0.7" />

        {/* jambul telinga */}
        <path d="M38 30 L30 12 L50 22 Z" fill="#E8963C" />
        <path d="M82 30 L90 12 L70 22 Z" fill="#E8963C" />

        {/* badan */}
        <ellipse cx="60" cy="68" rx="34" ry="36" fill="#F5A83D" />
        {/* perut */}
        <ellipse cx="60" cy="78" rx="22" ry="24" fill="#FFE9C7" />
        {/* bulu perut */}
        <path d="M48 70 q6 6 12 0 q6 6 12 0" stroke="#E8963C" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M48 82 q6 6 12 0 q6 6 12 0" stroke="#E8963C" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* sayap */}
        <ellipse cx="28" cy="70" rx="9" ry="20" fill="#E8963C" transform="rotate(12 28 70)" />
        <ellipse cx="92" cy="70" rx="9" ry="20" fill="#E8963C" transform="rotate(-12 92 70)" />

        {/* mata */}
        <circle cx="47" cy="52" r="13" fill="#FFFFFF" />
        <circle cx="73" cy="52" r="13" fill="#FFFFFF" />
        <circle cx="49" cy="54" r="6" fill="#3B2F2F" />
        <circle cx="71" cy="54" r="6" fill="#3B2F2F" />
        <circle cx="51" cy="52" r="2" fill="#FFFFFF" />
        <circle cx="73" cy="52" r="2" fill="#FFFFFF" />

        {/* paruh */}
        <path d="M60 62 l-7 6 q7 8 14 0 Z" fill="#E2703A" />

        {/* pipi merona */}
        <circle cx="38" cy="64" r="5" fill="#F4A988" opacity="0.7" />
        <circle cx="82" cy="64" r="5" fill="#F4A988" opacity="0.7" />

        {/* kaki */}
        <path d="M48 102 v6 M54 102 v6 M66 102 v6 M72 102 v6" stroke="#C97B2D" strokeWidth="3.5" strokeLinecap="round" />

        {/* topi wisuda */}
        {varian === 'wisuda' && (
          <g>
            <rect x="34" y="6" width="52" height="10" rx="2" fill="#3B2F5A" transform="rotate(-6 60 11)" />
            <path d="M32 14 L60 26 L88 14 L60 6 Z" fill="#4A3B6B" transform="rotate(-6 60 14)" />
            <rect x="56" y="2" width="8" height="8" rx="2" fill="#7C6AAE" transform="rotate(-6 60 6)" />
            <line x1="84" y1="12" x2="84" y2="30" stroke="#F5C77E" strokeWidth="3" strokeLinecap="round" />
            <circle cx="84" cy="33" r="4" fill="#F5C77E" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default Maskot;
