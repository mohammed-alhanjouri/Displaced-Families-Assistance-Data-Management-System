import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  LoaderCircle,
  PackagePlus,
  Phone,
  RotateCcw,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import VulnerabilityLevelBadge from "../components/families/VulnerabilityLevelBadge";
import VulnerabilityLevelSelect from "../components/families/VulnerabilityLevelSelect";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../features/auth/useAuth";
import {
  fetchFamilies,
  filterFamilies,
  type FamilyRecord,
  type VulnerabilityLevel,
} from "../lib/families";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";

const pageSize = 5;
const paginationButtonClassName =
  "inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(value),
  );

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
  const [page, setPage] = useState(1);

  //  Calculate pagination details based on the current page and the number of results
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedResults = results.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (newPage: number) => {
    setPage(Math.min(Math.max(newPage, 1), totalPages));
  };

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
        <PageHeader
          icon={Search}
          title="Local Search"
          subtitle="Find families inside your assigned camp."
          className="mt-3"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-gray-400" />
                  National ID / Family Head Name / Phone Number
                </span>
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
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-gray-400" />
                  Vulnerability Level
                </span>
              </label>
              <VulnerabilityLevelSelect
                id="search-vulnerability-level"
                name="vulnerabilityLevel"
                value={vulnerabilityLevel}
                onChange={handleVulnerabilityLevelChange}
              />

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    {isSearching ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Filter className="h-4 w-4" />
                    )}
                    {isSearching ? "Searching..." : "Apply"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSearching}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {hasSubmittedSearch && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Search className="h-5 w-5 text-[#0066FF]" />
            Search Results
          </h2>

          {isSearching ? (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Searching registered families...
            </p>
          ) : searchError ? (
            <p className="flex items-center gap-2 text-sm text-red-600" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" />
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
                    <th className="py-3 px-4 border">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-4 w-4" />
                        Family Head Name
                      </span>
                    </th>
                    <th className="py-3 px-4 border">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        Phone
                      </span>
                    </th>
                    <th className="py-3 px-4 border">Vulnerability Level</th>
                    <th className="py-3 px-4 border">Last Updated</th>
                    <th className="py-3 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((family) => (
                    <tr key={family.id} className="border-t">
                      <td className="py-2 px-4 border">{family.nationalId}</td>
                      <td className="py-2 px-4 border">
                        {family.familyHeadName}
                      </td>
                      <td className="py-2 px-4 border">{family.phoneNumber}</td>
                      <td className="py-2 px-4 border">
                        <VulnerabilityLevelBadge
                          level={family.vulnerabilityLevel}
                        />
                      </td>
                      <td className="py-2 px-4 border">
                        {formatDate(family.updatedAt)}
                      </td>
                      <td className="py-2 px-4 border">
                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/families/${family.nationalId}`}
                            className="inline-flex items-center gap-1.5 text-sm text-[#0066FF] hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                            View Profile
                          </Link>
                          <Link
                            to={`/add-assistance/${family.nationalId}`}
                            className="inline-flex items-center gap-1.5 text-sm text-[#0066FF] hover:text-blue-700"
                          >
                            <PackagePlus className="h-4 w-4" />
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
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={paginationButtonClassName}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${
                    pageNumber === currentPage
                      ? "border-gray-300 bg-gray-300 text-gray-900"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={paginationButtonClassName}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </RegisterFamilyPageLayout>
  );
};

export default LocalSearchPage;
