// DashboardCard.jsx — generic card wrapper used by every dashboard widget.
// Provides a consistent white card shell with an optional title, subtitle,
// and action slot (e.g. a "View All" button). Content goes in children.

export default function DashboardCard({
  title,
  subtitle,
  action,
  icon,
  className = "",
  bodyClassName = "",
  children,
}) {
  const hasHeader = title || subtitle || action;

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-6 ${className}`}
    >
      {hasHeader && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {icon}
            <div>
              {title && (
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
