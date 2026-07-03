import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ClipboardPlus,
  HandHeart,
  LayoutDashboard,
  MapPin,
  Search,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../features/auth/useAuth";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import { fetchFamilyCountByCamp } from "../lib/families";

const quickActions = [
  {
    title: "Register Family",
    description: "Create a new family record for your selected camp.",
    href: "/register-family",
    action: "Register Family",
    primary: true,
    icon: ClipboardPlus,
  },
  {
    title: "Local Search",
    description: "Find registered families in your selected camp.",
    href: "/local-search",
    action: "Search Families",
    primary: false,
    icon: Search,
  },
  {
    title: "Add Assistance",
    description: "Search for a family, then record the assistance provided.",
    href: "/local-search",
    action: "Add Assistance",
    primary: false,
    icon: HandHeart,
  },
] satisfies {
  title: string;
  description: string;
  href: string;
  action: string;
  primary: boolean;
  icon: LucideIcon;
}[];

const DataEntryDashboardPage = () => {
  const { user } = useAuth();
  const [familiesCount, setFamiliesCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadFamiliesCount = async () => {
      if (!user?.assignedCampId) {
        setLoadError(
          "Your account does not have a selected working camp. Select a camp during login or contact the system administrator.",
        );
        setIsLoading(false);
        return;
      }

      try {
        const count = await fetchFamilyCountByCamp(user.assignedCampId);

        if (isActive) {
          setFamiliesCount(count);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadFamiliesCount();

    return () => {
      isActive = false;
    };
  }, [user?.assignedCampId]);

  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[{ label: "Dashboard", href: "/data-entry-dashboard" }]}
        />
        <PageHeader
          icon={LayoutDashboard}
          title="Dashboard"
          subtitle="Daily workspace for camp-level family registration."
          className="mt-3 mb-6"
        />
      </div>

      {loadError && (
        <section className="mb-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {loadError}
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Families in Selected Camp
            </h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
              <UsersRound className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-4xl font-bold text-[#0066FF]">
            {isLoading ? "..." : (familiesCount ?? 0)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {user?.assignedCampName ?? "No camp selected"}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Current Work Location
            </h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
              <MapPin className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-800">
            {user?.assignedCampName ?? "Not selected"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            New registrations and local searches are scoped to this camp.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
          <ArrowRight className="h-5 w-5 text-[#0066FF]" />
          Quick Actions
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <div
                key={action.title}
                className="rounded-lg border border-gray-300 p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                  <Icon className="h-5 w-5" />
                </span>
              <h3 className="mt-4 text-base font-semibold text-gray-800">
                {action.title}
              </h3>
              <p className="mt-2 min-h-12 text-sm text-gray-500">
                {action.description}
              </p>
              <Link
                to={action.href}
                className={`mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 ${
                  action.primary
                    ? "bg-[#0066FF] text-white hover:bg-blue-700"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ArrowRight className="h-4 w-4" />
                {action.action}
              </Link>
            </div>
            );
          })}
        </div>
      </section>
    </RegisterFamilyPageLayout>
  );
};

export default DataEntryDashboardPage;
