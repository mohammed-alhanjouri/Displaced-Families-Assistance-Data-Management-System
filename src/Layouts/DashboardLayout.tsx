import HeaderNav from "../components/layout/HeaderNav";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderNav
        user={{
          name: "Moha",
          role: "System Administrator",
        }}
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
