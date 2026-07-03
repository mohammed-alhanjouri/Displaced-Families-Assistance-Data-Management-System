import { useEffect, useState } from "react";
import {
  HandHeart,
  ShieldAlert,
  UsersRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
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

  const cards: { title: string; value: number; icon: LucideIcon }[] = [
    {
      title: "Total Families",
      value: stats?.totalFamilies ?? 0,
      icon: UsersRound,
    },
    { title: "Total Persons", value: stats?.totalPersons ?? 0, icon: UserRound },
    {
      title: "High-Vulnerability Families",
      value: stats?.highVulnerabilityFamilies ?? 0,
      icon: ShieldAlert,
    },
    {
      title: "Total Assistance Provided",
      value: stats?.assistanceProvidedCount ?? 0,
      icon: HandHeart,
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
      {cards.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-medium text-gray-600">{stat.title}</h2>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#0066FF]">
              {isLoading ? "..." : stat.value}
            </p>
          </div>
        );
      })}
    </section>
  );
};

export default StatsCards;
