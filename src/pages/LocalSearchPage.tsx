import { useState, type ChangeEvent, type FormEvent } from "react";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { familiesData } from "../data/families";
import { Link } from "react-router-dom";

const vulnerabilityLevels = ["Low", "Medium", "High"];

const LocalSearchPage = () => {
  const [formData, setFormData] = useState({
    search: "",
    vulnerabilityLevel: "",
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
      vulnerabilityLevel: "",
    });
  };

  const filteredResults = familiesData.filter((family) => {
    const matchesSearch =
      family.nationalID.toString().includes(formData.search) ||
      family.familyHeadName
        .toLowerCase()
        .includes(formData.search.toLowerCase()) ||
      family.phoneNumber.includes(formData.search);

    const matchesVulnerabilityLevel =
      formData.vulnerabilityLevel === "" ||
      family.vulnerabilityLevel === formData.vulnerabilityLevel;

    return matchesSearch && matchesVulnerabilityLevel;
  });

  const hasAppliedFilters =
    formData.search.trim() !== "" || formData.vulnerabilityLevel !== "";

  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[{ label: "Local Search", href: "/local-search" }]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3">Local Search</h1>
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
                  <th className="py-3 px-4 border">Last Updated</th>
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
                      {family.lastUpdateDate || family.lastAssistanceDate}
                    </td>
                    <td className="py-2 px-4 border">
                      <Link
                        to={`/families/${family.nationalID}`}
                        className="text-sm text-[#0066FF] hover:text-blue-700"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/update-family`}
                        className="text-sm text-[#0066FF] hover:text-blue-700"
                      >
                        Update Family
                      </Link>
                      <Link
                        to={`/families/${family.nationalID}`}
                        className="text-sm text-[#0066FF] hover:text-blue-700"
                      >
                        Update Vulnerability
                      </Link>
                      <Link
                        to={`/families/${family.nationalID}`}
                        className="text-sm text-[#0066FF] hover:text-blue-700"
                      >
                        Add Assistance
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
    </RegisterFamilyPageLayout>
  );
};

export default LocalSearchPage;
