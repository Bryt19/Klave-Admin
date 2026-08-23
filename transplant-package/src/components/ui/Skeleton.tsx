import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-white/[0.06] ${className}`}
      {...props}
    />
  );
}

// 1. Stats Box Skeleton for Dashboard/Metrics grids
Skeleton.Stats = function SkeletonStats() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-16 h-8 mb-2" />
      <Skeleton className="w-28 h-3" />
    </div>
  );
};

// 2. Card Skeleton for Inventory grid / Staff cards
Skeleton.Card = function SkeletonCard() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-4 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/3 h-3 rounded-full" />
        </div>
        <Skeleton className="w-16 h-4 rounded-full" />
      </div>
      <div className="flex items-end justify-between mt-4">
        <div className="space-y-1">
          <Skeleton className="w-12 h-2" />
          <Skeleton className="w-16 h-6" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="w-20 h-2 ml-auto" />
          <Skeleton className="w-24 h-4 ml-auto" />
        </div>
      </div>
    </div>
  );
};

// 3. Row Skeleton for Tabular Lists / Recent activity / Logs
Skeleton.Row = function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3 animate-in fade-in duration-300">
      <div className="flex-1 space-y-2">
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <Skeleton className="w-16 h-5 rounded-full" />
      <Skeleton className="w-12 h-3" />
    </div>
  );
};
