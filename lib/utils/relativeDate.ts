/**
 * Format a date string as a relative date (e.g. "Today", "Tomorrow", "in 3 days").
 * Past dates show "Overdue".
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  // Reset time portions for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `in ${diffDays} days`;
  if (diffDays <= 14) return "in 1 week";
  return `in ${Math.ceil(diffDays / 7)} weeks`;
}
