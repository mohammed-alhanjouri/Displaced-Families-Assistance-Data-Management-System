import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { familiesData } from "../data/families";
import { useParams } from "react-router-dom";

const AddAssistancePage = () => {
  const { nationalID } = useParams();
  const family = familiesData.find(
    (family) => family.nationalID.toString() === nationalID,
  );

  if (!family) {
    return (
      <RegisterFamilyPageLayout>
        <div>
          <Breadcrumbs
            items={[
              { label: "Local Search", href: "/local-search" },
              { label: "Family Profile", href: `/families/${nationalID}` },
              {
                label: "Add Assistance",
                href: `/add-assistance/${nationalID}`,
              },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
            Add Assistance
          </h1>
        </div>
        <div className="space-y-3 bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Family Not Found</h1>
          <p>No family found with the provided national ID.</p>
        </div>
      </RegisterFamilyPageLayout>
    );
  }

  const vulnerabilityClasses: { [key: string]: string } = {
    Low: "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-green-100 text-green-700",
    Medium:
      "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700",
    High: "ml-2 rounded-lg px-4 py-2 text-sm font-medium bg-red-100 text-red-700",
  };

  return (
    <div>
      <RegisterFamilyPageLayout>
        <div>
          <Breadcrumbs
            items={[
              { label: "Local Search", href: "/local-search" },
              { label: "Family Profile", href: `/families/${nationalID}` },
              {
                label: "Add Assistance",
                href: `/add-assistance/${nationalID}`,
              },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
            Add Assistance
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Family Summary</h2>
          <div className="grid grid-cols-2 gap-6">
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
              <span className="font-semibold text-gray-800">
                Vulnerability Level:
              </span>{" "}
              <span className={vulnerabilityClasses[family.vulnerabilityLevel]}>
                {family.vulnerabilityLevel}
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Current Camp/Location:
              </span>{" "}
              {family.location || "N/A"}
            </p>
          </div>
        </div>
      </RegisterFamilyPageLayout>
    </div>
  );
};

export default AddAssistancePage;
