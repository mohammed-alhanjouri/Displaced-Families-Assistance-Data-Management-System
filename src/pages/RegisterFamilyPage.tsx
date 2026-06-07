import { useNavigate } from "react-router-dom";
import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";
import HouseholdInformationCard from "../features/register-family/HouseholdInformationCard";
import LocationInformationCard from "../features/register-family/LocationInformationCard";
import RegisterFamilyLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";

const RegisterFamilyPage = () => {
  // Navigation hook to redirect after form submission or cancellation (temporarily)
  const navigate = useNavigate();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <RegisterFamilyLayout>
      <div>
        <Breadcrumbs
          items={[{ label: "Register Family", href: "/register-family" }]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Register New Family
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
    </RegisterFamilyLayout>
  );
};

export default RegisterFamilyPage;
