import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import GlobalSearchPage from "../pages/GlobalSearchPage";
import FamilyProfilePage from "../pages/FamilyProfilePage";
import ReportsPage from "../pages/ReportsPage";
import RegisterFamilyPage from "../pages/RegisterFamilyPage";
import LocalSearchPage from "../pages/LocalSearchPage";
import UpdateFamilyInformation from "../pages/UpdateFamilyInformationPage";
import VulnerabilityAssessment from "../pages/VulnerabilityAssessment";
import AddAssistancePage from "../pages/AddAssistancePage";
import LogoutPage from "../pages/LogoutPage";
import UpdatePasswordPage from "../pages/UpdatePasswordPage";
// Add auth role helpers and useAuth hook imports
import { getRoleHomePath, type UserRole } from "../features/auth/auth";
import { useAuth } from "../features/auth/useAuth";

// Define role groups for access control
const managerRoles: UserRole[] = [
  "system_administrator",
  "organization_manager",
];
const dataEntryRoles: UserRole[] = ["data_entry_staff"];
const allRoles: UserRole[] = [...managerRoles, ...dataEntryRoles];

const LoadingRoute = () => (
  <main className="flex min-h-screen items-center justify-center px-4">
    <p className="text-sm font-medium text-gray-600">Checking access...</p>
  </main>
);

// Define a RequireAuth component to protect routes based on user roles (core route protection layer)
const RequireAuth = ({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) => {
  const { loading, user } = useAuth();
  // Check if the authentication state is still loading, if so, show a loading indicator
  if (loading) {
    return <LoadingRoute />;
  }
  // If the user is not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If the user is authenticated but does not have the required role, redirect to their home page based on their role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth allowedRoles={managerRoles}>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/global-search"
        element={
          <RequireAuth allowedRoles={managerRoles}>
            <GlobalSearchPage />
          </RequireAuth>
        }
      />
      <Route
        path="/families/:nationalID"
        element={
          <RequireAuth allowedRoles={allRoles}>
            <FamilyProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth allowedRoles={managerRoles}>
            <ReportsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/register-family"
        element={
          <RequireAuth allowedRoles={dataEntryRoles}>
            <RegisterFamilyPage />
          </RequireAuth>
        }
      />
      <Route
        path="/local-search"
        element={
          <RequireAuth allowedRoles={dataEntryRoles}>
            <LocalSearchPage />
          </RequireAuth>
        }
      />
      <Route
        path="/update-family/:nationalID"
        element={
          <RequireAuth allowedRoles={dataEntryRoles}>
            <UpdateFamilyInformation />
          </RequireAuth>
        }
      />
      <Route
        path="/vulnerability-assessment/:nationalID"
        element={
          <RequireAuth allowedRoles={dataEntryRoles}>
            <VulnerabilityAssessment />
          </RequireAuth>
        }
      />
      <Route
        path="/add-assistance/:nationalID"
        element={
          <RequireAuth allowedRoles={dataEntryRoles}>
            <AddAssistancePage />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
