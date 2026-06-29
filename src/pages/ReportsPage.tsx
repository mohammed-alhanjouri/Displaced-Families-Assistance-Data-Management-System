import { useEffect, useRef, useState, type SubmitEvent } from "react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { fetchCamps, type Camp } from "../lib/camps";
import DashboardLayout from "../layouts/DashboardLayout";

const reportTypes = [
  "Family Summary",
  "Assistance Overview",
  "Vulnerability Analysis",
];

// Define a delay for simulating report generation time
const reportGenerationDelayMs = 300;

const ReportsPage = () => {
  const [showReportOutput, setShowReportOutput] = useState(false);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [campLoadError, setCampLoadError] = useState("");
  // Store a ref to track the current report generation request, allowing us to cancel outdated requests if the user resets the form or generates a new report before the previous one completes
  const generationRequestRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    const loadCamps = async () => {
      try {
        const campOptions = await fetchCamps();

        if (isActive) {
          setCamps(campOptions);
        }
      } catch (error) {
        if (isActive) {
          setCampLoadError(
            error instanceof Error ? error.message : "Unable to load camps.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingCamps(false);
        }
      }
    };

    void loadCamps();

    return () => {
      isActive = false;
      // Increment the generation request ref to cancel any ongoing report generation if the component unmounts
      generationRequestRef.current += 1;
    };
  }, []);

  const handleReset = () => {
    // Increment the generation request ref to cancel any ongoing report generation when the form is reset
    generationRequestRef.current += 1;
    setIsGeneratingReport(false);
    setShowReportOutput(false);
  };

  const handleGenerateReport = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const reportType = formData.get("reportType") as string;
    const campId = formData.get("campId") as string;
    const fromDate = formData.get("fromDate") as string;
    const toDate = formData.get("toDate") as string;

    if (!reportType || !campId || !fromDate || !toDate) {
      return;
    }

    // Increment the generation request ref to track the current report generation request. This allows us to cancel outdated requests if the user resets the form or generates a new report before the previous one completes.
    const generationRequest = generationRequestRef.current + 1;
    generationRequestRef.current = generationRequest;
    setIsGeneratingReport(true);
    setShowReportOutput(false);

    // Simulate report generation delay
    await new Promise((resolve) =>
      window.setTimeout(resolve, reportGenerationDelayMs),
    );

    if (generationRequestRef.current === generationRequest) {
      setShowReportOutput(true);
      setIsGeneratingReport(false);
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
        <form onSubmit={handleGenerateReport} aria-busy={isGeneratingReport}>
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
              htmlFor="report-camp"
              className="block text-sm font-medium text-gray-700"
            >
              Camp/Location
            </label>
            <div className="mb-4">
              <select
                id="report-camp"
                name="campId"
                disabled={isLoadingCamps || Boolean(campLoadError)}
                aria-invalid={Boolean(campLoadError)}
                aria-describedby={
                  campLoadError ? "report-camp-error" : undefined
                }
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                <p id="report-camp-error" className="mt-1 text-sm text-red-600">
                  {campLoadError}
                </p>
              )}
            </div>

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
              disabled={isGeneratingReport}
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </button>

            <button
              type="reset"
              onClick={handleReset}
              disabled={isGeneratingReport}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
