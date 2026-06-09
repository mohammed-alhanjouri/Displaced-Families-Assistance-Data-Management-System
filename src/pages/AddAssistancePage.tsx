import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";
import Breadcrumbs from "../components/ui/Breadcrumbs";

const AddAssistancePage = () => {
  return (
    <div>
      <RegisterFamilyPageLayout>
        <div>
          <Breadcrumbs
            items={[
              { label: "Local Search", href: "/local-search" },
              { label: "Family Profile", href: "/families/:nationalID" },
              { label: "Add Assistance", href: "/add-assistance" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">
            Add Assistance
          </h1>
        </div>
      </RegisterFamilyPageLayout>
    </div>
  );
};

export default AddAssistancePage;
