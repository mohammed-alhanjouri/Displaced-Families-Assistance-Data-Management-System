import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import FamilyIdentificationCard from "../features/register-family/FamilyIdentificationCard";

const UpdateFamilyInformation = () => {
  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Local Search", href: "/local-search" },
            { label: "Family Profile", href: "/families/123456789" },
            { label: "Update Information", href: "/update-family" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
          Update Family Information
        </h1>
      </div>
      <FamilyIdentificationCard />
    </RegisterFamilyPageLayout>
  );
};

export default UpdateFamilyInformation;
