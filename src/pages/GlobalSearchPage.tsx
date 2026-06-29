import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import VulnerabilityLevelBadge from "../components/families/VulnerabilityLevelBadge";
import VulnerabilityLevelSelect from "../components/families/VulnerabilityLevelSelect";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { fetchCamps, type Camp } from "../lib/camps";
import {
  fetchFamilies,
  filterFamilies,
  type FamilyRecord,
  type VulnerabilityLevel,
} from "../lib/families";
import DashboardLayout from "../layouts/DashboardLayout";

type SearchFilters = {
  search: string;
  campId: string;
  vulnerabilityLevel: VulnerabilityLevel | "";
};

const emptyFilters: SearchFilters = {
  search: "",
  campId: "",
  vulnerabilityLevel: "",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(value),
  );

const GlobalSearchPage = () => {
  const [formData, setFormData] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [results, setResults] = useState<FamilyRecord[]>([]);
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCamps = async () => {
      try {
        const campOptions = await fetchCamps();

        if (isActive) {
          setCamps(campOptions);
        }
      } catch (error) {
        if (isActive) {
          setSearchError(
            error instanceof Error ? error.message : "Unable to load camps.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingCamps(false);
        }
      }
    };

    void loadCamps();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAppliedFilters = { ...formData };
    const hasFilters =
      nextAppliedFilters.search.trim() !== "" ||
      nextAppliedFilters.campId !== "" ||
      nextAppliedFilters.vulnerabilityLevel !== "";

    setAppliedFilters(nextAppliedFilters);
    setHasSubmittedSearch(true);
    setSearchError("");

    if (!hasFilters) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const families = await fetchFamilies();
      const textMatches = filterFamilies(
        families,
        nextAppliedFilters.search,
        nextAppliedFilters.vulnerabilityLevel,
      );
      setResults(
        nextAppliedFilters.campId
          ? textMatches.filter(
              (family) => family.currentCampId === nextAppliedFilters.campId,
            )
          : textMatches,
      );
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
    setFormData({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    setResults([]);
    setSearchError("");
    setHasSubmittedSearch(false);
  };

  const hasAppliedFilters =
    appliedFilters.search.trim() !== "" ||
    appliedFilters.campId !== "" ||
    appliedFilters.vulnerabilityLevel !== "";

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
          <div className="grid gap-6 md:grid-cols-3">
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
                htmlFor="search-camp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Camp / Location
              </label>
              <select
                id="search-camp"
                name="campId"
                value={formData.campId}
                onChange={handleChange}
                disabled={isLoadingCamps}
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingCamps ? "Loading camps..." : "Select a camp"}
                </option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
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
              <VulnerabilityLevelSelect
                id="search-vulnerability-level"
                name="vulnerabilityLevel"
                value={formData.vulnerabilityLevel}
                onChange={handleChange}
              />

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSearching ? "Searching..." : "Apply"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSearching}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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

          {isSearching ? (
            <p className="text-sm text-gray-600">
              Searching registered families...
            </p>
          ) : searchError ? (
            <p className="text-sm text-red-600" role="alert">
              {searchError}
            </p>
          ) : !hasAppliedFilters ? (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                No Results
              </h2>
              <p className="text-gray-500">No filters are applied</p>
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm text-gray-700">
                    <th className="py-3 px-4 border">National ID</th>
                    <th className="py-3 px-4 border">Family Head Name</th>
                    <th className="py-3 px-4 border">Phone</th>
                    <th className="py-3 px-4 border">Current Camp</th>
                    <th className="py-3 px-4 border">Vulnerability Level</th>
                    <th className="py-3 px-4 border">Last Assistance</th>
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
                        {family.currentCampName ?? "Unknown camp"}
                      </td>
                      <td className="py-2 px-4 border">
                        <VulnerabilityLevelBadge
                          level={family.vulnerabilityLevel}
                        />
                      </td>
                      <td className="py-2 px-4 border">
                        {family.lastAssistanceDate
                          ? formatDate(family.lastAssistanceDate)
                          : "No assistance recorded"}
                      </td>
                      <td className="py-2 px-4 border">
                        <Link
                          to={`/families/${family.nationalId}`}
                          className="text-sm text-[#0066FF] hover:text-blue-700"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
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
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default GlobalSearchPage;
