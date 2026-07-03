// Import the real Camp type from
import { Building2, MapPin, MapPinned } from "lucide-react";
import type { Camp } from "../../lib/camps";
import type {
  FamilyRegistrationChangeHandler,
  FamilyRegistrationErrors,
  FamilyRegistrationValues,
} from "./formTypes";

// Define a governorate to cities mapping for the original residence city dropdown
const citiesByGovernorate: Record<string, string[]> = {
  "North Gaza": ["Beit Lahia", "Beit Hanoun", "Jabalia"],
  Gaza: ["Gaza City", "Al-Zahra", "Juhor ad-Dik"],
  "Deir al-Balah": ["Deir al-Balah", "Al-Nuseirat", "Al-Maghazi", "Bureij"],
  "Khan Younis": ["Khan Younis", "Abasan al-Kabira", "Bani Suheila"],
  Rafah: ["Rafah", "Al-Shawka", "Al-Nasr"],
};

interface LocationInformationCardProps {
  values: FamilyRegistrationValues;
  errors: FamilyRegistrationErrors;
  onChange: FamilyRegistrationChangeHandler;
  camps: Camp[];
  isLoadingCamps: boolean;
  campLoadError: string;
  disabled?: boolean;
}

// The city dropdown is dynamically populated based on the selected governorate. If no governorate is selected, the city dropdown is disabled.
const LocationInformationCard = ({
  values,
  errors,
  onChange,
  camps,
  isLoadingCamps,
  campLoadError,
  disabled = false,
}: LocationInformationCardProps) => {
  const cities = citiesByGovernorate[values.originalResidenceGovernorate] ?? [];

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
          <MapPinned className="h-5 w-5" />
        </span>
        Location Information
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="currentLocation"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              Current Camp / Location
            </span>
          </label>
          <select
            id="currentLocation"
            name="currentLocation"
            required
            value={values.currentCampId}
            onChange={(event) => onChange("currentCampId", event.target.value)}
            disabled={disabled || isLoadingCamps || Boolean(campLoadError)}
            aria-invalid={Boolean(errors.currentCampId)}
            aria-describedby={
              errors.currentCampId ? "currentCampId-error" : undefined
            }
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {campLoadError && (
            <p className="mt-1 text-sm text-red-600">{campLoadError}</p>
          )}
          {errors.currentCampId && (
            <p id="currentCampId-error" className="mt-1 text-sm text-red-600">
              {errors.currentCampId}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="originalResidenceGovernorate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              Original Residence Governorate
            </span>
          </label>
          {/* Selected governorate comes from the form values, options come from the citiesByGovernorate mapping */}
          <select
            id="originalResidenceGovernorate"
            name="originalResidenceGovernorate"
            required
            value={values.originalResidenceGovernorate}
            onChange={(event) =>
              onChange("originalResidenceGovernorate", event.target.value)
            }
            disabled={disabled}
            aria-invalid={Boolean(errors.originalResidenceGovernorate)}
            aria-describedby={
              errors.originalResidenceGovernorate
                ? "originalResidenceGovernorate-error"
                : undefined
            }
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a governorate</option>
            {Object.keys(citiesByGovernorate).map((governorate) => (
              <option key={governorate} value={governorate}>
                {governorate}
              </option>
            ))}
          </select>
          {errors.originalResidenceGovernorate && (
            <p
              id="originalResidenceGovernorate-error"
              className="mt-1 text-sm text-red-600"
            >
              {errors.originalResidenceGovernorate}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="originalResidenceCity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              Original Residence City
            </span>
          </label>
          {/* City options come from the selected governorate only */}
          <select
            id="originalResidenceCity"
            name="originalResidenceCity"
            required
            value={values.originalResidenceCity}
            onChange={(event) =>
              onChange("originalResidenceCity", event.target.value)
            }
            // City dropdown is disabled if no governorate is selected
            disabled={disabled || !values.originalResidenceGovernorate}
            aria-invalid={Boolean(errors.originalResidenceCity)}
            aria-describedby={
              errors.originalResidenceCity
                ? "originalResidenceCity-error"
                : undefined
            }
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.originalResidenceCity && (
            <p
              id="originalResidenceCity-error"
              className="mt-1 text-sm text-red-600"
            >
              {errors.originalResidenceCity}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationInformationCard;
