import Breadcrumbs from "../components/ui/Breadcrumbs";
import ChartsCard from "../features/dashboard/ChartsCards";
import DashboardFilter from "../features/dashboard/DashboardFilters";
import StatsCards from "../features/dashboard/StatsCards";
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }]} />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Dashboard
        </h1>
      </div>
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
