import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VulnerabilityLevelBadge from "../components/families/VulnerabilityLevelBadge";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import {
  createAssistanceRecord,
  fetchAssistanceRecords,
  fetchFamilyByNationalId,
  fetchLatestVulnerabilityAssessment,
  type AssistanceRecord,
  type FamilyRecord,
  type VulnerabilityAssessmentRecord,
} from "../lib/families";
import RegisterFamilyPageLayout from "../layouts/RegisterFamilyLayout";

const assistanceTypes = ["Food", "Shelter", "Medical", "Education", "Cash"];

const createTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createEmptyFormValues = () => ({
  assistanceType: "",
  assistanceDate: createTodayInputValue(),
  providerOrganization: "",
  notes: "",
});

type AssistanceFormValues = ReturnType<typeof createEmptyFormValues>;
type AssistanceFormErrors = Partial<Record<keyof AssistanceFormValues, string>>;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const validate = (values: AssistanceFormValues) => {
  const errors: AssistanceFormErrors = {};

  if (!values.assistanceType) {
    errors.assistanceType = "Select an assistance type.";
  }

  if (!values.assistanceDate) {
    errors.assistanceDate = "Select the assistance date.";
  }

  if (values.providerOrganization.trim().length < 2) {
    errors.providerOrganization = "Enter the provider organization.";
  }

  return errors;
};

