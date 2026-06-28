import Breadcrumbs from "../components/ui/Breadcrumbs";
import DashboardLayout from "../layouts/DashboardLayout";
import { useState } from "react";

const reportTypes = [
  "Family Summary",
  "Assistance Overview",
  "Vulnerability Analysis",
];

const locations = [
  "Location 1",
  "Location 2",
  "Location 3",
  "Location 4",
  "Location 5",
  "Location 6",
  "Location 7",
  "Location 8",
  "Location 9",
  "Location 10",
];

const ReportsPage = () => {
  const [showReportOutput, setShowReportOutput] = useState(false);

  const handleReset = () => {
    setShowReportOutput(false);
  };

  const handleGenerateReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const reportType = formData.get("reportType") as string;
    const location = formData.get("location") as string;
    const fromDate = formData.get("fromDate") as string;
    const toDate = formData.get("toDate") as string;

    if (reportType && location && fromDate && toDate) {
      setShowReportOutput(true);
    }
  };
  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs items={[{ label: "Reports", href: "/reports" }]} />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Generate Reports
        </h1>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
        <form onSubmit={handleGenerateReport}>
          <div className="grid grid-cols-4 gap-6">
            <label
              htmlFor="report-type"
              className="block text-sm font-medium text-gray-700"
            >
              Report Type
            </label>
            <select
              id="report-type"
              name="reportType"
              className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Select a report type</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Camp / Location
            </label>
            <select
              id="location"
              name="location"
              className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <label
              htmlFor="from-date"
              className="block text-sm font-medium text-gray-800"
            >
              Date From
            </label>
            <input
              id="from-date"
              name="fromDate"
              type="date"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
            />

            <label
              htmlFor="to-date"
              className="block text-sm font-medium text-gray-800"
            >
              Date To
            </label>
            <input
              id="to-date"
              name="toDate"
              type="date"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-600 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF] sm:text-sm/6"
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              Generate Report
            </button>

            <button
              type="reset"
              onClick={handleReset}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {showReportOutput && (
        <div className="bg-white p-4 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Report Output</h2>
          <p className="text-gray-500">
            [Report preview placeholder (chart/table depending on type)]
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportsPage;
