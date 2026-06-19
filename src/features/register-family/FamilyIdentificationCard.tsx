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
}

const FamilyIdentificationCard = ({
  values,
  errors,
  onChange,
  disabled = false,
}: FamilyIdentificationCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Family Identification</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="nationalID"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            National ID *
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
            onChange={(event) =>
              onChange("nationalID", event.target.value.replace(/\D/g, "").slice(0, 9))
            }
            disabled={disabled}
            aria-invalid={Boolean(errors.nationalID)}
            aria-describedby={errors.nationalID ? "nationalID-error" : undefined}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            Family Head Name *
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
            Phone Number *
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
