import { useState, type SubmitEvent } from "react";
import logo from "../assets/react.svg";
import Button from "../components/ui/Button.tsx";
import Card from "../components/ui/Card.tsx";
import Checkbox from "../components/ui/Checkbox.tsx";
import Input from "../components/ui/Input.tsx";
import { useNavigate } from "react-router-dom";
// Add Supabase and remember me preference imports
import {
  supabase,
  getRememberMePreference,
  setRememberMePreference,
} from "../lib/supabase.ts";
// Add camps fetching imports
import { fetchCamps, type Camp } from "../lib/camps.ts";
// Add auth user fetching and role helper imports
import {
  getCurrentAuthUser,
  getRoleHomePath,
  isDataEntryRole,
  type AuthUser,
} from "../features/auth/auth.ts";
// Add useAuth hook import
import { useAuth } from "../features/auth/useAuth.ts";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCampId, setSelectedCampId] = useState("");
  const [rememberMe, setRememberMe] = useState(getRememberMePreference);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [requiresCampSelection, setRequiresCampSelection] = useState(false);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(false);
  const [campLoading, setCampLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuthUser } = useAuth();

  // Fetch camps for data entry staff and manage loading state
  const loadCamps = async () => {
    setCampLoading(true);

    try {
      const campOptions = await fetchCamps();
      setCamps(campOptions);
      return campOptions;
    } finally {
      setCampLoading(false);
    }
  };
  // Convert the login identifier to an email if it's a username, using a Supabase RPC function
  const resolveLoginEmail = async () => {
    const loginIdentifier = identifier.trim();

    if (loginIdentifier.includes("@")) {
      return loginIdentifier;
    }

    // Supabase RPC (Remote Procedure Call) function to resolve username to email
    const { data, error } = await supabase.rpc("resolve_login_email", {
      login_identifier: loginIdentifier,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (typeof data !== "string" || !data.includes("@")) {
      throw new Error("No active account was found for this username.");
    }

    return data;
  };

  // Complete the login process for data entry staff by updating their assigned camp and refreshing their auth state
  const completeDataEntryLogin = async (authUser: AuthUser) => {
    if (!selectedCampId) {
      setAuthMessage("Select your working location / camp to continue.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ assigned_camp_id: selectedCampId })
      .eq("id", authUser.id)
      .select("assigned_camp_id")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Your profile could not be updated with this camp.");
    }

    await refreshAuthUser();
    navigate(getRoleHomePath(authUser.role), { replace: true });
  };

  // Login Flow
  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (!identifier.trim() || !password) {
      setAuthError("Enter your Email/Username and password.");
      return;
    }

    setLoading(true);

    try {
      // Check if the user needs to select a camp (for data entry staff) before completing the login process
      if (requiresCampSelection) {
        const currentUser = await getCurrentAuthUser();

        if (!currentUser || !isDataEntryRole(currentUser.role)) {
          setRequiresCampSelection(false);
          throw new Error("Please sign in again.");
        }

        await completeDataEntryLogin(currentUser);
        return;
      }
      // Actual Supabase Login Process
      // Set the remember me preference in local storage
      setRememberMePreference(rememberMe);

      // Resolve the login identifier and sign in with Supabase
      const loginEmail = await resolveLoginEmail();
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Fetch and validate the authenticated user and handle role-based navigation
      const authUser = await getCurrentAuthUser();

      if (!authUser) {
        throw new Error("Unable to verify the signed-in user.");
      }

      // Data Entry Staff require an additional step to select their working location / camp before completing the login process
      if (isDataEntryRole(authUser.role)) {
        await loadCamps();
        setRequiresCampSelection(true);

        if (!selectedCampId) {
          setAuthMessage("Select your working location / camp to continue.");
          return;
        }

        await completeDataEntryLogin(authUser);
        return;
      }

      // Refresh the authenticated user and navigate to their home page based on their role
      await refreshAuthUser();
      navigate(getRoleHomePath(authUser.role), { replace: true });
    } catch (error) {
      // Error and Cleanup Handling
      setAuthError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Flow
  const handleForgotPassword = async () => {
    setAuthError("");
    setAuthMessage("");

    if (!identifier.trim()) {
      setAuthError("Enter your email or username to receive a reset link.");
      return;
    }

    setResetLoading(true);

    try {
      // Resolve the login identifier and send a Supabase password reset link
      const email = await resolveLoginEmail();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setAuthMessage(
        "If this account exists, Supabase will send a password reset link.",
      );
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to send a password reset link.",
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 lg:px-8">
      <Card className="flex w-full max-w-md flex-col items-center justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img alt="System Logo" src={logo} className="mx-auto h-10 w-auto" />
          <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-800">
            Sign in
          </h2>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm/6 font-medium text-gray-800"
              >
                Email / Username
              </label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-800"
                >
                  Password
                </label>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading || loading}
                    className="text-[#0066FF] hover:text-blue-700"
                  >
                    {resetLoading ? "Sending Reset Link..." : "Forgot password?"}
                  </button>
                </div>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {requiresCampSelection && (
              <div>
                <label
                  htmlFor="working-location"
                  className="block text-sm font-medium text-gray-800"
                >
                  Working Location / Camp
                </label>
                <div className="mt-2">
                  <select
                    id="working-location"
                    name="working-location"
                    required
                    value={selectedCampId}
                    onChange={(event) => setSelectedCampId(event.target.value)}
                    disabled={campLoading}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  >
                    <option value="">
                      {campLoading ? "Loading camps..." : "Select a location"}
                    </option>
                    {camps.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Checkbox
              id="remember-me"
              name="remember-me"
              label="Remember me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />

            {authError && <p className="text-sm text-red-600">{authError}</p>}
            {authMessage && (
              <p className="text-sm text-green-700">{authMessage}</p>
            )}

            <div>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Signing in..."
                  : requiresCampSelection
                    ? "Continue as Data Entry Staff"
                    : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </main>
  );
};

export default LoginPage;
