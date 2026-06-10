import DashboardLayout from "../layouts/DashboardLayout";
import { familiesData } from "../data/families";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { useState } from "react";

type ProfileTab = "familyMembers" | "assistanceHistory";

const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "familyMembers", label: "Family Members" },
  { id: "assistanceHistory", label: "Assistance History" },
];

const FamilyProfilePage = () => {
  const { nationalID } = useParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>("familyMembers");
  const family = familiesData.find(
    (family) => family.nationalID.toString() === nationalID,
  );
  if (!family) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Family Not Found</h1>
          <p>No family found with the provided national ID.</p>
        </div>
      </DashboardLayout>
    );
  }
  const vulnerabilityClasses: { [key: string]: string } = {
    Low: "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-green-100 text-green-700",
    Medium:
      "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700",
    High: "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Breadcrumbs
            items={[
              { label: "Global Search", href: "/global-search" },
              { label: "Family Profile" },
            ]}
          />

          <h1 className="text-2xl font-bold text-gray-800 mt-3">
            Family Profile
          </h1>
        </div>

        <Link
          to="/global-search"
          className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Search
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Family Information</h2>
          <p>
            <span className="font-semibold text-gray-800">National ID:</span>{" "}
            {family.nationalID}
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Family Head Name:
            </span>{" "}
            {family.familyHeadName}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Phone Number:</span>{" "}
            {family.phoneNumber}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Total Members:</span>{" "}
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Location and Vulnerability
          </h2>

          <div className="space-y-3">
            <p>
              <span className="font-semibold text-gray-800">
                Current Camp / Location:
              </span>{" "}
              {family.location}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Original Residence:
              </span>{" "}
              {family.originalResidence}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Vulnerability Score:
              </span>{" "}
              {family.vulnerabilityScore}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Vulnerability Level:
              </span>{" "}
              <span className={vulnerabilityClasses[family.vulnerabilityLevel]}>
                {family.vulnerabilityLevel}
              </span>
            </p>
          </div>
        </div>
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

        <div className="rounded-b-lg rounded-tr-lg border border-gray-300 bg-white p-6 shadow">
          {activeTab === "familyMembers" ? (
            <div
              aria-labelledby="familyMembers-tab"
              id="familyMembers-panel"
              role="tabpanel"
            >
              <div>
                {family.familyMembers ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {family.familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-blue-50 p-4 rounded-md hover:shadow-md space-y-2"
                      >
                        <h3 className="font-semibold text-gray-800">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-700">
                          Age: {member.age}
                        </p>
                        <p className="text-sm text-gray-700">
                          Gender: {member.gender}
                        </p>
                        <p className="text-sm text-gray-700">
                          Relationship to Head: {member.relationshipToHead}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
                    No family members information available.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              aria-labelledby="assistanceHistory-tab"
              id="assistanceHistory-panel"
              role="tabpanel"
            >
              {family.assistanceHistory.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
                  No assistance history available.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-dashed border-gray-300 p-6 text-center">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100 text-center text-sm text-gray-700">
                        <th className="py-3 px-4 border">Date</th>
                        <th className="py-3 px-4 border">Assistance Type</th>
                        <th className="py-3 px-4 border">
                          Provider Organization
                        </th>
                        <th className="py-3 px-4 border">Notes</th>
                        <th className="py-3 px-4 border">Recorded By</th>
                      </tr>
                    </thead>

                    <tbody>
                      {family.assistanceHistory.map((assistance) => (
                        <tr key={assistance.id}>
                          <td className="py-2 px-4 border">
                            {assistance.date}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.assistanceType}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.providerOrganization || "N/A"}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.notes || "N/A"}
                          </td>
                          <td className="py-2 px-4 border">
                            {assistance.recordedBy || "N/A"}
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
                  onClick={() => {}}
                  className="rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
                >
                  Export Assistance History (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyProfilePage;
