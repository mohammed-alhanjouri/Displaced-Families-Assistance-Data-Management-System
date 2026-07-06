import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../features/theme/useTheme";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme();
  const nextThemeLabel = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      onClick={toggleTheme}
      className={`inline-flex min-h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 shadow-sm transition hover:border-blue-200 hover:text-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300 dark:focus:ring-offset-slate-950 ${className}`.trim()}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
