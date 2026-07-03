import { useState, type SubmitEvent } from "react";
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  MapPin,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import logo from "../assets/LOGO.png";
import Button from "../components/ui/Button.tsx";
import Checkbox from "../components/ui/Checkbox.tsx";
import Input from "../components/ui/Input.tsx";
import { Link, useNavigate } from "react-router-dom";
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

const brandName = "Awn عَــــون";

const accessHighlights: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Users enter the workspace that matches their assigned role.",
  },
  {
    icon: MapPin,
    title: "Camp-aware workflow",
    description: "Data entry staff confirm their working location before entry.",
  },
  {
    icon: LockKeyhole,
    title: "Protected family data",
    description: "Authentication stays connected to Supabase security controls.",
  },
];

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-[#f5f8fc] px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:items-center">
          <section className="max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              <Home className="h-4 w-4" />
              Home page
            </Link>

            <div className="mt-8 flex items-center gap-4">
              <img
                alt="Awn logo"
                src={logo}
                className="h-16 w-16 rounded-lg object-contain ring-1 ring-blue-100"
              />
              <div>
                <p className="text-sm font-semibold text-[#0066FF]">
                  Secure access
                </p>
                <h1 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
                  {brandName}
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
              Sign in to manage displaced family registration, vulnerability
              assessment, assistance records, and reporting through the same
              controlled data path.
            </p>

            <div className="mt-8 grid gap-3">
              {accessHighlights.map((item) => {
                const HighlightIcon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#0066FF]">
                      <HighlightIcon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-gray-950">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-gray-600">
                        {item.description}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                <UserRoundCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-950">Sign in</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Use your email or username.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Email / Username
                </label>
                <div className="relative mt-2">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Enter your email or username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    className="mt-0 min-h-11 pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading || loading}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066FF] transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetLoading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {resetLoading ? "Sending link..." : "Forgot password?"}
                  </button>
                </div>
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-0 min-h-11 px-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-gray-400 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {requiresCampSelection && (
                <div>
                  <label
                    htmlFor="working-location"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Working Location / Camp
                  </label>
                  <div className="relative mt-2">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      id="working-location"
                      name="working-location"
                      required
                      value={selectedCampId}
                      onChange={(event) => setSelectedCampId(event.target.value)}
                      disabled={campLoading}
                      className="block min-h-11 w-full appearance-none rounded-md bg-white px-10 py-2 text-base text-gray-700 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              <Checkbox
                id="remember-me"
                name="remember-me"
                label="Remember me"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="mt-1"
              />

              {authError && (
                <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{authError}</p>
                </div>
              )}
              {authMessage && (
                <div className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{authMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="min-h-11 items-center gap-2 rounded-md bg-[#0066FF] px-4 py-2.5 text-sm hover:bg-blue-700"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading
                  ? "Signing in..."
                  : requiresCampSelection
                    ? "Continue as Data Entry Staff"
                    : "Sign in"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