const AddAssistancePage = () => {
  const { nationalID } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState<FamilyRecord | null>(null);
  const [latestAssessment, setLatestAssessment] =
    useState<VulnerabilityAssessmentRecord | null>(null);
  const [assistanceRecords, setAssistanceRecords] = useState<
    AssistanceRecord[]
  >([]);
  const [values, setValues] = useState<AssistanceFormValues>(
    createEmptyFormValues,
  );
  const [errors, setErrors] = useState<AssistanceFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadPage = async () => {
      if (!nationalID) {
        if (isActive) {
          setLoadError("A National ID is required to add assistance.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const familyRecord = await fetchFamilyByNationalId(nationalID);

        if (!isActive) {
          return;
        }

        if (!familyRecord) {
          setLoadError("No registered family was found with this National ID.");
          return;
        }

        const [records, assessment] = await Promise.all([
          fetchAssistanceRecords(familyRecord.id),
          fetchLatestVulnerabilityAssessment(familyRecord.id),
        ]);

        if (isActive) {
          setFamily(familyRecord);
          setAssistanceRecords(records);
          setLatestAssessment(assessment);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            getErrorMessage(
              error,
              "Unable to load assistance information. Refresh the page and try again.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      isActive = false;
    };
  }, [nationalID]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({
      ...current,
      [name as keyof AssistanceFormValues]: undefined,
    }));
    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!family) {
      setFormError("A registered family is required before saving assistance.");
      return;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setFormError("");
    setSuccessMessage("");

    if (Object.keys(validationErrors).length > 0) {
      setFormError("Correct the highlighted fields before saving assistance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedRecord = await createAssistanceRecord({
        familyId: family.id,
        assistanceType: values.assistanceType,
        assistanceDate: values.assistanceDate,
        providerOrganization: values.providerOrganization,
        notes: values.notes,
      });

      setAssistanceRecords((current) => [savedRecord, ...current]);
      setValues(createEmptyFormValues());
      setErrors({});
      setSuccessMessage("Assistance record saved successfully.");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to save assistance. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(nationalID ? `/families/${nationalID}` : "/local-search");
  };

  if (isLoading) {
    return (
      <RegisterFamilyPageLayout>
        <p className="text-sm text-gray-600">
          Loading assistance information...
        </p>
      </RegisterFamilyPageLayout>
    );
  }

  if (loadError || !family) {
    return (
      <RegisterFamilyPageLayout>
        <div>
          <Breadcrumbs
            items={[
              { label: "Local Search", href: "/local-search" },
              { label: "Family Profile", href: `/families/${nationalID}` },
              { label: "Add Assistance" },
            ]}
          />
          <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-800">
            Add Assistance
          </h1>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-800">Family Not Found</h2>
          <p className="mt-3 text-sm text-red-600" role="alert">
            {loadError || "No family found with the provided National ID."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/local-search")}
            className="mt-5 rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2"
          >
            Back to Local Search
          </button>
        </div>
      </RegisterFamilyPageLayout>
    );
  }

  return (
    <RegisterFamilyPageLayout>
      <div>
        <Breadcrumbs
          items={[
            { label: "Local Search", href: "/local-search" },
            { label: "Family Profile", href: `/families/${family.nationalId}` },
            { label: "Add Assistance" },
          ]}
        />
        <h1 className="mt-3 mb-6 text-2xl font-bold text-gray-800">
          Add Assistance
        </h1>
      </div>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Family Summary</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <p>
            <span className="font-semibold text-gray-800">National ID:</span>{" "}
            {family.nationalId}
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
            <VulnerabilityLevelBadge
              level={latestAssessment?.level ?? family.vulnerabilityLevel}
              variant="compact"
            />
          </p>
          <p>
            <span className="font-semibold text-gray-800">Current Camp:</span>{" "}
            {family.currentCampName ?? "Unknown camp"}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Assistance Details</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="assistance-type"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Assistance Type
              </label>
              <select
                id="assistance-type"
                name="assistanceType"
                value={values.assistanceType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                aria-invalid={Boolean(errors.assistanceType)}
                aria-describedby={
                  errors.assistanceType ? "assistance-type-error" : undefined
                }
              >
                <option value="">Select an assistance type</option>
                {assistanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.assistanceType && (
                <p
                  id="assistance-type-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.assistanceType}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assistance-date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Assistance Date
              </label>
              <input
                type="date"
                id="assistance-date"
                name="assistanceDate"
                value={values.assistanceDate}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                aria-invalid={Boolean(errors.assistanceDate)}
                aria-describedby={
                  errors.assistanceDate ? "assistance-date-error" : undefined
                }
              />
              {errors.assistanceDate && (
                <p
                  id="assistance-date-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.assistanceDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="provider-organization"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Provider Organization
              </label>
              <input
                type="text"
                id="provider-organization"
                name="providerOrganization"
                value={values.providerOrganization}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter provider organization"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                aria-invalid={Boolean(errors.providerOrganization)}
                aria-describedby={
                  errors.providerOrganization
                    ? "provider-organization-error"
                    : undefined
                }
              />
              {errors.providerOrganization && (
                <p
                  id="provider-organization-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.providerOrganization}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assistance-notes"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="assistance-notes"
                name="notes"
                rows={4}
                value={values.notes}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter any additional notes about the assistance provided."
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>
          </div>

          {formError && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className="mt-4 text-sm text-green-700" role="status">
              {successMessage}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Assistance"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Assistance History</h2>

        {assistanceRecords.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
            No assistance history available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-700">
                  <th className="border px-4 py-3">Date</th>
                  <th className="border px-4 py-3">Assistance Type</th>
                  <th className="border px-4 py-3">Provider Organization</th>
                  <th className="border px-4 py-3">Notes</th>
                  <th className="border px-4 py-3">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {assistanceRecords.map((assistance) => (
                  <tr key={assistance.id}>
                    <td className="border px-4 py-2">
                      {formatDate(assistance.assistanceDate)}
                    </td>
                    <td className="border px-4 py-2">
                      {assistance.assistanceType}
                    </td>
                    <td className="border px-4 py-2">
                      {assistance.providerOrganization}
                    </td>
                    <td className="border px-4 py-2">
                      {assistance.notes || "N/A"}
                    </td>
                    <td className="border px-4 py-2">
                      {assistance.recordedByName ?? "Current user"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </RegisterFamilyPageLayout>
  );
};

export default AddAssistancePage;
