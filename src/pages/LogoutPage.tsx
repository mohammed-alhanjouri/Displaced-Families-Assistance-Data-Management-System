import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, LogOut } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8fc] px-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <LogOut className="mx-auto h-8 w-8 text-[#0066FF]" />
        <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Signing out...
        </p>
      </div>
    </main>
  );
};

export default LogoutPage;
