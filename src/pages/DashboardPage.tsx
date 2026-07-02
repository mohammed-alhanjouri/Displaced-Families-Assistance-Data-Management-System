import { useCallback, useEffect, useState } from "react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useAuth } from "../features/auth/useAuth";
import ChartsCard from "../features/dashboard/ChartsCards";
import DashboardFilter from "../features/dashboard/DashboardFilters";
import StatsCards from "../features/dashboard/StatsCards";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchDashboardInsights,
  type DashboardAssistanceActivity,
  type DashboardChartDatum,
  type DashboardInsights,
  type DashboardStatsFilters,
  type DashboardVulnerabilityDatum,
  type VulnerabilityLevel,
} from "../lib/families";
import SystemAdminDashboardPage from "./SystemAdminDashboardPage";

const emptyDashboardFilters: DashboardStatsFilters = {
  campId: "",
  fromDate: "",
  toDate: "",
};

const emptyDashboardInsights: DashboardInsights = {
  familiesByCamp: [],
  vulnerabilityDistribution: [],
  recentAssistance: [],
};

const vulnerabilityColors: Record<VulnerabilityLevel, string> = {
  Low: "#bbf7d0",
  Medium: "#fed7aa",
  High: "#fecaca",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );

const ChartMessage = ({ children }: { children: string }) => (
  <div className="flex min-h-52 items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-4 text-center text-sm text-gray-500">
    {children}
  </div>
);

const FamiliesByCampChart = ({
  data,
  isLoading,
}: {
  data: DashboardChartDatum[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <ChartMessage>Loading family distribution...</ChartMessage>;
  }

  if (data.length === 0) {
    return <ChartMessage>No family data for the selected filters.</ChartMessage>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
      {data.map((item) => {
        const width = Math.max((item.value / maxValue) * 100, 6);

        return (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-gray-700">
                {item.label}
              </span>
              <span className="shrink-0 font-semibold text-gray-900">
                {item.value}
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-200">
              <div
                aria-label={`${item.label}: ${item.value} families`}
                className="h-3 rounded-full bg-blue-300"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const VulnerabilityDistributionChart = ({
  data,
  isLoading,
}: {
  data: DashboardVulnerabilityDatum[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <ChartMessage>Loading vulnerability distribution...</ChartMessage>;
  }

  const totalFamilies = data.reduce((sum, item) => sum + item.count, 0);

  if (totalFamilies === 0) {
    return (
      <ChartMessage>No vulnerability data for the selected filters.</ChartMessage>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex h-5 overflow-hidden rounded-full bg-gray-200">
        {data.map((item) => {
          const width = (item.count / totalFamilies) * 100;

          return (
            <div
              key={item.level}
              aria-label={`${item.level}: ${item.count} families`}
              className="h-full"
              style={{
                width: `${width}%`,
                backgroundColor: vulnerabilityColors[item.level],
              }}
            />
          );
        })}
      </div>
      <div className="space-y-3">
        {data.map((item) => {
          const percentage = Math.round((item.count / totalFamilies) * 100);

          return (
            <div
              key={item.level}
              className="flex items-center justify-between gap-4 rounded-md bg-white px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 font-medium text-gray-700">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: vulnerabilityColors[item.level] }}
                />
                {item.level}
              </span>
              <span className="font-semibold text-gray-900">
                {item.count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentAssistanceLog = ({
  records,
  isLoading,
}: {
  records: DashboardAssistanceActivity[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <section className="mt-6 rounded-lg border border-gray-300 bg-white p-6 text-sm text-gray-600 shadow-sm">
        Loading recent assistance...
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-800">
        Recent Assistance Logs
      </h2>
      {records.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No assistance records for the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Family</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Assistance</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDate(record.assistanceDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {record.familyHeadName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.nationalId}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {record.currentCampName ?? "Unknown camp"}
                  </td>
                  <td className="px-4 py-3">{record.assistanceType}</td>
                  <td className="px-4 py-3">{record.providerOrganization}</td>
                  <td className="px-4 py-3">
                    {record.recordedByName ?? "Current user"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const OrganizationDashboardPage = () => {
  const [filters, setFilters] = useState<DashboardStatsFilters>({
    ...emptyDashboardFilters,
  });
  const [filterRefreshToken, setFilterRefreshToken] = useState(0);
  const [isFilterActionLoading, setIsFilterActionLoading] = useState(false);
  const [dashboardInsights, setDashboardInsights] =
    useState<DashboardInsights>(emptyDashboardInsights);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsLoadError, setInsightsLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadInsights = async () => {
      setIsLoadingInsights(true);
      setInsightsLoadError("");

      try {
        const insights = await fetchDashboardInsights(filters);

        if (isActive) {
          setDashboardInsights(insights);
        }
      } catch (error) {
        if (isActive) {
          setInsightsLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard charts.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingInsights(false);
        }
      }
    };

    void loadInsights();

    return () => {
      isActive = false;
    };
  }, [filters, filterRefreshToken]);

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
      {insightsLoadError ? (
        <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {insightsLoadError}
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartsCard
              title="Families per Location"
              chart={
                <FamiliesByCampChart
                  data={dashboardInsights.familiesByCamp}
                  isLoading={isLoadingInsights}
                />
              }
            />
            <ChartsCard
              title="Vulnerability Distribution"
              chart={
                <VulnerabilityDistributionChart
                  data={dashboardInsights.vulnerabilityDistribution}
                  isLoading={isLoadingInsights}
                />
              }
            />
          </section>
          <RecentAssistanceLog
            records={dashboardInsights.recentAssistance}
            isLoading={isLoadingInsights}
          />
        </>
      )}
    </DashboardLayout>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === "system_administrator") {
    return <SystemAdminDashboardPage />;
  }

  return <OrganizationDashboardPage />;
};

export default DashboardPage;
