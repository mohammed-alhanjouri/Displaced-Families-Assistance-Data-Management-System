import { useCallback, useState } from "react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import ChartsCard from "../features/dashboard/ChartsCards";
import DashboardFilter from "../features/dashboard/DashboardFilters";
import StatsCards from "../features/dashboard/StatsCards";
import DashboardLayout from "../layouts/DashboardLayout";
import type { DashboardStatsFilters } from "../lib/families";

const emptyDashboardFilters: DashboardStatsFilters = {
  campId: "",
  fromDate: "",
  toDate: "",
};

const DashboardPage = () => {
  const [filters, setFilters] = useState<DashboardStatsFilters>({
    ...emptyDashboardFilters,
  });
  const [filterRefreshToken, setFilterRefreshToken] = useState(0);
  const [isFilterActionLoading, setIsFilterActionLoading] = useState(false);

  const handleApplyFilters = (nextFilters: DashboardStatsFilters) => {
    setIsFilterActionLoading(true);
    setFilters({ ...nextFilters });
    setFilterRefreshToken((current) => current + 1);
  };

  const handleClearFilters = () => {
    setIsFilterActionLoading(false);
    setFilters({ ...emptyDashboardFilters });
    setFilterRefreshToken((current) => current + 1);
  };

  const handleStatsLoadingChange = useCallback((isLoading: boolean) => {
    if (!isLoading) {
      setIsFilterActionLoading(false);
    }
  }, []);

  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }]} />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Dashboard
        </h1>
      </div>
      <DashboardFilter
        isApplying={isFilterActionLoading}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
      <StatsCards
        filters={filters}
        refreshToken={filterRefreshToken}
        onLoadingChange={handleStatsLoadingChange}
      />
      <section className="grid gap-6 grid-cols-2 mt-6">
        <ChartsCard
          title="Families per Location"
          chart={
            <span className="text-sm font-medium text-blue-600 underline">
              Chart Placeholder
            </span>
          }
        />
        <ChartsCard
          title="Vulnerability Levels (High / Medium / Low)"
          chart={
            <span className="text-sm font-medium text-blue-600 underline">
              Chart Placeholder
            </span>
          }
        />
      </section>
    </DashboardLayout>
  );
};

export default DashboardPage;
