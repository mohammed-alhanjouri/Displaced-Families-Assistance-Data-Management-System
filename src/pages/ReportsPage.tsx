import Breadcrumbs from "../components/ui/Breadcrumbs";
import DashboardLayout from "../layouts/DashboardLayout";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs
          items={[{ label: "Reports", href: "/reports" }]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Reports
        </h1>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
