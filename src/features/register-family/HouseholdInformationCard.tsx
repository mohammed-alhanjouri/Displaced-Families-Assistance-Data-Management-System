import { UsersRound, Venus } from "lucide-react";
import Checkbox from "../../components/ui/Checkbox";
import type {
  FamilyRegistrationChangeHandler,
  FamilyRegistrationErrors,
  FamilyRegistrationValues,
} from "./formTypes";

interface HouseholdInformationCardProps {
  values: FamilyRegistrationValues;
  errors: FamilyRegistrationErrors;
  onChange: FamilyRegistrationChangeHandler;
  disabled?: boolean;
}

const HouseholdInformationCard = ({
  values,
  errors,
  onChange,
  disabled = false,
}: HouseholdInformationCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
          <UsersRound className="h-5 w-5" />
        </span>
        Household Information
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="totalMembers"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <UsersRound className="h-4 w-4 text-gray-400" />
              Total Members *
            </span>
          </label>
          <input
            type="number"
            id="totalMembers"
            name="totalMembers"
            min={1}
            max={50}
            required
            value={values.totalMembers}
            onChange={(event) => onChange("totalMembers", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.totalMembers)}
            aria-describedby={errors.totalMembers ? "totalMembers-error" : undefined}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.totalMembers && (
            <p id="totalMembers-error" className="mt-1 text-sm text-red-600">
              {errors.totalMembers}
            </p>
          )}
        </div>
        <div>
          <Checkbox
            id="isFemaleHeaded"
            name="isFemaleHeaded"
            label="Female-Headed Household"
            checked={values.isFemaleHeaded}
            onChange={(event) => onChange("isFemaleHeaded", event.target.checked)}
            disabled={disabled}
          />
        </div>
        {values.isFemaleHeaded && (
          <div>
            <label
              htmlFor="femaleHeadReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <span className="inline-flex items-center gap-1.5">
                <Venus className="h-4 w-4 text-gray-400" />
                Female Head Reason
              </span>
            </label>
            <input
              type="text"
            id="femaleHeadReason"
            name="femaleHeadReason"
            required
            maxLength={250}
            value={values.femaleHeadReason}
            onChange={(event) => onChange("femaleHeadReason", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.femaleHeadReason)}
            aria-describedby={
              errors.femaleHeadReason ? "femaleHeadReason-error" : undefined
            }
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.femaleHeadReason && (
            <p id="femaleHeadReason-error" className="mt-1 text-sm text-red-600">
              {errors.femaleHeadReason}
            </p>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdInformationCard;
