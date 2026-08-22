interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral' | 'blue' | 'teal' | 'amber';
  size?: 'sm' | 'xs';
  showDot?: boolean;
}

function getBadgeThemeClass(label: string): string {
  const norm = label.toLowerCase().trim();

  if (norm === 'starter' || norm === 'blue') return 'badge-blue';
  if (norm === 'growth' || norm === 'primary' || norm === 'sale' || norm === 'support request' || norm === 'in progress') return 'badge-sky';
  if (norm === 'scale' || norm === 'purple' || norm === 'reconciliation' || norm === 'feature request') return 'badge-purple';
  if (norm === 'trial' || norm === 'warning' || norm === 'reversal' || norm === 'open' || norm === 'expiring' || norm === 'amber') return 'badge-amber';
  if (norm === 'active' || norm === 'success' || norm === 'restock' || norm === 'resolved') return 'badge-emerald';
  if (norm === 'suspended' || norm === 'overdue' || norm === 'danger' || norm === 'bug report') return 'badge-rose';

  return 'badge-slate';
}

export default function Badge({ label, size = 'xs', showDot = true }: BadgeProps) {
  const themeClass = getBadgeThemeClass(label);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-700 whitespace-nowrap shadow-2xs transition-all ${
        size === 'xs' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-[12px]'
      } ${themeClass}`}
    >
      {showDot && (
        <span className="badge-dot w-1.5 h-1.5 rounded-full shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
}
