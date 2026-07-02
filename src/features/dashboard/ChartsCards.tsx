import type { ReactNode } from "react";

interface ChartsCardProps {
  title: string;
  chart: ReactNode;
}

const ChartsCard = ({ title, chart }: ChartsCardProps) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-sm font-semibold text-gray-800">{title}</h2>
      <div className="min-h-64 rounded-md border border-gray-200 bg-gray-50 p-4">
        {chart}
      </div>
    </div>
  );
};

export default ChartsCard;
