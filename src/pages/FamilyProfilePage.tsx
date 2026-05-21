import DashboardLayout from "../layouts/DashboardLayout";
import { familiesData } from "../data/families";
import { Link, useParams } from "react-router-dom";

const FamilyProfilePage = () => {
  const { nationalID } = useParams();
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
    Low: "bg-green-100 text-green-700",
    Medium: "bg-orange-100 text-orange-700",
    High: "bg-red-100 text-red-700",
  };
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">
            Global Search {">"} Family Profile
          </p>

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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Family Information</h2>
          <p>National ID: {family.nationalID}</p>
          <p>Head of Family: {family.familyHeadName}</p>
          <p>Phone Number: {family.phoneNumber}</p>
          <p>Total Members: {family.totalMembers}</p>
          <p>Female-Headed Household: No</p>
          <p>Female Head Reason: N/A</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Location and Vulnerability
          </h2>
          <ul className="list-disc list-inside">
            <li>Current Camp / Location: {family.location}</li>
            <li>Original Residence: {family.originalResidence}</li>
            <li>Vulnerability Score: {family.vulnerabilityScore}</li>
            <li>
              Vulnerability Level:
              <span
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  vulnerabilityClasses[family.vulnerabilityLevel]
                }`}
              >
                {family.vulnerabilityLevel}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyProfilePage;
