import DashboardFilter from "../features/dashboard/DashboardFilters";
import StatsCards from "../features/dashboard/StatsCards";
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <DashboardFilter />
      <StatsCards />
    </DashboardLayout>
  );
};

export default DashboardPage;
