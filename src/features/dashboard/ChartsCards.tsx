import type { ReactNode } from "react";
import { BarChart3, type LucideIcon } from "lucide-react";

interface ChartsCardProps {
  title: string;
  chart: ReactNode;
  icon?: LucideIcon;
}

const ChartsCard = ({ title, chart, icon: Icon = BarChart3 }: ChartsCardProps) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <div className="min-h-64 rounded-md border border-gray-200 bg-gray-50 p-4">
        {chart}
      </div>
    </div>
  );
};

export default ChartsCard;
