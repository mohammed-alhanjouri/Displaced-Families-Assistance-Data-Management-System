import HeaderNav from "../components/layout/HeaderNav";
import Sidebar from "../components/layout/Sidebar";

const RegisterFamilyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderNav
        user={{
          name: "Moha",
          role: "Organization Manager",
        }}
      />
      <Sidebar
        links={[
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
