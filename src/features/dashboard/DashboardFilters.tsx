import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import {
  AlertCircle,
  Calendar,
  Filter,
  LoaderCircle,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { fetchCamps, type Camp } from "../../lib/camps";
import type { DashboardStatsFilters } from "../../lib/families";

const emptyFilters: DashboardStatsFilters = {
  campId: "",
  fromDate: "",
  toDate: "",
};

interface DashboardFilterProps {
  isApplying: boolean;
  onApply: (filters: DashboardStatsFilters) => void;
  onClear: () => void;
}

const DashboardFilter = ({
  isApplying,
  onApply,
  onClear,
}: DashboardFilterProps) => {
  const [formData, setFormData] = useState<DashboardStatsFilters>({
    ...emptyFilters,
  });
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [loadError, setLoadError] = useState("");

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
          setLoadError(
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

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(formData);
  };

  const handleClear = () => {
    const nextFilters = {
      ...emptyFilters,
    };

    setFormData(nextFilters);
    onClear();
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isApplying}
      className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,11rem)_minmax(0,11rem)_minmax(0,1fr)] md:items-start">
        <div>
          <label
            htmlFor="from-date"
            className="block text-sm font-medium text-gray-800 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              Date From (optional)
            </span>
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
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              Date To (optional)
            </span>
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

        <div>
          <label
            htmlFor="search-location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              Camp / Location
            </span>
          </label>
          <select
            id="search-location"
            name="campId"
            value={formData.campId}
            onChange={handleChange}
            disabled={isLoadingCamps}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              {isLoadingCamps ? "Loading locations..." : "Select a location"}
            </option>
            {camps.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </select>

          {loadError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              <AlertCircle className="mr-1 inline h-4 w-4" />
              {loadError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={isApplying}
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {isApplying ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                {isApplying ? "Applying..." : "Apply"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isApplying}
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
    </form>
  );
};

export default DashboardFilter;
