import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import { familiesData } from "../data/families";
import { useParams, useNavigate } from "react-router-dom";

const AddAssistancePage = () => {
  const { nationalID } = useParams();
  const navigate = useNavigate();
  const family = familiesData.find(
    (family) => family.nationalID.toString() === nationalID,
  );

  const handleCancel = () => {
    navigate(nationalID ? `/families/${nationalID}` : "/local-search");
  };

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

  const assistanceTypes = ["Food", "Shelter", "Medical", "Education", "Cash"];

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
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Assistance Details</h2>

          <form>
            <div className="grid grid-cols-2 gap-5">
              <label
                htmlFor="assistance-type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Assistance Type
              </label>
              <select
                id="assistance-type"
                name="assistanceType"
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">Select an assistance type</option>
                {assistanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label
                htmlFor="assistance-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Assistance Date
              </label>
              <input
                type="date"
                id="assistance-date"
                name="assistanceDate"
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <label
                htmlFor="provider-organization"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Provider Organization
              </label>
              <input
                type="text"
                id="provider-organization"
                name="providerOrganization"
                placeholder="Enter provider organization"
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <label
                htmlFor="assistance-notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes
              </label>
              <textarea
                id="assistance-notes"
                name="assistanceNotes"
                rows={4}
                placeholder="Enter any additional notes about the assistance provided.."
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="submit"
                className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
              >
                Save Assistance
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </RegisterFamilyPageLayout>
    </div>
  );
};

export default AddAssistancePage;
