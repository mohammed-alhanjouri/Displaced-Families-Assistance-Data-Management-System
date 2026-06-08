import { useNavigate } from "react-router-dom";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";
import HouseholdInformationCard from "../features/register-family/HouseholdInformationCard";
import LocationInformationCard from "../features/register-family/LocationInformationCard";

const UpdateFamilyInformation = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    navigate("/local-search");
  };
  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Local Search", href: "/local-search" },
            { label: "Family Profile", href: "/families/:nationalID" },
            { label: "Update Information", href: "/update-family" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Update Family Information
        </h1>
      </div>
      <form onSubmit={handleSubmit}>
        <FamilyIdentificationCard />
        <HouseholdInformationCard />
        <LocationInformationCard />

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="submit"
            className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
          >
            Save Registration
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
    </RegisterFamilyPageLayout>
  );
};

export default UpdateFamilyInformation;
