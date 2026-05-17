import { useState } from "react";
import Button from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import Checkbox from "../components/Checkbox.tsx";
import Input from "../components/Input.tsx";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");

  const locations = ["Location 1", "Location 2", "Location 3"];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, location });
  };

  return (
    <>
      {/* <h1 className="text-2xl font-bold text-center text-gray-800 mt-20">
        Welcome to Displaced Families Assistance and Data Management System
      </h1> */}

      <div className="min-h-screen flex items-center justify-center lg:px-8">
        <Card className="flex flex-col items-center justify-center w-full">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="System Logo"
              src="./src/assets/react.svg"
              className="mx-auto h-10 w-auto"
            />
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
                {/* <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
                  />
                </div> */}
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
                    <a href="#" className="text-[#0066FF] hover:text-blue-700">
                      Forgot password?
                    </a>
                  </div>
                </div>
                {/* <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
                  />
                </div> */}
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

                {/* <div className="flex items-center mt-4">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#0066FF] focus:ring-[#0066FF] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm/6 text-black"
                  >
                    Remember me
                  </label>
                </div> */}
                <Checkbox
                  id="remember-me"
                  name="remember-me"
                  label="Remember me"
                />
              </div>

              <div>
                {/* <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-[#0066FF] px-3 py-1.5 font-semibold text-white hover:bg-[#6699FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066FF]"
                >
                  Sign in
                </button> */}
                <Button type="submit">Sign in</Button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Not registered? {"  "}
              <a
                href="#"
                className="font-medium text-[#0066FF] hover:text-blue-700"
              >
                Sign up
              </a>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
