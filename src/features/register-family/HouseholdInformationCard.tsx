// Card containing household information details for the registration process
import { useState } from "react";
import Checkbox from "../../components/ui/Checkbox";

const HouseholdInformationCard = () => {
  const [isFemaleHeaded, setIsFemaleHeaded] = useState(false);

  const handleFemaleHeadedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFemaleHeaded(e.target.checked);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Household Information</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="totalMembers"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Total Members *
          </label>
          <input
            type="number"
            id="totalMembers"
            name="totalMembers"
            min={1}
            max={50}
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <Checkbox
            id="isFemaleHeaded"
            name="isFemaleHeaded"
            label="Female-Headed Household"
            checked={isFemaleHeaded}
            onChange={handleFemaleHeadedChange}
          />
        </div>
        {isFemaleHeaded && (
          <div>
            <label
              htmlFor="femaleHeadReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Female Head Reason
            </label>
            <input
              type="text"
              id="femaleHeadReason"
              name="femaleHeadReason"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdInformationCard;
