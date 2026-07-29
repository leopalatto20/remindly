export function formatRelativeDate(dateStr: string): string {
  const due = new Date(dateStr);
  const now = new Date();

  // Normalize to start of day for comparison
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = dueStart.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 14) return "In 2 weeks";
  if (diffDays <= 21) return "In 3 weeks";
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}