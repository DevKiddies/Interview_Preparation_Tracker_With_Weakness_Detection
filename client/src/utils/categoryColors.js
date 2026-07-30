// categoryColors.js — deterministic color assignment for categories.
// The DB's `categories` table is just {id, name} (no color field), so every
// admin page that needs to color-code a category derives it from the id
// instead, cycling through a fixed palette.

export const CATEGORY_PALETTE = ["blue", "indigo", "teal", "amber", "purple", "emerald"];

const CATEGORY_STYLES = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800/50",    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",    icon: "text-blue-600 dark:text-blue-400",    chart: "#3b82f6" },
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-900/20",  border: "border-indigo-200 dark:border-indigo-800/50", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400", icon: "text-indigo-600 dark:text-indigo-400", chart: "#6366f1" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-900/20",    border: "border-teal-200 dark:border-teal-800/50",    badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",    icon: "text-teal-600 dark:text-teal-400",    chart: "#14b8a6" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-200 dark:border-amber-800/50",  badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",  icon: "text-amber-600 dark:text-amber-400",  chart: "#f59e0b" },
  purple:  { bg: "bg-purple-50 dark:bg-purple-900/20",  border: "border-purple-200 dark:border-purple-800/50", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400", icon: "text-purple-600 dark:text-purple-400", chart: "#a855f7" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400", chart: "#10b981" },
};

export function categoryStyle(categoryId) {
  const key = CATEGORY_PALETTE[Number(categoryId) % CATEGORY_PALETTE.length];
  return CATEGORY_STYLES[key];
}
