import { useState, type ChangeEvent, type FormEvent } from "react";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { familiesData } from "../data/families";

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

  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Local Search", href: "/local-search" },
          ]}
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
    </RegisterFamilyPageLayout>
  );
};

export default LocalSearchPage;
