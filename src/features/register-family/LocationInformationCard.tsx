// Card containing location information details for the registration process

const LocationInformationCard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Location Information</h2>
      <form>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="currentLocation"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Current Camp / Location
            </label>
            <input
              type="text"
              id="currentLocation"
              name="currentLocation"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="originalResidenceGovernorate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Original Residence Governorate
            </label>
            <select
              id="originalResidenceGovernorate"
              name="originalResidenceGovernorate"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Select a governorate
              </option>
              <option value="northGaza">North Gaza</option>
              <option value="gaza">Gaza</option>
              <option value="middleGaza">Middle Gaza</option>
              <option value="southGaza">South Gaza</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="originalResidenceCity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Original Residence City
            </label>
            <select
              id="originalResidenceCity"
              name="originalResidenceCity"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Select a city
              </option>
              <option value="city1">City 1</option>
              <option value="city2">City 2</option>
              <option value="city3">City 3</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LocationInformationCard;
