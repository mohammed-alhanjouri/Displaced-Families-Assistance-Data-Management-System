import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  HandHeart,
  LoaderCircle,
  MapPin,
  RotateCcw,
  ShieldAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import VulnerabilityLevelBadge from "../components/families/VulnerabilityLevelBadge";
import { vulnerabilityLevels } from "../components/families/vulnerabilityLevel";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageHeader from "../components/ui/PageHeader";
import { fetchCamps, type Camp } from "../lib/camps";
import {
  fetchReportsData,
  type AssistanceHistoryReportRow,
  type AssistanceTypeReportRow,
  type FamiliesByLocationReportRow,
  type ReportSummary,
  type ReportsData,
  type ReportsFilters,
  type ReportsReportType,
  type VulnerabilityReportRow,
} from "../lib/families";
import DashboardLayout from "../layouts/DashboardLayout";

type ReportFormData = ReportsFilters & {
  reportType: ReportsReportType | "";
};

type GeneratedReport = {
  reportType: ReportsReportType;
  filters: ReportsFilters;
  campName: string;
  data: ReportsData;
  generatedAt: string;
};

const reportTypeLabels: Record<ReportsReportType, string> = {
  "families-by-location": "Families by Camp / Location",
  "vulnerability-levels": "Families by Vulnerability Level",
  "assistance-types": "Assistance by Type",
  "assistance-history": "Detailed Family Assistance History",
};

const reportTypeIcons: Record<ReportsReportType, LucideIcon> = {
  "families-by-location": MapPin,
  "vulnerability-levels": ShieldAlert,
  "assistance-types": HandHeart,
  "assistance-history": FileText,
};

const reportTypeOptions = Object.entries(reportTypeLabels).map(
  ([value, label]) => ({
    value: value as ReportsReportType,
    label,
  }),
);

const assistanceTypes = ["Food", "Shelter", "Medical", "Education", "Cash"];

const emptyReportFormData: ReportFormData = {
  reportType: "",
  campId: "",
  fromDate: "",
  toDate: "",
  vulnerabilityLevel: "",
  assistanceType: "",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatOptionalDate = (value: string | null) =>
  value ? formatDate(value) : "N/A";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getFilterSummary = (report: GeneratedReport) => {
  const parts = [
    `Location: ${report.campName}`,
    report.filters.fromDate
      ? `From: ${formatDate(report.filters.fromDate)}`
      : "From: All dates",
    report.filters.toDate
      ? `To: ${formatDate(report.filters.toDate)}`
      : "To: All dates",
    report.filters.vulnerabilityLevel
      ? `Vulnerability: ${report.filters.vulnerabilityLevel}`
      : "Vulnerability: All levels",
    report.filters.assistanceType
      ? `Assistance: ${report.filters.assistanceType}`
      : "Assistance: All types",
  ];

  return parts.join(" | ");
};

const SummaryCards = ({ summary }: { summary: ReportSummary }) => {
  const cards = [
    { label: "Families", value: summary.totalFamilies, icon: UsersRound },
    { label: "Persons", value: summary.totalPersons, icon: UsersRound },
    {
      label: "High Vulnerability",
      value: summary.highVulnerabilityFamilies,
      icon: ShieldAlert,
    },
    {
      label: "Assistance Records",
      value: summary.totalAssistanceRecords,
      icon: HandHeart,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-600">{card.label}</h3>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#0066FF]">
              {card.value}
            </p>
          </div>
        );
      })}
    </section>
  );
};

const EmptyTableState = ({ message }: { message: string }) => (
  <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
    <FileText className="mx-auto mb-2 h-6 w-6 text-gray-400" />
    <p>{message}</p>
  </div>
);

