import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={10} />}
            {item.to && !isLast ? (
              <button
                onClick={() => navigate(item.to)}
                className="transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? "text-slate-800 dark:text-slate-200" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
