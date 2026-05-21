import ChartsCard from "../features/dashboard/ChartsCards";
import DashboardFilter from "../features/dashboard/DashboardFilters";
import StatsCards from "../features/dashboard/StatsCards";
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <DashboardFilter />
      <StatsCards />
      <ChartsCard
        title="Families per Location"
        chart={<p className="text-gray-500">[Chart Placeholder]</p>}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
