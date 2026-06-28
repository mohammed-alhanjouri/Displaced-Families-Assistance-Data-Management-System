import { useEffect, useState } from "react";
import {
  fetchDashboardStats,
  type DashboardStats,
  type DashboardStatsFilters,
} from "../../lib/families";

interface StatsCardsProps {
  filters: DashboardStatsFilters;
  refreshToken: number;
  onLoadingChange?: (isLoading: boolean) => void;
}

const StatsCards = ({
  filters,
  refreshToken,
  onLoadingChange,
}: StatsCardsProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      setIsLoading(true);
      setLoadError("");
      onLoadingChange?.(true);

      try {
        const dashboardStats = await fetchDashboardStats(filters);

        if (isActive) {
          setStats(dashboardStats);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard statistics.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    void loadStats();

    return () => {
      isActive = false;
    };
  }, [filters, refreshToken, onLoadingChange]);

  const cards = [
    { title: "Total Families", value: stats?.totalFamilies ?? 0 },
    { title: "Total Persons", value: stats?.totalPersons ?? 0 },
    {
      title: "High-Vulnerability Families",
      value: stats?.highVulnerabilityFamilies ?? 0,
    },
    {
      title: "Total Assistance Provided",
      value: stats?.assistanceProvidedCount ?? 0,
    },
  ];

  if (loadError) {
    return (
      <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {loadError}
      </section>
    );
  }

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((stat) => (
        <div
          key={stat.title}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-2 text-sm font-medium text-gray-600">
            {stat.title}
          </h2>
          <p className="text-2xl font-semibold text-[#0066FF]">
            {isLoading ? "..." : stat.value}
          </p>
        </div>
      ))}
    </section>
  );
};

export default StatsCards;
