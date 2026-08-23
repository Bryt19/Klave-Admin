import { Drug } from '@/types';

export function daysUntil(dateStr: string) {
  if (!dateStr) return 999;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Expiring Soon' | 'Out of Stock' | 'Expired';

export const statusClass: Record<InventoryStatus, string> = {
  'In Stock': 'bg-success-50 dark:bg-success-500/10 text-success-500',
  'Low Stock': 'bg-warning-50 dark:bg-warning-500/10 text-warning-500',
  'Expiring Soon': 'bg-warning-50 dark:bg-warning-500/10 text-warning-500',
  'Out of Stock': 'bg-danger-50 dark:bg-danger-500/10 text-danger-500',
  'Expired': 'bg-danger-50 dark:bg-danger-500/10 text-danger-500',
};

export function isOutOfStock(drug: Drug): boolean {
  const total = (drug.batches || []).reduce((sum, batch) => sum + batch.quantity, 0);
  return total <= 0;
}

export function hasLowStock(drug: Drug): boolean {
  const total = (drug.batches || []).reduce((sum, batch) => sum + batch.quantity, 0);
  return total > 0 && total <= (drug.lowStockThreshold ?? 10);
}

export function hasExpiredBatch(drug: Drug): boolean {
  return (drug.batches || []).some(batch => daysUntil(batch.expiry) <= 0 && batch.quantity > 0);
}

export function hasExpiringSoonBatch(drug: Drug): boolean {
  return (drug.batches || []).some(batch => {
    const d = daysUntil(batch.expiry);
    return d > 0 && d <= 30 && batch.quantity > 0;
  });
}

export function hasNoActiveStock(drug: Drug): boolean {
  const activeTotal = (drug.batches || []).filter(b => daysUntil(b.expiry) > 0).reduce((sum, b) => sum + b.quantity, 0);
  return activeTotal <= 0 && (drug.batches || []).some(b => b.quantity > 0);
}

export function getDrugStatus(drug: Drug): InventoryStatus {
  if (isOutOfStock(drug)) return 'Out of Stock';
  if (hasNoActiveStock(drug)) return 'Expired';
  if (hasLowStock(drug)) return 'Low Stock';
  if (hasExpiringSoonBatch(drug)) return 'Expiring Soon';
  return 'In Stock';
}

export function getInventoryCardOutlineClass(drug: Drug): string {
  // Red outline for expiry risk or out-of-stock.
  if (isOutOfStock(drug) || hasExpiredBatch(drug) || hasExpiringSoonBatch(drug)) {
    return 'border-danger-400 ring-2 ring-danger-400/40 shadow-md shadow-danger-500/10';
  }

  // Amber outline for low-stock only.
  if (hasLowStock(drug)) {
    return 'border-warning-400 ring-2 ring-warning-400/40 shadow-md shadow-warning-500/10';
  }

  return 'border-border-light dark:border-border-dark hover:border-primary-500';
}

export function getNearestExpiry(drug: Drug): string {
  const batches = drug.batches || [];
  const active = batches.filter(b => b.quantity > 0);
  if (active.length === 0) return batches[0]?.expiry ?? '-';
  return [...active].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())[0].expiry;
}
