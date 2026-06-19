import HeaderNav from "../components/layout/HeaderNav";
import Sidebar from "../components/layout/Sidebar";
import { getRoleLabel } from "../features/auth/auth";
import { useAuth } from "../features/auth/useAuth";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderNav
        user={
          user
            ? {
                name: user.name,
                role: getRoleLabel(user.role),
              }
            : null
        }
      />
      <Sidebar
        links={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Global Search", href: "/global-search" },
          { name: "Reports", href: "/reports" },
          { name: "Logout", href: "/logout" },
        ]}
      />
      <main className="p-4 md:ml-64 md:p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
