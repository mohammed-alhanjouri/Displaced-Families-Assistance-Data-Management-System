import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  className = "",
}: PageHeaderProps) => (
  <div className={`flex items-start gap-3 ${className}`.trim()}>
    <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF] ring-1 ring-blue-100">
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

export default PageHeader;