const FamiliesByLocationTable = ({
  rows,
}: {
  rows: FamiliesByLocationReportRow[];
}) => {
  if (rows.length === 0) {
    return <EmptyTableState message="No family records match the filters." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Camp / Location</th>
            <th className="px-4 py-3 font-semibold">Families</th>
            <th className="px-4 py-3 font-semibold">Persons</th>
            <th className="px-4 py-3 font-semibold">High Vulnerability</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
          {rows.map((row) => (
            <tr key={row.campId}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {row.campName}
              </td>
              <td className="px-4 py-3">{row.familyCount}</td>
              <td className="px-4 py-3">{row.totalMembers}</td>
              <td className="px-4 py-3">{row.highVulnerabilityFamilies}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VulnerabilityTable = ({ rows }: { rows: VulnerabilityReportRow[] }) => {
  if (rows.every((row) => row.familyCount === 0)) {
    return (
      <EmptyTableState message="No vulnerability records match the filters." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Vulnerability Level</th>
            <th className="px-4 py-3 font-semibold">Families</th>
            <th className="px-4 py-3 font-semibold">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
          {rows.map((row) => (
            <tr key={row.level}>
              <td className="px-4 py-3">
                <VulnerabilityLevelBadge level={row.level} variant="compact" />
              </td>
              <td className="px-4 py-3">{row.familyCount}</td>
              <td className="px-4 py-3">{row.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AssistanceTypeTable = ({ rows }: { rows: AssistanceTypeReportRow[] }) => {
  if (rows.length === 0) {
    return (
      <EmptyTableState message="No assistance records match the filters." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Assistance Type</th>
            <th className="px-4 py-3 font-semibold">Records</th>
            <th className="px-4 py-3 font-semibold">Families Served</th>
            <th className="px-4 py-3 font-semibold">Latest Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
          {rows.map((row) => (
            <tr key={row.assistanceType}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {row.assistanceType}
              </td>
              <td className="px-4 py-3">{row.recordCount}</td>
              <td className="px-4 py-3">{row.familiesServed}</td>
              <td className="px-4 py-3">
                {formatOptionalDate(row.latestAssistanceDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AssistanceHistoryTable = ({
  rows,
}: {
  rows: AssistanceHistoryReportRow[];
}) => {
  if (rows.length === 0) {
    return (
      <EmptyTableState message="No assistance history matches the filters." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Family</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">Vulnerability</th>
            <th className="px-4 py-3 font-semibold">Assistance</th>
            <th className="px-4 py-3 font-semibold">Provider</th>
            <th className="px-4 py-3 font-semibold">Notes</th>
            <th className="px-4 py-3 font-semibold">Recorded By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="whitespace-nowrap px-4 py-3">
                {formatDate(row.assistanceDate)}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {row.familyHeadName}
                </div>
                <div className="text-xs text-gray-500">{row.nationalId}</div>
              </td>
              <td className="px-4 py-3">
                {row.currentCampName ?? "Unknown camp"}
              </td>
              <td className="px-4 py-3">
                <VulnerabilityLevelBadge
                  level={row.vulnerabilityLevel}
                  variant="compact"
                />
              </td>
              <td className="px-4 py-3">{row.assistanceType}</td>
              <td className="px-4 py-3">{row.providerOrganization}</td>
              <td className="px-4 py-3">{row.notes || "N/A"}</td>
              <td className="px-4 py-3">
                {row.recordedByName ?? "Current user"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportTable = ({ report }: { report: GeneratedReport }) => {
  switch (report.reportType) {
    case "families-by-location":
      return <FamiliesByLocationTable rows={report.data.familiesByLocation} />;
    case "vulnerability-levels":
      return <VulnerabilityTable rows={report.data.vulnerabilityLevels} />;
    case "assistance-types":
      return <AssistanceTypeTable rows={report.data.assistanceTypes} />;
    case "assistance-history":
      return <AssistanceHistoryTable rows={report.data.assistanceHistory} />;
    default:
      return null;
  }
};

const buildSummaryHtml = (summary: ReportSummary) => `
  <div class="summary">
    <div><strong>${summary.totalFamilies}</strong><span>Families</span></div>
    <div><strong>${summary.totalPersons}</strong><span>Persons</span></div>
    <div><strong>${summary.highVulnerabilityFamilies}</strong><span>High Vulnerability</span></div>
    <div><strong>${summary.totalAssistanceRecords}</strong><span>Assistance Records</span></div>
  </div>
`;

const buildReportTableHtml = (report: GeneratedReport) => {
  switch (report.reportType) {
    case "families-by-location":
      return `
        <table>
          <thead><tr><th>Camp / Location</th><th>Families</th><th>Persons</th><th>High Vulnerability</th></tr></thead>
          <tbody>
            ${
              report.data.familiesByLocation.length === 0
                ? `<tr><td colspan="4">No family records match the filters.</td></tr>`
                : report.data.familiesByLocation
                    .map(
                      (row) => `
                        <tr>
                          <td>${escapeHtml(row.campName)}</td>
                          <td>${row.familyCount}</td>
                          <td>${row.totalMembers}</td>
                          <td>${row.highVulnerabilityFamilies}</td>
                        </tr>
                      `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      `;
    case "vulnerability-levels":
      return `
        <table>
          <thead><tr><th>Vulnerability Level</th><th>Families</th><th>Share</th></tr></thead>
          <tbody>
            ${report.data.vulnerabilityLevels
              .map(
                (row) => `
                  <tr>
                    <td>${escapeHtml(row.level)}</td>
                    <td>${row.familyCount}</td>
                    <td>${row.percentage}%</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      `;
    case "assistance-types":
      return `
        <table>
          <thead><tr><th>Assistance Type</th><th>Records</th><th>Families Served</th><th>Latest Date</th></tr></thead>
          <tbody>
            ${
              report.data.assistanceTypes.length === 0
                ? `<tr><td colspan="4">No assistance records match the filters.</td></tr>`
                : report.data.assistanceTypes
                    .map(
                      (row) => `
                        <tr>
                          <td>${escapeHtml(row.assistanceType)}</td>
                          <td>${row.recordCount}</td>
                          <td>${row.familiesServed}</td>
                          <td>${escapeHtml(formatOptionalDate(row.latestAssistanceDate))}</td>
                        </tr>
                      `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      `;
    case "assistance-history":
      return `
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Family</th><th>National ID</th><th>Location</th>
              <th>Vulnerability</th><th>Assistance</th><th>Provider</th><th>Notes</th><th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            ${
              report.data.assistanceHistory.length === 0
                ? `<tr><td colspan="9">No assistance history matches the filters.</td></tr>`
                : report.data.assistanceHistory
                    .map(
                      (row) => `
                        <tr>
                          <td>${escapeHtml(formatDate(row.assistanceDate))}</td>
                          <td>${escapeHtml(row.familyHeadName)}</td>
                          <td>${escapeHtml(row.nationalId)}</td>
                          <td>${escapeHtml(row.currentCampName ?? "Unknown camp")}</td>
                          <td>${escapeHtml(row.vulnerabilityLevel)}</td>
                          <td>${escapeHtml(row.assistanceType)}</td>
                          <td>${escapeHtml(row.providerOrganization)}</td>
                          <td>${escapeHtml(row.notes || "N/A")}</td>
                          <td>${escapeHtml(row.recordedByName ?? "Current user")}</td>
                        </tr>
                      `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      `;
    default:
      return "";
  }
};

const buildReportHtml = (report: GeneratedReport) => `
  <!doctype html>
  <html>
    <head>
      <title>${escapeHtml(reportTypeLabels[report.reportType])}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
        h1 { margin: 0 0 8px; font-size: 24px; }
        p { margin: 0 0 8px; color: #4b5563; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
        .summary div { border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; }
        .summary strong { display: block; color: #0066ff; font-size: 22px; }
        .summary span { display: block; margin-top: 4px; color: #4b5563; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(reportTypeLabels[report.reportType])}</h1>
      <p>${escapeHtml(getFilterSummary(report))}</p>
      <p>Generated: ${escapeHtml(formatDateTime(report.generatedAt))}</p>
      ${buildSummaryHtml(report.data.summary)}
      ${buildReportTableHtml(report)}
    </body>
  </html>
`;

const ReportsPage = () => {
  const [formData, setFormData] = useState<ReportFormData>({
    ...emptyReportFormData,
  });
  const [generatedReport, setGeneratedReport] =
    useState<GeneratedReport | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [campLoadError, setCampLoadError] = useState("");
  const [formError, setFormError] = useState("");
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
      generationRequestRef.current += 1;
    };
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleReset = () => {
    generationRequestRef.current += 1;
    setFormData({ ...emptyReportFormData });
    setGeneratedReport(null);
    setFormError("");
    setIsGeneratingReport(false);
  };

  const handleGenerateReport = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.reportType) {
      setFormError("Select a report type.");
      return;
    }

    if (
      formData.fromDate &&
      formData.toDate &&
      formData.fromDate > formData.toDate
    ) {
      setFormError("Date From cannot be later than Date To.");
      return;
    }

    const reportFilters: ReportsFilters = {
      campId: formData.campId,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      vulnerabilityLevel: formData.vulnerabilityLevel,
      assistanceType: formData.assistanceType,
    };
    const selectedCamp = camps.find((camp) => camp.id === reportFilters.campId);
    const generationRequest = generationRequestRef.current + 1;
    generationRequestRef.current = generationRequest;
    setIsGeneratingReport(true);
    setFormError("");

    try {
      const data = await fetchReportsData(reportFilters);

      if (generationRequestRef.current === generationRequest) {
        setGeneratedReport({
          reportType: formData.reportType,
          filters: reportFilters,
          campName: reportFilters.campId
            ? (selectedCamp?.name ?? "Selected location")
            : "All locations",
          data,
          generatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (generationRequestRef.current === generationRequest) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to generate the report.",
        );
        setGeneratedReport(null);
      }
    } finally {
      if (generationRequestRef.current === generationRequest) {
        setIsGeneratingReport(false);
      }
    }
  };

  const handleExportPdf = () => {
    if (!generatedReport) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      setFormError("Unable to open the PDF export window.");
      return;
    }

    printWindow.document.write(buildReportHtml(generatedReport));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const GeneratedReportIcon = generatedReport
    ? reportTypeIcons[generatedReport.reportType]
    : FileText;

  return (
    <DashboardLayout>
      <div>
        <Breadcrumbs items={[{ label: "Reports", href: "/reports" }]} />
        <PageHeader
          icon={FileText}
          title="Generate Reports"
          subtitle="Build filtered operational reports for planning and export."
          className="mt-3 mb-6"
        />
      </div>

      <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
          <BarChart3 className="h-5 w-5 text-[#0066FF]" />
          Report Configuration
        </h2>
        <form onSubmit={handleGenerateReport} aria-busy={isGeneratingReport}>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label
                htmlFor="report-type"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Report Type
                </span>
              </label>
              <select
                id="report-type"
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a report type</option>
                {reportTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-camp"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Camp / Location
                </span>
              </label>
              <select
                id="report-camp"
                name="campId"
                value={formData.campId}
                onChange={handleChange}
                disabled={isLoadingCamps}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingCamps ? "Loading locations..." : "All locations"}
                </option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
              {campLoadError && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  {campLoadError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="report-vulnerability"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-gray-400" />
                  Vulnerability Level
                </span>
              </label>
              <select
                id="report-vulnerability"
                name="vulnerabilityLevel"
                value={formData.vulnerabilityLevel}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All levels</option>
                {vulnerabilityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-assistance-type"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                <span className="inline-flex items-center gap-1.5">
                  <HandHeart className="h-4 w-4 text-gray-400" />
                  Assistance Type
                </span>
              </label>
              <select
                id="report-assistance-type"
                name="assistanceType"
                value={formData.assistanceType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All types</option>
                {assistanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="from-date"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Date From
                </span>
              </label>
              <input
                id="from-date"
                name="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-600 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF]"
              />
            </div>

            <div>
              <label
                htmlFor="to-date"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Date To
                </span>
              </label>
              <input
                id="to-date"
                name="toDate"
                type="date"
                value={formData.toDate}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-600 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#0066FF]"
              />
            </div>
          </div>

          {formError && (
            <p className="mt-4 flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={isGeneratingReport}
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {isGeneratingReport ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isGeneratingReport}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </span>
            </button>
          </div>
        </form>
      </section>

      {generatedReport && (
        <section className="mt-6 rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                <GeneratedReportIcon className="mr-2 inline h-5 w-5 text-[#0066FF]" />
                {reportTypeLabels[generatedReport.reportType]}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {getFilterSummary(generatedReport)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Generated {formatDateTime(generatedReport.generatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              Export as PDF
            </button>
          </div>

          <SummaryCards summary={generatedReport.data.summary} />

          <div className="mt-6 rounded-md border border-gray-200">
            <ReportTable report={generatedReport} />
          </div>
        </section>
      )}
    </DashboardLayout>
  );
};

export default ReportsPage;
