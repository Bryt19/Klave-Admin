import { useId } from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ showWordmark = true, size = 'md', className = '' }: LogoProps) {
  const instanceId = useId().replace(/:/g, '');
  const greenGradId = `klavGreen_${instanceId}`;
  const cyanGradId = `klavCyan_${instanceId}`;

  const dimensions = {
    sm: { mark: 24, text: 'text-[16px]' },
    md: { mark: 30, text: 'text-[19px]' },
    lg: { mark: 36, text: 'text-[22px]' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-visibility Brand Symbol (Normal Proportions) */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={dimensions.mark}
          height={dimensions.mark}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-150 hover:scale-105"
        >
          <defs>
            <linearGradient id={greenGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E699" />
              <stop offset="100%" stopColor="#00B06F" />
            </linearGradient>
            <linearGradient id={cyanGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <filter id={`shadow_${instanceId}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0EA5E9" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Glowing background halo */}
          <g filter={`url(#shadow_${instanceId})`}>
            {/* Vertical Pill (Vibrant Emerald Green) */}
            <rect x="14" y="2" width="12" height="36" rx="6" fill={`url(#${greenGradId})`} />

            {/* Horizontal Pill (Vibrant Sky Blue) */}
            <rect x="2" y="14" width="36" height="12" rx="6" fill={`url(#${cyanGradId})`} />

            {/* Center Overlap Intersection */}
            <rect x="14" y="14" width="12" height="12" rx="3" fill="#0083B0" opacity="0.8" />
          </g>
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`font-heading font-700 tracking-tight transition-colors ${dimensions.text}`}
          style={{ color: 'var(--text-primary)' }}
        >
          Klavora
        </span>
      )}
    </div>
  );
}
