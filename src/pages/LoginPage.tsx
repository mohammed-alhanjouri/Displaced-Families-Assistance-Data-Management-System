import { useState } from "react";
import logo from "../assets/react.svg";
import Button from "../components/ui/Button.tsx";
import Card from "../components/ui/Card.tsx";
import Checkbox from "../components/ui/Checkbox.tsx";
import Input from "../components/ui/Input.tsx";
import { useNavigate } from "react-router-dom";

// interface LoginPageProps {
//   onLogin: () => void;
// }

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");

  const locations = ["Location 1", "Location 2", "Location 3"];

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/dashboard");
    // onLogin();
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-800"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    className="text-[#0066FF] hover:text-blue-700"
                  >
                    Forgot password?
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm"
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <Checkbox
                id="remember-me"
                name="remember-me"
                label="Remember me"
                checked={true}
                onChange={() => {}}
              />
            </div>

            <div>
              <Button type="submit">Sign in</Button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not registered? {"  "}
            <button
              type="button"
              className="font-medium text-[#0066FF] hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
        </div>
      </Card>
    </main>
  );
};

export default LoginPage;
