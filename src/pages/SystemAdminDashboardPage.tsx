import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageHeader from "../components/ui/PageHeader";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  adminUserRoleOptions,
  createEmptyAdminUserRoleCounts,
  fetchAdminUsers,
  type AdminUserAccount,
} from "../lib/adminUsers";

const quickActions = [
  {
    title: "Add New User",
    description: "Create an account and assign the correct system role.",
    href: "/user-management",
    action: "Add User",
    primary: true,
    icon: UserPlus,
  },
  {
    title: "User Management",
    description: "Edit user details, camp assignment, roles, and status.",
    href: "/user-management",
    action: "Manage Users",
    primary: false,
    icon: UserCog,
  },
  {
    title: "Roles & Permissions",
    description: "Review the predefined access model for each role.",
    href: "/roles-permissions",
    action: "View Permissions",
    primary: false,
    icon: ShieldCheck,
  },
] satisfies {
  title: string;
  description: string;
  href: string;
  action: string;
  primary: boolean;
  icon: LucideIcon;
}[];

const SystemAdminDashboardPage = () => {
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const adminUsers = await fetchAdminUsers();

        if (isActive) {
          setUsers(adminUsers);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load system administrator dashboard data.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isActive = false;
    };
  }, []);

  const roleCounts = useMemo(
    () =>
      users.reduce(
        (counts, user) => {
          counts[user.role] += 1;
          return counts;
        },
        createEmptyAdminUserRoleCounts(),
      ),
    [users],
  );
  const activeUsersCount = useMemo(
    () => users.filter((user) => user.status === "active").length,
    [users],
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }]} />
          <PageHeader
            icon={LayoutDashboard}
            title="System Administrator Dashboard"
            subtitle="Account, role, and access control overview."
            className="mt-3"
          />
        </div>
        <Link
          to="/user-management"
          className="inline-flex items-center gap-2 self-start rounded-md bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" />
          Add New User
        </Link>
      </div>

      {loadError && (
        <section className="mt-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {loadError}
        </section>
      )}

      <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
              <UsersRound className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-4xl font-bold text-[#0066FF]">
            {isLoading ? "..." : users.length}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {isLoading ? "Loading accounts" : `${activeUsersCount} active`}
          </p>
        </div>

        {adminUserRoleOptions.map((role) => (
          <div key={role.value} className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-700">
                {role.label}
              </h2>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                <KeyRound className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-[#0066FF]">
              {isLoading ? "..." : roleCounts[role.value]}
            </p>
            <p className="mt-2 text-sm text-gray-500">Registered accounts</p>
          </div>
        ))}
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
    </DashboardLayout>
  );
};

export default SystemAdminDashboardPage;
