/**
 * Formats a raw UUID into a human-readable, shorter string for UI presentation.
 * It strictly preserves the original UUID length conceptually, but returns a shortened identifier.
 * 
 * @param uuid The raw database UUID (e.g., '0e64a722-9fba-44...')
 * @param entityType A descriptive prefix for the entity (e.g., 'Batch', 'TXN', 'User')
 * @returns A formatted string like 'Batch-0E64A'
 */
export function formatEntityId(uuid: string, entityType: string = 'ID'): string {
  if (!uuid) return '-';
  
  // Extract the first 5 alphanumeric characters from the UUID, removing any hyphens
  const shortId = uuid.replace(/-/g, '').substring(0, 5).toUpperCase();
  
  return `${entityType}-${shortId}`;
}

/**
 * Formats a transaction ID or receipt reference for display (e.g., KLV-070DC700).
 */
export function formatTxId(uuid: string): string {
  if (!uuid) return '-';
  const shortId = uuid.split('-')[0].substring(0, 8).toUpperCase();
  return `KLV-${shortId}`;
}

/**
 * Helper to generate sequential alphabetical labels (A, B, C... Z, AA, AB) based on an array index.
 * Useful for mapping over lists where a short, predictable label is better than a random ID slice.
 * 
 * @param index The zero-based index of the item in the array
 * @param prefix An optional prefix (e.g., 'Batch')
 * @returns A formatted string like 'Batch A' or 'Batch B'
 */
export function getSequentialLabel(index: number, prefix: string = ''): string {
  let label = '';
  let tempIndex = index;
  
  while (tempIndex >= 0) {
    label = String.fromCharCode(65 + (tempIndex % 26)) + label;
    tempIndex = Math.floor(tempIndex / 26) - 1;
  }
  
  return prefix ? `${prefix} ${label}` : label;
}

/**
 * Calculates a friendly human-readable relative time string (e.g. 'just now', '5m ago', '2h ago', 'yesterday', '3d ago').
 */
export function timeAgo(ts: string | Date | null | undefined): string {
  if (!ts) return 'recently';
  const time = typeof ts === 'string' ? new Date(ts).getTime() : ts.getTime();
  const diff = Date.now() - time;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

/**
 * Calculates the number of days until a future date string.
 */
export function daysUntil(dateStr: string | Date | null | undefined): number {
  if (!dateStr) return 999;
  const time = typeof dateStr === 'string' ? new Date(dateStr).getTime() : dateStr.getTime();
  const diff = time - Date.now();
  return Math.ceil(diff / 86400000);
}

/**
 * Formats a monetary amount into Ghana Cedis (GH₵).
 */
export function formatCurrency(amount: number | string | null | undefined, currency: string = 'GH₵'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  return `${currency} ${num.toFixed(2)}`;
}

/**
 * Deterministically generates a consistent avatar background color based on a staff member's ID or name.
 * Prevents color shifting across renders and page reloads.
 */
export function getStaffAvatarColor(nameOrId: string | null | undefined): string {
  const COLORS = ['#10B981', '#0EA5E9', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#3B82F6', '#14B8A6'];
  if (!nameOrId) return COLORS[0];
  
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}


