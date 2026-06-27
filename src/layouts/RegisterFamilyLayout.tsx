import HeaderNav from "../components/layout/HeaderNav";
import Sidebar from "../components/layout/Sidebar";
import { getRoleLabel } from "../features/auth/auth";
import { useAuth } from "../features/auth/useAuth";

const RegisterFamilyLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

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
      <Sidebar
        links={[
          { name: "Dashboard", href: "/data-entry-dashboard" },
          { name: "Register Family", href: "/register-family" },
          { name: "Local Search", href: "/local-search" },
          { name: "Logout", href: "/logout" },
        ]}
      />
      <main className="p-4 md:ml-64 md:p-6">{children}</main>
    </div>
  );
};

export default RegisterFamilyLayout;
