import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import logo from "../assets/logo-img.png";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { supabase } from "../lib/supabase";

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await supabase.auth.signOut();
    setPassword("");
    setConfirmPassword("");
    setSuccessMessage("Password updated. Sign in with your new password.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 lg:px-8">
      <Card className="flex w-full max-w-md flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            src={logo}
            alt="Awn logo"
            className="mx-auto h-14 w-14 rounded-xl object-contain ring-1 ring-blue-100"
          />
          <h1 className="mt-4 flex items-center justify-center gap-2 text-center text-2xl/9 font-bold tracking-tight text-gray-800">
            <ShieldCheck className="h-6 w-6 text-[#0066FF]" />
            Update Password
          </h1>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
          {successMessage ? (
            <div className="space-y-6">
              <p className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMessage}
              </p>
              <Button
                type="button"
                onClick={() => navigate("/login")}
                icon={LogIn}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm/6 font-medium text-gray-800"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                    New Password
                  </span>
                </label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm/6 font-medium text-gray-800"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                    Confirm Password
                  </span>
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              {errorMessage && (
                <p className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                icon={loading ? LoaderCircle : ShieldCheck}
              >
                {loading ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </main>
  );
};

export default UpdatePasswordPage;
