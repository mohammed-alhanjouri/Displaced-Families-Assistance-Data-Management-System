import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

const LogoutPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      await signOut();
      navigate("/login", { replace: true });
    };

    void logout();
  }, [navigate, signOut]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm font-medium text-gray-600">Signing out...</p>
    </main>
  );
};

export default LogoutPage;
