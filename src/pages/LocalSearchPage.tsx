import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useAuth } from "../features/auth/useAuth";
import {
  fetchFamilies,
  filterFamilies,
  type FamilyRecord,
  type VulnerabilityLevel,
} from "../lib/families";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(value),
  );

const vulnerabilityLevels: VulnerabilityLevel[] = ["Low", "Medium", "High"];

const vulnerabilityClasses: Record<
  VulnerabilityLevel | "Not assessed",
  string
> = {
  Low: "rounded-lg px-4 py-2 text-sm font-medium bg-green-100 text-green-700",
  Medium:
    "rounded-lg px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700",
  High: "rounded-lg px-4 py-2 text-sm font-medium bg-red-100 text-red-700",
  "Not assessed":
    "rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600",
};

const getVulnerabilityLabel = (
  level: VulnerabilityLevel | null,
): VulnerabilityLevel | "Not assessed" => level ?? "Not assessed";

const getVulnerabilityClass = (level: VulnerabilityLevel | null) =>
  vulnerabilityClasses[getVulnerabilityLabel(level)];

const LocalSearchPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [vulnerabilityLevel, setVulnerabilityLevel] = useState<
    VulnerabilityLevel | ""
  >("");
  const [results, setResults] = useState<FamilyRecord[]>([]);
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleVulnerabilityLevelChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setVulnerabilityLevel(event.target.value as VulnerabilityLevel | "");
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchError("");
    setHasSubmittedSearch(true);

    const nextHasAppliedFilters =
      search.trim() !== "" || vulnerabilityLevel !== "";

    setHasAppliedFilters(nextHasAppliedFilters);

    if (!nextHasAppliedFilters) {
      setResults([]);
      return;
    }

    if (!user?.assignedCampId) {
      setResults([]);
      setSearchError(
        "Your account does not have an assigned working camp. Contact the system administrator.",
      );
      return;
    }

    setIsSearching(true);

    try {
      const families = await fetchFamilies(user.assignedCampId);
      setResults(filterFamilies(families, search, vulnerabilityLevel));
    } catch (error) {
      setResults([]);
      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to search registered families. Please try again.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearch("");
    setVulnerabilityLevel("");
    setResults([]);
    setSearchError("");
    setHasSubmittedSearch(false);
    setHasAppliedFilters(false);
  };

  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/data-entry-dashboard" },
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
                value={search}
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
                value={vulnerabilityLevel}
                onChange={handleVulnerabilityLevelChange}
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vulnerability level</option>
                {vulnerabilityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSearching}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {hasSubmittedSearch && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Search Results
          </h2>

          {!hasAppliedFilters ? (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                No Results
              </h2>
              <p className="text-gray-500">No filters are applied</p>
            </>
          ) : isSearching ? (
            <p className="text-sm text-gray-600">
              Searching registered families...
            </p>
          ) : searchError ? (
            <p className="text-sm text-red-600" role="alert">
              {searchError}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm text-gray-700">
                    <th className="py-3 px-4 border">National ID</th>
                    <th className="py-3 px-4 border">Family Head Name</th>
                    <th className="py-3 px-4 border">Phone</th>
                    <th className="py-3 px-4 border">Vulnerability Level</th>
                    <th className="py-3 px-4 border">Last Updated</th>
                    <th className="py-3 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((family) => (
                    <tr key={family.id} className="border-t">
                      <td className="py-2 px-4 border">{family.nationalId}</td>
                      <td className="py-2 px-4 border">
                        {family.familyHeadName}
                      </td>
                      <td className="py-2 px-4 border">{family.phoneNumber}</td>
                      <td className="py-2 px-4 border">
                        <span
                          className={getVulnerabilityClass(
                            family.vulnerabilityLevel,
                          )}
                        >
                          {getVulnerabilityLabel(family.vulnerabilityLevel)}
                        </span>
                      </td>
                      <td className="py-2 px-4 border">
                        {formatDate(family.updatedAt)}
                      </td>
                      <td className="py-2 px-4 border">
                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/families/${family.nationalId}`}
                            className="text-sm text-[#0066FF] hover:text-blue-700"
                          >
                            View Profile
                          </Link>
                          <Link
                            to={`/add-assistance/${family.nationalId}`}
                            className="text-sm text-[#0066FF] hover:text-blue-700"
                          >
                            Add Assistance
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-4 px-4 text-center text-gray-500"
                      >
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </RegisterFamilyPageLayout>
  );
};

export default LocalSearchPage;
