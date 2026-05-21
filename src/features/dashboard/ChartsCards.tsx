interface ChartsCardProps {
  title: string;
  chart: React.ReactNode;
}

const ChartsCard = ({ title, chart }: ChartsCardProps) => {
  return (
    <div className="mt-10 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-medium text-gray-700">{title}</h2>
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {chart}
      </div>
    </div>
  );
};

export default ChartsCard;
