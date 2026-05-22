import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";
import HouseholdInformationCard from "../features/register-family/HouseholdInformationCard";
import LocationInformationCard from "../features/register-family/LocationInformationCard";
import RegisterFamilyLayout from "../layouts/RegisterFamilyLayout";

const RegisterFamilyPage = () => {
  return (
    <RegisterFamilyLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Register New Family
      </h1>
      <FamilyIdentificationCard />
      <HouseholdInformationCard />
      <LocationInformationCard />
    </RegisterFamilyLayout>
  );
};

export default RegisterFamilyPage;
