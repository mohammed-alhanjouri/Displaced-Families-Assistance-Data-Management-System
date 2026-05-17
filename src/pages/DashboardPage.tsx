import HeaderNav from "../components/HeaderNav";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Search from "../components/Search";

const DashboardPage = () => {
  return (
    <>
      <HeaderNav
        user={{
          name: "Moha",
          role: "System Administrator",
        }}
      />
      <div className="flex">
        <Sidebar
          links={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Global Search", href: "/global-search" },
            { name: "Reports", href: "/reports" },
            { name: "Settings", href: "/settings" },
            { name: "Logout", href: "/logout" },
          ]}
        />
        <main className="flex-1 flex-col p-6 w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Dashboard Overview
          </h1>
          <Search />
          {/* Dashboard content goes here */}
        </main>
      </div>
      <Card className="flex flex-col items-center justify-center mt-10">
        <h2 className="text-sm text-gray-800 mb-2">Total Families</h2>
        <p className="text-lg font-semibold text-[#0066FF]">125</p>
      </Card>
      <Card className="flex flex-col items-center justify-center mt-10">
        <h2 className="text-sm text-gray-800 mb-2">Total Persons</h2>
        <p className="text-lg font-semibold text-[#0066FF]">300</p>
      </Card>
      <Card className="flex flex-col items-center justify-center mt-10">
        <h2 className="text-sm text-gray-800 mb-2">
          High-Vulnerability Families
        </h2>
        <p className="text-lg font-semibold text-[#0066FF]">25</p>
      </Card>
      <Card className="flex flex-col items-center justify-center mt-10">
        <h2 className="text-sm text-gray-800 mb-2">
          Total Assistance Provided
        </h2>
        <p className="text-lg font-semibold text-[#0066FF]">57</p>
      </Card>
    </>
  );
};

export default DashboardPage;
