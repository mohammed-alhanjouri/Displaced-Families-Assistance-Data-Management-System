import HeaderNav from "../components/layout/HeaderNav";
import Sidebar from "../components/layout/Sidebar";
import { getRoleLabel } from "../features/auth/auth";
import { useAuth } from "../features/auth/useAuth";

const systemAdminLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "User Management", href: "/user-management" },
  { name: "Roles & Permissions", href: "/roles-permissions" },
  { name: "Logout", href: "/logout" },
];

const managerLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Global Search", href: "/global-search" },
  { name: "Reports", href: "/reports" },
  { name: "Logout", href: "/logout" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const links =
    user?.role === "system_administrator" ? systemAdminLinks : managerLinks;

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderNav
        user={
          user
            ? {
                name: user.name,
                role: getRoleLabel(user.role),
                location:
                  user.role === "data_entry_staff"
                    ? (user.assignedCampName ?? "")
                    : "",
              }
            : null
        }
      />
      <Sidebar links={links} />
      <main className="p-4 md:ml-64 md:p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
