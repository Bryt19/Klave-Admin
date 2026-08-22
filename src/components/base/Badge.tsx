interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral' | 'blue' | 'teal' | 'amber';
  size?: 'sm' | 'xs';
  showDot?: boolean;
}

function getBadgeStyle(label: string, variant?: BadgeProps['variant']) {
  const norm = label.toLowerCase().trim();

  if (norm === 'starter') {
    return {
      classes: 'bg-blue-500 text-white border-blue-600 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700/50',
      dot: 'bg-blue-200 dark:bg-blue-400',
    };
  }
  if (norm === 'growth') {
    return {
      classes: 'bg-sky-500 text-white border-sky-600 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700/50',
      dot: 'bg-sky-200 dark:bg-sky-400',
    };
  }
  if (norm === 'scale') {
    return {
      classes: 'bg-purple-500 text-white border-purple-600 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700/50',
      dot: 'bg-purple-200 dark:bg-purple-400',
    };
  }
  if (norm === 'trial') {
    return {
      classes: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/50',
      dot: 'bg-amber-200 dark:bg-amber-400',
    };
  }
  if (norm === 'active') {
    return {
      classes: 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/50',
      dot: 'bg-emerald-200 dark:bg-emerald-400',
    };
  }
  if (norm === 'churned' || norm === 'overdue' || norm === 'danger' || norm === 'bug report') {
    return {
      classes: 'bg-rose-500 text-white border-rose-600 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/50',
      dot: 'bg-rose-200 dark:bg-rose-400',
    };
  }
  if (norm === 'suspended' || norm === 'cancelled') {
    return {
      classes: 'bg-slate-500 text-white border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-600/50',
      dot: 'bg-slate-300 dark:bg-slate-400',
    };
  }
  if (norm === 'sale') {
    return {
      classes: 'bg-sky-500 text-white border-sky-600 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700/50',
      dot: 'bg-sky-200 dark:bg-sky-400',
    };
  }
  if (norm === 'restock') {
    return {
      classes: 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/50',
      dot: 'bg-emerald-200 dark:bg-emerald-400',
    };
  }
  if (norm === 'reversal') {
    return {
      classes: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/50',
      dot: 'bg-amber-200 dark:bg-amber-400',
    };
  }
  if (norm === 'reconciliation') {
    return {
      classes: 'bg-purple-500 text-white border-purple-600 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700/50',
      dot: 'bg-purple-200 dark:bg-purple-400',
    };
  }
  if (norm === 'open' || norm === 'expiring') {
    return {
      classes: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/50',
      dot: 'bg-amber-200 dark:bg-amber-400',
    };
  }
  if (norm === 'in progress' || norm === 'support request') {
    return {
      classes: 'bg-sky-500 text-white border-sky-600 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700/50',
      dot: 'bg-sky-200 dark:bg-sky-400',
    };
  }
  if (norm === 'resolved') {
    return {
      classes: 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/50',
      dot: 'bg-emerald-200 dark:bg-emerald-400',
    };
  }

  const variants: Record<string, { classes: string; dot: string }> = {
    primary: {
      classes: 'bg-sky-500 text-white border-sky-600 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700/50',
      dot: 'bg-sky-200 dark:bg-sky-400',
    },
    success: {
      classes: 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/50',
      dot: 'bg-emerald-200 dark:bg-emerald-400',
    },
    warning: {
      classes: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/50',
      dot: 'bg-amber-200 dark:bg-amber-400',
    },
    danger: {
      classes: 'bg-rose-500 text-white border-rose-600 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/50',
      dot: 'bg-rose-200 dark:bg-rose-400',
    },
    purple: {
      classes: 'bg-purple-500 text-white border-purple-600 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700/50',
      dot: 'bg-purple-200 dark:bg-purple-400',
    },
    neutral: {
      classes: 'bg-slate-500 text-white border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-600/50',
      dot: 'bg-slate-300 dark:bg-slate-400',
    },
    blue: {
      classes: 'bg-blue-500 text-white border-blue-600 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700/50',
      dot: 'bg-blue-200 dark:bg-blue-400',
    },
    teal: {
      classes: 'bg-teal-500 text-white border-teal-600 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-700/50',
      dot: 'bg-teal-200 dark:bg-teal-400',
    },
    amber: {
      classes: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/50',
      dot: 'bg-amber-200 dark:bg-amber-400',
    },
  };

  return variants[variant || 'primary'] || variants.primary;
}

export default function Badge({ label, variant, size = 'xs', showDot = true }: BadgeProps) {
  const style = getBadgeStyle(label, variant);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold tracking-tight whitespace-nowrap border border-solid transition-all ${
        size === 'xs' ? 'px-3 py-1 text-[11px]' : 'px-3.5 py-1 text-[12px]'
      } ${style.classes}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      )}
      <span>{label}</span>
    </span>
  );
}
