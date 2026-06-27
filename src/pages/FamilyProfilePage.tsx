import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useAuth } from "../features/auth/useAuth";
import {
  fetchAssistanceRecords,
  fetchFamilyByNationalId,
  fetchLatestVulnerabilityAssessment,
  type AssistanceRecord,
  type FamilyRecord,
  type VulnerabilityAssessmentRecord,
} from "../lib/families";
import DashboardLayout from "../layouts/DashboardLayout";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";

type ProfileTab = "familyMembers" | "assistanceHistory";

const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "familyMembers", label: "Family Members" },
  { id: "assistanceHistory", label: "Assistance History" },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );

const vulnerabilityClasses: Record<string, string> = {
  Low: "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-green-100 text-green-700",
  Medium:
    "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700",
  High:
    "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-red-100 text-red-700",
  "Not assessed":
    "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600",
};

const getOriginalResidence = (family: FamilyRecord) =>
  [family.originalResidenceCity, family.originalResidenceGovernorate]
    .filter(Boolean)
    .join(", ");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const FamilyProfilePage = () => {
  const { nationalID } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("familyMembers");
  const [family, setFamily] = useState<FamilyRecord | null>(null);
  const [assistanceRecords, setAssistanceRecords] = useState<
    AssistanceRecord[]
  >([]);
  const [latestAssessment, setLatestAssessment] =
    useState<VulnerabilityAssessmentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const isDataEntryUser = user?.role === "data_entry_staff";
  const Layout = isDataEntryUser ? RegisterFamilyPageLayout : DashboardLayout;
  const searchPath = isDataEntryUser ? "/local-search" : "/global-search";
  const searchLabel = isDataEntryUser ? "Local Search" : "Global Search";
  const state = location.state as { successMessage?: unknown } | null;
  const successMessage =
    typeof state?.successMessage === "string" ? state.successMessage : "";

  const handleExportAssistanceHistory = () => {
    if (!family) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      return;
    }

    const assistanceContent =
      assistanceRecords.length === 0
        ? "<p>No assistance history available.</p>"
        : `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Assistance Type</th>
                <th>Provider Organization</th>
                <th>Notes</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${assistanceRecords
                .map(
                  (assistance) => `
                    <tr>
                      <td>${escapeHtml(formatDate(assistance.assistanceDate))}</td>
                      <td>${escapeHtml(assistance.assistanceType)}</td>
                      <td>${escapeHtml(assistance.providerOrganization)}</td>
                      <td>${escapeHtml(assistance.notes || "N/A")}</td>
                      <td>${escapeHtml(assistance.recordedByName ?? "Current user")}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        `;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Assistance History - ${escapeHtml(family.nationalId)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
            h1 { margin-bottom: 4px; }
            p { margin-top: 0; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background: #e5e7eb; }
          </style>
        </head>
        <body>
          <h1>Assistance History</h1>
          <p>${escapeHtml(family.familyHeadName)} - ${escapeHtml(family.nationalId)}</p>
          ${assistanceContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    let isActive = true;

    const loadFamily = async () => {
      if (!nationalID) {
        if (isActive) {
          setLoadError("A National ID is required to view a family profile.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const familyRecord = await fetchFamilyByNationalId(nationalID);

        if (!isActive) {
          return;
        }

        if (!familyRecord) {
          setLoadError("No registered family was found with this National ID.");
          return;
        }

        const [records, assessment] = await Promise.all([
          fetchAssistanceRecords(familyRecord.id),
          fetchLatestVulnerabilityAssessment(familyRecord.id),
        ]);

        if (!isActive) {
          return;
        }

        setFamily(familyRecord);
        setAssistanceRecords(records);
        setLatestAssessment(assessment);
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load the family profile. Please try again.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadFamily();

    return () => {
      isActive = false;
    };
  }, [nationalID]);

  if (isLoading) {
    return (
      <Layout>
        <p className="text-sm text-gray-600">Loading family profile...</p>
      </Layout>
    );
  }

  if (loadError || !family) {
    return (
      <Layout>
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-800">Family Not Found</h1>
          <p className="mt-3 text-sm text-red-600" role="alert">
            {loadError || "No family found with the provided National ID."}
          </p>
          <Link
            to={searchPath}
            className="mt-5 inline-block rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to {searchLabel}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: searchLabel, href: searchPath },
              { label: "Family Profile" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-800 mt-3">
            Family Profile
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {isDataEntryUser && (
            <Link
              to={`/update-family/${family.nationalId}`}
              className="rounded-md border border-[#0066FF] bg-white px-4 py-2 text-sm font-medium text-[#0066FF] hover:bg-blue-50"
            >
              Update Family
            </Link>
          )}
          {isDataEntryUser && (
            <Link
              to={`/vulnerability-assessment/${family.nationalId}`}
              className="rounded-md border border-[#0066FF] bg-white px-4 py-2 text-sm font-medium text-[#0066FF] hover:bg-blue-50"
            >
              Assess Vulnerability
            </Link>
          )}
          {isDataEntryUser && (
            <Link
              to={`/add-assistance/${family.nationalId}`}
              className="rounded-md border border-[#0066FF] bg-white px-4 py-2 text-sm font-medium text-[#0066FF] hover:bg-blue-50"
            >
              Add Assistance
            </Link>
          )}
          <Link
            to={searchPath}
            className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </div>
      </div>

      {successMessage && (
        <p
          className="mb-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Family Information
          </h2>
          <div className="space-y-3">
            <p>
              <span className="font-semibold text-gray-800">National ID:</span>{" "}
              {family.nationalId}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Family Head Name:
              </span>{" "}
              {family.familyHeadName}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Phone Number:
              </span>{" "}
              {family.phoneNumber}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Total Members:
              </span>{" "}
              {family.totalMembers}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Female-Headed Household:
              </span>{" "}
              {family.isFemaleHeaded ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Female Head Reason:
              </span>{" "}
              {family.femaleHeadReason || "N/A"}
            </p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Location and Vulnerability
          </h2>
          <div className="space-y-3">
            <p>
              <span className="font-semibold text-gray-800">
                Current Camp / Location:
              </span>{" "}
              {family.currentCampName ?? "Unknown camp"}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Original Residence:
              </span>{" "}
              {getOriginalResidence(family)}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Vulnerability Score:
              </span>{" "}
              {latestAssessment?.score ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Vulnerability Level:
              </span>{" "}
              <span
                className={
                  vulnerabilityClasses[
                    latestAssessment?.level ?? "Not assessed"
                  ]
                }
              >
                {latestAssessment?.level ?? "Not assessed"}
              </span>
            </p>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <div
          aria-label="Family profile details"
          className="flex flex-wrap gap-1"
          role="tablist"
        >
          {profileTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-controls={`${tab.id}-panel`}
                aria-selected={isActive}
                className={`rounded-t-lg border px-6 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-gray-300 border-b-white bg-white text-gray-900"
                    : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                id={`${tab.id}-tab`}
                role="tab"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <section className="rounded-b-lg rounded-tr-lg border border-gray-300 bg-white p-6 shadow">
          {activeTab === "familyMembers" ? (
            <div
              aria-labelledby="familyMembers-tab"
              id="familyMembers-panel"
              role="tabpanel"
            >
              <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No family members information available.
              </div>
            </div>
          ) : (
            <div
              aria-labelledby="assistanceHistory-tab"
              id="assistanceHistory-panel"
              role="tabpanel"
            >
              {assistanceRecords.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
                  No assistance history available.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-dashed border-gray-300 p-6 text-center">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100 text-center text-sm text-gray-700">
                        <th className="py-3 px-4 border">Date</th>
                        <th className="py-3 px-4 border">
                          Assistance Type
                        </th>
                        <th className="py-3 px-4 border">
                          Provider Organization
                        </th>
                        <th className="py-3 px-4 border">Notes</th>
                        <th className="py-3 px-4 border">
                          Recorded By
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assistanceRecords.map((assistance) => (
                        <tr key={assistance.id}>
                          <td className="py-2 px-4 border">
                            {formatDate(assistance.assistanceDate)}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.assistanceType}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.providerOrganization}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.notes || "N/A"}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.recordedByName ?? "Current user"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleExportAssistanceHistory}
                  className="rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
                >
                  Export Assistance History (PDF)
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default FamilyProfilePage;
