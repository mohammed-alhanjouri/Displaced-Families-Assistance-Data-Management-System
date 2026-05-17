const DashboardFilter = () => {
  const locations = ["Location 1", "Location 2", "Location 3"];

  return (
    <form className="grid gap-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div>
        <label
          htmlFor="search-date"
          className="block text-sm font-medium text-gray-800"
        >
          Date Range
        </label>
        <input
          id="search-date"
          name="search-date"
          type="date"
          className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
        />
      </div>

      <div>
        <label
          htmlFor="search-location"
          className="block text-sm font-medium text-gray-800"
        >
          Location
        </label>
        <select
          id="search-location"
          name="search-location"
          className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
        >
          <option value="">Select a location</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
      >
        Apply
      </button>
    </form>
  );
};

export default DashboardFilter;
