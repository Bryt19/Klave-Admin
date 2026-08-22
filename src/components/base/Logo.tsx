import { useId } from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ showWordmark = true, size = 'md', className = '' }: LogoProps) {
  const id = useId();

  const markDimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
  }[size];

  const textStyles = {
    sm: 'text-[16px]',
    md: 'text-[19px]',
    lg: 'text-[24px]',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={markDimensions.width}
        height={markDimensions.height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={`${id}-green`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D287" />
            <stop offset="100%" stopColor="#00B06F" />
          </linearGradient>
          <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        {/* Vertical pill (Emerald Green) */}
        <rect x="14" y="3" width="12" height="34" rx="6" fill={`url(#${id}-green)`} />
        {/* Horizontal pill (Cyan / Sky Blue) */}
        <rect x="3" y="14" width="34" height="12" rx="6" fill={`url(#${id}-blue)`} />
        {/* Intersection Overlay */}
        <rect x="14" y="14" width="12" height="12" rx="2" fill="#0083B0" opacity="0.88" />
      </svg>

      {showWordmark && (
        <span
          className={`font-heading font-800 tracking-tight transition-colors ${textStyles}`}
          style={{ color: 'var(--text-primary)' }}
        >
          Klavora
        </span>
      )}
    </div>
  );
}
