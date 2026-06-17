import { Navigate, useLocation } from "react-router-dom";
import {
  getHomePathForRole,
  useAuth,
  type UserRole,
} from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-sm font-medium text-gray-600">Loading session...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!profile || profile.status !== "active") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-md">
          <h1 className="text-xl font-bold text-gray-800">Access unavailable</h1>
          <p className="mt-2 text-sm text-gray-600">
            This account needs an active system profile before using the system.
          </p>
        </div>
      </main>
    );
  }

  if (!allowedRoles.includes(profile.user_role)) {
    return <Navigate to={getHomePathForRole(profile.user_role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
