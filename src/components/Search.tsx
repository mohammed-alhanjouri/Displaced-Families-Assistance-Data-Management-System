// Search component for global search functionality

import Button from "./Button";

const Search = () => {
  const locations = ["Location 1", "Location 2", "Location 3"];
  return (
    <div className="flex flex-row gap-20 max-w-full mx-auto mt-10 bg-white border-2 border-gray-300 rounded-lg shadow-md p-6">
      <label
        htmlFor="search-date"
        className="block text-sm font-medium text-gray-800"
      >
        Date Range
      </label>
      <input
        type="date"
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6 mt-2"
      />
      <label
        htmlFor="search-location"
        className="block text-sm font-medium text-gray-800"
      >
        Location
      </label>
      <select className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6 mt-2">
        <option value="">Select a location</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
      {/* <Button
        type="submit"
        onClick={}
        className="font-medium text-[#0066FF] hover:text-blue-700"
      >
        Apply Filter
      </Button> */}
    </div>
  );
};

export default Search;
