import { Contact, Hash, Phone, UserRound } from "lucide-react";
import type {
  FamilyRegistrationChangeHandler,
  FamilyRegistrationErrors,
  FamilyRegistrationValues,
} from "./formTypes";

interface FamilyIdentificationCardProps {
  values: FamilyRegistrationValues;
  errors: FamilyRegistrationErrors;
  onChange: FamilyRegistrationChangeHandler;
  disabled?: boolean;
  isNationalIdReadOnly?: boolean;
}

const FamilyIdentificationCard = ({
  values,
  errors,
  onChange,
  disabled = false,
  isNationalIdReadOnly = false,
}: FamilyIdentificationCardProps) => {
  const nationalIdHelpId = isNationalIdReadOnly
    ? "nationalID-readonly-help"
    : undefined;
  const nationalIdErrorId = errors.nationalID ? "nationalID-error" : undefined;
  const nationalIdDescribedBy = [nationalIdErrorId, nationalIdHelpId]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
          <Contact className="h-5 w-5" />
        </span>
        Family Identification
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="nationalID"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-gray-400" />
              National ID *
            </span>
          </label>
          <input
            type="text"
            id="nationalID"
            name="nationalID"
            inputMode="numeric"
            autoComplete="off"
            required
            maxLength={9}
            value={values.nationalID}
            onChange={(event) => {
              if (isNationalIdReadOnly) {
                return;
              }

              onChange(
                "nationalID",
                event.target.value.replace(/\D/g, "").slice(0, 9),
              );
            }}
            disabled={disabled}
            readOnly={isNationalIdReadOnly}
            aria-invalid={Boolean(errors.nationalID)}
            aria-describedby={nationalIdDescribedBy || undefined}
            className={`w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isNationalIdReadOnly ? "bg-gray-100 text-gray-600" : ""
            }`}
          />
          {isNationalIdReadOnly && (
            <p id="nationalID-readonly-help" className="mt-1 text-sm text-gray-500">
              National ID cannot be modified.
            </p>
          )}
          {errors.nationalID && (
            <p id="nationalID-error" className="mt-1 text-sm text-red-600">
              {errors.nationalID}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="familyHeadName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-gray-400" />
              Family Head Name *
            </span>
          </label>
          <input
            type="text"
            id="familyHeadName"
            name="familyHeadName"
            required
            maxLength={120}
            autoComplete="name"
            value={values.familyHeadName}
            onChange={(event) => onChange("familyHeadName", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.familyHeadName)}
            aria-describedby={
              errors.familyHeadName ? "familyHeadName-error" : undefined
            }
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.familyHeadName && (
            <p id="familyHeadName-error" className="mt-1 text-sm text-red-600">
              {errors.familyHeadName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-gray-400" />
              Phone Number *
            </span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            inputMode="numeric"
            autoComplete="tel"
            required
            maxLength={10}
            value={values.phoneNumber}
            onChange={(event) =>
              onChange("phoneNumber", event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            disabled={disabled}
            aria-invalid={Boolean(errors.phoneNumber)}
            aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">
              {errors.phoneNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyIdentificationCard;
