import { useState, type ChangeEvent, type FormEvent } from "react";

const DashboardFilter = () => {
  const locations = ["Location 1", "Location 2", "Location 3"];
  const [formData, setFormData] = useState({
    search: "",
    location: "",
    vulnerabilityLevel: "",
    fromDate: "",
    toDate: "",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleClear = () => {
    setFormData({
      search: "",
      location: "",
      vulnerabilityLevel: "",
      fromDate: "",
      toDate: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end"
    >
      <div>
        <label
          htmlFor="from-date"
          className="block text-sm font-medium text-gray-800 mb-2"
        >
          Date From (optional)
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
          Date To (optional)
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
          Location
        </label>
        <select
          id="search-location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a location</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default DashboardFilter;
