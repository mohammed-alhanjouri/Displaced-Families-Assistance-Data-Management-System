import { Link } from "react-router-dom";
import { familiesData } from "../data/families";
import DashboardLayout from "../layouts/DashboardLayout";
import { useState, type ChangeEvent, type FormEvent } from "react";
import Breadcrumbs from "../components/ui/Breadcrumbs";

const locations = [
  "Location 1",
  "Location 2",
  "Location 3",
  "Location 4",
  "Location 5",
  "Location 6",
  "Location 7",
  "Location 8",
  "Location 9",
  "Location 10",
];

const vulnerabilityLevels = ["Low", "Medium", "High"];

const GlobalSearchPage = () => {
  const [formData, setFormData] = useState({
    search: "",
    location: "",
    vulnerabilityLevel: "",
    fromDate: "",
    toDate: "",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleClear = () => {
    setFormData({
      search: "",
      location: "",
      vulnerabilityLevel: "",
      fromDate: "",
      toDate: "",
    });
  };

  const filteredResults = familiesData.filter((family) => {
    const matchesSearch =
      family.nationalID.toString().includes(formData.search) ||
      family.familyHeadName
        .toLowerCase()
        .includes(formData.search.toLowerCase()) ||
      family.phoneNumber.includes(formData.search);

    const matchesLocation =
      formData.location === "" || family.location === formData.location;

    const matchesVulnerabilityLevel =
      formData.vulnerabilityLevel === "" ||
      family.vulnerabilityLevel === formData.vulnerabilityLevel;

    const matchesDates =
      (!formData.fromDate || family.lastAssistanceDate >= formData.fromDate) &&
      (!formData.toDate || family.lastAssistanceDate <= formData.toDate);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesVulnerabilityLevel &&
      matchesDates
    );
  });

  const hasAppliedFilters =
    formData.search.trim() !== "" ||
    formData.location !== "" ||
    formData.vulnerabilityLevel !== "" ||
    formData.fromDate !== "" ||
    formData.toDate !== "";

  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Global Search" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3">Global Search</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                National ID / Family Head Name / Phone Number
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={formData.search}
                onChange={handleChange}
                placeholder="Enter ID, Name, or Phone..."
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="search-location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <select
                id="search-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="search-vulnerability-level"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vulnerability Level
              </label>
              <select
                id="search-vulnerability-level"
                name="vulnerabilityLevel"
                value={formData.vulnerabilityLevel}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vulnerability level</option>
                {vulnerabilityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div />

            <div>
              <label
                htmlFor="from-date"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Assistance Date From (optional)
              </label>
              <input
                id="from-date"
                name="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
              />
            </div>

            <div>
              <label
                htmlFor="to-date"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Assistance Date To (optional)
              </label>
              <input
                id="to-date"
                name="toDate"
                type="date"
                value={formData.toDate}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {!hasAppliedFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Search Results
          </h2>
          <h2 className="text-lg font-medium text-gray-700 mb-2">No Results</h2>
          <p className="text-gray-500">No filters are applied</p>
        </div>
      )}

      {hasAppliedFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Search Results
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-700">
                  <th className="py-3 px-4 border">National ID</th>
                  <th className="py-3 px-4 border">Family Head Name</th>
                  <th className="py-3 px-4 border">Phone</th>
                  <th className="py-3 px-4 border">Current Camp/Location</th>
                  <th className="py-3 px-4 border">Vulnerability Level</th>
                  <th className="py-3 px-4 border">Last Assistance Date</th>
                  <th className="py-3 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((family) => (
                  <tr key={family.nationalID} className="border-t">
                    <td className="py-2 px-4 border">{family.nationalID}</td>
                    <td className="py-2 px-4 border">
                      {family.familyHeadName}
                    </td>
                    <td className="py-2 px-4 border">{family.phoneNumber}</td>
                    <td className="py-2 px-4 border">{family.location}</td>
                    <td className="py-2 px-4 border">
                      {family.vulnerabilityLevel}
                    </td>
                    <td className="py-2 px-4 border">
                      {family.lastAssistanceDate}
                    </td>
                    <td className="py-2 px-4 border">
                      <Link
                        to={`/families/${family.nationalID}`}
                        className="text-sm text-[#0066FF] hover:text-blue-700"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GlobalSearchPage;
