import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";
import RegisterFamilyLayout from "../layouts/RegisterFamilyLayout";

const RegisterFamilyPage = () => {
  return (
    <RegisterFamilyLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Register New Family
      </h1>
      <FamilyIdentificationCard />
    </RegisterFamilyLayout>
  );
};

export default RegisterFamilyPage;
