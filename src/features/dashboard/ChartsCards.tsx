interface ChartsCardProps {
  title: string;
  chart: React.ReactNode;
}

const ChartsCard = ({ title, chart }: ChartsCardProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5">
      <h2 className="mb-5 text-sm font-medium text-gray-800">{title}</h2>
      <div className="flex h-52 items-center bg-gray-200 px-2 rounded-md">
        {chart}
      </div>
    </div>
  );
};

export default ChartsCard;
