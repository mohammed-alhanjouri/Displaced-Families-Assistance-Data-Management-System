import { CheckCircle2, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageHeader from "../components/ui/PageHeader";
import { adminUserRoleOptions } from "../lib/adminUsers";
import DashboardLayout from "../layouts/DashboardLayout";

const permissions = [
  {
    name: "Login",
    system_administrator: true,
    data_entry_staff: true,
    organization_manager: true,
  },
  {
    name: "Register Family",
    system_administrator: true,
    data_entry_staff: true,
    organization_manager: false,
  },
  {
    name: "Update Family Information",
    system_administrator: true,
    data_entry_staff: true,
    organization_manager: false,
  },
  {
    name: "Record Assistance",
    system_administrator: true,
    data_entry_staff: true,
    organization_manager: false,
  },
  {
    name: "Record Vulnerability",
    system_administrator: true,
    data_entry_staff: true,
    organization_manager: false,
  },
  {
    name: "Local Search",
    system_administrator: true,
    data_entry_staff: true,
    organization_manager: false,
  },
  {
    name: "Global Search",
    system_administrator: true,
    data_entry_staff: false,
    organization_manager: true,
  },
  {
    name: "Generate Reports",
    system_administrator: true,
    data_entry_staff: false,
    organization_manager: true,
  },
  {
    name: "Export Reports",
    system_administrator: true,
    data_entry_staff: false,
    organization_manager: true,
  },
  {
    name: "Manage Users",
    system_administrator: true,
    data_entry_staff: false,
    organization_manager: false,
  },
];

const RolesPermissionsPage = () => {
  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Roles & Permissions" },
          ]}
        />
        <PageHeader
          icon={ShieldCheck}
          title="Role Permissions Overview"
          subtitle="Review which system actions each role can access."
          className="mt-3"
        />
      </div>

      <section className="mt-6 rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border-b border-gray-300 px-3 py-3 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <LockKeyhole className="h-4 w-4" />
                    Permission
                  </span>
                </th>
                {adminUserRoleOptions.map((role) => (
                  <th
                    key={role.value}
                    className="border-b border-gray-300 px-3 py-3 text-center font-semibold"
                  >
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {permissions.map((permission) => (
                <tr key={permission.name}>
                  <td className="px-3 py-3 font-medium text-gray-800">
                    {permission.name}
                  </td>
                  {adminUserRoleOptions.map((role) => (
                    <td key={role.value} className="px-3 py-3 text-center">
                      {permission[role.value] ? (
                        <span className="inline-flex items-center justify-center text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="sr-only">Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-gray-300">
                          <XCircle className="h-5 w-5" />
                          <span className="sr-only">Not allowed</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-sm font-medium text-gray-600">
        <LockKeyhole className="mr-1 inline h-4 w-4 text-gray-400" />
        Permissions are predefined and cannot be modified in the current system
        version.
      </p>
    </DashboardLayout>
  );
};

export default RolesPermissionsPage;
